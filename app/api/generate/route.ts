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
        const prompt = `Generate an image: A hyper-realistic portrait of a child as a ${theme}, professional studio lighting, 8k, highly detailed, futuristic`

        // Initialize Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
        }

        // Use Gemini 2.0 Flash with native image generation
        // This model supports responseModalities: ["IMAGE"] for image generation
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE", "TEXT"],
                    responseMimeType: "text/plain"
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error:', response.status, errorText)
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('Gemini API Response structure:', Object.keys(data))

        let resultUrl = ''

        // Extract image from Gemini response
        // Response structure: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
        if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData) {
                    const mimeType = part.inlineData.mimeType || 'image/png'
                    resultUrl = `data:${mimeType};base64,${part.inlineData.data}`
                    break
                }
            }
        }

        if (!resultUrl) {
            console.error('Unexpected API response structure:', JSON.stringify(data, null, 2))
            throw new Error('No image data returned from Gemini API')
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
