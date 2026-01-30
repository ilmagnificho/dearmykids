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

        // Get variant ID from environment
        const variantEnvKey = `LEMONSQUEEZY_VARIANT_${packageId.toUpperCase()}`
        const variantId = process.env[variantEnvKey]

        if (!variantId) {
            console.error(`Missing env var: ${variantEnvKey}`)
            return NextResponse.json({ error: 'Package not configured' }, { status: 500 })
        }

        const apiKey = process.env.LEMONSQUEEZY_API_KEY
        const storeId = process.env.LEMONSQUEEZY_STORE_ID

        if (!apiKey || !storeId) {
            return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
        }

        // Get base URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://dearmykids.vercel.app'

        // Create Lemon Squeezy checkout
        const payload = {
            data: {
                type: 'checkouts',
                attributes: {
                    checkout_data: {
                        email: user.email,
                        custom: {
                            user_id: user.id,
                            package_id: packageId,
                            credits: creditPackage.credits
                        }
                    },
                    product_options: {
                        redirect_url: `${origin}/dashboard?payment=success&package=${packageId}`,
                    },
                    checkout_options: {
                        button_color: '#f59e0b'
                    }
                },
                relationships: {
                    store: {
                        data: { type: 'stores', id: storeId.toString() }
                    },
                    variant: {
                        data: { type: 'variants', id: variantId.toString() }
                    }
                }
            }
        }

        console.log('Sending checkout payload:', JSON.stringify(payload, null, 2))

        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Lemon Squeezy API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            })
            throw new Error(`Lemon Squeezy API/Store Error: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        return NextResponse.json({ checkoutUrl: data.data.attributes.url })

    } catch (error: any) {
        console.error('Checkout error details:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
