import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Wallet } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

// Shortcuts to the roadmap tool pages. The mobile bottom nav is already full at 375px (five
// tabs), so on phones these cards on the dashboard are the way in; the desktop sidebar lists
// them as well.
const TOOLS = [{ to: '/manager/finance', icon: Wallet, labelKey: 'nav.finance', descKey: 'tools.finance.desc', feature: 'finance' }]

export default function ToolLinks() {
  const { t, isRtl } = useLanguage()
  const { isFeatureOn } = useData()
  const tools = TOOLS.filter((tool) => isFeatureOn(tool.feature))
  if (!tools.length) return null
  const Chevron = isRtl ? ChevronLeft : ChevronRight
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {tools.map(({ to, icon: Icon, labelKey, descKey }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 bg-surface border border-outline-variant rounded-md p-4 shadow-sm hover:border-primary/40 hover:bg-surface-container-lowest transition-colors"
        >
          <span className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <Icon size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-sans text-body-sm font-semibold text-on-surface">{t(labelKey)}</span>
            <span className="block font-sans text-[12px] text-on-surface-variant truncate">{t(descKey)}</span>
          </span>
          <Chevron size={18} className="text-outline shrink-0" />
        </Link>
      ))}
    </div>
  )
}
