import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, IdCard, Megaphone, Settings } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const TABS = [
  { to: '/manager', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/manager/calendar', icon: CalendarDays, label: 'Schedule' },
  { to: '/manager/staff', icon: IdCard, label: 'Staff' },
  { to: '/manager/marketing', icon: Megaphone, label: 'Marketing' },
  { to: '/manager/settings', icon: Settings, label: 'Settings' },
]

export default function ManagerBottomNav() {
  const { pathname } = useLocation()
  const { t } = useLanguage()

  return (
    <nav className="lg:hidden fixed bottom-0 start-0 end-0 z-50 flex justify-around items-center h-20 px-1 pb-safe bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
      {TABS.map(({ to, icon: Icon, label, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-full transition-all duration-150 ${
              active ? 'bg-primary-container text-on-primary-container scale-95' : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span className="font-mono text-[9px] tracking-wide mt-1">{t(label)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
