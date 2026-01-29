'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock Data for Guest Gallery
const MOCK_GALLERY = [
    {
        id: 'mock-1',
        theme: 'Astronaut',
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-2',
        theme: 'Doctor',
        image_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-3',
        theme: 'K-Pop Star',
        image_url: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString()
    }
]

function DashboardContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Explicit guest flag from URL or logic
    const isGuestParam = searchParams.get('guest') === 'true'

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [images, setImages] = useState<any[]>([])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (isGuestParam || !user) {
                // Guest View
                setImages(MOCK_GALLERY)
            } else {
                // User View - Fetch from DB
                // TODO: Implement fetch
                console.log('Fetching user images...')
            }
            setLoading(false)
        }
        checkUser()
    }, [isGuestParam])

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    const isGuest = isGuestParam || !user

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-navy-900">
                        {isGuest ? 'Guest Gallery (Demo)' : 'My Collection'}
                    </h1>
                    <p className="text-gray-500">
                        {isGuest
                            ? 'This is a preview of what you can create.'
                            : 'Your child\'s future portraits.'}
                    </p>
                </div>
                <Link href="/create">
                    <Button>Create New</Button>
                </Link>
            </div>

            {isGuest && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <strong>Guest Mode:</strong> Results are not saved. Sign in to save your collection.
                    <Link href="/login" className="underline ml-2 font-bold">Sign In</Link>
                </div>
            )}

            {images.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-xl border-2 border-dashed">
                    <p className="text-gray-500 mb-4">No images found.</p>
                    <Link href="/create">
                        <Button variant="outline">Create your first portrait</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <Card key={img.id} className="overflow-hidden group">
                            <div className="aspect-[3/4] relative bg-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.image_url}
                                    alt={img.theme}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <p className="text-white font-medium">{img.theme}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
