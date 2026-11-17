import { facilities } from './facilities'

const STORAGE_KEY = 'aio-demo-selected-facility'
export const FACILITY_SELECTION_EVENT =
  'aio-selected-facility-updated'

export function getSelectedFacilityId(): number {
  const fallback = Number(facilities[0]?.id ?? 1)

  if (typeof window === 'undefined') {
    return fallback
  }

  const saved = Number(localStorage.getItem(STORAGE_KEY))

  const exists = facilities.some(
    (facility) => Number(facility.id) === saved
  )

  return exists ? saved : fallback
}

export function setSelectedFacilityId(id: number): void {
  const exists = facilities.some(
    (facility) => Number(facility.id) === id
  )

  if (!exists) return

  localStorage.setItem(STORAGE_KEY, String(id))

  window.dispatchEvent(
    new Event(FACILITY_SELECTION_EVENT)
  )
}