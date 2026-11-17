
import { useEffect, useState } from 'react'
import {
  Building2,
  HeartPulse,
  Shield,
  House,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

import NotificationCenter from './NotificationCenter'
import { BRAND } from '../config/branding'

import {
  FACILITY_SELECTION_EVENT,
  getSelectedFacilityId,
} from '../data/facilitySelection'

const links = [
  {
    label: 'Home',
    path: '/',
    icon: House,
    activeStyle: 'bg-[#E9DCFF] text-[#7038CE]',
  },
  {
    label: 'Patient',
    path: '/patient',
    icon: HeartPulse,
    activeStyle: 'bg-[#E9DCFF] text-[#7038CE]',
  },
  {
    label: 'Facility',
    path: '/facility',
    icon: Building2,
    activeStyle: 'bg-[#E9DCFF] text-[#7038CE]',
  },
  {
    label: 'LGU',
    path: '/lgu',
    icon: Shield,
    activeStyle: 'bg-[#F7E3D0] text-[#A4562A]',
  },
]

function RoleNavigation() {
  const location = useLocation()

  const [selectedFacilityId, setSelectedFacilityId] =
    useState(getSelectedFacilityId)

  useEffect(() => {
    const refresh = () => {
      setSelectedFacilityId(getSelectedFacilityId())
    }

    window.addEventListener(
      FACILITY_SELECTION_EVENT,
      refresh
    )
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(
        FACILITY_SELECTION_EVENT,
        refresh
      )
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const isPatient = location.pathname.startsWith('/patient')
  const isFacility = location.pathname.startsWith('/facility')

  return (
    <header className="sticky top-0 z-[1000] isolate bg-[#F9F6FC] px-4 py-2.5 sm:px-6">
      <nav
        aria-label="Demo interface navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E1F3] bg-[#FFFCFF] px-4 py-2.5 sm:px-5"
      >
        {/* Platform branding */}
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8451E5]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8451E5] text-white">
            <HeartPulse size={20} strokeWidth={1.9} />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#302441]">
              {BRAND.name}
            </span>

            <span className="text-[10px] font-medium tracking-wide text-[#81758F]">
              HEALTHCARE COORDINATION PLATFORM
            </span>
          </div>
        </NavLink>

        {/* Navigation and notifications */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:justify-end">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F3EFF9] p-1">
            {links.map((link) => {
              const Icon = link.icon

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-2 rounded-md',
                      'px-3 py-2 text-xs font-semibold',
                      'transition-colors duration-200',
                      'focus-visible:outline-2',
                      'focus-visible:outline-offset-2',
                      'focus-visible:outline-[#8451E5]',
                      isActive
                        ? link.activeStyle
                        : 'text-[#70647F] hover:bg-[#E9E1F3] hover:text-[#302441]',
                    ].join(' ')
                  }
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </div>

          {isPatient && (
            <NotificationCenter role="Patient" />
          )}

          {isFacility && (
            <NotificationCenter
              role="Healthcare Facility"
              facilityId={selectedFacilityId}
            />
          )}
        </div>
      </nav>
    </header>
  )
}

export default RoleNavigation
