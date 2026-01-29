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
        const prompt = `A hyper-realistic portrait of a child as a ${theme}, professional studio lighting, 8k, highly detailed, futuristic`

        // Initialize Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
        }

        // Use REST API for Imagen 3 image generation
        // The @google/generative-ai SDK doesn't support generateImages method
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Imagen API Error:', response.status, errorText)
            throw new Error(`Imagen API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('Imagen API Response:', JSON.stringify(data, null, 2))

        let resultUrl = ''

        // Extract image from response
        if (data.predictions && data.predictions.length > 0) {
            const firstImage = data.predictions[0]
            if (firstImage.bytesBase64Encoded) {
                resultUrl = `data:image/png;base64,${firstImage.bytesBase64Encoded}`
            } else if (firstImage.image) {
                resultUrl = `data:image/png;base64,${firstImage.image}`
            }
        }

        if (!resultUrl) {
            console.error('Unexpected API response structure:', data)
            throw new Error('No image data returned from Imagen API')
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
        // Extract Base64 data (remove prefix)
        const base64Data = resultUrl.split(',')[1]
        const imageBuffer = Buffer.from(base64Data, 'base64')
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
                image_url: publicUrl, // Save the Storage URL
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
