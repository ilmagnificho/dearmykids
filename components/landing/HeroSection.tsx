'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import TrustBanner from './TrustBanner'

export default function HeroSection({ locale }: { locale: string }) {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-100/50 rounded-full blur-3xl opacity-70 mix-blend-multiply filter" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl opacity-70 mix-blend-multiply filter" />
            </div>

            <div className="container mx-auto px-4 text-center">
                <TrustBanner locale={locale} />

                <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1] max-w-4xl mx-auto">
                    {locale === 'ko' ? (
                        <>
                            아이의 상상력을 <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                현실로 만들어주세요
                            </span>
                        </>
                    ) : (
                        <>
                            Turn Your Child's <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                Dreams Into Reality
                            </span>
                        </>
                    )}
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {locale === 'ko'
                        ? '평범한 일상 사진 한 장으로 시작하는 마법 같은 변화. 우주비행사부터 무대 위 주인공까지, AI가 선사하는 특별한 포트레이트를 만나보세요.'
                        : 'Transform everyday photos into magical portraits. From fearless astronauts to stage superstars, let AI reveal your child\'s limitless potential.'
                    }
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/create">
                        <Button size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                            <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
                            {locale === 'ko' ? '지금 무료로 시작하기' : 'Start Creating for Free'}
                        </Button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-4 sm:mt-0 sm:ml-4">
                        {locale === 'ko' ? '✨ 회원가입 없이 둘러보기' : '✨ No credit card required'}
                    </p>
                </div>


                {/* Visual Hook - Removed per user request to increase trust (no fake previews) */}
            </div>
        </section>
    )
}
