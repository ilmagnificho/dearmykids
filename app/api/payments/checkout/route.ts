import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createCheckout, LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await request.json()

        // Get variant ID based on plan
        let variantId: string | undefined
        if (plan === 'monthly') {
            variantId = LEMONSQUEEZY_CONFIG.variants.premium_monthly
        } else if (plan === 'yearly') {
            variantId = LEMONSQUEEZY_CONFIG.variants.premium_yearly
        }

        if (!variantId) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Get base URL
        const origin = request.headers.get('origin') || 'https://dearmykids.vercel.app'

        // Create checkout
        const checkoutUrl = await createCheckout(
            variantId,
            user.id,
            user.email || '',
            `${origin}/dashboard?payment=success`,
            `${origin}/pricing?payment=cancelled`
        )

        return NextResponse.json({ checkoutUrl })

    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
