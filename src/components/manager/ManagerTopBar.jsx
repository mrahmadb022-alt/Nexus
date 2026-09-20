import { ArrowLeftRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import LanguageSwitcher from '../LanguageSwitcher'

export default function ManagerTopBar({ title }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { businessSettings } = useData()
  return (
    <header className="lg:hidden flex justify-between items-center px-margin-mobile h-16 w-full bg-surface sticky top-0 z-30 border-b border-outline-variant/20">
      <h1 className="font-sans text-display-lg-mobile font-bold text-primary">{title || businessSettings.name || t('Nexus Booking')}</h1>
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/')}
          aria-label={t('View Client App')}
          title={t('View Client App')}
          className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-on-surface-variant"
        >
          <ArrowLeftRight size={20} />
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
