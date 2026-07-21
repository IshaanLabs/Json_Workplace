import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/utils/classNames'
import type { Notification } from '@/types/ui'

const DEFAULT_DURATION = 4000

function NotificationItem({ notification }: { notification: Notification }) {
  const remove = useStore((s) => s.removeNotification)

  useEffect(() => {
    const timer = setTimeout(
      () => remove(notification.id),
      notification.duration ?? DEFAULT_DURATION
    )
    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, remove])

  const icons = {
    success: <CheckCircle2 size={15} aria-hidden="true" />,
    error: <AlertCircle size={15} aria-hidden="true" />,
    warning: <AlertTriangle size={15} aria-hidden="true" />,
    info: <Info size={15} aria-hidden="true" />,
  }

  const colours = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]',
    error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]',
    info: 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]',
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-2 rounded border px-3 py-2.5 shadow-sm',
        'text-xs font-medium max-w-[320px]',
        colours[notification.type]
      )}
    >
      <span className="mt-px shrink-0">{icons[notification.type]}</span>
      <span className="flex-1">{notification.message}</span>
      <button
        type="button"
        onClick={() => remove(notification.id)}
        aria-label="Dismiss notification"
        className="ml-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  )
}

export function NotificationList() {
  const notifications = useStore((s) => s.notifications)

  if (notifications.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-8 right-4 z-50 flex flex-col gap-2"
    >
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  )
}
