'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const SLIDES = [
  {
    src: '/_ (1).jpeg',
    title: 'Nouvelle Saison',
    subtitle: "L'élégance ivoirienne revisitée pour la femme moderne.",
    label: 'Collection 2025',
  },
  {
    src: '/vert-avocat.jpeg',
    title: 'Style & Élégance',
    subtitle: 'Des créations uniques pour sublimer chaque silhouette.',
    label: 'Nouveautés',
  },
  {
    src: '/Instagram.jpeg',
    title: 'Coups de Cœur',
    subtitle: 'Les pièces incontournables de la saison.',
    label: 'Sélection',
  },
]

const INTERVAL = 4500

export function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 700)
  }, [animating])

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length)
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">

      {/* Images — toutes empilées, transition opacity */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.title}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* Content — slide depuis le bas au changement */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10">
        <p
          key={`label-${current}`}
          className="font-sans text-white/70 text-sm tracking-widest uppercase mb-2 animate-slide-up"
        >
          {SLIDES[current].label}
        </p>
        <h1
          key={`title-${current}`}
          className="font-display italic text-white text-4xl md:text-5xl leading-tight mb-3 animate-slide-up"
          style={{ animationDelay: '60ms' }}
        >
          {SLIDES[current].title}
        </h1>
        <p
          key={`sub-${current}`}
          className="font-sans text-white/85 text-base mb-6 max-w-xs leading-relaxed animate-slide-up"
          style={{ animationDelay: '120ms' }}
        >
          {SLIDES[current].subtitle}
        </p>
        <Link href="/boutique" className="animate-slide-up" style={{ animationDelay: '180ms' }}>
          <Button variant="primary" size="lg" className="inline-flex w-fit">
            Découvrir
          </Button>
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? '24px' : '6px',
              height: '6px',
              borderRadius: '9999px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          key={current}
          className="h-full bg-white/50 origin-left"
          style={{
            animation: `progress-bar ${INTERVAL}ms linear forwards`,
          }}
        />
      </div>
    </section>
  )
}
