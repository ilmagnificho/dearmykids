import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

// Sample showcase images - replace with actual generated examples
const SHOWCASE_EXAMPLES = [
    { theme: 'Astronaut', emoji: '🚀' },
    { theme: 'Doctor', emoji: '👨‍⚕️' },
    { theme: 'K-Pop Star', emoji: '🎤' },
    { theme: 'Scientist', emoji: '🔬' },
    { theme: 'Chef', emoji: '👨‍🍳' },
    { theme: 'Pilot', emoji: '✈️' },
]

export default function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section - Clean & Focused */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 lg:py-24">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                        Turn your child into their
                        <span className="text-amber-600 block mt-2">dream career</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                        Upload a photo and watch AI transform your child into an astronaut, doctor, or any career they dream of.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/create">
                            <Button size="lg" className="h-14 px-10 text-lg bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                                Try it Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">No sign-up required for first creation</p>
                </div>

                {/* Career Preview Grid */}
                <div className="mt-16 w-full max-w-4xl">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                        {SHOWCASE_EXAMPLES.map((item) => (
                            <div
                                key={item.theme}
                                className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-3 hover:scale-105 transition-transform cursor-pointer"
                            >
                                <span className="text-3xl sm:text-4xl mb-2">{item.emoji}</span>
                                <span className="text-xs sm:text-sm font-medium text-slate-700 text-center">{item.theme}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">+ more careers coming soon</p>
                </div>
            </section>

            {/* Simple How It Works */}
            <section className="py-16 bg-slate-50 border-t">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                            <h3 className="font-semibold mb-2">Upload Photo</h3>
                            <p className="text-sm text-gray-500">Clear front-facing photo works best</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                            <h3 className="font-semibold mb-2">Choose Career</h3>
                            <p className="text-sm text-gray-500">Pick from 10+ dream careers</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                            <h3 className="font-semibold mb-2">Download & Share</h3>
                            <p className="text-sm text-gray-500">Get your portrait in seconds</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
