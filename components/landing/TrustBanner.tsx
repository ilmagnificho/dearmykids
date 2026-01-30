'use client'

import { Star } from 'lucide-react'

export default function TrustBanner({ locale }: { locale: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-6 gap-2 animate-fade-in-up">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
                {locale === 'ko'
                    ? <><span className="font-bold text-gray-900">많은 부모님들</span>이 선택한 서비스</>
                    : <>Loved by <span className="font-bold text-gray-900">Parents</span> worldwide</>
                }
            </p>
        </div>
    )
}
