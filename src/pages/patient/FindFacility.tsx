
import { useMemo, useState } from 'react'
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Building2,
  Phone,
  Map,
  List,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  facilities,
  availableServices,
} from '../../data/facilities'
import type {
  Facility,
  FacilityOwnership,
} from '../../data/facilities'

type ViewMode = 'list' | 'map'

function FindFacility() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [service, setService] = useState('All')
  const [ownership, setOwnership] =
    useState<FacilityOwnership | 'All'>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedFacility, setSelectedFacility] =
    useState<Facility | null>(null)

  const filteredFacilities = useMemo(() => {
    const term = search.trim().toLowerCase()

    return facilities.filter((facility) => {
      const searchableText = [
        facility.name,
        facility.location,
        facility.address,
        facility.ownership,
        ...facility.services,
      ]
        .join(' ')
        .toLowerCase()

      return (
        searchableText.includes(term) &&
        (service === 'All' ||
          facility.services.includes(service)) &&
        (ownership === 'All' ||
          facility.ownership === ownership)
      )
    })
  }, [search, service, ownership])

  function requestAppointment(facility: Facility) {
    navigate('/patient/questionnaire', {
      state: { facility },
    })
  }

  function openFacilityMap(facility: Facility) {
    const url =
      `https://www.openstreetmap.org/?mlat=${facility.latitude}` +
      `&mlon=${facility.longitude}` +
      `#map=14/${facility.latitude}/${facility.longitude}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const mapFacility =
    selectedFacility &&
    filteredFacilities.some(
      (facility) => facility.id === selectedFacility.id
    )
      ? selectedFacility
      : filteredFacilities[0]

  const mapUrl = mapFacility
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        mapFacility.longitude - 0.035
      }%2C${mapFacility.latitude - 0.025}%2C${
        mapFacility.longitude + 0.035
      }%2C${mapFacility.latitude + 0.025}&layer=mapnik&marker=${
        mapFacility.latitude
      }%2C${mapFacility.longitude}`
    : ''

  return (
    <main className="theme-patient aio-page px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">

        {/* Navigation */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="aio-back-button"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>
        
          <button
            type="button"
            onClick={() => navigate('/patient/appointments')}
            className="aio-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
          >
            <ClipboardList size={18} />
            My Appointments
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 border-l-4 border-[var(--color-primary)] pl-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Patient Portal
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            Find a Healthcare Facility
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
            Explore healthcare facilities and services,
            then request an appointment.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="aio-card p-5 sm:p-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="search"
              placeholder="Search facility, service, or location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-12 pr-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
            <SlidersHorizontal size={17} />
            Filter Facilities
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="service-filter"
                className="mb-2 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Healthcare Service
              </label>

              <select
                id="service-filter"
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
              >
                <option value="All">All Services</option>
                {availableServices.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ownership-filter"
                className="mb-2 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Facility Ownership
              </label>

              <select
                id="ownership-filter"
                value={ownership}
                onChange={(event) =>
                  setOwnership(
                    event.target.value as FacilityOwnership | 'All'
                  )
                }
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
              >
                <option value="All">All Facilities</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results and View Toggle */}
        <div className="mb-5 mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {filteredFacilities.length}
            </span>{' '}
            facilities found
          </p>

          <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
              }`}
            >
              <List size={16} />
              List
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
              }`}
            >
              <Map size={16} />
              Map
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="relative isolate z-0 mb-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {mapFacility ? (
              <>
                <iframe
                  key={mapUrl}
                  title="Healthcare Facility Map"
                  src={mapUrl}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                <div className="p-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Map centered on: {mapFacility.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Approximate demonstration coordinates.
                    Select a facility below to change the map.
                  </p>
                </div>
              </>
            ) : (
              <p className="p-8 text-center text-sm text-[var(--color-text-muted)]">
                No facilities to display on the map.
              </p>
            )}
          </div>
        )}

        {/* Facility Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredFacilities.map((facility) => (
            <article
              key={facility.id}
              className={`rounded-xl border bg-[var(--color-surface)] p-5 transition-colors sm:p-6 ${
                selectedFacility?.id === facility.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-surface)] ring-1 ring-[var(--color-primary-soft)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-lg bg-[var(--color-primary-soft)] p-3 text-[var(--color-primary)]">
                  <Building2 size={24} />
                </div>

                <span className="rounded-md bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                  {facility.ownership}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {facility.name}
              </h2>

              <div className="mt-3 flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <MapPin size={17} className="mt-0.5 shrink-0" />
                {facility.address}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Phone size={16} />
                {facility.contact}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Available Services
                </p>

                <div className="flex flex-wrap gap-2">
                  {facility.services.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5">
                <button
                  type="button"
                  onClick={() => requestAppointment(facility)}
                  className="aio-btn-primary inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold"
                >
                  Request Appointment
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFacility(facility)
                    setViewMode('map')
                  }}
                  aria-label={`View ${facility.name} on map`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
                >
                  <MapPin size={16} />
                  View on Map
                </button>

                <button
                  type="button"
                  onClick={() => openFacilityMap(facility)}
                  className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
                >
                  Open Map
                  <ExternalLink size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredFacilities.length === 0 && (
          <div className="aio-card p-10 text-center">
            <Search
              size={32}
              className="mx-auto mb-4 text-[var(--color-text-muted)]"
            />

            <p className="font-semibold text-[var(--color-text)]">
              No facilities found
            </p>

            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Try another search or change your filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setService('All')
                setOwnership('All')
              }}
              className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs leading-5 text-[var(--color-text-muted)]">
          Demonstration facility records only. Names, services,
          and map markers do not represent verified providers
          or actual facility participation.
        </p>
      </div>
    </main>
  )
}

export default FindFacility
