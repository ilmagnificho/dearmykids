'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { Loader2, Lock, Crown, ImageIcon, Upload } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/contexts/LocaleContext'

// Session storage key for cached photo
const CACHED_PHOTO_KEY = 'dearmykids_cached_photo'

// Theme IDs with emojis (names come from i18n)
const THEMES = {
    free: [
        { id: 'astronaut', emoji: '🚀' },
        { id: 'doctor', emoji: '👨‍⚕️' },
        { id: 'scientist', emoji: '🔬' },
    ],
    premium: [
        { id: 'kpop_star', emoji: '🎤' },
        { id: 'chef', emoji: '👨‍🍳' },
        { id: 'pilot', emoji: '✈️' },
        { id: 'soccer', emoji: '⚽' },
        { id: 'baseball', emoji: '⚾' },
        { id: 'basketball', emoji: '🏀' },
        { id: 'volleyball', emoji: '🏐' },
        { id: 'tennis', emoji: '🎾' },
        { id: 'golf', emoji: '⛳' },
        { id: 'artist', emoji: '🎨' },
        { id: 'firefighter', emoji: '🚒' },
        { id: 'police', emoji: '👮' },
        { id: 'teacher', emoji: '📚' },
        { id: 'veterinarian', emoji: '🐾' },
    ]
}

// Format IDs (names come from i18n)
const FORMATS = [
    { id: 'square', ratio: '1:1', free: true },
    { id: 'portrait', ratio: '3:4', free: false },
    { id: 'landscape', ratio: '16:9', free: false },
]

// Shot type IDs (names come from i18n)
const SHOT_TYPES = [
    { id: 'portrait', free: true },
    { id: 'full_body', free: false },
    { id: 'headshot', free: false },
]

