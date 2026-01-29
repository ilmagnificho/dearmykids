import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint cleans up expired images
// Called by Vercel Cron (every hour) or manually with secret key

export async function POST(request: Request) {
    try {
        // Verify authorization - either Vercel Cron or manual call with secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET
        const cleanupKey = process.env.CLEANUP_SECRET_KEY

        // Check for Vercel Cron secret (set automatically by Vercel)
        const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`
        // Check for manual call with our secret
        const isManualCall = cleanupKey && authHeader === `Bearer ${cleanupKey}`

        if (!isVercelCron && !isManualCall) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use service role key for admin operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Find expired images
        const now = new Date().toISOString()
        const { data: expiredImages, error: fetchError } = await supabase
            .from('generated_images')
            .select('id, storage_path, image_url')
            .lt('expires_at', now)
            .not('expires_at', 'is', null)

        if (fetchError) {
            console.error('Error fetching expired images:', fetchError)
            throw fetchError
        }

        if (!expiredImages || expiredImages.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No expired images to clean up',
                deleted: 0
            })
        }

        console.log(`Found ${expiredImages.length} expired images to delete`)

        // Delete from storage
        const storagePaths = expiredImages
            .filter(img => img.storage_path)
            .map(img => img.storage_path)

        if (storagePaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('uploads')
                .remove(storagePaths)

            if (storageError) {
                console.error('Error deleting from storage:', storageError)
                // Continue anyway to delete DB records
            }
        }

        // Delete from database
        const imageIds = expiredImages.map(img => img.id)
        const { error: deleteError } = await supabase
            .from('generated_images')
            .delete()
            .in('id', imageIds)

        if (deleteError) {
            console.error('Error deleting from database:', deleteError)
            throw deleteError
        }

        console.log(`Successfully deleted ${expiredImages.length} expired images`)

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${expiredImages.length} expired images`,
            deleted: expiredImages.length
        })

    } catch (error: any) {
        console.error('Cleanup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Also support GET for easy testing (but still requires auth)
export async function GET(request: Request) {
    return POST(request)
}
