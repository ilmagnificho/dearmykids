'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ReferralTrackerContent() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            document.cookie = `dearmykids_referral=${ref}; path=/; max-age=2592000` // 30 days
        }
    }, [searchParams])

    return null
}

export default function ReferralTracker() {
    return (
        <Suspense fallback={null}>
            <ReferralTrackerContent />
        </Suspense>
    )
}
