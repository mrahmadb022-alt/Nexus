import { useLanguage } from '../context/LanguageContext'

const STATUS_STYLES = {
  pending: 'bg-pending-container text-on-pending-container',
  confirmed: 'bg-secondary-container text-on-secondary-container',
  'in-service': 'bg-success-container text-on-success-container',
  completed: 'bg-surface-container text-on-surface-variant',
  cancelled: 'bg-error-container text-on-error-container',
}

const STATUS_DOT = {
  pending: 'bg-amber-500',
  confirmed: 'bg-secondary',
  'in-service': 'bg-green-600 animate-pulse',
  completed: 'bg-outline',
  cancelled: 'bg-error',
}

const STATUS_KEY = {
  pending: 'status_pending',
  confirmed: 'status_confirmed',
  'in-service': 'status_in_service',
  completed: 'status_completed',
  cancelled: 'status_cancelled',
}

export default function StatusPill({ status }) {
  const { t } = useLanguage()
  return (
    <span className={`status-pill ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || STATUS_DOT.pending}`} />
      {t(STATUS_KEY[status] || 'Pending')}
    </span>
  )
}
