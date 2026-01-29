'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { Loader2, Rocket, Briefcase, Music } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const THEMES = [
    { id: 'astronaut', name: 'Astronaut', icon: Rocket, description: 'Exploring the galaxy' },
    { id: 'doctor', name: 'Doctor', icon: Briefcase, description: 'Saving lives' },
    { id: 'kpop_star', name: 'K-Pop Star', icon: Music, description: 'Shining on stage' },
]

export default function CreatePage() {
    const [step, setStep] = useState(1)
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleImageSelected = async (blob: Blob) => {
        if (!selectedTheme) return
        setUploading(true)

        try {
            // Check User Session
            const { data: { user } } = await supabase.auth.getUser()
            const isGuest = !user

            let filePath = ''

            if (!isGuest) {
                // 1. Upload to Supabase Storage (Only for logged-in users)
                const fileExt = 'jpg'
                const fileName = `${Date.now()}.${fileExt}`
                filePath = `${fileName}` // Relative path

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, blob, {
                        contentType: 'image/jpeg'
                    })

                if (uploadError) throw uploadError
            } else {
                console.log('Guest Mode: Skipping Storage Upload')
                filePath = 'guest_demo.jpg' // Dummy path
            }

            // 2. Call Generate API
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({
                    storage_path: filePath,
                    theme: selectedTheme,
                    is_guest: isGuest
                })
            })

            if (!response.ok) throw new Error('Generation failed')

            const result = await response.json()

            // 3. Redirect
            if (isGuest) {
                // Store actual result in local storage for guest
                if (result.imageUrl) {
                    const guestResult = {
                        id: 'guest-' + Date.now(),
                        theme: selectedTheme,
                        image_url: result.imageUrl,
                        created_at: new Date().toISOString()
                    }
                    localStorage.setItem('guest_latest_result', JSON.stringify(guestResult))
                }
                alert('Guest Mode: Generation Complete!')
                router.push('/dashboard?guest=true')
            } else {
                alert('Image generation started! You will be notified when ready.')
                router.push('/dashboard')
            }

        } catch (error: any) {
            console.error(error)
            alert('Error: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-serif font-bold text-navy-900 mb-2">Create Your Child's Future</h1>
                <p className="text-gray-500">Step {step} of 2</p>
            </div>

            {step === 1 && (
                <div className="space-y-8">
                    <h2 className="text-xl font-medium text-center">Select a Dream Career</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {THEMES.map((theme) => {
                            const Icon = theme.icon
                            const isSelected = selectedTheme === theme.id
                            return (
                                <Card
                                    key={theme.id}
                                    className={`p-6 cursor-pointer transition-all hover:shadow-md border-2 ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-transparent'}`}
                                    onClick={() => setSelectedTheme(theme.id)}
                                >
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className={`p-4 rounded-full ${isSelected ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{theme.name}</h3>
                                            <p className="text-sm text-gray-500">{theme.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                    <div className="flex justify-center mt-8">
                        <Button
                            size="lg"
                            disabled={!selectedTheme}
                            onClick={() => setStep(2)}
                            className="w-full md:w-auto px-12"
                        >
                            Next Step
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 max-w-xl mx-auto">
                    <h2 className="text-xl font-medium text-center">Upload a Clear Photo</h2>
                    <p className="text-sm text-center text-gray-500 mb-8">
                        For best results, upload a front-facing photo with good lighting.
                    </p>

                    {uploading ? (
                        <div className="text-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500 mb-4" />
                            <p className="text-lg font-medium">Uploading & Processing...</p>
                            <p className="text-sm text-gray-500">This may take a moment.</p>
                        </div>
                    ) : (
                        <ImageUpload onImageSelected={handleImageSelected} />
                    )}

                    <div className="flex justify-center pt-8">
                        <Button variant="ghost" onClick={() => setStep(1)} disabled={uploading}>
                            Back to Themes
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
