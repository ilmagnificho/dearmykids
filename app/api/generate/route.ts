import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const json = await request.json()
        const { storage_path, theme, is_guest, image_base64 } = json

        if (!theme) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('Generating with theme:', theme)

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            if (is_guest) {
                return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey!)

        // 1. Vision Analysis Phase (if image provided)
        let visualDescription = `A cute child`

        if (image_base64) {
            try {
                const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
                const visionPrompt = "Describe the physical appearance of the child in this photo in extreme detail for an image generator prompt. Focus on: ethnicity, hair style/color, eye shape, distinct features (like glasses, freckles), facial structure, and expression. Do not describe the background. Keep it concise, comma-separated."

                const visionResult = await visionModel.generateContent([
                    visionPrompt,
                    {
                        inlineData: {
                            data: image_base64,
                            mimeType: "image/jpeg",
                        },
                    },
                ])
                const response = await visionResult.response
                visualDescription = response.text().trim()
                console.log('Vision Analysis:', visualDescription)
            } catch (visionError) {
                console.warn('Vision analysis failed, falling back to generic prompt:', visionError)
            }
        }

        // 2. Adjust prompt using Vision data
        // Combine visual description with theme
        const prompt = `A hyper - realistic cinematic portrait of ${visualDescription} dressed as a ${theme}, professional studio lighting, 8k, highly detailed, sharp focus, futuristic, movie poster quality`

        console.log('Final Prompt:', prompt)

        // 3. Image Generation Phase (Gemini 2.5 Flash Image)
        // Model: gemini-2.5-flash-image (the only model that supports image generation)

        console.log('Calling Gemini 2.5 Flash Image for Image Generation...')

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

        const imagePrompt = `Generate a photorealistic image: ${prompt}`

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: imagePrompt }]
                }]
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error:', response.status, errorText)
            throw new Error(`Gemini Generation Failed: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log('Gemini Response keys:', Object.keys(data))

        let resultUrl = ''

        // Extract image from response - check for inlineData in parts
        if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                    resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                    console.log('Found image in response')
                    break
                }
            }
        }

        if (!resultUrl) {
            console.error('Unexpected Gemini response:', JSON.stringify(data, null, 2))
            throw new Error('Gemini returned no image data.')
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

        // 2. Save to DB
        const base64Data = resultUrl.split(',')[1]
        const imageBuffer = Buffer.from(base64Data, 'base64')
        const fileName = `generated / ${user.id}/${Date.now()}.jpg`

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
                image_url: publicUrl,
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
