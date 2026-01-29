import { createClient } from '@/utils/supabase/client' // IMPORTANT: client for data, but server-side fetching happens in generateMetadata
import { Metadata, ResolvingMetadata } from 'next'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Share2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { createServerClient } from '@supabase/ssr' // For server-side fetching
import { cookies } from 'next/headers'

// Helper to get Supabase client on server
async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
}

type Props = {
    params: { id: string }
}

// 1. Dynamic Metadata Generation for SEO
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id
    const supabase = await getSupabase()

    // Fetch image details
    const { data: image } = await supabase
        .from('generated_images')
        .select('theme, image_url')
        .eq('id', id)
        .eq('is_public', true) // Only show public images
        .single()

    if (!image) {
        return {
            title: 'DearMyKids - Create AI Child Portraits',
        }
    }

    const title = `Cute ${image.theme} Portrait | DearMyKids`
    const description = `Check out this amazing AI-generated ${image.theme} portrait! Create your own child's future look with DearMyKids.`

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [image.image_url], // Vital for social sharing
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image.image_url],
        },
    }
}

// 2. The Page Component
export default async function GalleryItemPage({ params }: Props) {
    const supabase = await getSupabase()
    const { data: image } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', params.id)
        .eq('is_public', true)
        .single()

    if (!image) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Image not found</h1>
                <p className="text-gray-500 mb-8">This image might be private or deleted.</p>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link href="/" className="text-gray-500 hover:text-amber-600 flex items-center gap-2">
                        ← Back to Gallery
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-1/2 relative aspect-[4/5] md:aspect-auto bg-slate-200">
                        <Image
                            src={image.image_url}
                            alt={`${image.theme} Portrait`}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 mb-6">
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-4 capitalize">
                            {image.theme || 'Future'} Portrait
                        </h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Do you want to see your child as a <strong>{image.theme}</strong> too?
                            Turn your child's photo into this magical look in seconds!
                        </p>

                        <div className="space-y-4">
                            <Link href={`/create?theme=${image.theme}`} className="block">
                                <Button size="lg" className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20">
                                    <Wand2 className="w-5 h-5 mr-2" />
                                    Try This Style
                                </Button>
                            </Link>

                            <p className="text-xs text-gray-400 text-center">
                                No sign-up required for first try!
                            </p>
                        </div>
                    </div>
                </div>

                {/* More Examples (Static for now, could be dynamic related) */}
                <div className="mt-20 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-8">Discover More Dreams</h3>
                    <div className="flex justify-center gap-4">
                        <Link href="/">
                            <Button variant="outline">View All</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Wand2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 2 2 2-2 2-2-2 2-2Z" /><path d="m5 2 2 2-2 2-2-2 2-2Z" /><path d="m15 11 2 2-2 2-2-2 2-2Z" /><path d="m6 18 9.3-9.3c.7-.7 1.8-.7 2.5 0l.7.7c.7.7.7 1.8 0 2.5L9.2 21.2A2.86 2.86 0 0 1 7.2 22H5a1 1 0 0 1-1-1v-2.2c0-.7.3-1.5.8-2Z" /><path d="m2 22 3-3" /><path d="m22 2-3 3" /></svg>
    )
}
