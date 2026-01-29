'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Loader2 } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PricingPage() {
    const { t, locale } = useLocale()
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        setLoading(plan)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Redirect to login first
                router.push('/login?redirect=/pricing')
                return
            }

            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            })

            const data = await response.json()

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                throw new Error(data.error || 'Failed to create checkout')
            }

        } catch (error: any) {
            console.error('Subscribe error:', error)
            alert(locale === 'ko' ? '결제 페이지 생성에 실패했습니다.' : 'Failed to create checkout.')
        } finally {
            setLoading(null)
        }
    }

    const plans = {
        free: {
            name: locale === 'ko' ? '무료' : 'Free',
            price: locale === 'ko' ? '₩0' : '$0',
            period: locale === 'ko' ? '영구' : 'forever',
            features: locale === 'ko' ? [
                '무료 테마 3개',
                '정사각형 포맷',
                '상반신 촬영',
                '이미지 2시간 보관',
                '하루 3회 생성',
            ] : [
                '3 free themes',
                'Square format only',
                'Upper body shot',
                '2-hour image storage',
                '3 generations per day',
            ]
        },
        monthly: {
            name: locale === 'ko' ? '프리미엄 월간' : 'Premium Monthly',
            price: locale === 'ko' ? '₩9,900' : '$7.99',
            period: locale === 'ko' ? '/ 월' : '/ month',
            features: locale === 'ko' ? [
                '모든 테마 무제한',
                '모든 이미지 포맷',
                '모든 촬영 구도',
                '이미지 48시간 보관',
                '무제한 생성',
                '우선 처리',
            ] : [
                'All themes unlimited',
                'All image formats',
                'All shot types',
                '48-hour image storage',
                'Unlimited generations',
                'Priority processing',
            ]
        },
        yearly: {
            name: locale === 'ko' ? '프리미엄 연간' : 'Premium Yearly',
            price: locale === 'ko' ? '₩79,900' : '$59.99',
            period: locale === 'ko' ? '/ 년' : '/ year',
            discount: locale === 'ko' ? '33% 할인' : '33% off',
            features: locale === 'ko' ? [
                '모든 프리미엄 기능',
                '연간 결제 시 4개월 무료',
                '신규 테마 우선 체험',
                '이메일 우선 지원',
            ] : [
                'All premium features',
                '4 months free with yearly',
                'Early access to new themes',
                'Priority email support',
            ]
        }
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'ko' ? '요금제 선택' : 'Choose Your Plan'}
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {locale === 'ko'
                        ? '우리 아이의 꿈을 더 다양하게 표현해보세요'
                        : 'Unlock more ways to visualize your child\'s dreams'}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Free Plan */}
                <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">{plans.free.name}</h3>
                        <div className="text-3xl font-bold">{plans.free.price}</div>
                        <div className="text-gray-500 text-sm">{plans.free.period}</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                        {plans.free.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link href="/create">
                        <Button variant="outline" className="w-full">
                            {locale === 'ko' ? '무료로 시작' : 'Start Free'}
                        </Button>
                    </Link>
                </Card>

                {/* Monthly Plan */}
                <Card className="p-6 border-2 border-amber-500 hover:shadow-lg transition-shadow relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {locale === 'ko' ? '인기' : 'Popular'}
                    </div>
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-amber-500" />
                            <h3 className="text-xl font-bold">{plans.monthly.name}</h3>
                        </div>
                        <div className="text-3xl font-bold">{plans.monthly.price}</div>
                        <div className="text-gray-500 text-sm">{plans.monthly.period}</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                        {plans.monthly.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Button
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        onClick={() => handleSubscribe('monthly')}
                        disabled={loading !== null}
                    >
                        {loading === 'monthly' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            locale === 'ko' ? '구독하기' : 'Subscribe'
                        )}
                    </Button>
                </Card>

                {/* Yearly Plan */}
                <Card className="p-6 border-2 border-purple-500 hover:shadow-lg transition-shadow relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {plans.yearly.discount}
                    </div>
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-purple-500" />
                            <h3 className="text-xl font-bold">{plans.yearly.name}</h3>
                        </div>
                        <div className="text-3xl font-bold">{plans.yearly.price}</div>
                        <div className="text-gray-500 text-sm">{plans.yearly.period}</div>
                    </div>
                    <ul className="space-y-3 mb-6">
                        {plans.yearly.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Button
                        className="w-full bg-purple-500 hover:bg-purple-600"
                        onClick={() => handleSubscribe('yearly')}
                        disabled={loading !== null}
                    >
                        {loading === 'yearly' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            locale === 'ko' ? '구독하기' : 'Subscribe'
                        )}
                    </Button>
                </Card>
            </div>

            {/* FAQ or additional info */}
            <div className="mt-12 text-center text-sm text-gray-500">
                <p>
                    {locale === 'ko'
                        ? '결제는 Lemon Squeezy를 통해 안전하게 처리됩니다. 언제든 구독을 취소할 수 있습니다.'
                        : 'Payments are securely processed by Lemon Squeezy. Cancel anytime.'}
                </p>
            </div>
        </div>
    )
}
