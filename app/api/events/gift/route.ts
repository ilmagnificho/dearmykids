import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CREDIT_PACKAGES, PackageId } from '@/lib/credits'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { packageId } = await request.json() as { packageId: PackageId }

        // Validate package
        const creditPackage = CREDIT_PACKAGES[packageId]
        if (!creditPackage) {
            return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
        }

        // Limit: Check if user already got a gift TODAY (or ever? Let's say once per day for now to be generous but prevent loop)
        // Actually, user said "collect metrics". Let's prevent clear abuse but allow re-clicking for "fun" if reasonable?
        // Let's implement: "1 Gift per Account" for Launch Event to keep it special (and avoid inflation).

        // Check existing SUCCESSFUL attempt
        const { data: existing } = await supabase
            .from('purchase_attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'gifted')
            .single()

        if (existing) {
            // Log the duplicate attempt anyway
            await supabase.from('purchase_attempts').insert({
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
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('credits')
            .eq('user_id', user.id)
            .single()

        const currentCredits = profile?.credits || 0
        const newCredits = currentCredits + creditPackage.credits

        // 2. Update Profile
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ credits: newCredits })
            .eq('user_id', user.id)

        if (updateError) throw updateError

        // 3. Log Success
        await supabase.from('purchase_attempts').insert({
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
