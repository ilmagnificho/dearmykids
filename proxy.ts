import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Default response to fall back to if anything goes wrong
    const supabaseResponse = NextResponse.next()

    try {
        // Check for env vars safely
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // If keys are completely missing, we just skip auth logic to avoid crashing
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase env vars missing in middleware. Skipping auth check.')
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            supabaseResponse.cookies.set(name, value, options)
                        })
                    },
                },
            }
        )

        // IMPORTANT: Avoid writing any logic between createServerClient and
        // supabase.auth.getUser().
        await supabase.auth.getUser()

        return supabaseResponse
    } catch (error) {
        // CRITICAL: Ensure the site never crashes due to middleware errors
        console.error('Middleware Error:', error)
        return supabaseResponse
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
