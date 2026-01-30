'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import TrustBanner from './TrustBanner'
import { ComparisonSlider } from '@/components/ui/ComparisonSlider'

export default function HeroSection({ locale }: { locale: string }) {
    return (
        <section className="relative w-full min-h-[90vh] flex items-center bg-[#F8F9FA] overflow-hidden">
            <div className="container mx-auto px-4 h-full">
                <div className="flex flex-col lg:flex-row h-full items-center gap-12 lg:gap-20">

                    {/* Left Column: Hero Visual (Before/After Comparison) */}
                    <div className="w-full lg:w-1/2 relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-1 mt-8 lg:mt-0 ring-4 ring-white/50">
                        <ComparisonSlider
                            beforeImage="https://images.unsplash.com/photo-1602052852877-c4542602353a?q=80&w=1000&auto=format&fit=crop"
                            afterImage="https://images.unsplash.com/photo-1454789548779-d5521175313c?q=80&w=1000&auto=format&fit=crop"
                            beforeLabel={locale === 'ko' ? "평범한 사진" : "Original Photo"}
                            afterLabel={locale === 'ko' ? "우주비행사 변신" : "Future Astronaut"}
                        />

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                            {locale === 'ko' ? '👈 슬라이더를 움직여보세요 👉' : '👈 Slide to see the magic 👉'}
                        </div>
                    </div>

                    {/* Right Column: Text & CTA */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-start text-left order-2 lg:order-2 pb-12 lg:pb-0">
                        <div className="mb-6">
                            <TrustBanner locale={locale} />
                        </div>

                        <h2 className="text-sm font-bold tracking-widest text-amber-600 mb-4 uppercase">
                            {locale === 'ko' ? 'AI 기반 진로 탐색 도구' : 'AI-POWERED CAREER EXPLORATION'}
                        </h2>

                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            {locale === 'ko' ? (
                                <>
                                    우리 아이의 상상을 <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 italic pr-2">
                                        현실로 만드세요
                                    </span>
                                </>
                            ) : (
                                <>
                                    Turn Your Child's <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 italic pr-2">
                                        Dreams Into Reality
                                    </span>
                                </>
                            )}
                        </h1>

                        <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed font-light">
                            {locale === 'ko'
                                ? '평범한 사진 한 장이면 충분합니다. 우주비행사, 의사, 아이돌... 아이가 꿈꾸는 모든 모습을 AI로 미리 만나보세요.'
                                : 'One photo is all it takes. Astronaut, Doctor, K-Pop Star... Visualize your child\'s limitless potential with our AI technology.'
                            }
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link href="/create" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/30 transition-all">
                                    {locale === 'ko' ? '시작하기' : 'Start Creating'}
                                </Button>
                            </Link>
                        </div>

                        <p className="text-xs text-gray-400 mt-4 ml-2">
                            {locale === 'ko' ? '회원가입 불필요. 즉시 AI 분석.' : 'No sign-up required. Instant analysis.'}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}
