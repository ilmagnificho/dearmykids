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

        // Detailed Prompt Logic (Enhanced for better results)
        const themePrompts: Record<string, { label: string, details: string }> = {
            // Free
            'astronaut': {
                label: 'Astronaut',
                details: 'wearing a detailed white NASA space suit with patches and a helmet held under their arm, standing inside a futuristic space station with earth visible through a window'
            },
            'doctor': {
                label: 'Doctor',
                details: 'wearing a clean white medical coat with a stethoscope around the neck, standing in a modern, bright hospital corridor'
            },
            'scientist': {
                label: 'Scientist',
                details: 'wearing a white lab coat and safety goggles, holding a bubbling test tube, standing in a high-tech chemistry laboratory'
            },

            // Premium - Entertainment
            'kpop_star': {
                label: 'K-Pop Star',
                details: 'wearing a trendy, colorful, and stylish K-Pop idol stage outfit with glitter and accessories, standing on a concert stage with bright neon lights and spotlights'
            },
            'artist': {
                label: 'Artist',
                details: 'wearing a denim apron splattered with colorful paint, holding a palette and brush, standing in a sunlit art studio filled with canvas paintings'
            },

            // Premium - Professional
            'chef': {
                label: 'Chef',
                details: 'wearing a professional white chef uniform with a double-breasted jacket and a tall chef hat (toque), standing in a professional stainless steel luxury kitchen'
            },
            'pilot': {
                label: 'Pilot',
                details: 'wearing a professional airline pilot uniform with a navy blazer, captain hat with gold insignia, and tie, standing in an airport cockpit or runway background'
            },
            'firefighter': {
                label: 'Firefighter',
                details: 'wearing authentic turnout gear (firefighter suit) with reflective stripes and a helmet, standing in front of a red fire truck'
            },
            'police': {
                label: 'Police Officer',
                details: 'wearing a neat police officer uniform with a badge and hat, standing in a city street background'
            },
            'teacher': {
                label: 'Teacher',
                details: 'wearing smart casual professional clothing, standing in front of a classroom chalkboard with colorful educational drawings'
            },
            'veterinarian': {
                label: 'Veterinarian',
                details: 'wearing green or blue medical scrubs with cute paw print patterns, holding a stethoscope, standing in a modern veterinary clinic'
            },

            // Premium - Sports (Expanded)
            'soccer': {
                label: 'Soccer Player',
                details: 'wearing a professional soccer jersey and shorts with knee-high socks and cleats, standing on a green grass soccer field in a stadium'
            },
            'baseball': {
                label: 'Baseball Player',
                details: 'wearing a traditional baseball jersey button-up uniform with pants and a baseball cap, holding a baseball bat, standing on a baseball diamond field'
            },
            'basketball': {
                label: 'Basketball Player',
                details: 'wearing a sleeveless basketball jersey and shorts, holding a basketball, standing on a polished indoor basketball court'
            },
            'volleyball': {
                label: 'Volleyball Player',
                details: 'wearing a tight-fitting volleyball jersey and athletic shorts with knee pads, standing on an indoor volleyball court with a net in the background'
            },
            'tennis': {
                label: 'Tennis Player',
                details: 'wearing a white polo shirt and tennis shorts/skirt with a headband, holding a tennis racket, standing on a clay tennis court'
            },
            'golf': {
                label: 'Golf Player',
                details: 'wearing a polo shirt, cap, and golf glove, holding a golf club, standing on a beautiful green golf course with trees in the background'
            },
        }

        const themeConfig = themePrompts[theme] || { label: theme, details: `wearing a ${theme} costume` }
        const themeName = themeConfig.label

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

        // Image editing prompt - REFINED for better likeness and quality
        const editPrompt = `Edit this photo of a child to transform them into a ${themeName}.

CRITICAL INSTRUCTIONS:
1. FACE PRESERVATION: Keep the child's EXACT face, facial features, eyes, nose, mouth, skin tone, hair color, and expression. The face MUST remain recognizable as the original child.
2. COSTUME CHANGE: Change ONLY their clothing/outfit. They should be ${themeConfig.details}.
3. BACKGROUND: Change background to match the description: ${themeConfig.details}.
4. STYLE: Photorealistic, high quality, 8k resolution, cinematic lighting.
5. FORMAT: ${aspectRatio}.
6. SHOT: ${shotInstruction}.

Do not cartoonize unless specified. Make it look like a real professional photo.`

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
            if (!isFreeTheme || !isFreeFormat || !isFreeShot) {
                return NextResponse.json({
                    error: 'Premium features (theme, format, or shot type) are not available for guests.',
                    code: 'PREMIUM_REQUIRED'
                }, { status: 403 })
            }

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
            await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    daily_free_used: dailyFreeUsed + 1,
                    daily_free_date: today,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
        } else {
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

        const expiresAt = new Date()
        if (needsCredits) {
            expiresAt.setHours(expiresAt.getHours() + 48)
        } else {
            expiresAt.setHours(expiresAt.getHours() + 2)
        }

        const { data: imageRecord, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: user.id,
                image_url: publicUrl,
                prompt: editPrompt,
                theme: theme,
                storage_path: fileName,
                expires_at: expiresAt.toISOString(),
                // Analytics
                is_free_tier: canUseFree,
                credits_used: needsCredits ? 1 : 0,
                format: format,
                shot_type: shot_type
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