export default function CreatePage() {
    const { t } = useLocale()
    const [step, setStep] = useState(1)
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
    const [selectedFormat, setSelectedFormat] = useState('square')
    const [selectedShot, setSelectedShot] = useState('portrait')
    const [uploading, setUploading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('') // Dynamic loading steps

    const [hasCredits, setHasCredits] = useState(false) // Check if user has credits
    const [credits, setCredits] = useState(0)
    const [cachedPhoto, setCachedPhoto] = useState<string | null>(null) // Base64 cached photo
    const [useCachedPhoto, setUseCachedPhoto] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkCredits = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('credits')
                    .eq('user_id', user.id)
                    .single()

                if (error) {
                    console.error('Error fetching credits:', error)
                }

                console.log('User Profile Credits:', profile)

                if (profile) {
                    setCredits(profile.credits)
                    setHasCredits(profile.credits > 0)
                }
            }
        }
        checkCredits()
    }, [])

    // Loading message rotation
    useEffect(() => {
        if (!uploading) return

        const messages = [
            'Scanning for cuteness...',
            'Designing the perfect outfit...',
            'Adjusting studio lighting...',
            'Capturing the moment...'
        ]

        // Initial message
        setLoadingMessage(messages[0])

        let i = 0
        const interval = setInterval(() => {
            i = (i + 1) % messages.length
            setLoadingMessage(messages[i])
        }, 3000)

        return () => clearInterval(interval)
    }, [uploading])

    // Load cached photo from sessionStorage on mount
    useEffect(() => {
        const cached = sessionStorage.getItem(CACHED_PHOTO_KEY)
        if (cached) {
            setCachedPhoto(cached)
        }
    }, [])

    const allThemes = [...THEMES.free, ...THEMES.premium]
    const selectedThemeData = allThemes.find(th => th.id === selectedTheme)
    const getThemeName = (id: string) => t.themes[id as keyof typeof t.themes] || id
    const getFormatName = (id: string) => t.formats[id as keyof typeof t.formats] || id
    const getShotName = (id: string) => t.shotTypes[id as keyof typeof t.shotTypes] || id

    // Generate with provided base64 image
    const generateWithImage = async (imageBase64: string) => {
        if (!selectedTheme) return
        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const isGuest = !user

            // Save to session storage for reuse
            sessionStorage.setItem(CACHED_PHOTO_KEY, imageBase64)
            setCachedPhoto(imageBase64)

            // Call Generate API with options
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({
                    storage_path: '',
                    image_base64: imageBase64,
                    theme: selectedTheme,
                    format: selectedFormat,
                    shot_type: selectedShot,
                    is_guest: isGuest
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Generation failed: ${response.status}`)
            }

            const result = await response.json()

            if (result.imageUrl) {
                const resultData = {
                    id: isGuest ? 'guest-' + Date.now() : result.imageId,
                    theme: selectedTheme,
                    image_url: result.imageUrl,
                    created_at: new Date().toISOString()
                }
                localStorage.setItem('guest_latest_result', JSON.stringify(resultData))
                router.push(`/result?guest=${isGuest}`)
            } else {
                throw new Error('No image returned from generation')
            }

        } catch (error: any) {
            console.error(error)
            alert('Error: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleImageSelected = async (blob: Blob) => {
        if (!selectedTheme) return

        // Convert Blob to Base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
                const base64 = reader.result as string
                resolve(base64.split(',')[1])
            }
            reader.readAsDataURL(blob)
        })
        const imageBase64 = await base64Promise

        await generateWithImage(imageBase64)
    }

    const handleUseCachedPhoto = async () => {
        if (!cachedPhoto || !selectedTheme) return
        await generateWithImage(cachedPhoto)
    }

    const canSelectTheme = (themeId: string) => {
        const isFree = THEMES.free.some(t => t.id === themeId)
        return isFree || hasCredits
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-amber-500' : s < step ? 'w-8 bg-amber-300' : 'w-8 bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Step 1: Select Theme */}
            {step === 1 && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">{t.create.chooseCareer}</h1>
                        <p className="text-gray-500">{t.create.whatToBe}</p>
                    </div>

                    {/* Free Themes */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t.create.free}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {THEMES.free.map((theme) => (
                                <Card
                                    key={theme.id}
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${selectedTheme === theme.id
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-transparent hover:border-gray-200'
                                        }`}
                                    onClick={() => setSelectedTheme(theme.id)}
                                >
                                    <div className="text-center">
                                        <span className="text-3xl mb-2 block">{theme.emoji}</span>
                                        <p className="font-medium text-sm">{getThemeName(theme.id)}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Premium Themes */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-medium text-gray-500">{t.create.premium}</h3>
                            {!hasCredits && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {credits} Credits Required
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {THEMES.premium.map((theme) => {
                                const canSelect = canSelectTheme(theme.id)
                                return (
                                    <Card
                                        key={theme.id}
                                        className={`p-4 transition-all border-2 relative ${canSelect
                                            ? selectedTheme === theme.id
                                                ? 'border-amber-500 bg-amber-50 cursor-pointer'
                                                : 'border-transparent hover:border-gray-200 cursor-pointer hover:shadow-md'
                                            : 'border-transparent bg-gray-50 opacity-60 cursor-not-allowed'
                                            }`}
                                        onClick={() => canSelect && setSelectedTheme(theme.id)}
                                    >
                                        {!canSelect && (
                                            <div className="absolute top-2 right-2">
                                                <Lock className="w-3 h-3 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <span className="text-2xl sm:text-3xl mb-2 block">{theme.emoji}</span>
                                            <p className="font-medium text-xs sm:text-sm">{getThemeName(theme.id)}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button
                            size="lg"
                            disabled={!selectedTheme}
                            onClick={() => setStep(2)}
                            className="px-12 bg-amber-600 hover:bg-amber-700"
                        >
                            {t.create.continue}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Options */}
            {step === 2 && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">{t.create.customize}</h1>
                        <p className="text-gray-500">{selectedThemeData?.emoji} {selectedTheme && getThemeName(selectedTheme)}</p>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">{t.create.format}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {FORMATS.map((format) => {
                                const canSelect = format.free || hasCredits
                                return (
                                    <Card
                                        key={format.id}
                                        className={`p-4 transition-all border-2 relative ${canSelect
                                            ? selectedFormat === format.id
                                                ? 'border-amber-500 bg-amber-50 cursor-pointer'
                                                : 'border-transparent hover:border-gray-200 cursor-pointer'
                                            : 'border-transparent bg-gray-50 opacity-60 cursor-not-allowed'
                                            }`}
                                        onClick={() => canSelect && setSelectedFormat(format.id)}
                                    >
                                        {!canSelect && (
                                            <div className="absolute top-2 right-2">
                                                <Lock className="w-3 h-3 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <div className={`mx-auto mb-2 bg-gray-200 ${format.id === 'square' ? 'w-10 h-10' :
                                                format.id === 'portrait' ? 'w-8 h-10' : 'w-12 h-7'
                                                } rounded`} />
                                            <p className="font-medium text-sm">{getFormatName(format.id)}</p>
                                            <p className="text-xs text-gray-400">{format.ratio}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Shot Type Selection */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">{t.create.shotType}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {SHOT_TYPES.map((shot) => {
                                const canSelect = shot.free || hasCredits
                                return (
                                    <Card
                                        key={shot.id}
                                        className={`p-4 transition-all border-2 relative ${canSelect
                                            ? selectedShot === shot.id
                                                ? 'border-amber-500 bg-amber-50 cursor-pointer'
                                                : 'border-transparent hover:border-gray-200 cursor-pointer'
                                            : 'border-transparent bg-gray-50 opacity-60 cursor-not-allowed'
                                            }`}
                                        onClick={() => canSelect && setSelectedShot(shot.id)}
                                    >
                                        {!canSelect && (
                                            <div className="absolute top-2 right-2">
                                                <Lock className="w-3 h-3 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="font-medium text-sm">{getShotName(shot.id)}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            {t.create.back}
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => setStep(3)}
                            className="px-12 bg-amber-600 hover:bg-amber-700"
                        >
                            {t.create.continue}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Upload Photo */}
            {step === 3 && (
                <div className="space-y-6 max-w-xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">{t.create.uploadPhoto}</h1>
                        <p className="text-gray-500">
                            {selectedThemeData?.emoji} {selectedTheme && getThemeName(selectedTheme)} • {getFormatName(selectedFormat)} • {getShotName(selectedShot)}
                        </p>
                    </div>

                    {uploading ? (
                        <div className="text-center py-16">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-amber-200 rounded-full opacity-25 animate-ping"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-lg border-2 border-amber-100">
                                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold mb-2 animate-pulse text-amber-900">
                                {loadingMessage || t.create.creating}
                            </h2>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                {t.create.creatingTime || 'This takes about 10-20 seconds'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Option to use cached photo */}
                            {cachedPhoto && (
                                <div className="space-y-4">
                                    <Card
                                        className="p-4 border-2 border-amber-300 bg-amber-50 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={handleUseCachedPhoto}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`data:image/jpeg;base64,${cachedPhoto}`}
                                                    alt="Cached photo"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-amber-600" />
                                                    <p className="font-semibold text-amber-900">{t.create.usePreviousPhoto}</p>
                                                </div>
                                                <p className="text-sm text-amber-700">{t.create.usePreviousPhotoDesc}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="text-sm text-gray-400">{t.create.or}</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>

                                    <div className="text-center text-sm text-gray-500 mb-2">
                                        <Upload className="w-4 h-4 inline mr-1" />
                                        {t.create.uploadNewPhoto}
                                    </div>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                                <p className="font-medium text-amber-800 mb-2">{t.create.tips}</p>
                                <ul className="text-amber-700 space-y-1 text-sm">
                                    <li>• {t.create.tip1}</li>
                                    <li>• {t.create.tip2}</li>
                                    <li>• {t.create.tip3}</li>
                                </ul>
                            </div>

                            <ImageUpload onImageSelected={handleImageSelected} />

                            {/* Privacy Assurance */}
                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    {t.create.privacyNote || 'Photos are deleted after 24h. No AI training.'}
                                    <a href="/about" target="_blank" className="underline hover:text-gray-600 ml-1">
                                        {t.create.learnMore || 'Learn more'}
                                    </a>
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-center pt-4">
                        <Button variant="ghost" onClick={() => setStep(2)} disabled={uploading}>
                            {t.create.back}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
