import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { FREE_TIER } from '@/lib/credits'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const json = await request.json()
        const { storage_path, theme, is_guest, image_base64, format = 'square', shot_type = 'portrait' } = json

        if (!theme) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if theme is free or premium
        const isFreeTheme = FREE_TIER.freeThemes.includes(theme)
        const isFreeFormat = format === 'square'
        const isFreeShot = shot_type === 'portrait'

        // Theme display names
        const themeNames: Record<string, string> = {
            'astronaut': 'Astronaut',
            'doctor': 'Doctor',
            'scientist': 'Scientist',
            'kpop_star': 'K-Pop Star',
            'chef': 'Chef',
            'pilot': 'Pilot',
            'athlete': 'Athlete',
            'artist': 'Artist',
            'firefighter': 'Firefighter',
            'police': 'Police Officer',
            'teacher': 'Teacher',
            'veterinarian': 'Veterinarian',
        }
        const themeName = themeNames[theme] || theme

        if (!image_base64 && !storage_path) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 })
        }

        console.log('Generating with theme:', theme)

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing')
            return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
        }

        // Get the source image
        let sourceImageBase64 = image_base64
        let imageMimeType = 'image/jpeg'

        // If no direct base64, fetch from storage
        if (!sourceImageBase64 && storage_path) {
            const { data: imageData, error: downloadError } = await supabase.storage
                .from('uploads')
                .download(storage_path)

            if (downloadError || !imageData) {
                console.error('Failed to download source image:', downloadError)
                throw new Error('Failed to download source image')
            }

            const arrayBuffer = await imageData.arrayBuffer()
            sourceImageBase64 = Buffer.from(arrayBuffer).toString('base64')
            imageMimeType = imageData.type || 'image/jpeg'
        }

        console.log('Source image ready, generating with theme:', themeName, 'format:', format, 'shot:', shot_type)

        // Build shot type instruction
        const shotInstructions: Record<string, string> = {
            'portrait': 'Show the upper body (head and shoulders)',
            'full_body': 'Show the full body from head to toe',
            'headshot': 'Show a close-up of the face',
        }
        const shotInstruction = shotInstructions[shot_type] || shotInstructions['portrait']

        // Build aspect ratio instruction
        const aspectRatios: Record<string, string> = {
            'square': '1:1 square aspect ratio',
            'portrait': '3:4 portrait aspect ratio',
            'landscape': '16:9 landscape aspect ratio',
        }
        const aspectRatio = aspectRatios[format] || aspectRatios['square']

        // Image editing prompt - MUST include the source image and ask to EDIT it
        const editPrompt = `Edit this photo of a child to transform them into a ${themeName}.

CRITICAL REQUIREMENTS:
- KEEP the child's EXACT face, facial features, ethnicity, skin tone, hair color, and any accessories like glasses
- ONLY change their clothing/outfit to match a ${themeName} costume/uniform
- Add an appropriate professional background for a ${themeName}
- The result should look like the SAME child dressed up as a ${themeName}
- ${shotInstruction}
- Output image should be ${aspectRatio}
- Photorealistic style, professional studio portrait lighting, high quality`

        // Use Gemini 2.5 Flash Image with the source image included
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

        console.log('Calling Gemini 2.5 Flash Image for Image Editing...')

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: imageMimeType,
                                data: sourceImageBase64
                            }
                        },
                        { text: editPrompt }
                    ]
                }]
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Error:', response.status, errorText)
            throw new Error(`Gemini Generation Failed: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log('Gemini Response received')

        let resultUrl = ''

        // Extract image from response
        if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                    resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                    console.log('Found edited image in response')
                    break
                }
            }
        }

        if (!resultUrl) {
            console.error('Unexpected Gemini response:', JSON.stringify(data, null, 2))
            throw new Error('Gemini returned no image data.')
        }

        // Guest Mode Response
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

        // Check credits and daily limit
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('credits, daily_free_used, daily_free_date')
            .eq('user_id', user.id)
            .single()

        const today = new Date().toISOString().split('T')[0]
        const credits = profile?.credits || 0
        const dailyFreeUsed = profile?.daily_free_date === today ? (profile?.daily_free_used || 0) : 0

        // Determine if this is a free generation or paid
        const canUseFree = isFreeTheme && isFreeFormat && isFreeShot && dailyFreeUsed < FREE_TIER.dailyLimit
        const needsCredits = !canUseFree

        if (needsCredits && credits <= 0) {
            return NextResponse.json({
                error: 'No credits remaining',
                needsCredits: true,
                message: 'Please purchase credits to continue'
            }, { status: 402 })
        }

        // Deduct credit or update daily free count
        if (canUseFree) {
            // Using free daily generation
            await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    daily_free_used: dailyFreeUsed + 1,
                    daily_free_date: today,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
        } else {
            // Deduct 1 credit
            await supabase
                .from('user_profiles')
                .update({
                    credits: credits - 1,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
        }

        // Save to Storage and DB
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

        // Set expiration based on whether credits were used
        // 48 hours if paid (credits used), 2 hours if free daily
        const expiresAt = new Date()
        if (needsCredits) {
            expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours for paid
        } else {
            expiresAt.setHours(expiresAt.getHours() + 2) // 2 hours for free
        }

        const { data: imageRecord, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: user.id,
                image_url: publicUrl,
                prompt: editPrompt,
                theme: theme,
                storage_path: fileName,
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single()

        if (dbError) throw dbError

        return NextResponse.json({
            success: true,
            message: 'Generation successful',
            imageId: imageRecord.id,
            imageUrl: publicUrl
        })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 })
    }
}
