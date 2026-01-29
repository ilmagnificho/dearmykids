'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { Card } from '@/components/ui/card'
import { ShieldCheck, Info, Heart, AlertTriangle } from 'lucide-react'

export default function AboutPage() {
    const { locale } = useLocale()

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 text-slate-900">
                    {locale === 'ko' ? '서비스 소개 & 안내' : 'About & Disclaimer'}
                </h1>
                <p className="text-lg text-gray-600">
                    {locale === 'ko'
                        ? '아이들의 꿈을 응원하는 DearMyKids의 이야기와 약속'
                        : 'Our mission and commitment to safety at DearMyKids'}
                </p>
            </div>

            <div className="grid gap-8">
                {/* Mission Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-6 h-6 text-amber-500" />
                        <h2 className="text-2xl font-bold">
                            {locale === 'ko' ? '우리의 미션' : 'Our Mission'}
                        </h2>
                    </div>
                    <Card className="p-6 bg-white border-amber-100">
                        <p className="leading-relaxed text-gray-700">
                            {locale === 'ko'
                                ? 'DearMyKids는 모든 아이들이 자신의 무한한 가능성을 시각적으로 체험할 수 있도록 돕습니다. 우주비행사, 의사, 무대 위의 스타가 된 자신의 모습을 보며 아이들은 더 큰 꿈을 꾸게 됩니다. 우리는 AI 기술을 통해 아이들의 상상력에 날개를 달아주고자 합니다.'
                                : 'DearMyKids empowers children to visualize their infinite potential. By seeing themselves as astronauts, doctors, or superstars, children are inspired to dream bigger. We use AI technology to give wings to their imagination.'}
                        </p>
                    </Card>
                </section>

                {/* Privacy & Safety Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        <h2 className="text-2xl font-bold">
                            {locale === 'ko' ? '개인정보 보호 및 안전' : 'Privacy & Safety'}
                        </h2>
                    </div>
                    <Card className="p-6 bg-white border-green-100">
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="font-bold text-green-700 min-w-[4rem]">
                                    {locale === 'ko' ? '자동 삭제' : 'Auto Delete'}
                                </span>
                                <span className="text-gray-700">
                                    {locale === 'ko'
                                        ? '업로드된 원본 사진은 이미지 생성 직후 24시간 이내에 서버에서 영구적으로 삭제됩니다. 보관이 필요한 생성 결과물은 갤러리에 저장하거나 다운로드하시기 바랍니다.'
                                        : 'Uploaded original photos are permanently deleted from our servers within 24 hours. Please save your generated portraits, as they are stored separately.'}
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-700 min-w-[4rem]">
                                    {locale === 'ko' ? '학습 금지' : 'No Training'}
                                </span>
                                <span className="text-gray-700">
                                    {locale === 'ko'
                                        ? '사용자의 이미지는 AI 모델 학습에 절대 사용되지 않습니다. 오직 사용자가 요청한 포트레이트 생성을 위해서만 일시적으로 사용됩니다.'
                                        : 'We NEVER use your photos to train our AI models. They are used solely for generating your requested portrait and are processed securely.'}
                                </span>
                            </li>
                        </ul>
                    </Card>
                </section>

                {/* Disclaimer Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-bold">
                            {locale === 'ko' ? '면책 조항 (Disclaimer)' : 'Disclaimer'}
                        </h2>
                    </div>
                    <Card className="p-6 bg-orange-50 border-orange-100">
                        <div className="space-y-4 text-sm text-gray-700">
                            <p>
                                {locale === 'ko'
                                    ? '1. 본 서비스는 AI(인공지능)를 사용하여 이미지를 생성합니다. 결과물의 정확도나 품질은 원본 사진의 품질에 따라 달라질 수 있으며, 항상 완벽한 결과를 보장하지는 않습니다.'
                                    : '1. This service uses AI generation. Providing a high-quality original photo yields the best results, but perfect accuracy is not guaranteed due to the nature of AI.'}
                            </p>
                            <p>
                                {locale === 'ko'
                                    ? '2. 생성된 이미지의 일부 디테일(손가락, 배경 텍스트 등)이 자연스럽지 않을 수 있습니다.'
                                    : '2. Minor artifacts (e.g., fingers, background text) may appear in generated images.'}
                            </p>
                            <p>
                                {locale === 'ko'
                                    ? '3. 본 서비스는 오락 및 교육 목적으로 제공됩니다. 생성된 이미지를 상업적으로 이용하거나 타인의 명예를 훼손하는 용도로 사용하여 발생하는 문제에 대해 회사는 책임지지 않습니다.'
                                    : '3. This service is for entertainment and educational purposes only. Users are responsible for how they use the generated images. Commercial use or misuse is at the user\'s discretion and risk.'}
                            </p>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    )
}
