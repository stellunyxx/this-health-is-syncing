
import { ClipboardCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import type { Appointment } from '../../data/appointments'

function RequestConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()

  const appointment = location.state?.appointment as Appointment | undefined

  if (!appointment) {
    return (
      <main className="theme-patient aio-page flex items-center justify-center px-5 py-10">
        <div className="aio-card w-full max-w-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            No appointment request to display
          </h1>

          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Please select a healthcare facility and submit an appointment request first.
          </p>

          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="aio-back-button mt-6"
          >
            <ArrowLeft size={17} />
            Return to facility search
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="theme-patient aio-page flex items-center justify-center px-5 py-10">
      <div className="aio-card w-full max-w-lg p-7 sm:p-9">

        {/* Appointment request icon */}
        <div className="mb-6 flex justify-center">
          <span className="aio-success-bg inline-flex h-16 w-16 items-center justify-center rounded-full">
            <ClipboardCheck
              size={32}
              className="aio-success-text"
              strokeWidth={1.8}
            />
          </span>
        </div>

        {/* Confirmation heading */}
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Appointment Request
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
            Request Submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Your appointment request has been successfully recorded.
            The healthcare facility will review your request before
            confirming your appointment.
          </p>
        </div>

        {/* Appointment details */}
        <section className="mt-8 border-y border-[var(--color-border)] py-5">
          <h2 className="mb-5 text-sm font-semibold text-[var(--color-text)]">
            Request Details
          </h2>

          <dl className="space-y-5">
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">
                Healthcare Facility
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                {appointment.facilityName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">
                Request ID
              </dt>
              <dd className="mt-1 break-all text-sm font-medium text-[var(--color-text)]">
                {appointment.id}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">
                Current Status
              </dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  {appointment.status}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        {/* Navigation actions */}
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/patient/appointments')}
            className="aio-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold"
          >
            View My Appointments
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="aio-back-button w-full justify-center"
          >
            <ArrowLeft size={17} />
            Back to Facilities
          </button>
        </div>

        {/* Prototype disclaimer */}
        <p className="mt-6 text-center text-xs leading-5 text-[var(--color-text-muted)]">
          This is a prototype. Your request is stored locally
          for demonstration purposes.
        </p>
      </div>
    </main>
  )
}

export default RequestConfirmation
