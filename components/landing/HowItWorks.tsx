'use client'

import { Upload, Wand2, Download, ArrowRight } from 'lucide-react'

export default function HowItWorks({ locale }: { locale: string }) {
    const steps = [
        {
            icon: Upload,
            title: locale === 'ko' ? '사진 업로드' : 'Upload Photo',
            desc: locale === 'ko' ? '아이의 얼굴이 잘 나온 사진을 한 장 골라주세요.' : 'Choose a clear photo of your child\'s face.',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: Wand2,
            title: locale === 'ko' ? '테마 선택' : 'Pick a Theme',
            desc: locale === 'ko' ? '우주, 병원, 무대 등 원하는 꿈의 무대를 선택하세요.' : 'Select a dream theme: Space, Stage, Future, etc.',
            color: 'bg-amber-100 text-amber-600'
        },
        {
            icon: Download,
            title: locale === 'ko' ? '마법같은 결과' : 'Get Result',
            desc: locale === 'ko' ? 'AI가 단 10초 만에 고화질 포트레이트를 완성합니다.' : 'AI generates a high-quality portrait in seconds.',
            color: 'bg-green-100 text-green-600'
        }
    ]

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-slate-900">
                        {locale === 'ko' ? '어떻게 만드나요?' : 'How It Works'}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {locale === 'ko'
                            ? '복잡한 과정은 없습니다. 단 세 번의 클릭으로 아이에게 잊지 못할 추억을 선물하세요.'
                            : 'Three simple steps to create unforgettable memories for your child.'}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 -z-10" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center group">
                            <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {step.desc}
                            </p>

                            {/* Mobile Arrow */}
                            {idx < 2 && (
                                <div className="md:hidden mt-8 flex justify-center text-gray-300">
                                    <ArrowRight className="w-6 h-6 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
