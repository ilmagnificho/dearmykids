import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { LocaleProvider } from '@/contexts/LocaleContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'DearMyKids - A gift for your child\'s future',
  description: 'Transform your child\'s photos into hyper-realistic future career portraits.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-stone-50 text-stone-900`}>
        <LocaleProvider>
          <Navbar />
          <main>{children}</main>
        </LocaleProvider>
      </body>
    </html>
  )
}
