'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { useEffect, useState } from 'react'
import ReferralTracker from '@/components/ReferralTracker'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'

interface GalleryImage {
    id: string
    image_url: string
    theme: string
}

export default function Home() {
    const { locale, setLocale } = useLocale()
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

    useEffect(() => {
        // Fetch public gallery
        fetch('/api/gallery')
            .then(res => res.json())
            .then(data => setGalleryImages(data.images || []))
            .catch(() => { })
    }, [])

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-white">
            <ReferralTracker />

            {/* Language Switcher - Absolute for Hero */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-white transition-all shadow-sm"
                >
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{locale === 'ko' ? 'EN' : '한국어'}</span>
                </button>
            </div>

            {/* 1. New Hero Section */}
            <HeroSection locale={locale} />

            {/* 2. Live Gallery (Existing Logic, refined styling wrapper) */}
            {galleryImages.length > 0 && (
                <section className="py-20 bg-slate-50 overflow-hidden border-y border-slate-100">
                    <div className="container mx-auto px-4 mb-10 text-center">
                        <span className="text-amber-600 font-bold tracking-wider text-xs uppercase mb-2 block">Gallery</span>
                        <h2 className="text-3xl font-bold text-slate-900">
                            {locale === 'ko' ? '엄마들이 만든 작품들' : 'Latest Creations'}
                        </h2>
                    </div>

                    {/* Infinite scroll */}
                    <div className="relative w-full">
                        <div className="flex gap-6 animate-scroll px-4">
                            {[...galleryImages, ...galleryImages].map((img, idx) => (
                                <div
                                    key={`${img.id}-${idx}`}
                                    className="flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-white group hover:shadow-xl transition-shadow"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.image_url}
                                        alt={img.theme}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. New How It Works */}
            <HowItWorks locale={locale} />

            {/* 4. Final CTA (Refined) */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        {locale === 'ko' ? '아이의 꿈을 응원해주세요' : 'Ready to Start?'}
                    </h2>
                    <p className="mb-10 text-xl text-gray-400 max-w-2xl mx-auto">
                        {locale === 'ko' ? '첫 번째 포트레이트는 무료입니다. 지금 바로 확인해보세요.' : 'Create your first portrait for free defined by your imagination.'}
                    </p>
                    <Link href="/create">
                        <Button size="lg" className="h-16 px-12 text-xl bg-amber-500 hover:bg-amber-600 text-white border-none rounded-full shadow-2xl hover:shadow-amber-500/20 transition-all">
                            {locale === 'ko' ? '무료로 시작하기' : 'Create Free Portrait'} <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
