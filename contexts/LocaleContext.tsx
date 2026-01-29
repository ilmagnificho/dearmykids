'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, getTranslations, translations } from '@/lib/i18n'

type TranslationType = typeof translations.en

interface LocaleContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: TranslationType
}

// Default context value for SSR
const defaultContext: LocaleContextType = {
    locale: 'en',
    setLocale: () => {},
    t: translations.en
}

const LocaleContext = createContext<LocaleContextType>(defaultContext)

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Detect locale on client side
        const stored = localStorage.getItem('locale') as Locale | null
        if (stored && (stored === 'ko' || stored === 'en')) {
            setLocaleState(stored)
        } else {
            // Auto-detect from browser
            const browserLang = navigator.language.toLowerCase()
            const detected: Locale = browserLang.startsWith('ko') ? 'ko' : 'en'
            setLocaleState(detected)
        }
        setMounted(true)
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', newLocale)
        }
    }

    const t = getTranslations(locale)

    // Always provide context, use default 'en' until mounted
    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    return useContext(LocaleContext)
}
