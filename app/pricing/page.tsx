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

    const handlePurchase = async (packageId: string) => {
        setLoading(packageId)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/pricing')
                return
            }

            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            })

            const data = await response.json()

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                throw new Error(data.error || 'Failed')
            }

        } catch (error: any) {
            console.error('Purchase error:', error)
            alert(locale === 'ko' ? '결제 오류가 발생했습니다.' : 'Payment error occurred.')
        } finally {
            setLoading(null)
        }
    }

    const packages = Object.values(CREDIT_PACKAGES)

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'ko' ? '크레딧 구매' : 'Buy Credits'}
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    {locale === 'ko'
                        ? '크레딧 1개 = AI 포트레이트 1장. 필요한 만큼만 구매하세요!'
                        : '1 credit = 1 AI portrait. Buy only what you need!'}
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

                                {/* Price */}
                                <div className="text-2xl font-bold">
                                    {formatPrice(price, locale)}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {locale === 'ko' ? `장당 ₩${perImage.toLocaleString()}` : `$${(perImage / 100).toFixed(2)} per image`}
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
                                    locale === 'ko' ? '구매하기' : 'Buy Now'
                                )}
                            </Button>
                        </Card>
                    )
                })}
            </div>

            {/* Trust badges */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 mb-4">
                    {locale === 'ko'
                        ? '안전한 결제 | Lemon Squeezy 결제 보안'
                        : 'Secure payments powered by Lemon Squeezy'}
                </p>
                <div className="flex justify-center gap-4 text-gray-400">
                    <span className="text-xs">💳 카드결제</span>
                    <span className="text-xs">🍎 Apple Pay</span>
                    <span className="text-xs">🔒 SSL 암호화</span>
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
                            {locale === 'ko' ? '크레딧 유효기간이 있나요?' : 'Do credits expire?'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {locale === 'ko'
                                ? '아니요! 구매한 크레딧은 무기한 유효합니다.'
                                : 'No! Purchased credits never expire.'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-1">
                            {locale === 'ko' ? '환불이 가능한가요?' : 'Can I get a refund?'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {locale === 'ko'
                                ? '미사용 크레딧에 한해 7일 이내 환불 가능합니다.'
                                : 'Unused credits can be refunded within 7 days.'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium mb-1">
                            {locale === 'ko' ? '생성된 이미지는 얼마나 보관되나요?' : 'How long are images stored?'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {locale === 'ko'
                                ? '48시간 동안 서버에 보관됩니다. 즉시 다운로드하세요!'
                                : 'Images are stored for 48 hours. Download immediately!'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
