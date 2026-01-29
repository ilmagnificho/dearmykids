// Lemon Squeezy API configuration and helpers

export const LEMONSQUEEZY_CONFIG = {
    // API endpoints
    apiUrl: 'https://api.lemonsqueezy.com/v1',

    // Store and product IDs (set these in environment variables)
    storeId: process.env.LEMONSQUEEZY_STORE_ID,

    // Product variants (create these in Lemon Squeezy dashboard)
    variants: {
        premium_monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
        premium_yearly: process.env.LEMONSQUEEZY_VARIANT_YEARLY,
    }
}

// Create checkout URL for a variant
export async function createCheckout(
    variantId: string,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
) {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY
    if (!apiKey) {
        throw new Error('Lemon Squeezy API key not configured')
    }

    const response = await fetch(`${LEMONSQUEEZY_CONFIG.apiUrl}/checkouts`, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            data: {
                type: 'checkouts',
                attributes: {
                    checkout_data: {
                        email: userEmail,
                        custom: {
                            user_id: userId
                        }
                    },
                    product_options: {
                        redirect_url: successUrl,
                    },
                    checkout_options: {
                        button_color: '#f59e0b' // amber-500
                    }
                },
                relationships: {
                    store: {
                        data: {
                            type: 'stores',
                            id: LEMONSQUEEZY_CONFIG.storeId
                        }
                    },
                    variant: {
                        data: {
                            type: 'variants',
                            id: variantId
                        }
                    }
                }
            }
        })
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Lemon Squeezy checkout error:', error)
        throw new Error('Failed to create checkout')
    }

    const data = await response.json()
    return data.data.attributes.url
}

// Verify webhook signature
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(payload).digest('hex')
    return signature === digest
}

// Subscription status types
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused' | 'unpaid'

// Check if subscription is active
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
    return status === 'active'
}
