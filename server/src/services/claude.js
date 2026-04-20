const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const generateAgreementText = async (details) => {
  const prompt = `You are a legal document assistant specializing in Indian rental law.
Generate a complete, professional rental agreement using the details below.
The agreement must follow standard Indian rental norms including:
- Stamp duty reference clause
- 11-month lease renewal standard
- TDS clause if rent exceeds ₹50,000/month
- Notice period clause (minimum 1 month)
- Maintenance responsibility split

Format the output with clear numbered sections and sub-sections.
Use formal legal language. Output plain text only — no markdown.

DETAILS:
Tenant Name: ${details.tenantName}
Owner Name: ${details.ownerName}
Property Address: ${details.address}, ${details.area}, ${details.city}
Monthly Rent: ₹${details.rent}
Security Deposit: ₹${details.deposit}
Lease Start Date: ${details.startDate}
Lease Duration: ${details.duration} months
Lease End Date: ${details.endDate}
Furnished Status: ${details.furnished}
Included Amenities: ${details.amenities}
Special Terms: ${details.specialTerms}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
};

const generateRentSuggestion = async ({ city, area, bedrooms, propertyType, min, max, count }) => {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Based on ${count} similar ${bedrooms}BHK ${propertyType} properties in ${area}, ${city} with rents ranging from ₹${min} to ₹${max}, provide a one-sentence competitive rent suggestion for a new listing. Be specific about the range. No markdown.`
    }]
  });
  return message.content[0].text;
};

module.exports = { generateAgreementText, generateRentSuggestion };
