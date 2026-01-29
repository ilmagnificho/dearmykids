'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const THEME_LABELS: Record<string, string> = {
    'astronaut': 'Astronaut',
    'doctor': 'Doctor',
    'kpop_star': 'K-Pop Star',
}

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
                // Guest View - Show only what they created (no mock data)
                const storedResult = localStorage.getItem('guest_latest_result')
                const guestImages: any[] = []

                if (storedResult) {
                    try {
                        const newImage = JSON.parse(storedResult)
                        // Format theme label properly
                        newImage.theme = THEME_LABELS[newImage.theme] || newImage.theme
                        guestImages.push(newImage)
                    } catch (e) {
                        console.error('Failed to parse guest result', e)
                    }
                }
                setImages(guestImages)
            } else {
                // User View - Fetch from DB
                try {
                    const { data, error } = await supabase
                        .from('generated_images')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })

                    if (error) throw error
                    setImages(data || [])
                } catch (error) {
                    console.error('Error fetching images:', error)
                }
            }
            setLoading(false)
        }
        checkUser()
    }, [isGuestParam, supabase])

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
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-medium mb-2">No portraits yet</h3>
                    <p className="text-gray-500 mb-6">Create your first AI-generated portrait!</p>
                    <Link href="/create">
                        <Button className="bg-amber-600 hover:bg-amber-700">Create Your First Portrait</Button>
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
