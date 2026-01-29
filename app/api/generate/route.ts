import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const json = await request.json()
        const { storage_path, theme, is_guest } = json

        if (!storage_path || !theme) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('Generating with theme:', theme)

        // Adjust prompt based on theme
        const prompt = `A hyper - realistic portrait of a child as a ${theme}, professional studio lighting, 8k, highly detailed, futuristic`

        // Call Google Gemini API (Imagen 3) via REST
        // We use REST because the SDK support for Imagen can be experimental/variable
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            if (is_guest) {
                return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
            }
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: prompt,
                        },
                    ],
                    parameters: {
                        sampleCount: 1,
                        // aspectRatio: "3:4" // Optional: Support if needed
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error:', errorText)
            throw new Error(`Gemini API Failed: ${response.statusText}`)
        }

        const data = await response.json()
        // Response format: { predictions: [ { bytesBase64Encoded: "..." } ] }

        let resultUrl = ''
        if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
            const base64Image = data.predictions[0].bytesBase64Encoded
            resultUrl = `data:image/jpeg;base64,${base64Image}`
        } else if (data.predictions && data.predictions[0]?.mimeType && data.predictions[0]?.bytesBase64Encoded) {
            // Handle generic format if different
            resultUrl = `data:${data.predictions[0].mimeType};base64,${data.predictions[0].bytesBase64Encoded}`
        } else {
            throw new Error('No image data in response')
        }

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

        // 2. Save to DB (Upload Base64 to Storage first?)
        // For real users, we should upload the result to Storage to get a permanent URL.
        // Base64 strings are too large for the 'image_url' text column usually and bad for DB performance.

        // Upload generated image to Supabase Storage
        const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64')
        const fileName = `generated/${user.id}/${Date.now()}.jpg`

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, imageBuffer, {
                contentType: 'image/jpeg'
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName)

        const { data: imageRecord, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: user.id,
                image_url: publicUrl, // Save the Storage URL, not Base64
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
            imageUrl: publicUrl
        })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 })
    }
}
