'use client'

import { Gift, Image as ImageIcon, Share2, Printer } from 'lucide-react'

export default function FeatureShowcase({ locale }: { locale: string }) {
    const features = [
        {
            icon: Gift,
            title: locale === 'ko' ? '특별한 생일 초대장' : 'Unique Birthday Invites',
            desc: locale === 'ko'
                ? '우주비행사가 된 아이의 사진으로 친구들을 초대해보세요. 세상에 하나뿐인 초대장이 됩니다.'
                : 'Create one-of-a-kind birthday invites featuring your child as an astronaut or superhero.',
            color: 'bg-pink-50 text-pink-600',
            colSpan: 'md:col-span-2'
        },
        {
            icon: Printer,
            title: locale === 'ko' ? '공부방 포스터' : 'Inspiration Posters',
            desc: locale === 'ko'
                ? '고해상도로 출력하여 아이 방에 걸어주세요. 꿈을 향한 동기부여가 됩니다.'
                : 'Print high-res portraits for their room. A daily reminder of their limitless potential.',
            color: 'bg-blue-50 text-blue-600',
            colSpan: 'md:col-span-1'
        },
        {
            icon: Share2,
            title: locale === 'ko' ? '가족 공유' : 'Share with Family',
            desc: locale === 'ko'
                ? '할머니, 할아버지에게 카카오톡으로 바로 전송하세요.'
                : 'Instantly share the magic with grandparents and family via social media.',
            color: 'bg-amber-50 text-amber-600',
            colSpan: 'md:col-span-1'
        },
        {
            icon: ImageIcon,
            title: locale === 'ko' ? '성장 앨범' : 'Digital Growth Album',
            desc: locale === 'ko'
                ? '매년 달라지는 아이의 모습을 다양한 테마로 기록하세요.'
                : 'Document their growth with new fantasy themes every year. A modern twist on the family album.',
            color: 'bg-purple-50 text-purple-600',
            colSpan: 'md:col-span-2'
        }
    ]

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-slate-900">
                        {locale === 'ko' ? '이렇게 활용해보세요' : 'Endless Possibilities'}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {locale === 'ko'
                            ? '단순한 이미지 생성을 넘어, 아이의 일상을 특별하게 만들어주는 다양한 방법들입니다.'
                            : 'More than just images. Discover how DearMyKids adds magic to your everyday life.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`${feature.colSpan} p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group bg-white`}
                        >
                            <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
