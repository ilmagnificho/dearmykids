'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, RefreshCw, Home, Sparkles, Gift, Check } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'

function ResultContent() {
    const searchParams = useSearchParams()
    const { t } = useLocale()
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [theme, setTheme] = useState<string>('')
    const [imageId, setImageId] = useState<string>('')
    const [isGuest, setIsGuest] = useState(false)
    const [isShared, setIsShared] = useState(false)
    const [sharing, setSharing] = useState(false)

    useEffect(() => {
        const guestParam = searchParams.get('guest') === 'true'
        setIsGuest(guestParam)

        const storedResult = localStorage.getItem('guest_latest_result')
        if (storedResult) {
            try {
                const result = JSON.parse(storedResult)
                setImageUrl(result.image_url)
                setTheme(result.theme)
                setImageId(result.id)
            } catch (e) {
                console.error('Failed to parse result', e)
            }
        }
    }, [searchParams])

    const handleDownload = async () => {
        if (!imageUrl) return

        try {
            // For data URLs, create blob directly
            if (imageUrl.startsWith('data:')) {
                const link = document.createElement('a')
                link.href = imageUrl
                link.download = `dearmykids-${theme}-${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
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
            }
        } catch (error) {
            console.error('Download failed:', error)
            window.open(imageUrl, '_blank')
        }
    }

    const handleShare = async () => {
        if (!imageUrl) return

        const themeLabel = t.themes[theme as keyof typeof t.themes] || theme
        const shareText = `${themeLabel} - DearMyKids`

        // Try native share first
        if (navigator.share) {
            try {
                // For data URLs, we need to convert to blob for sharing
                if (imageUrl.startsWith('data:')) {
                    const response = await fetch(imageUrl)
                    const blob = await response.blob()
                    const file = new File([blob], `dearmykids-${theme}.png`, { type: 'image/png' })

                    await navigator.share({
                        title: shareText,
                        text: 'Check out this portrait created with DearMyKids!',
                        files: [file],
                    })
                } else {
                    await navigator.share({
                        title: shareText,
                        text: 'Check out this portrait created with DearMyKids!',
                        url: window.location.href,
                    })
                }
                return
            } catch (error) {
                // User cancelled or share failed, fall through to clipboard
                console.log('Share cancelled or failed')
            }
        }

        // Fallback: copy URL
        try {
            await navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        } catch {
            // Final fallback
            window.open(imageUrl, '_blank')
        }
    }

    const handleShareToGallery = async () => {
        if (!imageId || isGuest) return

        setSharing(true)
        try {
            const response = await fetch('/api/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId })
            })

            const data = await response.json()
            if (data.success) {
                setIsShared(true)
                alert(t.result.shareSuccess)
            }
        } catch (error) {
            console.error('Share to gallery failed:', error)
        } finally {
            setSharing(false)
        }
    }

    if (!imageUrl) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-500 mb-4">{t.common.noResult}</p>
                <Link href="/create">
                    <Button>{t.common.createNew}</Button>
                </Link>
            </div>
        )
    }

    const themeLabel = t.themes[theme as keyof typeof t.themes] || theme

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    {t.result.complete}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    {t.result.yourFuture} <span className="text-amber-600">{themeLabel}</span>
                </h1>
                <p className="text-gray-500">
                    {t.result.description}
                </p>
            </div>

            {/* Main Result Image */}
            <Card className="overflow-hidden mb-8 shadow-xl">
                <div className="aspect-square relative bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={`Child as ${themeLabel}`}
                        className="w-full h-full object-contain"
                    />
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-slate-900 hover:bg-slate-800"
                >
                    <Download className="w-5 h-5 mr-2" />
                    {t.result.download}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    {t.result.share}
                </Button>
            </div>

            {/* Share to Gallery CTA (for logged-in users) */}
            {!isGuest && !isShared && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Gift className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-purple-900">{t.result.shareToGallery}</p>
                                <p className="text-sm text-purple-700">{t.result.shareReward}</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleShareToGallery}
                            disabled={sharing}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {sharing ? '...' : t.result.shareToGallery}
                        </Button>
                    </div>
                    <p className="text-xs text-purple-600 mt-3">{t.result.shareConfirm}</p>
                </div>
            )}

            {isShared && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">{t.result.shareSuccess}</p>
                </div>
            )}

            {/* Next Actions */}
            <div className="border-t pt-8">
                <h2 className="text-lg font-medium text-center mb-6">{t.result.whatsNext}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <Link href="/create" className="block">
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-amber-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <RefreshCw className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{t.result.tryAnother}</p>
                                    <p className="text-sm text-gray-500">{t.result.createMore}</p>
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
                                    <p className="font-medium">{t.result.backHome}</p>
                                    <p className="text-sm text-gray-500">{t.result.returnMain}</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Guest Sign-up CTA */}
            {isGuest && (
                <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-center">
                    <h3 className="text-xl font-bold mb-2">{t.result.loveResult}</h3>
                    <p className="text-gray-600 mb-4">{t.result.signUpCta}</p>
                    <Link href="/login">
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            {t.result.createAccount}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <ResultContent />
        </Suspense>
    )
}
