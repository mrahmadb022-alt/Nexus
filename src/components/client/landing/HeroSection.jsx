import { useData } from '../../../context/DataContext'

export default function HeroSection() {
  const { businessSettings } = useData()

  return (
    <section className="relative w-full h-[46vh] min-h-[320px] rounded-3xl overflow-hidden shadow-card-client-lg">
      <img src={businessSettings.heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-inverse-surface/10 to-inverse-surface/40" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {businessSettings.logoUrl ? (
          <img
            src={businessSettings.logoUrl}
            alt={businessSettings.name}
            className="max-h-24 sm:max-h-32 max-w-[70%] object-contain drop-shadow-lg"
          />
        ) : (
          <h1 className="font-sans text-display-lg sm:text-[40px] sm:leading-[48px] text-on-tertiary text-center drop-shadow-lg px-4">
            {businessSettings.name}
          </h1>
        )}
      </div>
    </section>
  )
}
