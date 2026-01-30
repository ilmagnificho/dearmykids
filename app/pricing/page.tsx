'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Loader2, Gift } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CREDIT_PACKAGES, formatPrice, FREE_TIER } from '@/lib/credits'

export default function PricingPage() {
    const { locale } = useLocale()
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [showCelebration, setShowCelebration] = useState<{ credits: number, message: string } | null>(null)

    const handlePurchase = async (packageId: string) => {
        setLoading(packageId)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/pricing')
                return
            }

            // Call Gift API instead of Payment
            const response = await fetch('/api/events/gift', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed')
            }

            if (data.success) {
                // Show celebration!
                setShowCelebration({
                    credits: data.newCredits,
                    message: locale === 'ko' ? '크레딧이 무료로 지급되었습니다!' : 'Credits granted for free!'
                })
            } else {
                // Already claimed or other status
                alert(locale === 'ko' ? data.message : data.message)
            }

        } catch (error: any) {
            console.error('Gift error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            alert(locale === 'ko' ? `오류가 발생했습니다: ${errorMessage}` : `Error: ${errorMessage}`)
        } finally {
            setLoading(null)
        }
    }

    const packages = Object.values(CREDIT_PACKAGES)

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 relative">
            {/* Header */}
            <div className="text-center mb-12">
                <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold mb-4 animate-bounce">
                    {locale === 'ko' ? '🎉 런칭 기념 이벤트 중!' : '🎉 Launch Celebration Event!'}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'ko' ? '크레딧 무료 선물' : 'Free Credit Gifts'}
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    {locale === 'ko'
                        ? '지금 구매 버튼을 누르면 무료로 크레딧을 드려요! (계정당 1회)'
                        : 'Click buy to get free credits! (Once per account)'}
                </p>
            </div>

            {/* Free Tier Info */}
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                <Gift className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-green-900">
                        {locale === 'ko' ? '매일 무료 1장!' : 'Free daily generation!'}
                    </p>
                    <p className="text-sm text-green-700">
                        {locale === 'ko'
                            ? `로그인하면 매일 ${FREE_TIER.dailyLimit}장 무료 (무료 테마 ${FREE_TIER.freeThemes.length}개)`
                            : `Get ${FREE_TIER.dailyLimit} free generation daily with ${FREE_TIER.freeThemes.length} free themes`}
                    </p>
                </div>
            </div>

            {/* Package Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                    const price = locale === 'ko' ? pkg.price.krw : pkg.price.usd
                    const perImage = Math.round(price / pkg.credits)
                    const isPopular = pkg.popular

                    return (
                        <Card
                            key={pkg.id}
                            className={`p-6 relative transition-all hover:shadow-lg ${isPopular
                                ? 'border-2 border-amber-500 shadow-amber-100'
                                : 'border-2 hover:border-gray-300'
                                }`}
                        >
                            {/* Popular Badge */}
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {locale === 'ko' ? '인기' : 'Popular'}
                                </div>
                            )}

                            {/* Savings Badge */}
                            {'savings' in pkg && pkg.savings && (
                                <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                                    {pkg.savings[locale]}
                                </div>
                            )}

                            {/* Package Info */}
                            <div className="text-center mb-6 pt-2">
                                <h3 className="text-xl font-bold mb-1">{pkg.name[locale]}</h3>
                                <p className="text-gray-500 text-sm mb-4">{pkg.description[locale]}</p>

                                {/* Credits */}
                                <div className="text-4xl font-bold text-amber-600 mb-1">
                                    {pkg.credits}<span className="text-lg font-normal text-gray-500">
                                        {locale === 'ko' ? '장' : ' credits'}
                                    </span>
                                </div>

                                {/* Price (Strikethrough for Event) */}
                                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <span className="line-through text-gray-400 text-lg">
                                        {formatPrice(price, locale)}
                                    </span>
                                    <span className="text-red-500">
                                        {locale === 'ko' ? '0원' : 'Free'}
                                    </span>
                                </div>
                                <div className="text-sm text-amber-600 font-bold">
                                    {locale === 'ko' ? '🎁 런칭 기념 무료!' : '🎁 Free Launch Gift!'}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2 mb-6 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {locale === 'ko' ? '모든 테마 사용 가능' : 'All themes available'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {locale === 'ko' ? '모든 포맷 & 구도' : 'All formats & shots'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {locale === 'ko' ? '48시간 이미지 보관' : '48-hour image storage'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {locale === 'ko' ? '크레딧 무기한 유효' : 'Credits never expire'}
                                </li>
                            </ul>

                            {/* Buy Button */}
                            <Button
                                className={`w-full ${isPopular
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-slate-800 hover:bg-slate-700'
                                    }`}
                                onClick={() => handlePurchase(pkg.id)}
                                disabled={loading !== null}
                            >
                                {loading === pkg.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    locale === 'ko' ? '무료로 받기' : 'Get for Free'
                                )}
                            </Button>
                        </Card>
                    )
                })}
            </div>

            {/* Celebration Modal */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-2xl font-bold mb-2 text-amber-600">
                            {locale === 'ko' ? '축하합니다!' : 'Congratulations!'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {showCelebration.message}
                        </p>
                        <div className="p-4 bg-amber-50 rounded-xl mb-6 border border-amber-100">
                            <p className="text-sm text-amber-800 mb-1">
                                {locale === 'ko' ? '현재 총 보유 크레딧' : 'Total Credits'}
                            </p>
                            <p className="text-3xl font-bold text-amber-600">
                                {showCelebration.credits}
                            </p>
                        </div>
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-lg py-6"
                            onClick={() => {
                                setShowCelebration(null)
                                router.refresh()
                                router.push('/dashboard')
                            }}
                        >
                            {locale === 'ko' ? '이미지 만들러 가기 ✨' : 'Start Creating ✨'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Trust badges */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 mb-4">
                    {locale === 'ko'
                        ? '100% 안전한 무료 이벤트입니다.'
                        : '100% Secure Free Event'}
                </p>
                <div className="flex justify-center gap-4 text-gray-400">
                    <span className="text-xs flex items-center gap-1">
                        🔒 {locale === 'ko' ? 'SSL 암호화' : 'SSL Secured'}
                    </span>
                    <span className="text-xs flex items-center gap-1">
                        🛡️ {locale === 'ko' ? '개인정보 보호' : 'Privacy Protected'}
                    </span>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-center mb-6">
                    {locale === 'ko' ? '자주 묻는 질문' : 'FAQ'}
                </h2>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-1">
                            {locale === 'ko' ? '정말 무료인가요?' : 'Is it really free?'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {locale === 'ko'
                                ? '네! 서비스 런칭 기념으로 제공되는 특별 혜택입니다. 카드 정보 입력 없이 즉시 지급됩니다.'
                                : 'Yes! This is a special launch celebration gift. No credit card required.'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-1">
                            {locale === 'ko' ? '크레딧 유효기간이 있나요?' : 'Do credits expire?'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {locale === 'ko'
                                ? '아니요, 제공받은 크레딧은 유효기간 없이 언제든 사용하실 수 있습니다.'
                                : 'No, credits do not expire. You can use them whenever you like.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

