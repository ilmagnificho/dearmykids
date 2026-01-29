'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Loader2, Search, Plus, User as UserIcon } from 'lucide-react'

// Types
interface UserProfile {
    user_id: string
    email: string
    full_name: string
    avatar_url?: string | null
    credits: number
    free_credits: number
    is_admin: boolean
    created_at: string
}

export default function AdminPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchEmail, setSearchEmail] = useState('')
    const [searchResults, setSearchResults] = useState<UserProfile[]>([])
    const [updating, setUpdating] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    // 1. Check Admin Status & Load Data
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!profile || !profile.is_admin) {
                alert('Access Denied: Admins only.')
                router.push('/')
                return
            }

            // Load recent users
            fetchRecentUsers()
        }

        checkAdmin()
    }, [router, supabase])

    const fetchRecentUsers = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) setProfiles(data)
        setLoading(false)
    }

    // 2. Search
    const handleSearch = async () => {
        if (!searchEmail) return
        setLoading(true)
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('email', `%${searchEmail}%`)
            .limit(5)

        if (data) setSearchResults(data)
        setLoading(false)
    }

    // 3. Add Credits
    const grantCredits = async (userId: string, amount: number) => {
        setUpdating(userId)
        try {
            // Fetch current
            const { data: current } = await supabase
                .from('user_profiles')
                .select('credits')
                .eq('user_id', userId)
                .single()

            if (!current) throw new Error('User not found')

            const { error } = await supabase
                .from('user_profiles')
                .update({ credits: (current.credits || 0) + amount })
                .eq('user_id', userId)

            if (error) throw error

            alert(`Granted ${amount} credits!`)
            // Refresh
            fetchRecentUsers()
            if (searchResults.length > 0) handleSearch()

        } catch (e: any) {
            console.error(e)
            alert('Error: ' + e.message)
        } finally {
            setUpdating(null)
        }
    }

    if (loading && profiles.length === 0) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span className="bg-slate-900 text-white px-2 py-1 rounded text-sm">ADMIN</span>
                Manager Dashboard
            </h1>

            {/* Search Section */}
            <Card className="p-6 mb-8 bg-slate-50">
                <h2 className="text-xl font-bold mb-4">Find User</h2>
                <div className="flex gap-4 mb-6">
                    <Input
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>

                {searchResults.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-500 text-sm">Search Results:</h3>
                        {searchResults.map(user => (
                            <UserRow key={user.user_id} user={user} onGrant={grantCredits} updating={updating} />
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Users */}
            <div>
                <h2 className="text-xl font-bold mb-4">Recent Users</h2>
                <div className="space-y-4">
                    {profiles.map(user => (
                        <UserRow key={user.user_id} user={user} onGrant={grantCredits} updating={updating} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function UserRow({ user, onGrant, updating }: { user: UserProfile, onGrant: (id: string, n: number) => void, updating: string | null }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                        <UserIcon className="text-gray-400" />
                    )}
                </div>
                <div>
                    <div className="font-bold flex items-center gap-2">
                        {user.full_name || 'No Name'}
                        <span className="text-xs font-normal text-gray-400">({user.email})</span>
                        {user.is_admin && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">ADMIN</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                        Credits: <span className="font-bold text-amber-600">{user.credits}</span> |
                        Free: {user.free_credits} |
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 hover:bg-green-50 text-green-700"
                    onClick={() => onGrant(user.user_id, 1)}
                    disabled={updating === user.user_id}
                >
                    <Plus className="w-3 h-3 mr-1" /> 1 Credit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 hover:bg-green-50 text-green-700"
                    onClick={() => onGrant(user.user_id, 5)}
                    disabled={updating === user.user_id}
                >
                    <Plus className="w-3 h-3 mr-1" /> 5 Credits
                </Button>
            </div>
        </div>
    )
}
