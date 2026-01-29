import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Fetch public gallery images
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('generated_images')
            .select('id, image_url, theme, created_at')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) {
            console.error('Gallery fetch error:', error)
            return NextResponse.json({ images: [] })
        }

        return NextResponse.json({ images: data || [] })
    } catch (error) {
        console.error('Gallery error:', error)
        return NextResponse.json({ images: [] })
    }
}

// POST - Share image to public gallery
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { imageId } = await request.json()

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
        }

        // Update image to public
        const { error: updateError } = await supabase
            .from('generated_images')
            .update({ is_public: true })
            .eq('id', imageId)

        if (updateError) {
            throw updateError
        }

        // If logged in user, give them a free credit
        if (user) {
            // Increment free_credits in user profile (if table exists)
            // For MVP, we'll track this simply
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('free_credits')
                .eq('user_id', user.id)
                .single()

            if (profile) {
                await supabase
                    .from('user_profiles')
                    .update({ free_credits: (profile.free_credits || 0) + 1 })
                    .eq('user_id', user.id)
            } else {
                // Create profile with 1 credit
                await supabase
                    .from('user_profiles')
                    .insert({ user_id: user.id, free_credits: 1 })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Image shared to gallery',
            creditEarned: !!user
        })

    } catch (error: any) {
        console.error('Share error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
