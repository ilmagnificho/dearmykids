import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // Use standard client for Admin/Service Role
import { createClient as createServerClient } from '@/utils/supabase/server' // User Auth Check
import { CREDIT_PACKAGES, PackageId } from '@/lib/credits'

export async function POST(request: Request) {
    console.log('Gift API: Processing POST request')
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.log('Gift API: No user found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Validate Env Vars
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Gift API Error: Missing SUPABASE_SERVICE_ROLE_KEY')
            return NextResponse.json({ error: 'Server Configuration Error: Missing Service Role Key' }, { status: 500 })
        }

        // Initialize Admin Client (Service Role) to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const body = await request.json()
        const { packageId } = body as { packageId: PackageId }
        console.log(`Gift API: User ${user.id} requesting package ${packageId}`)

        // Validate package
        const creditPackage = CREDIT_PACKAGES[packageId]
        if (!creditPackage) {
            return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
        }

        // Limit: Check if user already got a gift TODAY (or ever? Let's say once per day for now to be generous but prevent loop)
        // Actually, user said "collect metrics". Let's prevent clear abuse but allow re-clicking for "fun" if reasonable?
        // Let's implement: "1 Gift per Account" for Launch Event to keep it special (and avoid inflation).

        // Check existing SUCCESSFUL attempt
        const { data: existing } = await supabaseAdmin
            .from('purchase_attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'gifted')
            .single()

        if (existing) {
            // Log the duplicate attempt anyway
            await supabaseAdmin.from('purchase_attempts').insert({
                user_id: user.id,
                package_id: packageId,
                status: 'already_claimed',
                credits_amount: 0,
                user_agent: request.headers.get('user-agent')
            })
            return NextResponse.json({
                success: false,
                message: "You've already claimed your Launch Gift! Enjoy your credits."
            })
        }

        // Grant Credits
        // 1. Get current credits
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('credits')
            .eq('user_id', user.id)
            .single()

        const currentCredits = profile?.credits || 0
        const newCredits = currentCredits + creditPackage.credits

        // 2. Update Profile
        const { error: updateError } = await supabaseAdmin
            .from('user_profiles')
            .update({ credits: newCredits })
            .eq('user_id', user.id)

        if (updateError) throw updateError

        // 3. Log Success
        await supabaseAdmin.from('purchase_attempts').insert({
            user_id: user.id,
            package_id: packageId,
            status: 'gifted',
            credits_amount: creditPackage.credits,
            user_agent: request.headers.get('user-agent')
        })

        return NextResponse.json({
            success: true,
            message: `Launch Gift! ${creditPackage.credits} credits added to your account.`,
            newCredits: newCredits
        })

    } catch (error: any) {
        console.error('Gift error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    return NextResponse.json({ message: 'Gift API is working (GET). Please use POST to claim gift.' })
}
