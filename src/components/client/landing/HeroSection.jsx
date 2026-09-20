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
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <div className="absolute -inset-2 rounded-full bg-primary-fixed/60 blur-md animate-glow-pulse pointer-events-none" />
            {businessSettings.logoUrl ? (
              <div className="relative w-full h-full rounded-full bg-surface/90 backdrop-blur-sm shadow-md overflow-hidden">
                <img
                  src={businessSettings.logoUrl}
                  alt={businessSettings.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="relative w-full h-full rounded-full bg-surface/90 backdrop-blur-sm shadow-md flex items-center justify-center">
                <Sparkles className="text-primary" size={36} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
