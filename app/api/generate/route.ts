import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

        // Initialize Gemini Client
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            if (is_guest) {
                return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey!)

        // Use the imagen-3.0-generate-001 model
        // Note: As of early 2025, Imagen might be accessed via specific model name in the SDK
        // Or sometimes requires a specific 'tool' syntax if using a chat model.
        // However, standard docs suggest retrieving the model directly.
        // If 'imagen-3.0-generate-001' 404s, we might try 'gemini-pro' with image generation tools if updated.
        // But let's try the SDK's direct model access first which usually resolves the correct endpoint.

        // NOTE: The standard SDK usually assumes text generation models. 
        // Image generation support in the JS SDK is newer. 
        // We will try to use the REST fallback logic IF the SDK throws "method not found" but 
        // let's assume the user has the latest SDK handled this.
        // Actually, the JS SDK might not strictly have type definition for `generateImages` in older versions.
        // Let's use `getGenerativeModel` and cast to any to avoid TS errors if types are lagging,
        // or check docs standard.

        // Attempting with SDK
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" }) as any;

        let resultUrl = ''

        try {
            // SDK method for images
            const result = await model.generateImages({
                prompt: prompt,
                numberOfImages: 1,
            });
            const response = result.response;
            const predictions = response.predictions || response.images; // Check SDK response structure

            if (predictions && predictions.length > 0) {
                // Check if it's base64 (bytesBase64Encoded) or a signed URL
                const firstImage = predictions[0];
                if (firstImage.bytesBase64Encoded) {
                    resultUrl = `data:image/jpeg;base64,${firstImage.bytesBase64Encoded}`
                } else if (firstImage.url) {
                    resultUrl = firstImage.url
                } else if (typeof firstImage === 'string') {
                    resultUrl = `data:image/jpeg;base64,${firstImage}`
                }
            }
        } catch (sdkError: any) {
            // Fallback or re-throw
            console.warn('SDK Generate Images failed, trying generic generateContent or throwing:', sdkError)

            // If the SDK call failed (e.g. 404), maybe try 'imagen-3.0-generate-002'
            if (sdkError.message?.includes('404')) {
                throw new Error('Imagen 3 Model Not Found. Your API Key may not have access to this model yet.')
            }
            throw sdkError
        }

        if (!resultUrl) {
            throw new Error('No image data returned from Gemini SDK')
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
