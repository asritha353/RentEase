import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Public
const LandingPage    = lazy(() => import('@/pages/public/LandingPage'))
const LoginPage      = lazy(() => import('@/pages/public/LoginPage'))
const RegisterPage   = lazy(() => import('@/pages/public/RegisterPage'))
const SelectRolePage = lazy(() => import('@/pages/public/SelectRolePage'))
const PropertiesPage = lazy(() => import('@/pages/public/PropertiesPage'))
const PropertyDetail = lazy(() => import('@/pages/public/PropertyDetail'))
const PrivacyPage    = lazy(() => import('@/pages/public/PrivacyPage'))
const TermsPage      = lazy(() => import('@/pages/public/TermsPage'))
const AuthCallback   = lazy(() => import('@/pages/public/AuthCallback'))

// Tenant
const TenantDashboard    = lazy(() => import('@/pages/tenant/TenantDashboard'))
const TenantSearch       = lazy(() => import('@/pages/tenant/TenantSearch'))
const TenantApplications = lazy(() => import('@/pages/tenant/TenantApplications'))
const TenantAgreements   = lazy(() => import('@/pages/tenant/TenantAgreements'))
const TenantSaved        = lazy(() => import('@/pages/tenant/TenantSaved'))
const TenantProfile      = lazy(() => import('@/pages/tenant/TenantProfile'))

// Owner
const OwnerDashboard    = lazy(() => import('@/pages/owner/OwnerDashboard'))
const OwnerProperties   = lazy(() => import('@/pages/owner/OwnerProperties'))
const OwnerPropertyForm = lazy(() => import('@/pages/owner/OwnerPropertyForm'))
const OwnerApplications = lazy(() => import('@/pages/owner/OwnerApplications'))
const OwnerAgreements   = lazy(() => import('@/pages/owner/OwnerAgreements'))
const OwnerProfile      = lazy(() => import('@/pages/owner/OwnerProfile'))

// Admin
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers        = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminProperties   = lazy(() => import('@/pages/admin/AdminProperties'))
const AdminApplications = lazy(() => import('@/pages/admin/AdminApplications'))
const AdminLogs         = lazy(() => import('@/pages/admin/AdminLogs'))

// Error pages
const NotFoundPage  = lazy(() => import('@/pages/errors/NotFoundPage'))
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'))

// Guards
import ProtectedRoute from '@/components/layout/ProtectedRoute'

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/auth/callback"  element={<AuthCallback />} />
        <Route path="/properties"     element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/privacy"        element={<PrivacyPage />} />
        <Route path="/terms"          element={<TermsPage />} />

        {/* Tenant */}
        <Route path="/tenant" element={<ProtectedRoute role="TENANT" />}>
          <Route index              element={<Navigate to="/tenant/dashboard" replace />} />
          <Route path="dashboard"   element={<TenantDashboard />} />
          <Route path="search"      element={<TenantSearch />} />
          <Route path="applications" element={<TenantApplications />} />
          <Route path="agreements"  element={<TenantAgreements />} />
          <Route path="saved"       element={<TenantSaved />} />
          <Route path="profile"     element={<TenantProfile />} />
        </Route>

        {/* Owner */}
        <Route path="/owner" element={<ProtectedRoute role="OWNER" />}>
          <Route index                      element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard"           element={<OwnerDashboard />} />
          <Route path="properties"          element={<OwnerProperties />} />
          <Route path="properties/new"      element={<OwnerPropertyForm />} />
          <Route path="properties/:id/edit" element={<OwnerPropertyForm />} />
          <Route path="applications"        element={<OwnerApplications />} />
          <Route path="agreements"          element={<OwnerAgreements />} />
          <Route path="profile"             element={<OwnerProfile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="ADMIN" />}>
          <Route index               element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="users"        element={<AdminUsers />} />
          <Route path="properties"   element={<AdminProperties />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="logs"         element={<AdminLogs />} />
        </Route>

        {/* Errors */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*"    element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
