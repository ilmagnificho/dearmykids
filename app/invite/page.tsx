'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Copy, Share2, Users, Check } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import Link from 'next/link'

export default function InvitePage() {
    const { t } = useLocale()
    const [referralCode, setReferralCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('referral_code')
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setReferralCode(data.referral_code)
                }
            }
            setLoading(false)
        }

        fetchProfile()
    }, [])

    const handleCopy = () => {
        if (!referralCode) return
        const link = `${window.location.origin}?ref=${referralCode}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        if (!referralCode) return
        const link = `${window.location.origin}?ref=${referralCode}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'DearMyKids Invitation',
                    text: t.invite?.shareText || 'Check out DearMyKids! I created my child\'s future portrait. clear',
                    url: link
                })
            } catch (err) {
                console.error('Share failed', err)
            }
        } else {
            handleCopy()
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-lg">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
                    <Gift className="w-4 h-4" />
                    {t.invite?.badge || 'Referral Program'}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                    {t.invite?.title || 'Invite Friends & Get Free Credits'}
                </h1>
                <p className="text-gray-500">
                    {t.invite?.description || 'Share your unique link. When a friend signs up, you BOTH get 1 free credit!'}
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : referralCode ? (
                <Card className="p-8 border-2 border-purple-100 bg-purple-50/50">
                    <div className="text-center mb-8">
                        <Users className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                        <h3 className="font-medium text-slate-900 mb-2">Your Unique Referral Link</h3>
                        <p className="text-sm text-gray-500 mb-6">Share this link with your friends</p>

                        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-200 mb-4">
                            <code className="flex-1 text-sm text-purple-900 font-mono truncate">
                                {typeof window !== 'undefined' ? `${window.location.host}?ref=${referralCode}` : referralCode}
                            </code>
                            <Button size="icon" variant="ghost" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                            </Button>
                        </div>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg" onClick={handleShare}>
                        <Share2 className="w-5 h-5 mr-2" />
                        {t.invite?.shareBtn || 'Share Link'}
                    </Button>
                </Card>
            ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl">
                    <p className="text-gray-500 mb-4">Please sign in to get your referral code.</p>
                    <Link href="/login">
                        <Button variant="outline">Sign In</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
