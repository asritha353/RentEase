const prisma = require('../lib/prisma');
const logActivity        = require('../utils/logActivity');
const createNotification = require('../utils/createNotification');

// ── Number to Indian words ────────────────────────────────────────────────────
function numberToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n === 0) return 'Zero';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
  return numberToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numberToWords(n % 10000000) : '');
}

function fmtDate(d) {
  const date = new Date(d);
  const day = date.getDate();
  const suffix = ['th','st','nd','rd'][(day > 3 && day < 21) ? 0 : [0,1,2,3,4,5,6,7,8,9][day % 10]] || 'th';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
  const yr = date.getFullYear().toString();
  const yearWords = yr.split('').map(d => years[+d]).join(' ');
  return `${day}${suffix} day of ${months[date.getMonth()]}, ${yearWords}`;
}

function fmtMoney(n) {
  return `₹${n.toLocaleString('en-IN')}/-  (Rupees ${numberToWords(n)} Only)`;
}

// ── POST /api/agreements/generate/:applicationId ──────────────────────────────
const generateAgreement = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { startDate, duration = 11, specialTerms = '' } = req.body;

    if (!startDate) return res.status(400).json({ error: 'startDate is required' });

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: { include: { owner: { select: { id: true, name: true, email: true } } } },
        tenant:   { select: { id: true, name: true, email: true } },
      }
    });

    if (!app)                                       return res.status(404).json({ error: 'Application not found' });
    if (app.property.ownerId !== req.user.id)       return res.status(403).json({ error: 'Not authorized' });
    if (app.status !== 'ACCEPTED')                  return res.status(400).json({ error: 'Application must be ACCEPTED first' });
    if (app.agreement)                              return res.status(400).json({ error: 'Agreement already generated for this application' });

    const start  = new Date(startDate);
    const end    = new Date(start);
    end.setMonth(end.getMonth() + parseInt(duration));

    const vars = {
      ownerName:       req.user.name,
      tenantName:      app.tenant.name,
      tenantPhone:     app.tenantPhone || 'N/A',
      tenantEmail:     app.tenant.email,
      propertyAddress: app.property.address,
      area:            app.property.area,
      city:            app.property.city,
      pincode:         '500001',
      propertyType:    app.property.propertyType.replace(/_/g, ' '),
      furnished:       app.property.furnished.replace(/_/g, ' '),
      amenities:       (app.property.amenities || []).join(', '),
      rent:            app.property.rent.toLocaleString('en-IN'),
      rentInWords:     numberToWords(app.property.rent),
      deposit:         app.property.deposit.toLocaleString('en-IN'),
      depositInWords:  numberToWords(app.property.deposit),
      startDate:       fmtDate(start),
      endDate:         fmtDate(end),
      duration:        parseInt(duration),
      specialTerms:    specialTerms || 'None',
      executionDate:   fmtDate(new Date()),
    };

    const terms = await generateAgreementText(vars);

    const agreement = await prisma.agreement.create({
      data: {
        applicationId,
        tenantName:      app.tenant.name,
        ownerName:       req.user.name,
        propertyAddress: `${app.property.address}, ${app.property.area}, ${app.property.city}`,
        rent:            app.property.rent,
        deposit:         app.property.deposit,
        duration:        parseInt(duration),
        startDate:       start,
        endDate:         end,
        terms,
        specialTerms:    specialTerms || null,
        pdfUrl:          null,
      }
    });

    await createNotification({
      userId:  app.tenantId,
      type:    'AGREEMENT_READY',
      title:   'Rental Agreement Ready! 📄',
      message: `Your rental agreement for "${app.property.title}" is ready. Download it from your dashboard.`,
      link:    '/tenant/agreements'
    });

    await logActivity({
      userId: req.user.id, action: 'AGREEMENT_GENERATED',
      entity: 'Agreement', entityId: agreement.id
    });

    return res.status(201).json({ agreement });
  } catch (err) {
    console.error('generateAgreement error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/agreements/my (tenant) ──────────────────────────────────────────
const getMyAgreements = async (req, res) => {
  try {
    const agreements = await prisma.agreement.findMany({
      where: { application: { tenantId: req.user.id } },
      include: {
        application: {
          include: { property: { select: { title: true, city: true, area: true, images: true } } }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });
    return res.json({ agreements });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/agreements/owner (owner's generated agreements) ──────────────────
const getOwnerAgreements = async (req, res) => {
  try {
    const agreements = await prisma.agreement.findMany({
      where: { application: { property: { ownerId: req.user.id } } },
      include: {
        application: {
          include: {
            property: { select: { title: true, city: true, area: true } },
            tenant:   { select: { name: true, email: true, avatar: true } }
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });
    return res.json({ agreements });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/agreements/:id/pdf ───────────────────────────────────────────────
const getAgreementPdf = async (req, res) => {
  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id: req.params.id },
      include: { application: { include: { property: true, tenant: true } } }
    });
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    const html = buildAgreementHtml(agreement);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="RentEase-Agreement-${agreement.id.slice(0,8)}.html"`);
    return res.send(html);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function generateAgreementText(vars) {
  const claudePrompt = `You are a senior legal document specialist with 20 years of experience drafting residential rental agreements under Indian property law (Transfer of Property Act 1882, Registration Act 1908, and applicable State Rent Control Acts).

Generate a complete, formal, legally structured rental agreement. The document must be indistinguishable from one prepared by a licensed advocate.

STRICT FORMATTING RULES:
- Output must be plain text only. No markdown, no asterisks, no hyphens as bullets.
- Use numbered sections: 1., 1.1, 1.2, 2., 2.1 etc.
- Use ALL CAPS for section headings.
- Leave a blank line between each section.
- Signature blocks must be clearly formatted at the bottom.
- Dates must be written in full: ${vars.startDate}.
- Monetary amounts must appear both in numerals and words: ₹22,000/- (Rupees Twenty-Two Thousand Only).

MANDATORY SECTIONS TO INCLUDE (in this order):
1. AGREEMENT TITLE (centered, all caps)
2. PARTIES TO THE AGREEMENT (full names, addresses, referred to as LESSOR and LESSEE)
3. RECITALS (background and intent)
4. DESCRIPTION OF PREMISES
5. TERM OF TENANCY (commencement, duration, end date, renewal clause)
6. RENT AND PAYMENT TERMS (amount, due date, grace period, late fee)
7. SECURITY DEPOSIT (amount, conditions for deduction, refund timeline — 30 days after vacating)
8. UTILITIES AND MAINTENANCE (who pays electricity, water, maintenance charges)
9. PERMITTED USE (residential purpose only, no subletting without consent)
10. ALTERATIONS AND IMPROVEMENTS (no structural changes without written consent)
11. INSPECTION AND ACCESS (24-hour notice required for landlord entry except emergency)
12. INSURANCE (tenant responsible for personal property insurance)
13. TERMINATION AND NOTICE PERIOD (minimum 30 days written notice by either party)
14. BREACH AND REMEDIES (eviction process, legal recourse)
15. STAMP DUTY AND REGISTRATION (parties to bear cost equally, reference to applicable State Act)
16. TDS CLAUSE (if monthly rent exceeds ₹50,000, tenant to deduct TDS at 10% under Section 194-I)
17. GOVERNING LAW AND JURISDICTION (courts of ${vars.city})
18. ENTIRE AGREEMENT (this document supersedes all prior verbal or written agreements)
19. SIGNATURES AND WITNESSES (LESSOR signature block, LESSEE signature block, two witnesses each with name and address)

PROPERTY DETAILS:
Lessor (Owner) Full Name: ${vars.ownerName}
Lessee (Tenant) Full Name: ${vars.tenantName}
Tenant Phone: ${vars.tenantPhone}
Tenant Email: ${vars.tenantEmail}
Property Address: ${vars.propertyAddress}, ${vars.area}, ${vars.city} - ${vars.pincode}
Property Type: ${vars.propertyType}
Furnished Status: ${vars.furnished}
Included Amenities: ${vars.amenities}
Monthly Rent: ₹${vars.rent}/- (Rupees ${vars.rentInWords} Only)
Security Deposit: ₹${vars.deposit}/- (Rupees ${vars.depositInWords} Only)
Lease Commencement Date: ${vars.startDate}
Lease Duration: ${vars.duration} months
Lease End Date: ${vars.endDate}
Special Terms and Conditions: ${vars.specialTerms}
Place of Execution: ${vars.city}
Date of Execution: ${vars.executionDate}

Generate the complete agreement now. Begin with the centered title. Do not add any preamble, explanation, or closing note outside the document itself.`;

  try {
    if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-your')) {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{ role: 'user', content: claudePrompt }]
      });
      return msg.content[0].text;
    }
  } catch (err) {
    console.warn('Claude API failed, using fallback template:', err.message);
  }

  // ── Fallback legal template ─────────────────────────────────────────────────
  return `RESIDENTIAL RENTAL AGREEMENT

THIS AGREEMENT is made and entered into on the ${vars.executionDate}, at ${vars.city}.


1. PARTIES TO THE AGREEMENT

1.1 LESSOR (Owner): ${vars.ownerName}, hereinafter referred to as the "LESSOR".

1.2 LESSEE (Tenant): ${vars.tenantName}, Email: ${vars.tenantEmail}, Phone: ${vars.tenantPhone}, hereinafter referred to as the "LESSEE".


2. RECITALS

2.1 The LESSOR is the absolute owner of the premises described herein and has full legal authority to let the same.

2.2 The LESSEE desires to take the said premises on rent for residential purposes only, and the LESSOR has agreed to let the same on the terms and conditions set forth herein.


3. DESCRIPTION OF PREMISES

3.1 Property Address: ${vars.propertyAddress}, ${vars.area}, ${vars.city} - ${vars.pincode}.

3.2 Property Type: ${vars.propertyType}, ${vars.furnished}.

3.3 Amenities included: ${vars.amenities}.


4. TERM OF TENANCY

4.1 This Agreement shall commence on ${vars.startDate} and shall continue for a period of ${vars.duration} (${numberToWords(vars.duration)}) months, ending on ${vars.endDate}.

4.2 Renewal of this Agreement shall be subject to mutual consent of both parties, and fresh terms shall be agreed upon in writing.


5. RENT AND PAYMENT TERMS

5.1 The monthly rent for the said premises is ${fmtMoney(parseInt(vars.rent.replace(/,/g, '')))}.

5.2 Rent shall be payable on or before the 5th day of each calendar month.

5.3 A grace period of 5 days is allowed. Rent paid after the 10th of the month shall attract a late fee of ₹500/- per day.


6. SECURITY DEPOSIT

6.1 The LESSEE has paid a refundable security deposit of ${fmtMoney(parseInt(vars.deposit.replace(/,/g, '')))}.

6.2 The deposit shall be returned within 30 days of the LESSEE vacating the premises, after deducting any dues for unpaid rent, damages beyond normal wear and tear, or pending utility bills.


7. UTILITIES AND MAINTENANCE

7.1 The LESSEE shall bear the cost of electricity, water, gas, internet, and any other utility consumed during the tenancy.

7.2 The LESSEE shall maintain the premises in good and habitable condition.

7.3 Major structural repairs shall be the responsibility of the LESSOR.


8. PERMITTED USE

8.1 The premises shall be used exclusively for residential purposes by the LESSEE and their immediate family.

8.2 Subletting, assigning, or transferring possession of the premises in whole or in part is strictly prohibited without prior written consent of the LESSOR.


9. ALTERATIONS AND IMPROVEMENTS

9.1 The LESSEE shall not make any structural alterations, additions, or improvements to the premises without prior written consent of the LESSOR.

9.2 Any approved alterations shall become the property of the LESSOR unless otherwise agreed in writing.


10. INSPECTION AND ACCESS

10.1 The LESSOR or their authorized representative shall give a minimum 24-hour advance notice before inspecting the premises, except in case of emergency.


11. INSURANCE

11.1 The LESSEE shall be responsible for insuring their personal property. The LESSOR's property insurance does not cover LESSEE's belongings.


12. TERMINATION AND NOTICE PERIOD

12.1 Either party may terminate this Agreement by giving a minimum of 30 (Thirty) days' written notice to the other party.

12.2 In the event of breach by the LESSEE, the LESSOR may terminate the Agreement with 7 days' notice.


13. BREACH AND REMEDIES

13.1 Failure to pay rent, subletting without consent, or causing damage to property shall constitute a breach of this Agreement.

13.2 Upon breach, the non-breaching party shall be entitled to all legal remedies available under applicable laws.


14. STAMP DUTY AND REGISTRATION

14.1 The cost of stamp duty and registration of this Agreement shall be borne equally by both parties, as per the applicable State Stamp Act.


15. TDS CLAUSE

15.1 If the monthly rent payable exceeds ₹50,000/-, the LESSEE shall deduct Tax Deducted at Source (TDS) at the applicable rate under Section 194-I of the Income Tax Act, 1961, and deposit the same with the Government of India.


16. GOVERNING LAW AND JURISDICTION

16.1 This Agreement shall be governed by the laws of India. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts at ${vars.city}.


17. ENTIRE AGREEMENT

17.1 This Agreement constitutes the entire understanding between the parties and supersedes all prior verbal or written negotiations, representations, or agreements.


18. SIGNATURES

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.


LESSOR (Owner):                              LESSEE (Tenant):

Signature: _______________________           Signature: _______________________
Name: ${vars.ownerName}                      Name: ${vars.tenantName}
Date: ___________________________            Date: ___________________________


WITNESS 1:                                   WITNESS 2:

Name: ___________________________           Name: ___________________________
Address: ________________________           Address: ________________________
Signature: ______________________           Signature: ______________________
Date: ___________________________           Date: ___________________________
${vars.specialTerms && vars.specialTerms !== 'None' ? `\n\nSPECIAL TERMS AND CONDITIONS:\n${vars.specialTerms}` : ''}`;
}

function buildAgreementHtml(ag) {
  const paragraphs = ag.terms.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br/>';
    // Detect section headings (all caps lines or numbered headings)
    if (/^[0-9]+\.\s+[A-Z\s]+$/.test(trimmed) || /^[A-Z\s]{8,}$/.test(trimmed)) {
      return `<div class="section-heading">${trimmed}</div>`;
    }
    return `<p>${trimmed}</p>`;
  }).join('\n');

  const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rental Agreement — RentEase</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.8; color: #1a1a1a; background: white; }
  .page { width: 210mm; min-height: 297mm; padding: 25mm 20mm 20mm 25mm; margin: 0 auto; position: relative; }
  .watermark {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80pt; color: rgba(0,0,0,0.04); font-weight: bold;
    pointer-events: none; z-index: 0; letter-spacing: 8px; font-family: Arial, sans-serif;
  }
  .document-header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; position: relative; z-index: 1; }
  .document-header .stamp { font-size: 9pt; color: #666; margin-bottom: 6px; font-family: Arial, sans-serif; }
  .document-header h1 { font-size: 18pt; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .document-header .ref { font-size: 9pt; color: #666; font-family: Arial, sans-serif; }
  .highlight-box { background: #f8f8f8; border-left: 4px solid #1a1a1a; padding: 14px 18px; margin: 16px 0 24px 0; font-size: 11pt; position: relative; z-index: 1; }
  .highlight-box .row { display: flex; margin-bottom: 4px; }
  .highlight-box .label { font-weight: bold; min-width: 180px; display: inline-block; }
  .content { position: relative; z-index: 1; }
  .section-heading { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 22px; margin-bottom: 6px; border-bottom: 1px solid #bbb; padding-bottom: 3px; }
  p { margin-bottom: 9px; text-align: justify; }
  br { display: block; margin-bottom: 4px; }
  .signature-section { margin-top: 48px; page-break-inside: avoid; border-top: 2px solid #1a1a1a; padding-top: 24px; position: relative; z-index: 1; }
  .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 16px; }
  .sig-block { border: 1px solid #ccc; padding: 16px; }
  .sig-block .role { font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-bottom: 8px; color: #444; font-family: Arial, sans-serif; }
  .sig-line { border-bottom: 1px solid #888; height: 36px; margin: 12px 0 6px 0; }
  .sig-name { font-size: 11pt; font-weight: bold; margin-top: 4px; }
  .sig-date { font-size: 10pt; color: #555; margin-top: 6px; }
  .witness-section { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .footer { margin-top: 32px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8.5pt; color: #888; text-align: center; font-family: Arial, sans-serif; position: relative; z-index: 1; }
  @media print {
    .page { margin: 0; padding: 20mm 18mm; }
    .watermark { position: fixed; }
  }
</style>
</head>
<body>
<div class="watermark">RENTEASE</div>
<div class="page">
  <div class="document-header">
    <div class="stamp">Generated via RentEase Platform &middot; rentease.in &middot; support@rentease.in</div>
    <h1>Residential Rental Agreement</h1>
    <div class="ref">Agreement ID: ${ag.id} &nbsp;&middot;&nbsp; Generated: ${fmtD(ag.generatedAt)}</div>
  </div>

  <div class="highlight-box">
    <div class="row"><span class="label">Lessor (Owner):</span> <span>${ag.ownerName}</span></div>
    <div class="row"><span class="label">Lessee (Tenant):</span> <span>${ag.tenantName}</span></div>
    <div class="row"><span class="label">Property:</span> <span>${ag.propertyAddress}</span></div>
    <div class="row"><span class="label">Monthly Rent:</span> <span>₹${ag.rent.toLocaleString('en-IN')}/- &nbsp;&middot;&nbsp; Security Deposit: ₹${ag.deposit.toLocaleString('en-IN')}/-</span></div>
    <div class="row"><span class="label">Lease Term:</span> <span>${fmtD(ag.startDate)} &rarr; ${fmtD(ag.endDate)} (${ag.duration} months)</span></div>
  </div>

  <div class="content">
    ${paragraphs}
  </div>

  <div class="signature-section">
    <div class="signature-grid">
      <div class="sig-block">
        <div class="role">Lessor (Property Owner)</div>
        <div class="sig-line"></div>
        <div class="sig-name">${ag.ownerName}</div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-block">
        <div class="role">Lessee (Tenant)</div>
        <div class="sig-line"></div>
        <div class="sig-name">${ag.tenantName}</div>
        <div class="sig-date">Date: _______________</div>
      </div>
    </div>
    <div class="witness-section">
      <div class="sig-block">
        <div class="role">Witness 1</div>
        <div class="sig-line"></div>
        <div class="sig-date">Name &amp; Address: _______________</div>
      </div>
      <div class="sig-block">
        <div class="role">Witness 2</div>
        <div class="sig-line"></div>
        <div class="sig-date">Name &amp; Address: _______________</div>
      </div>
    </div>
  </div>

  <div class="footer">
    This rental agreement was generated by the RentEase platform. It is legally valid subject to stamp duty and registration
    as per the applicable State Stamp Act and Registration Act, 1908. Parties are advised to consult a legal professional.
    &copy; ${new Date().getFullYear()} RentEase &middot; rentease.in
  </div>
</div>
</body>
</html>`;
}

module.exports = { generateAgreement, getAgreementPdf, getMyAgreements, getOwnerAgreements };
