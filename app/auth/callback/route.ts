import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check for referral code
            const cookieStore = await cookies()
            const referralCode = cookieStore.get('dearmykids_referral')?.value

            if (referralCode) {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    // Check if already referred to avoid double counting
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('referred_by, credits')
                        .eq('user_id', user.id)
                        .single()

                    if (profile && !profile.referred_by) {
                        // Find referrer
                        const { data: referrer } = await supabase
                            .from('user_profiles')
                            .select('user_id')
                            .eq('referral_code', referralCode)
                            .single()

                        if (referrer) {
                            // Link user to referrer and Give Bonus Credits (1 each)
                            await supabase
                                .from('user_profiles')
                                .update({
                                    referred_by: referrer.user_id,
                                    credits: (profile.credits || 0) + 1
                                })
                                .eq('user_id', user.id)

                            // Give referrer credit
                            await supabase.rpc('increment_credits', {
                                user_uuid: referrer.user_id,
                                amount: 1
                            })
                        }
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
