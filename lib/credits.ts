// Credit packages and pricing configuration

export const CREDIT_PACKAGES = {
    trial: {
        id: 'trial',
        name: { ko: '체험팩', en: 'Trial Pack' },
        credits: 3,
        price: { krw: 2900, usd: 2.49 },
        description: { ko: '가볍게 체험해보세요', en: 'Try it out' },
        popular: false,
    },
    starter: {
        id: 'starter',
        name: { ko: '스타터팩', en: 'Starter Pack' },
        credits: 10,
        price: { krw: 7900, usd: 5.99 },
        description: { ko: '다양한 직업 체험', en: 'Explore various careers' },
        popular: true,
        savings: { ko: '19% 할인', en: '19% off' },
    },
    family: {
        id: 'family',
        name: { ko: '패밀리팩', en: 'Family Pack' },
        credits: 30,
        price: { krw: 19900, usd: 14.99 },
        description: { ko: '온 가족이 함께', en: 'For the whole family' },
        popular: false,
        savings: { ko: '33% 할인', en: '33% off' },
    },
} as const

export type PackageId = keyof typeof CREDIT_PACKAGES

// Free tier settings
export const FREE_TIER = {
    dailyLimit: 1,           // 1 free generation per day
    freeThemes: ['astronaut', 'doctor', 'scientist'],  // Free themes only
    imageRetention: 2,       // 2 hours
}

// Paid tier settings
export const PAID_TIER = {
    allThemes: true,
    allFormats: true,
    allShotTypes: true,
    imageRetention: 48,      // 48 hours
}

// Calculate per-image cost for display
export function getPerImagePrice(packageId: PackageId, locale: 'ko' | 'en'): string {
    const pkg = CREDIT_PACKAGES[packageId]
    const price = locale === 'ko' ? pkg.price.krw : pkg.price.usd
    const perImage = Math.round(price / pkg.credits)

    if (locale === 'ko') {
        return `₩${perImage.toLocaleString()}/장`
    }
    return `$${(perImage / 100).toFixed(2)}/image`
}

// Format price for display
export function formatPrice(amount: number, locale: 'ko' | 'en'): string {
    if (locale === 'ko') {
        return `₩${amount.toLocaleString()}`
    }
    return `$${amount.toFixed(2)}`
}
