import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 py-20 lg:py-32">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-amber-100 text-amber-900 hover:bg-amber-200">
            <Sparkles className="w-3 h-3 mr-1" />
            MVP Launch
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900">
            See your child's <br className="hidden sm:inline" />
            <span className="text-amber-600">future today.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            A premium AI service that serves as a gift for your child's dreams.
            Turn today's photo into tomorrow's Astronaut, Doctor, or K-Pop Star.
          </p>
        </div>

        <div className="flex flex-col gap-4 min-[400px]:flex-row">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white">
              Create Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#examples">
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              View Gallery
            </Button>
          </Link>
        </div>

        {/* Carousel Placeholder */}
        <div className="mt-12 w-full max-w-5xl aspect-video rounded-xl bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            {/* In a real app, this would be a refined specific Carousel component */}
            <span className="text-lg font-medium">✨ High-Quality Future Career Portraits Carousel ✨</span>
          </div>
          {/* Simulation of content */}
          <div className="grid grid-cols-3 gap-4 p-4 w-full h-full opacity-30">
            <div className="bg-slate-300 rounded-lg animate-pulse delay-75"></div>
            <div className="bg-slate-300 rounded-lg animate-pulse delay-150"></div>
            <div className="bg-slate-300 rounded-lg animate-pulse delay-300"></div>
          </div>
        </div>
      </section>

      {/* Feature Section (Simple) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-2xl">🚀</div>
            <h3 className="font-serif text-xl font-bold mb-2">Dream Big</h3>
            <p className="text-gray-600">Explore limitless career possibilities from Astronaut to President.</p>
          </div>
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-2xl">✨</div>
            <h3 className="font-serif text-xl font-bold mb-2">Hyper Realistic</h3>
            <p className="text-gray-600">Powered by advanced Flux.1 AI for studio-quality portraits.</p>
          </div>
          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-2xl">🎁</div>
            <h3 className="font-serif text-xl font-bold mb-2">The Perfect Gift</h3>
            <p className="text-gray-600">Create a timeless keepsake for your child and family.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
