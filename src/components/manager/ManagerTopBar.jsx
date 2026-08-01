import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher'

export default function ManagerTopBar({ title }) {
  const { t } = useLanguage()
  return (
    <header className="lg:hidden flex justify-between items-center px-margin-mobile h-16 w-full bg-surface sticky top-0 z-30 border-b border-outline-variant/20">
      <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">{title || t('Nexus Booking')}</h1>
      <LanguageSwitcher />
    </header>
  )
}
