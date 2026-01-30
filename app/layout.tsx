import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LocaleProvider } from '@/contexts/LocaleContext'

const GA_ID = 'G-P22MPFLKPG'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

const siteUrl = 'https://www.dearmykids.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DearMyKids - 우리 아이의 꿈을 현실로 | AI 미래 직업 포트레이트',
    template: '%s | DearMyKids',
  },
  description: '사진 한 장으로 우리 아이를 우주비행사, 의사, K-Pop 스타로 변신! AI가 만드는 미래 직업 포트레이트 서비스.',
  keywords: ['AI 포트레이트', '아이 사진', '미래 직업', '우주비행사', '의사', 'K-Pop', '어린이 선물', 'AI 이미지 생성'],
  authors: [{ name: 'DearMyKids' }],
  creator: 'DearMyKids',
  publisher: 'DearMyKids',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'DearMyKids',
    title: 'DearMyKids - 우리 아이의 꿈을 현실로',
    description: '사진 한 장으로 우리 아이를 우주비행사, 의사, K-Pop 스타로 변신! AI가 만드는 미래 직업 포트레이트.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DearMyKids - AI 미래 직업 포트레이트',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DearMyKids - 우리 아이의 꿈을 현실로',
    description: '사진 한 장으로 우리 아이를 우주비행사, 의사, K-Pop 스타로 변신!',
    images: ['/og-image.png'],
  },
  verification: {
    // google: 'your-google-verification-code',
    // naver: 'your-naver-verification-code',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'ko-KR': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#f59e0b" />
        {/* Google Analytics - Exclude internal traffic if flag is set */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            // Check if internal user flag is set
            const isInternal = typeof window !== 'undefined' && localStorage.getItem('exclude_ga') === 'true';
            
            if (!isInternal) {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            } else {
              console.log('GA4 blocked for internal user');
            }
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-stone-50 text-stone-900`}>
        <LocaleProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  )
}
