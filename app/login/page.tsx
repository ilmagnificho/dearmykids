'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, Chrome } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (provider: 'google' | 'kakao') => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-stone-50">
            {/* Left side - Visual (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                <div className="relative z-10 text-white p-10 max-w-xl">
                    <h2 className="font-serif text-4xl mb-6"> "The best way to predict the future is to create it." </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-amber-500/20 text-amber-500"><Check className="w-4 h-4" /></div>
                            <span>Premium AI Generation</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-amber-500/20 text-amber-500"><Check className="w-4 h-4" /></div>
                            <span>Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-amber-500/20 text-amber-500"><Check className="w-4 h-4" /></div>
                            <span>Instant Results</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900">Sign in to DearMyKids</h1>
                        <p className="mt-2 text-sm text-gray-600">Start creating your child's dream portraits today.</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium flex items-center justify-center gap-3 hover:bg-gray-50 bg-white"
                            onClick={() => handleLogin('google')}
                            disabled={loading}
                        >
                            <Chrome className="w-5 h-5 text-red-500" />
                            Continue with Google
                        </Button>

                        <Button
                            className="w-full h-12 text-base font-medium flex items-center justify-center gap-3 bg-[#FAE100] hover:bg-[#FADB00] text-[#371D1E] border border-[#FADB00]"
                            onClick={() => handleLogin('kakao')}
                            disabled={loading}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M12 3C5.373 3 0 7.378 0 12.78c0 3.326 2.058 6.257 5.213 8.046-.226.837-.822 3.037-.94 3.527-.15.614.227.86.598.618.667-.446 4.397-2.903 5.48-3.66.52.076 1.05.116 1.59.116 6.627 0 12-4.378 12-9.78S16.627 3 12 3z" />
                            </svg>
                            Continue with Kakao
                        </Button>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        By continuing, you simply agree to our harmless Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    )
}
