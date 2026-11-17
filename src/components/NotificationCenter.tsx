
import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  CheckCheck,
  X,
  Inbox,
} from 'lucide-react'
import { useNavigate } from 'react-router'

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../data/notifications'

import type {
  AppNotification,
  NotificationRole,
} from '../data/notifications'

import { FACILITY_SELECTION_EVENT } from '../data/facilitySelection'

type Props = {
  role: NotificationRole
  facilityId?: number
}

type NotificationTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'default'

function getNotificationTone(
  notification: AppNotification
): NotificationTone {
  const content = (
    notification.title + ' ' + notification.message
  ).toLowerCase()

  if (
    content.includes('declined') ||
    content.includes('rejected') ||
    content.includes('cancelled')
  ) {
    return 'danger'
  }

  if (
    content.includes('approved') ||
    content.includes('completed') ||
    content.includes('accepted') ||
    content.includes('confirmed')
  ) {
    return 'success'
  }

  if (
    content.includes('rescheduled') ||
    content.includes('proposed') ||
    content.includes('change requested') ||
    content.includes('suggested date')
  ) {
    return 'warning'
  }

  return 'default'
}

const toneStyles: Record<
  NotificationTone,
  { dot: string; label: string }
> = {
  success: {
    dot: 'bg-[#36734D]',
    label: 'text-[#36734D]',
  },
  warning: {
    dot: 'bg-[#C48734]',
    label: 'text-[#A56A20]',
  },
  danger: {
    dot: 'bg-[#C65353]',
    label: 'text-[#B44343]',
  },
  default: {
    dot: 'bg-[#8451E5]',
    label: 'text-[#8451E5]',
  },
}

function NotificationCenter({ role, facilityId }: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] =
    useState<AppNotification[]>([])

  useEffect(() => {
    const refresh = () => {
      setNotifications(getNotifications(role, facilityId))
    }

    refresh()

    window.addEventListener('aio-appointments-updated', refresh)
    window.addEventListener('aio-notifications-updated', refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('aio-appointments-updated', refresh)
      window.removeEventListener('aio-notifications-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [role, facilityId])

  useEffect(() => {
    setOpen(false)
  }, [role, facilityId])

  useEffect(() => {
    const closeOnFacilitySwitch = () => setOpen(false)

    window.addEventListener(
      FACILITY_SELECTION_EVENT,
      closeOnFacilitySwitch
    )

    return () => {
      window.removeEventListener(
        FACILITY_SELECTION_EVENT,
        closeOnFacilitySwitch
      )
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  function handleOpenNotification(
    notification: AppNotification
  ) {
    markNotificationRead(notification.id)

    setNotifications(getNotifications(role, facilityId))
    setOpen(false)

    if (role === 'Patient') {
      navigate('/patient/appointments')
    } else {
      navigate('/facility')
    }
  }

  function handleMarkAllRead() {
    markAllNotificationsRead(role, facilityId)
    setNotifications(getNotifications(role, facilityId))
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Notification trigger */}
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((previous) => !previous)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8451E5] ${
          open
            ? 'border-[#C9B4EE] bg-[#E9DCFF] text-[#7038CE]'
            : 'border-[#E9E1F3] bg-[#FFFCFF] text-[#70647F] hover:bg-[#F3EFF9]'
        }`}
      >
        <Bell size={19} strokeWidth={1.9} />

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#8451E5] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-[1100] mt-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#E9E1F3] bg-[#FFFCFF] shadow-[0_12px_32px_rgba(48,36,65,0.12)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E9E1F3] px-4 py-4">
            <div>
              <h3 className="text-sm font-bold text-[#302441]">
                Notifications
              </h3>

              <p className="mt-1 text-xs text-[#81758F]">
                {unreadCount === 0
                  ? 'You are all caught up'
                  : `${unreadCount} unread notification${
                      unreadCount === 1 ? '' : 's'
                    }`}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-[#81758F] transition-colors hover:bg-[#F3EFF9] hover:text-[#302441]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mark all as read */}
          {notifications.length > 0 && (
            <div className="flex justify-end border-b border-[#E9E1F3] px-4 py-2.5">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#8451E5] transition-colors hover:text-[#7038CE] disabled:cursor-default disabled:opacity-40"
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            </div>
          )}

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const tone = getNotificationTone(notification)
              const style = toneStyles[tone]

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleOpenNotification(notification)
                  }
                  className={`w-full border-b border-[#E9E1F3] px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[#F5F0FC] ${
                    notification.read
                      ? 'bg-[#FFFCFF]'
                      : 'bg-[#F7F2FF]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status indicator */}
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.read
                          ? 'bg-[#D8D0E2]'
                          : style.dot
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-5 text-[#302441] ${
                          notification.read
                            ? 'font-medium'
                            : 'font-bold'
                        }`}
                      >
                        {notification.title}
                      </p>

                      <p className="mt-1.5 text-xs leading-relaxed text-[#70647F]">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-[#94889F]">
                        {new Date(
                          notification.timestamp
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Empty state */}
            {notifications.length === 0 && (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EFF9] text-[#8451E5]">
                  <Inbox size={23} strokeWidth={1.7} />
                </div>

                <p className="text-sm font-semibold text-[#302441]">
                  No notifications yet
                </p>

                <p className="mt-1 max-w-56 text-xs leading-relaxed text-[#81758F]">
                  Appointment updates will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
