import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

export default function PortfolioMarquee({ photos }) {
  const { isRtl } = useLanguage()
  const [paused, setPaused] = useState(false)

  if (!photos || photos.length === 0) return null

  const track = [...photos, ...photos]
  const duration = Math.max(photos.length * 5, 20)

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl select-none touch-none"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      <div
        className={`flex gap-4 w-max nb-marquee-track ${isRtl ? 'nb-marquee-rtl' : 'nb-marquee-ltr'}`}
        style={{
          direction: 'ltr',
          animationDuration: `${duration}s`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {track.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="w-56 h-72 sm:w-64 sm:h-80 rounded-xl overflow-hidden shrink-0 shadow-card-client"
          >
            <img src={photo.url} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 start-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
