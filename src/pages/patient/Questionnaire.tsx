
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { addAppointment } from '../../data/appointments'

const symptomOptions = [
  'Fever',
  'Cough',
  'Headache',
  'Runny nose',
  'Stomach discomfort',
  'Sore throat',
  'Body aches',
  'Other',
]

const durationOptions = [
  'Today',
  '1–3 days',
  '4–7 days',
  'More than a week',
]

type Facility = {
  id: number
  name: string
  location: string
  services: string[]
}

function Questionnaire() {
  const navigate = useNavigate()
  const location = useLocation()

  const facility = location.state?.facility as Facility | undefined

  // Form state
  const [service, setService] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [otherDetails, setOtherDetails] = useState('')
  const [duration, setDuration] = useState('')
  const [consent, setConsent] = useState(false)

  // Get today's local date
  const today = new Date()
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const otherSelected = symptoms.includes('Other')
  const otherDetailsValid = !otherSelected || otherDetails.trim().length > 0

  const formValid =
    !!facility &&
    !!service &&
    facility.services.includes(service) &&
    !!preferredDate &&
    preferredDate >= minDate &&
    symptoms.length > 0 &&
    otherDetailsValid &&
    !!duration &&
    consent

  // Add or remove a symptom
  function toggleSymptom(symptom: string) {
    if (symptom === 'Other' && otherSelected) {
      setOtherDetails('')
    }

    setSymptoms((previous) =>
      previous.includes(symptom)
        ? previous.filter((item) => item !== symptom)
        : [...previous, symptom]
    )
  }

  // Submit appointment request
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!facility || !formValid) {
      return
    }

    const submittedSymptoms = symptoms.map((symptom) =>
      symptom === 'Other'
        ? `Other: ${otherDetails.trim()}`
        : symptom
    )

    const appointment = addAppointment({
      facilityId: facility.id,
      facilityName: facility.name,
      patient: 'Demo Patient',
      service,
      date: preferredDate,
      symptoms: submittedSymptoms,
      duration,
    })

    navigate('/patient/confirmation', {
      state: { appointment },
    })
  }

  // Handle missing facility
  if (!facility) {
    return (
      <main className="theme-patient aio-page px-5 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">
          No facility selected
        </h1>

        <p className="mt-2 text-[var(--color-text-muted)]">
          Please select a healthcare facility before requesting an appointment.
        </p>

        <button
          type="button"
          onClick={() => navigate('/patient')}
          className="mt-4 font-semibold text-[var(--color-primary)] underline underline-offset-4"
        >
          Find a healthcare facility
        </button>
      </main>
    )
  }

  return (
    <main className="theme-patient aio-page px-5 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/patient')}
          className="aio-back-button mb-8"
        >
          <ArrowLeft size={17} />
          Back to facilities
        </button>

        {/* Questionnaire Card */}
        <div className="aio-card p-6 md:p-8">

          {/* Header */}
          <div className="mb-6 inline-flex rounded-xl bg-[var(--color-primary-soft)] p-3 text-[var(--color-primary)]">
            <ClipboardList size={26} />
          </div>

          <p className="mb-2 text-sm font-semibold text-[var(--color-primary)]">
            STEP 2 OF 2
          </p>

          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Appointment Questionnaire
          </h1>

          <p className="mt-2 text-[var(--color-text-muted)]">
            Tell the healthcare facility about your concerns before your visit.
          </p>

          {/* Selected Facility */}
          <div className="mt-6 rounded-xl bg-[var(--color-surface-muted)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">
              Selected Facility
            </p>

            <p className="mt-1 font-semibold text-[var(--color-text)]">
              {facility.name}
            </p>

            <p className="text-sm text-[var(--color-text-muted)]">
              {facility.location}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">

            {/* Appointment Details */}
            <section className="space-y-5">
              <div>
                <label
                  htmlFor="service"
                  className="block font-semibold text-[var(--color-text)]"
                >
                  What healthcare service do you need?
                </label>

                <select
                  id="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  className="mt-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                >
                  <option value="">Select a service</option>

                  {facility.services.map((availableService) => (
                    <option
                      key={availableService}
                      value={availableService}
                    >
                      {availableService}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="preferredDate"
                  className="block font-semibold text-[var(--color-text)]"
                >
                  Preferred Appointment Date
                </label>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Your preferred date is subject to facility approval.
                </p>

                <input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  min={minDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                  className="mt-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>
            </section>

            {/* Symptoms */}
            <section>
              <h2 className="font-semibold text-[var(--color-text)]">
                What are you experiencing?
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Select all that apply.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {symptomOptions.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${symptoms.includes(symptom) ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`} 
                  >
                    <input
                      type="checkbox"
                      checked={symptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="accent-[var(--color-primary)]"
                    />

                    <span className="text-sm text-[var(--color-text)]">
                      {symptom}
                    </span>
                  </label>
                ))}
              </div>

              {/* Other Symptoms Details */}
              {otherSelected && (
                <div className="mt-5">
                  <label
                    htmlFor="otherDetails"
                    className="block font-semibold text-[var(--color-text)]"
                  >
                    Please describe your symptoms or concerns
                  </label>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Briefly describe what you are experiencing.
                  </p>

                  <textarea
                    id="otherDetails"
                    value={otherDetails}
                    onChange={(e) => setOtherDetails(e.target.value)}
                    placeholder="Enter additional details..."
                    rows={4}
                    maxLength={500}
                    required
                    className="mt-3 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                  />

                  <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">
                    {otherDetails.length}/500 characters
                  </p>
                </div>
              )}
            </section>

            {/* Symptom Duration */}
            <section>
              <h2 className="font-semibold text-[var(--color-text)]">
                How long have you experienced these symptoms?
              </h2>

              <div className="mt-4 space-y-3">
                {durationOptions.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${duration === option ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={option}
                      checked={duration === option}
                      onChange={() => setDuration(option)}
                      className="accent-[var(--color-primary)]"
                    />

                    <span className="text-sm text-[var(--color-text)]">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Consent */}
            <section className="border-t border-[var(--color-border)] pt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                />

                <span className="text-sm leading-relaxed text-[var(--color-text)]">
                  I agree to share the information I provided with the
                  selected healthcare facility for appointment coordination,
                  subject to the privacy notice.
                </span>
              </label>

              <p className="mt-2 pl-7 text-xs leading-relaxed text-[var(--color-text-muted)]">
                Prototype only. A complete privacy notice will be required
                before collecting real patient information.
              </p>
            </section>

            {/* Medical Disclaimer */}
            <p className="text-sm text-[var(--color-text-muted)]">
              This questionnaire is not a diagnosis or an emergency service.
              For urgent medical concerns, seek immediate medical assistance.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formValid}
              className="aio-btn-primary flex w-full items-center justify-center gap-2 px-6 py-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Request
              <ArrowRight size={18} />
            </button>

          </form>
        </div>
      </div>
    </main>
  )
}

export default Questionnaire
