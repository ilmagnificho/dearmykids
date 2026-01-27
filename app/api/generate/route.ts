import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const { storage_path, theme } = json

        if (!storage_path || !theme) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(storage_path)

        // 2. Create an entry in 'generated_images' table with status 'processing'
        // Note: We might want to add a status column to generated_images or valid check
        // For MVP, we insert a placeholder record
        const { data: imageRecord, error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: user.id,
                image_url: 'pending', // Placeholder
                prompt: `Theme: ${theme}`,
                theme: theme,
                storage_path: storage_path
            })
            .select()
            .single()

        if (dbError) throw dbError

        // 3. Call Replicate API (Mocked or Real)
        // In a real app, process.env.REPLICATE_API_TOKEN would be used
        console.log('Calling AI Service with:', publicUrl, theme)

        // MOCK RESPONSE for now since we don't have API keys active
        // We simulate a delay or assume webhook handles it. 
        // If using Replicate, we would POST to https://api.replicate.com/v1/predictions

        return NextResponse.json({
            success: true,
            message: 'Generation processing started',
            imageId: imageRecord.id
        })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
