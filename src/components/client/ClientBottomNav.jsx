import { Link, useLocation } from 'react-router-dom'
import { Compass, CalendarDays, Star, User } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const TABS = [
  { to: '/', icon: Compass, label: 'Explore' },
  { to: '/services', icon: CalendarDays, label: 'Bookings' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/appointments', icon: User, label: 'Profile' },
]

export default function ClientBottomNav() {
  const { pathname } = useLocation()
  const { t } = useLanguage()

  return (
    <nav className="md:hidden fixed bottom-0 start-0 end-0 z-50 flex justify-around items-center h-20 px-2 pb-safe bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
      {TABS.map(({ to, icon: Icon, label }) => {
        const active = pathname === to || (to === '/services' && ['/services', '/datetime', '/confirm'].includes(pathname))
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all duration-150 ${
              active ? 'bg-primary-container text-on-primary-container scale-95' : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
            <span className="font-mono text-[10px] tracking-wide mt-1">{t(label)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
