
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet'
import { MapPin } from 'lucide-react'
import type { FacilitySummary } from '../data/monitoring'
import 'leaflet/dist/leaflet.css'

type Props = {
  summaries: FacilitySummary[]
}

function FacilityActivityMap({ summaries }: Props) {
  return (
    <section className="relative isolate z-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <MapPin
              size={17}
              strokeWidth={1.8}
              className="text-[var(--color-primary)]"
            />

            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Facility Monitoring
            </span>
          </div>

          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Healthcare Facility Activity Map
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Approximate sample facility locations with
            aggregated appointment activity.
          </p>
        </div>

        {/* Facility Count */}
        <span className="inline-flex shrink-0 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
          {summaries.length}{' '}
          {summaries.length === 1 ? 'Facility' : 'Facilities'}
        </span>
      </div>

      {/* Map */}
      <div className="relative z-0 h-[400px] w-full sm:h-[430px]">
        <MapContainer
          center={[10.69, 122.43]}
          zoom={10}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {summaries.map((facility) => (
            <CircleMarker
              key={facility.facilityId}
              center={[
                facility.latitude,
                facility.longitude,
              ]}
              radius={10}
              pathOptions={{
                color: '#A4562A',
                fillColor: '#B96532',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="text-sm font-semibold text-[#44352C]">
                    {facility.name}
                  </p>

                  <p className="mt-1 text-xs text-[#806C5C]">
                    {facility.location}
                  </p>

                  <div className="my-3 border-t border-[#EFE1D4]" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-5">
                      <span className="text-xs text-[#806C5C]">
                        Requests
                      </span>

                      <span className="text-sm font-semibold text-[#B96532]">
                        {facility.requests}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <span className="text-xs text-[#806C5C]">
                        Completed
                      </span>

                      <span className="text-sm font-semibold text-[#36734D]">
                        {facility.completed}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border)] px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-[#A4562A] bg-[#B96532]" />

          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Sample Healthcare Facility
          </span>
        </div>

        <span className="text-xs text-[var(--color-text-muted)]">
          Select a marker to view appointment activity.
        </span>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 sm:px-6">
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          Map markers represent approximate fictional facility
          locations, not verified operational healthcare sites.
        </p>
      </div>
    </section>
  )
}

export default FacilityActivityMap
