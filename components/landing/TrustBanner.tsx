'use client'

import { Star } from 'lucide-react'

export default function TrustBanner() {
    return (
        <div className="flex flex-col items-center justify-center py-6 gap-2 animate-fade-in-up">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
                Loved by <span className="font-bold text-gray-900">50,000+ happy parents</span> worldwide
            </p>
        </div>
    )
}
