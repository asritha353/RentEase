import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, FileText, ChevronRight } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Terms of Service — RentEase</title>
        <meta name="description" content="RentEase Terms of Service — rules for using the platform." />
      </Helmet>

      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900"><Home size={20} className="text-primary" /> RentEase</Link>
        <Link to="/login" className="btn-primary py-2 px-4 text-sm">Sign In</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={14} /> <span>Terms of Service</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><FileText size={24} className="text-blue-600" /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: April 20, 2025</p>
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing or using RentEase ("Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Platform. These terms constitute a legally binding agreement between you and RentEase.'
            },
            {
              title: '2. Platform Description',
              content: 'RentEase is a marketplace platform that connects property owners ("Owners") with prospective tenants ("Tenants") for residential rental purposes. RentEase is NOT a party to any rental agreement. We facilitate connections and provide tools; the actual tenancy is a legal relationship solely between Owner and Tenant.'
            },
            {
              title: '3. User Accounts and Roles',
              content: `• You must be at least 18 years of age to use this platform.
• You are responsible for maintaining the security of your account.
• You may register as a Tenant or Owner. Misrepresenting your role is a violation of these terms.
• Admin accounts are assigned by RentEase — you cannot self-register as an Admin.
• You may not create multiple accounts to circumvent bans or restrictions.`
            },
            {
              title: '4. Owner Responsibilities',
              content: `Property owners must:
• Ensure all property information is accurate, truthful, and up-to-date.
• Own or have legal authorization to list the property for rent.
• Respond to applications in a timely manner.
• Not discriminate against applicants based on religion, caste, gender, nationality, or any protected characteristic.
• Not list properties that are not available for rent (fake listings are strictly prohibited).
• Ensure generated agreements accurately reflect the actual agreed terms before signing.`
            },
            {
              title: '5. Tenant Responsibilities',
              content: `Tenants must:
• Provide truthful information in all application forms, including income, occupation, and personal details.
• Not submit fraudulent applications or misrepresent their financial situation.
• Withdraw applications they no longer intend to pursue.
• Honor agreements they have accepted.
• Not use the platform to collect owner contact details for off-platform solicitation.`
            },
            {
              title: '6. AI-Generated Rental Agreements',
              content: `• RentEase uses AI (Claude by Anthropic) to generate draft rental agreements.
• Generated agreements are drafts intended as a starting point. Users are strongly advised to review all agreements with a licensed legal professional before signing.
• RentEase makes no warranty that generated agreements are complete, legally enforceable, or compliant with all applicable local laws.
• The Platform is not responsible for any legal disputes arising from AI-generated agreements.
• Users are responsible for stamp duty, registration, and any required notarization as per applicable State laws.`
            },
            {
              title: '7. Prohibited Conduct',
              content: `The following are strictly prohibited:
• Posting false, misleading, or fraudulent property listings.
• Submitting applications with false income or identity information.
• Harassment, threats, or abusive communication between users.
• Attempting to circumvent security, rate limits, or access controls.
• Scraping, copying, or reproducing platform content without permission.
• Using the platform for any illegal purpose.
• Subletting properties found through the platform without owner consent.`
            },
            {
              title: '8. Fees and Payments',
              content: 'RentEase is currently free to use. We reserve the right to introduce subscription plans or transaction fees with 30 days\' notice to registered users. Rent payments, security deposits, and any financial transactions are between Owners and Tenants directly. RentEase does not handle or process any rental payments.'
            },
            {
              title: '9. Intellectual Property',
              content: 'All content, code, design, and branding on the RentEase platform is owned by RentEase and protected by Indian and international intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit written permission.'
            },
            {
              title: '10. Dispute Resolution',
              content: 'Any disputes between Owners and Tenants are the sole responsibility of the parties involved. RentEase may, at its discretion, assist in mediation but is not obligated to do so. Disputes arising from these Terms shall be governed by Indian law and subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.'
            },
            {
              title: '11. Platform Availability and Modifications',
              content: 'RentEase does not guarantee uninterrupted access to the Platform. We reserve the right to modify, suspend, or discontinue any feature with reasonable notice. We are not liable for any loss arising from downtime or service interruptions.'
            },
            {
              title: '12. Limitation of Liability',
              content: 'To the maximum extent permitted by Indian law, RentEase shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the Platform, including but not limited to lost rent, property damage, or failed tenancy agreements.'
            },
            {
              title: '13. Termination',
              content: 'RentEase may suspend or terminate accounts that violate these Terms. Blocked users will see a suspension notice and cannot access Platform features. You may request account deletion by emailing support@rentease.in.'
            },
            {
              title: '14. Governing Law',
              content: 'These Terms of Service are governed by the laws of India, including the Indian Contract Act 1872, IT Act 2000, and Consumer Protection Act 2019. Any legal proceedings shall be conducted in English in courts of competent jurisdiction in Hyderabad, India.'
            },
            {
              title: '15. Contact',
              content: 'For any questions about these Terms: support@rentease.in · RentEase, India'
            }
          ].map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{s.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
          Questions? Email us at <a href="mailto:support@rentease.in" className="text-primary hover:underline">support@rentease.in</a>
        </div>
      </div>
    </div>
  )
}
