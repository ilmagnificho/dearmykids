import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Webhook received:', body)

        // Validate webhook signature if needed (highly recommended for production)

        if (body.status === 'succeeded') {
            const supabase = await createClient()
            const outputUrl = body.output && body.output[0] // Replicate usually returns an array

            // We typically pass the internal image ID in the webhook metadata or query param
            // For MVP, let's assume we can map it back or just log it.
            // real implementation requires passing ?id=... in the webhook URL

            console.log('Generation Succeeded:', outputUrl)

            // Update database logic would go here
            // await supabase.from('generated_images').update({ image_url: outputUrl }).eq('id', body.id)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}
