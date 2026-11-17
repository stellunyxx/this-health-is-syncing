
import { useEffect, useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { facilities } from '../data/facilities'
import {
  FACILITY_SELECTION_EVENT,
  getSelectedFacilityId,
  setSelectedFacilityId,
} from '../data/facilitySelection'

export default function FacilitySelector() {
  const [selectedId, setSelectedId] = useState(
    getSelectedFacilityId
  )

  useEffect(() => {
    const refresh = () => {
      setSelectedId(getSelectedFacilityId())
    }

    window.addEventListener(FACILITY_SELECTION_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(
        FACILITY_SELECTION_EVENT,
        refresh
      )
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <section className="aio-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Facility Label */}
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
            <Building2
              size={20}
              className="text-[var(--color-primary)]"
              strokeWidth={1.8}
            />
          </span>

          <div>
            <label
              htmlFor="facility-selector"
              className="block text-sm font-semibold text-[var(--color-text)]"
            >
              Active Demo Facility
            </label>

            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              Select a facility to view its demonstration records.
            </p>
          </div>
        </div>

        {/* Facility Dropdown */}
        <div className="relative w-full sm:max-w-sm">
          <select
            id="facility-selector"
            value={selectedId}
            onChange={(event) => {
              const id = Number(event.target.value)
              setSelectedFacilityId(id)
              setSelectedId(id)
            }}
            className="w-full cursor-pointer appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-4 pr-11 text-sm font-medium text-[var(--color-text)] outline-none transition-colors hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            {facilities.map((facility) => (
              <option
                key={facility.id}
                value={facility.id}
              >
                {facility.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Prototype Notice */}
      <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-xs leading-5 text-[var(--color-text-muted)]">
        Switching facilities changes the demonstration records
        displayed. It does not provide secure account access.
      </p>
    </section>
  )
}
