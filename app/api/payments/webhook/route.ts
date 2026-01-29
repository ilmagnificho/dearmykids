import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(payload).digest('hex')
    return signature === digest
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('x-signature') || ''
        const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

        // Verify signature if secret is configured
        if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const eventName = payload.meta.event_name

        console.log('Lemon Squeezy webhook:', eventName)

        // Get custom data
        const customData = payload.meta.custom_data || {}
        const userId = customData.user_id
        const packageId = customData.package_id
        const credits = parseInt(customData.credits) || 0

        if (!userId) {
            console.error('No user_id in webhook')
            return NextResponse.json({ error: 'No user_id' }, { status: 400 })
        }

        // Connect to Supabase with service role
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase config missing')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Handle order completed (one-time purchase)
        if (eventName === 'order_created') {
            const orderId = payload.data.id
            const orderTotal = payload.data.attributes.total

            console.log(`Order ${orderId} for user ${userId}: ${credits} credits`)

            // Get current credits
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('credits')
                .eq('user_id', userId)
                .single()

            const currentCredits = profile?.credits || 0
            const newCredits = currentCredits + credits

            // Update user credits
            await supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    credits: newCredits,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            // Record the purchase
            await supabase
                .from('purchases')
                .insert({
                    user_id: userId,
                    order_id: orderId,
                    package_id: packageId,
                    credits_added: credits,
                    amount: orderTotal,
                    created_at: new Date().toISOString()
                })

            console.log(`User ${userId} now has ${newCredits} credits`)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
