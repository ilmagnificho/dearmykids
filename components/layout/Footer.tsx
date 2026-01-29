'use client'

import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Mail, Instagram, Twitter } from 'lucide-react'

export function Footer() {
    const { locale } = useLocale()
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">DearMyKids</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            {locale === 'ko'
                                ? '우리 아이의 꿈을 현실로, DearMyKids. AI 기술로 아이들의 무한한 상상력을 시각화합니다.'
                                : 'Visualizing children\'s dreams with AI. We empower kids to see their infinite potential.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
                            <li><Link href="/pricing" className="hover:text-amber-500 transition-colors">Pricing</Link></li>
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">About</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a href="mailto:info@tetracorp.co.kr" className="hover:text-amber-500 transition-colors">
                                    info@tetracorp.co.kr
                                </a>
                            </li>
                            {/* 
                            <li className="flex gap-4 mt-4">
                                <Link href="#" className="hover:text-amber-500"><Instagram className="w-5 h-5" /></Link>
                                <Link href="#" className="hover:text-amber-500"><Twitter className="w-5 h-5" /></Link>
                            </li> 
                            */}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>© {currentYear} DearMyKids. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
