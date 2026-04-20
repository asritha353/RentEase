import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, Search, FileText, Shield, Bell, Download, ChevronRight, Star, Users, Building2, Zap, MapPin, Check } from 'lucide-react'

const HOW_IT_WORKS = {
  Owner: {
    icon: '🏠',
    steps: [
      { icon: '📸', title: 'List Your Property', desc: 'Add photos, amenities, and rent. Our AI suggests the ideal market price.' },
      { icon: '📋', title: 'Review Applications', desc: 'See full tenant profiles — income, occupation, cover message, and move-in date.' },
      { icon: '📄', title: 'Generate Agreement', desc: 'One click generates a legally structured rental agreement. Download and sign.' },
    ]
  },
  Tenant: {
    icon: '🏃',
    steps: [
      { icon: '🔍', title: 'Search & Filter', desc: 'Filter by city, BHK, rent range, furnishing, and amenities across 100+ listings.' },
      { icon: '✍️', title: 'Apply in 2 Minutes', desc: 'Submit your profile once. Cover message, occupation, and move-in date — all in one form.' },
      { icon: '🎉', title: 'Move In', desc: 'Get accepted, download your agreement, and move into your new home.' },
    ]
  },
  Admin: {
    icon: '⚙️',
    steps: [
      { icon: '📊', title: 'Monitor Platform', desc: 'Real-time stats dashboard — users, properties, applications, and agreements.' },
      { icon: '👥', title: 'Manage Users', desc: 'Block/unblock accounts, review user activity, and maintain platform integrity.' },
      { icon: '📝', title: 'Audit Trail', desc: 'Full activity log of every action on the platform for compliance and oversight.' },
    ]
  }
}

const FEATURES = [
  { icon: Zap, title: 'AI-Powered Agreements', desc: 'Claude generates 19-section legally structured rental agreements in seconds. Covers all Indian property law requirements.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Users, title: 'Role-Based Dashboards', desc: 'Purpose-built interfaces for Owners, Tenants, and Admins. No clutter, just what each role needs.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Search, title: 'Smart Search & Filters', desc: 'Filter by city, rent, BHK, furnishing, and amenities. Find the right property in seconds.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { icon: Bell, title: 'Real-Time Notifications', desc: 'Owners get notified instantly when tenants apply. Tenants hear back fast — no more waiting in the dark.', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Shield, title: 'Secure Authentication', desc: 'One-click sign-in via Google. No passwords to remember or forget. Enterprise-grade JWT security.', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Download, title: 'PDF Agreement Download', desc: 'Print-ready rental agreements with watermark, signature blocks, and legal formatting. Download instantly.', color: 'text-rose-600', bg: 'bg-rose-50' },
]

const TESTIMONIALS = [
  { name: 'Ravi Shankar', role: 'Property Owner', city: 'Hyderabad', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ravi', quote: "Listed my 3BHK in Banjara Hills and had 5 applications within a week. The AI-generated agreement saved me ₹8,000 in advocate fees. Game changer.", stars: 5 },
  { name: 'Ananya Krishnan', role: 'Software Engineer', city: 'Bangalore', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya', quote: "Found my apartment in Koramangala in 2 days. The application form was so detailed that the owner immediately knew I was serious. Loved the experience.", stars: 5 },
  { name: 'Priya Mehta', role: 'Property Owner', city: 'Mumbai', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', quote: "Managing 4 properties used to be chaos. Now I see all applications in one place, know exactly who's applying, and generate agreements with one click.", stars: 5 },
]

const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 'Pune', 'Vijayawada', 'Guntur', 'Ongole', 'Amaravati', 'Tadepalli']

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'Owner' | 'Tenant' | 'Admin'>('Owner')
  const [searchCity, setSearchCity] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    navigate(searchCity ? `/properties?city=${searchCity}` : '/properties')
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>RentEase — India's Smartest Rental Management Platform</title>
        <meta name="description" content="List properties, find tenants, and generate legal rental agreements — all in one place. Built for Indian rental market." />
      </Helmet>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <Home size={22} className="text-primary" /> RentEase
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <Link to="/properties" className="hover:text-primary transition-colors">Browse Properties</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-900 transition-colors text-sm">Log in</Link>
            <Link to="/register" className="btn-primary py-2 px-5 text-sm">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            🇮🇳 Made in India · Trusted by 500+ landlords and tenants
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            India's Smartest<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Rental Management</span> Platform
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            List properties, find verified tenants, and generate legally structured rental agreements — all in one place.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
            <select value={searchCity} onChange={e => setSearchCity(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm text-sm font-medium">
              <option value="" className="text-slate-800">All Cities</option>
              {CITIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
            </select>
            <button onClick={handleSearch} className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
              <Search size={18} /> Search Properties
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/login" className="px-6 py-3 bg-owner text-white rounded-2xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2">
              🏠 List Your Property <ChevronRight size={16} />
            </Link>
            <Link to="/properties" className="px-6 py-3 bg-tenant text-white rounded-2xl font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
              🔍 Find a Home <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="bg-slate-50 border-b border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ['100+', 'Properties Listed'],
              ['5', 'Cities Active'],
              ['Instant', 'Agreement Generation'],
              ['Secure', 'Google Login'],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-extrabold text-slate-900">{val}</div>
                <div className="text-sm text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-500 text-lg">A platform built for every stakeholder in the rental journey</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {(Object.keys(HOW_IT_WORKS) as Array<'Owner' | 'Tenant' | 'Admin'>).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {HOW_IT_WORKS[tab].icon} {tab}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS[activeTab].steps.map((step, i) => (
            <div key={step.title} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{step.icon}</div>
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Step {i + 1}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-500 text-lg">Built from the ground up for the Indian rental market</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-slate-100">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Browse ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Browse by City</h2>
          <p className="text-slate-500">Properties across India's top rental markets</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {CITIES.map(city => (
            <Link key={city} to={`/properties?city=${city}`}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:text-primary transition-all font-semibold text-slate-700 shadow-sm hover:shadow-md">
              <MapPin size={16} /> {city}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">What Our Users Say</h2>
            <p className="text-slate-400">Real experiences from owners and tenants across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex text-amber-400 mb-4">
                  {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border border-white/20" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-700 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 text-lg mb-8">Join hundreds of property owners and tenants using RentEase across India.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-slate-50 transition-colors">
              Create an Account
            </Link>
            <Link to="/properties" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
              Browse Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Home size={20} className="text-primary" /> RentEase
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/properties" className="hover:text-white transition-colors">Browse</Link>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} RentEase. All rights reserved.</span>
            <span>Made in India 🇮🇳 · support@rentease.in</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
