
import {
  CalendarDays,
  HeartPulse,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import NotificationCenter from './NotificationCenter'

function PatientHeader() {
  const navigate = useNavigate()

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-teal-700 p-3 text-white">
          <HeartPulse size={25} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Patient Portal
          </h1>

          <p className="text-sm text-slate-500">
            AIO Healthcare · Demo
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/patient/appointments')}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <CalendarDays size={18} />
          My Appointments
        </button>

        <NotificationCenter role="Patient" />
      </div>
    </header>
  )
}

export default PatientHeader
