import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, Shield, ChevronRight } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Privacy Policy — RentEase</title>
        <meta name="description" content="RentEase Privacy Policy — how we collect, use, and protect your data." />
      </Helmet>

      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900"><Home size={20} className="text-primary" /> RentEase</Link>
        <Link to="/login" className="btn-primary py-2 px-4 text-sm">Sign In</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={14} /> <span>Privacy Policy</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center"><Shield size={24} className="text-green-600" /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: April 20, 2025</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: `When you use RentEase, we collect:
• **Account Information**: Your name, email address, and profile picture from Google Sign-In.
• **Application Data**: Phone number, occupation, monthly income, current residence, and move-in preferences you provide when applying for a property.
• **Property Data**: Information you provide when listing a property, including address, rent, photos, and amenities.
• **Usage Data**: Page visits, search queries, and feature usage to improve the platform.
• **Communication Data**: Messages and cover letters sent through the platform.`
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to:
• Provide and improve the RentEase platform and its features.
• Match tenants with suitable properties and owners.
• Generate rental agreements on your behalf.
• Send notifications about application status, new applications, and agreement generation.
• Comply with legal obligations under Indian law.
• Prevent fraud and maintain platform security.`
            },
            {
              title: '3. Google OAuth Data Usage',
              content: `RentEase uses Google Sign-In for authentication. When you sign in with Google:
• We receive your name, email address, and profile photo from Google.
• We do not receive your Google password, payment methods, or other personal data.
• We do not share your Google account data with third parties.
• Google's use of your data is governed by Google's Privacy Policy (policies.google.com/privacy).`
            },
            {
              title: '4. Data Storage and Security',
              content: `• All data is stored on secure servers with encryption at rest and in transit (TLS/SSL).
• Passwords are never stored — we use Google OAuth exclusively.
• We implement rate limiting, input validation, and JWT-based authentication to protect accounts.
• Access to production databases is restricted to authorized personnel only.
• We retain your data for as long as your account is active or as required by law.`
            },
            {
              title: '5. Data Sharing',
              content: `We share data only in the following circumstances:
• **Between Users**: Property details are visible publicly. Application details are shared between the specific tenant and property owner.
• **Service Providers**: We use Cloudinary (image hosting) and Anthropic (AI agreement generation). These providers process data under their own privacy policies.
• **Legal Requirements**: We may disclose data if required by law, court order, or government authority.
• We do not sell your personal data to advertisers or third parties.`
            },
            {
              title: '6. Your Rights',
              content: `You have the right to:
• **Access**: Request a copy of all personal data we hold about you.
• **Rectification**: Correct inaccurate personal information in your profile.
• **Deletion**: Request deletion of your account and associated data. Email support@rentease.in.
• **Portability**: Request your data in a machine-readable format.
• **Withdrawal**: Withdraw consent for data processing at any time.

To exercise any of these rights, contact us at support@rentease.in.`
            },
            {
              title: '7. Cookies',
              content: `RentEase uses minimal cookies:
• **Session cookies**: To maintain your login state securely.
• **Preference cookies**: To remember your search preferences and settings.
We do not use advertising or tracking cookies.`
            },
            {
              title: '8. Children\'s Privacy',
              content: `RentEase is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has provided us data, contact support@rentease.in.`
            },
            {
              title: '9. Changes to This Policy',
              content: `We may update this Privacy Policy periodically. We will notify registered users via email and display a notice on the platform. Continued use after changes constitutes acceptance of the updated policy.`
            },
            {
              title: '10. Contact Us',
              content: `For any privacy-related questions or requests:
• Email: support@rentease.in
• Address: RentEase, India
• Response time: Within 48 hours`
            }
          ].map(section => (
            <div key={section.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
          Questions? Email us at{' '}
          <a href="mailto:support@rentease.in" className="text-primary hover:underline">support@rentease.in</a>
        </div>
      </div>
    </div>
  )
}
