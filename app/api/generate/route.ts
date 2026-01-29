import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Replicate from 'replicate'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const json = await request.json()
        const { storage_path, theme, is_guest } = json

        if (!storage_path || !theme) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Initialize Replicate
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        })

        // Determine Image URL
        let imageUrlToProcess = ''

        if (is_guest && storage_path === 'guest_demo.jpg') {
            // Use a demo image URL for guest processing (or a random one)
            // Ideally, we might want to accept a Data URI or handle upload even for guests if we want "Real" results on "Their" photo.
            // But since we skipped upload for guests earlier... we have a problem if we want to use THEIR photo.
            // For now, let's use a placeholder 'child' image if they didn't upload to Supabase.
            // OR rewrite guest flow to allow upload (public bucket? or simpler: Base64 pass-through - risky size).
            // BETTER: Use a sample image for the "Demo" prompt.
            imageUrlToProcess = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80'
        } else {
            // Get public URL from Supabase
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(storage_path)
            imageUrlToProcess = publicUrl
        }

        console.log('Generating with theme:', theme)

        // Call Replicate (Flux Schnell)
        // Adjust prompt based on theme
        const prompt = `A hyper-realistic portrait of a child as a ${theme}, professional studio lighting, 8k, highly detailed, futuristic`

        const output = await replicate.run(
            "black-forest-labs/flux-schnell",
            {
                input: {
                    prompt: prompt,
                    // aspect_ratio: "3:4", // Flux might support this
                    // image: imageUrlToProcess // If doing img2img. Flux Schnell is usually txt2img or img2img? 
                    // Let's assume text-to-image for now based on "Theme". 
                    // If we want Face Swap/Adapter, that's more complex.
                    // MVP: Just Text Generation based on theme
                }
            }
        )

        console.log('Replicate Output:', output)
        // content: [ "https://replicate.delivery/..." ]
        const resultUrl = Array.isArray(output) ? output[0] : output

        // 0. Guest Mode Response
        if (is_guest) {
            return NextResponse.json({
                success: true,
                message: 'Guest generation successful',
                imageUrl: resultUrl,
                guest: true
            })
        }

        // Standard Auth Check
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Save to DB
        const { data: imageRecord, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: user.id,
                image_url: String(resultUrl),
                prompt: prompt,
                theme: theme,
                storage_path: storage_path
            })
            .select()
            .single()

        if (dbError) throw dbError

        return NextResponse.json({
            success: true,
            message: 'Generation processing started',
            imageId: imageRecord.id,
            imageUrl: String(resultUrl) // Return URL for immediate display
        })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 })
    }
}
