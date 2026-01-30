'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Loader2, Globe } from 'lucide-react'

export function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    // Hide Navbar on login page if desired, or keep it simple
    if (pathname === '/login') return null

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold tracking-tight text-navy-900">
                    DearMyKids
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/create" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        Create
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        Pricing
                    </Link>
                    <Link href="/collection" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        Collection
                    </Link>
                    <Link href="/invite" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        Invite
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        Dashboard
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        About
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <button
                        onClick={() => {
                            const newLocale = localStorage.getItem('locale') === 'ko' ? 'en' : 'ko'
                            localStorage.setItem('locale', newLocale)
                            window.dispatchEvent(new Event('localeChange'))
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-navy-900 border rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>EN/KR</span>
                    </button>

                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium hidden sm:inline-block">
                                {user.email}
                            </span>
                            <Button onClick={handleSignOut} variant="ghost" size="sm">
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" className="bg-navy-900 hover:bg-navy-800 text-white">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
