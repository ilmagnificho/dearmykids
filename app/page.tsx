'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { useEffect, useState } from 'react'

// Career showcase
const CAREERS = [
    { id: 'astronaut', emoji: '🚀' },
    { id: 'doctor', emoji: '👨‍⚕️' },
    { id: 'scientist', emoji: '🔬' },
    { id: 'kpop_star', emoji: '🎤' },
    { id: 'chef', emoji: '👨‍🍳' },
    { id: 'pilot', emoji: '✈️' },
]

interface GalleryImage {
    id: string
    image_url: string
    theme: string
}

export default function Home() {
    const { locale, setLocale, t } = useLocale()
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

    useEffect(() => {
        // Fetch public gallery
        fetch('/api/gallery')
            .then(res => res.json())
            .then(data => setGalleryImages(data.images || []))
            .catch(() => { })
    }, [])

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Language Switcher */}
            <div className="absolute top-20 right-4 z-10">
                <button
                    onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-full hover:bg-gray-50 transition-colors"
                >
                    <Globe className="w-4 h-4" />
                    {locale === 'ko' ? 'EN' : '한국어'}
                </button>
            </div>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:py-20">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                        {t.hero.title}
                        <span className="text-amber-600 block mt-2">{t.hero.titleHighlight}</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                        {t.hero.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/create">
                            <Button size="lg" className="h-14 px-10 text-lg bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                                {t.hero.cta} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">{t.hero.ctaSubtext}</p>
                </div>

                {/* Career Icons */}
                <div className="mt-12 w-full max-w-3xl">
                    <div className="flex justify-center gap-4 flex-wrap">
                        {CAREERS.map((career) => (
                            <div
                                key={career.id}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-sm"
                            >
                                <span className="text-2xl sm:text-3xl">{career.emoji}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Gallery Showcase - Scrolling */}
            {galleryImages.length > 0 && (
                <section className="py-12 bg-gradient-to-b from-white to-slate-50 border-t overflow-hidden">
                    <div className="container mx-auto px-4 mb-8">
                        <h2 className="text-2xl font-bold text-center mb-2">{t.gallery.title}</h2>
                        <p className="text-gray-500 text-center text-sm">{t.gallery.subtitle}</p>
                    </div>

                    {/* Infinite scroll animation */}
                    <div className="relative">
                        <div className="flex gap-4 animate-scroll">
                            {[...galleryImages, ...galleryImages].map((img, idx) => (
                                <div
                                    key={`${img.id}-${idx}`}
                                    className="flex-shrink-0 w-48 h-64 rounded-xl overflow-hidden shadow-lg bg-white"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.image_url}
                                        alt={img.theme}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-12">{t.howItWorks.title}</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">1</div>
                            <h3 className="font-semibold mb-2">{t.howItWorks.step1}</h3>
                            <p className="text-sm text-gray-500">{t.howItWorks.step1Desc}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">2</div>
                            <h3 className="font-semibold mb-2">{t.howItWorks.step2}</h3>
                            <p className="text-sm text-gray-500">{t.howItWorks.step2Desc}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">3</div>
                            <h3 className="font-semibold mb-2">{t.howItWorks.step3}</h3>
                            <p className="text-sm text-gray-500">{t.howItWorks.step3Desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {locale === 'ko' ? '지금 바로 시작하세요!' : 'Start creating today!'}
                    </h2>
                    <p className="mb-8 opacity-90">
                        {locale === 'ko' ? '첫 번째 포트레이트는 무료입니다' : 'Your first portrait is free'}
                    </p>
                    <Link href="/create">
                        <Button size="lg" className="h-14 px-10 text-lg bg-white text-amber-600 hover:bg-gray-100">
                            {t.hero.cta} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
