'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { Loader2, Lock, Crown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Theme categories with free/premium distinction
const THEMES = {
    free: [
        { id: 'astronaut', name: 'Astronaut', emoji: '🚀', description: 'Space explorer' },
        { id: 'doctor', name: 'Doctor', emoji: '👨‍⚕️', description: 'Healthcare hero' },
        { id: 'scientist', name: 'Scientist', emoji: '🔬', description: 'Lab researcher' },
    ],
    premium: [
        { id: 'kpop_star', name: 'K-Pop Star', emoji: '🎤', description: 'Stage performer' },
        { id: 'chef', name: 'Chef', emoji: '👨‍🍳', description: 'Culinary artist' },
        { id: 'pilot', name: 'Pilot', emoji: '✈️', description: 'Sky captain' },
        { id: 'athlete', name: 'Athlete', emoji: '⚽', description: 'Sports champion' },
        { id: 'artist', name: 'Artist', emoji: '🎨', description: 'Creative genius' },
        { id: 'firefighter', name: 'Firefighter', emoji: '🚒', description: 'Brave rescuer' },
        { id: 'police', name: 'Police Officer', emoji: '👮', description: 'Law protector' },
        { id: 'teacher', name: 'Teacher', emoji: '📚', description: 'Knowledge giver' },
        { id: 'veterinarian', name: 'Veterinarian', emoji: '🐾', description: 'Animal doctor' },
    ]
}

// Format options
const FORMATS = [
    { id: 'square', name: 'Square', ratio: '1:1', description: 'Instagram, Profile', free: true },
    { id: 'portrait', name: 'Portrait', ratio: '3:4', description: 'Print, Poster', free: false },
    { id: 'landscape', name: 'Landscape', ratio: '16:9', description: 'Desktop, Frame', free: false },
]

// Shot type options
const SHOT_TYPES = [
    { id: 'portrait', name: 'Upper Body', description: 'Face & shoulders', free: true },
    { id: 'full_body', name: 'Full Body', description: 'Head to toe', free: false },
    { id: 'headshot', name: 'Headshot', description: 'Face close-up', free: false },
]

export default function CreatePage() {
    const [step, setStep] = useState(1)
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
    const [selectedFormat, setSelectedFormat] = useState('square')
    const [selectedShot, setSelectedShot] = useState('portrait')
    const [uploading, setUploading] = useState(false)
    const [isPremiumUser] = useState(false) // TODO: Check from auth/subscription
    const supabase = createClient()
    const router = useRouter()

    const allThemes = [...THEMES.free, ...THEMES.premium]
    const selectedThemeData = allThemes.find(t => t.id === selectedTheme)

    const handleImageSelected = async (blob: Blob) => {
        if (!selectedTheme) return
        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const isGuest = !user

            let filePath = ''

            if (!isGuest) {
                const fileExt = 'jpg'
                const fileName = `${Date.now()}.${fileExt}`
                filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, blob, {
                        contentType: 'image/jpeg'
                    })

                if (uploadError) throw uploadError
            } else {
                filePath = 'guest_demo.jpg'
            }

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

            // Call Generate API with options
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({
                    storage_path: filePath,
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

    const canSelectTheme = (themeId: string) => {
        const isFree = THEMES.free.some(t => t.id === themeId)
        return isFree || isPremiumUser
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
                        <h1 className="text-2xl font-bold mb-2">Choose a Dream Career</h1>
                        <p className="text-gray-500">What does your child want to be?</p>
                    </div>

                    {/* Free Themes */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">FREE</h3>
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
                                        <p className="font-medium text-sm">{theme.name}</p>
                                        <p className="text-xs text-gray-400">{theme.description}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Premium Themes */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-medium text-gray-500">PREMIUM</h3>
                            {!isPremiumUser && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
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
                                            <p className="font-medium text-xs sm:text-sm">{theme.name}</p>
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
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Options */}
            {step === 2 && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Customize Your Portrait</h1>
                        <p className="text-gray-500">Selected: <span className="font-medium">{selectedThemeData?.emoji} {selectedThemeData?.name}</span></p>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Image Format</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {FORMATS.map((format) => {
                                const canSelect = format.free || isPremiumUser
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
                                            <p className="font-medium text-sm">{format.name}</p>
                                            <p className="text-xs text-gray-400">{format.ratio}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Shot Type Selection */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Shot Type</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {SHOT_TYPES.map((shot) => {
                                const canSelect = shot.free || isPremiumUser
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
                                            <p className="font-medium text-sm">{shot.name}</p>
                                            <p className="text-xs text-gray-400">{shot.description}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => setStep(3)}
                            className="px-12 bg-amber-600 hover:bg-amber-700"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Upload Photo */}
            {step === 3 && (
                <div className="space-y-6 max-w-xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Upload Photo</h1>
                        <p className="text-gray-500">
                            {selectedThemeData?.emoji} {selectedThemeData?.name} • Square • Upper Body
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-amber-800 mb-2">Tips for best results:</p>
                        <ul className="text-amber-700 space-y-1 text-sm">
                            <li>• Clear, front-facing photo</li>
                            <li>• Good lighting, no shadows on face</li>
                            <li>• Neutral background preferred</li>
                        </ul>
                    </div>

                    {uploading ? (
                        <div className="text-center py-16">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto text-amber-500 mb-4" />
                            <p className="text-lg font-medium">Creating your portrait...</p>
                            <p className="text-sm text-gray-500">This takes about 10-20 seconds</p>
                        </div>
                    ) : (
                        <ImageUpload onImageSelected={handleImageSelected} />
                    )}

                    <div className="flex justify-center pt-4">
                        <Button variant="ghost" onClick={() => setStep(2)} disabled={uploading}>
                            Back
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
