
import { lazy, Suspense } from 'react'
import {
  ArrowRight,
  Building2,
  HeartPulse,
  Shield,
} from 'lucide-react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router'

import RoleNavigation from './components/RoleNavigation'
import { BRAND } from './config/branding'

const FindFacility = lazy(
  () => import('./pages/patient/FindFacility')
)
const Questionnaire = lazy(
  () => import('./pages/patient/Questionnaire')
)
const RequestConfirmation = lazy(
  () => import('./pages/patient/RequestConfirmation')
)
const MyAppointments = lazy(
  () => import('./pages/patient/MyAppointments')
)

const FacilityDashboard = lazy(
  () => import('./pages/facility/FacilityDashboard')
)
const FacilityAnalytics = lazy(
  () => import('./pages/facility/FacilityAnalytics')
)
const AuditLogs = lazy(
  () => import('./pages/facility/AuditLogs')
)

const LGUDashboard = lazy(
  () => import('./pages/lgu/LGUDashboard')
)

const roles = [
  {
    title: 'Patient',
    description:
      'Find healthcare services, request appointments, and manage your visits.',
    icon: HeartPulse,
    path: '/patient',
    iconStyle: 'bg-[#E9DCFF] text-[#8451E5]',
    borderStyle: 'hover:border-[#BDA1EF]',
    linkStyle: 'text-[#8451E5]',
  },
  {
    title: 'Healthcare Facility',
    description:
      'Manage appointment requests, consultations, and facility analytics.',
    icon: Building2,
    path: '/facility',
    iconStyle: 'bg-[#E9DCFF] text-[#8451E5]',
    borderStyle: 'hover:border-[#BDA1EF]',
    linkStyle: 'text-[#8451E5]',
  },
  {
    title: 'LGU / DRRM',
    description:
      'Monitor healthcare activity, service demand, and early warning indicators.',
    icon: Shield,
    path: '/lgu',
    iconStyle: 'bg-[#F7E3D0] text-[#B96532]',
    borderStyle: 'hover:border-[#D8AA85]',
    linkStyle: 'text-[#B96532]',
  },
]

function Home() {
  return (
    <main className="min-h-screen bg-[#F9F6FC] px-5 py-8 text-[#302441] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Hero section */}
        <section className="mb-10 max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#8451E5]">
            {BRAND.tagline}
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Healthcare,
            <span className="text-[#8451E5]">
              {' '}connected.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#70647F] sm:text-lg">
            One platform bringing patients, healthcare facilities,
            and local governments together for more coordinated,
            accessible, and informed healthcare.
          </p>
        </section>

        {/* Portal selection */}
        <section aria-labelledby="portal-heading">
          <div className="mb-5">
            <h2
              id="portal-heading"
              className="text-xl font-bold tracking-tight"
            >
              Explore the platform
            </h2>

            <p className="mt-1 text-sm text-[#70647F]">
              Select a portal to explore its demonstration features.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon

              return (
                <Link
                  key={role.path}
                  to={role.path}
                  className={`group flex flex-col rounded-xl border border-[#E9E1F3] bg-[#FFFCFF] p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8451E5] ${role.borderStyle}`}
                >
                  <div
                    className={`mb-6 inline-flex h-12 w-12 items-center justify-center self-start rounded-xl ${role.iconStyle}`}
                  >
                    <Icon size={25} strokeWidth={1.9} />
                  </div>

                  <h3 className="text-lg font-bold text-[#302441]">
                    {role.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-[#70647F]">
                    {role.description}
                  </p>

                  <div
                    className={`mt-8 flex items-center gap-2 text-sm font-semibold ${role.linkStyle}`}
                  >
                    Explore portal
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-[#E9E1F3] pt-6 text-center">
          <p className="text-xs leading-6 text-[#81758F]">
            {BRAND.name} · Demonstration Prototype
          </p>

          <p className="mt-1 text-xs leading-6 text-[#81758F]">
            All healthcare facilities, appointments, and monitoring
            data are fictional and intended for demonstration only.
          </p>
        </footer>
      </div>
    </main>
  )
}

function PageLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center bg-[#F9F6FC] px-5"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-[#70647F]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#E9DCFF] border-t-[#8451E5]" />
        Loading portal...
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <RoleNavigation />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/patient"
            element={<FindFacility />}
          />
          <Route
            path="/patient/appointments"
            element={<MyAppointments />}
          />
          <Route
            path="/patient/confirmation"
            element={<RequestConfirmation />}
          />
          <Route
            path="/patient/questionnaire"
            element={<Questionnaire />}
          />

          <Route
            path="/facility"
            element={<FacilityDashboard />}
          />
          <Route
            path="/facility/analytics"
            element={<FacilityAnalytics />}
          />
          <Route
            path="/facility/audit-logs"
            element={<AuditLogs />}
          />

          <Route
            path="/lgu"
            element={<LGUDashboard />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
