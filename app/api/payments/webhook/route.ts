import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature } from '@/lib/lemonsqueezy'

// Lemon Squeezy webhook handler
export async function POST(request: Request) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('x-signature') || ''
        const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

        // Verify signature
        if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const eventName = payload.meta.event_name

        console.log('Lemon Squeezy webhook:', eventName)

        // Use service role for admin operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase config missing')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get user ID from custom data
        const userId = payload.meta.custom_data?.user_id
        if (!userId) {
            console.error('No user_id in webhook payload')
            return NextResponse.json({ error: 'No user_id' }, { status: 400 })
        }

        // Handle different events
        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated':
            case 'subscription_resumed': {
                const status = payload.data.attributes.status
                const isActive = status === 'active'

                // Update user profile
                await supabase
                    .from('user_profiles')
                    .upsert({
                        user_id: userId,
                        is_premium: isActive,
                        subscription_id: payload.data.id,
                        subscription_status: status,
                        subscription_ends_at: payload.data.attributes.ends_at || payload.data.attributes.renews_at,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })

                console.log(`User ${userId} subscription updated: ${status}`)
                break
            }

            case 'subscription_cancelled':
            case 'subscription_expired':
            case 'subscription_paused': {
                // Mark as not premium
                await supabase
                    .from('user_profiles')
                    .update({
                        is_premium: false,
                        subscription_status: payload.data.attributes.status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)

                console.log(`User ${userId} subscription ended`)
                break
            }

            case 'order_created': {
                // One-time purchase - could be used for credit packs
                console.log(`Order created for user ${userId}`)
                break
            }

            default:
                console.log(`Unhandled event: ${eventName}`)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
