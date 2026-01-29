'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, RefreshCw, Home, Sparkles } from 'lucide-react'
import Link from 'next/link'

const THEME_LABELS: Record<string, string> = {
    'astronaut': 'Astronaut',
    'doctor': 'Doctor',
    'kpop_star': 'K-Pop Star',
}

function ResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [theme, setTheme] = useState<string>('')
    const [isGuest, setIsGuest] = useState(false)

    useEffect(() => {
        // Get result from localStorage (for guest) or URL params
        const guestParam = searchParams.get('guest') === 'true'
        setIsGuest(guestParam)

        const storedResult = localStorage.getItem('guest_latest_result')
        if (storedResult) {
            try {
                const result = JSON.parse(storedResult)
                setImageUrl(result.image_url)
                setTheme(result.theme)
            } catch (e) {
                console.error('Failed to parse result', e)
            }
        }
    }, [searchParams])

    const handleDownload = async () => {
        if (!imageUrl) return

        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dearmykids-${theme}-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
            // Fallback: open in new tab
            window.open(imageUrl, '_blank')
        }
    }

    const handleShare = async () => {
        if (!imageUrl) return

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My child as a ${THEME_LABELS[theme] || theme}`,
                    text: 'Check out this amazing portrait created with DearMyKids!',
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Share cancelled')
            }
        } else {
            // Fallback: copy link
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    if (!imageUrl) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-500 mb-4">No result found.</p>
                <Link href="/create">
                    <Button>Create New Portrait</Button>
                </Link>
            </div>
        )
    }

    const themeLabel = THEME_LABELS[theme] || theme

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Generation Complete!
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">
                    Your Future <span className="text-amber-600">{themeLabel}</span>
                </h1>
                <p className="text-gray-500">
                    Here's the portrait we created for your child
                </p>
            </div>

            {/* Main Result Image */}
            <Card className="overflow-hidden mb-8 shadow-xl">
                <div className="aspect-square md:aspect-[4/5] relative bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={`Child as ${themeLabel}`}
                        className="w-full h-full object-contain"
                    />
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-slate-900 hover:bg-slate-800"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Download Image
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                </Button>
            </div>

            {/* Next Actions */}
            <div className="border-t pt-8">
                <h2 className="text-lg font-medium text-center mb-6">What's Next?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <Link href="/create" className="block">
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-amber-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <RefreshCw className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Try Another Theme</p>
                                    <p className="text-sm text-gray-500">Create more portraits</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/" className="block">
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-slate-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Home className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Back to Home</p>
                                    <p className="text-sm text-gray-500">Return to main page</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Guest Sign-up CTA */}
            {isGuest && (
                <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-center">
                    <h3 className="font-serif text-xl font-bold mb-2">Love the result?</h3>
                    <p className="text-gray-600 mb-4">
                        Sign up to save your portraits and create unlimited images!
                    </p>
                    <Link href="/login">
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading result...</div>}>
            <ResultContent />
        </Suspense>
    )
}
