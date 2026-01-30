'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Loader2, Globe } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export function Navbar() {
    const { locale, setLocale } = useLocale()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const pathname = usePathname()

    // Add credit state
    const [credits, setCredits] = useState<number | null>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('credits')
                    .eq('user_id', user.id)
                    .single()
                if (profile) setCredits(profile.credits)
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('credits')
                    .eq('user_id', session.user.id)
                    .single()
                if (profile) setCredits(profile.credits)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    // Hide Navbar on login page if desired
    if (pathname === '/login') return null

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold tracking-tight text-navy-900">
                    DearMyKids
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/create" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        {locale === 'ko' ? '만들기' : 'Create'}
                    </Link>
                    {/* <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        {locale === 'ko' ? '가격' : 'Pricing'}
                    </Link> */}
                    <Link href="/collection" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        {locale === 'ko' ? '컬렉션' : 'Collection'}
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        {locale === 'ko' ? '대시보드' : 'Dashboard'}
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-navy-900">
                        {locale === 'ko' ? '소개' : 'About'}
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <button
                        onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-navy-900 border rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{locale === 'ko' ? 'KR' : 'EN'}</span>
                    </button>

                    {/* Buy Me a Coffee Button (No Auth) */}
                    <a
                        href="https://buymeacoffee.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-[#FFDD00] text-black px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <img
                            src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                            alt="Buy me a coffee"
                            className="w-4 h-4"
                        />
                        <span>{locale === 'ko' ? '커피 한잔 쏘기' : 'Buy me a coffee'}</span>
                    </a>
                </div>
            </div>
        </nav>
    )
}
