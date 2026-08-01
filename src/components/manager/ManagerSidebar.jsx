import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, IdCard, Megaphone, Settings, ArrowLeftRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import LanguageSwitcher from '../LanguageSwitcher'

const LINKS = [
  { to: '/manager', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/manager/calendar', icon: CalendarDays, label: 'Schedule' },
  { to: '/manager/staff', icon: IdCard, label: 'Staff' },
  { to: '/manager/marketing', icon: Megaphone, label: 'Marketing' },
  { to: '/manager/settings', icon: Settings, label: 'Settings' },
]

export default function ManagerSidebar() {
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const { businessSettings } = useData()

  return (
    <nav className="hidden lg:flex flex-col h-screen sticky top-0 start-0 z-40 py-6 w-72 border-e border-outline-variant bg-surface shrink-0">
      <div className="px-6 py-2 flex items-center justify-between mb-6">
        <span className="font-display-lg-mobile text-display-lg-mobile text-primary">{t('Nexus Booking')}</span>
        <LanguageSwitcher />
      </div>
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-headline-md shrink-0">
          {businessSettings.name.slice(0, 1)}
        </div>
        <div>
          <p className="font-headline-md text-headline-md text-on-surface">{t('Salon Manager')}</p>
          <p className="text-body-sm text-on-surface-variant">{t('Main Street Branch')}</p>
          <p className="font-label-caps text-label-caps text-outline mt-1 uppercase">{t('Admin Access')}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1 px-2">
        {LINKS.map(({ to, icon: Icon, label, end }) => {
          const active = end ? pathname === to : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded font-body-lg text-body-lg transition-colors ${
                active
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon size={20} />
              {t(label)}
            </Link>
          )
        })}
      </div>
      <div className="px-4 pt-4 border-t border-outline-variant/50">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 mx-2 rounded font-body-lg text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeftRight size={18} />
          {t('View Client App')}
        </Link>
      </div>
    </nav>
  )
}
