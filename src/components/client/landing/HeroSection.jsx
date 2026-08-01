import { Sparkles } from 'lucide-react'
import { useData } from '../../../context/DataContext'

export default function HeroSection() {
  const { businessSettings } = useData()

  return (
    <section className="relative w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] min-h-[420px] overflow-hidden shadow-card-client-lg flex flex-col">
      <img src={businessSettings.heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/50 to-transparent" />

      <div className="relative z-10 flex flex-col flex-1 p-6 sm:p-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface/90 backdrop-blur-sm shadow-md flex items-center justify-center overflow-hidden p-2 shrink-0">
            {businessSettings.logoUrl ? (
              <img src={businessSettings.logoUrl} alt={businessSettings.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <Sparkles className="text-primary" size={28} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
