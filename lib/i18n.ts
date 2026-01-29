// Internationalization (i18n) configuration

export type Locale = 'ko' | 'en'

export const translations = {
    ko: {
        // Landing page
        hero: {
            title: '우리 아이의',
            titleHighlight: '꿈을 현실로',
            subtitle: '사진 한 장으로 우주비행사, 의사, 아이돌 등 아이가 꿈꾸는 미래를 AI로 만들어보세요.',
            cta: '무료로 시작하기',
            ctaSubtext: '첫 번째 생성은 회원가입 없이 무료',
        },
        howItWorks: {
            title: '이용 방법',
            step1: '사진 업로드',
            step1Desc: '정면을 바라보는 선명한 사진',
            step2: '직업 선택',
            step2Desc: '10개 이상의 직업 중 선택',
            step3: '다운로드 & 공유',
            step3Desc: '몇 초 안에 완성',
        },
        gallery: {
            title: '다른 부모님들이 만든 작품',
            subtitle: '공유에 동의한 사용자들의 결과물입니다',
        },
        // Create page
        create: {
            chooseCareer: '꿈꾸는 직업 선택',
            whatToBe: '우리 아이는 뭐가 되고 싶을까요?',
            free: '무료',
            premium: '프리미엄',
            comingSoon: '출시 예정',
            continue: '계속하기',
            customize: '포트레이트 설정',
            format: '이미지 형식',
            shotType: '촬영 구도',
            uploadPhoto: '사진 업로드',
            tips: '좋은 결과를 위한 팁:',
            tip1: '정면을 바라보는 선명한 사진',
            tip2: '얼굴에 그림자 없이 밝은 조명',
            tip3: '단순한 배경 권장',
            creating: '포트레이트 생성 중...',
            creatingTime: '약 10-20초 소요됩니다',
            back: '이전',
            usePreviousPhoto: '이전 사진 사용',
            usePreviousPhotoDesc: '방금 업로드한 사진으로 다른 직업 만들기',
            uploadNewPhoto: '새 사진 업로드',
            or: '또는',
            privacyNote: '원본 사진은 24시간 후 자동 삭제되며 학습에 사용되지 않습니다.',
            learnMore: '자세히 보기',
        },
        // Result page
        result: {
            complete: '생성 완료!',
            yourFuture: '미래의',
            description: '우리 아이의 포트레이트가 완성되었습니다',
            download: '이미지 다운로드',
            share: '공유하기',
            shareToGallery: '갤러리에 공유하기',
            shareReward: '공유하면 1장 무료 생성권 획득!',
            shareConfirm: '다른 사용자들이 볼 수 있도록 갤러리에 공개합니다',
            shareSuccess: '공유 완료! 무료 생성권 1장이 추가되었습니다.',
            whatsNext: '다음은?',
            tryAnother: '다른 테마 도전',
            createMore: '더 많은 포트레이트 만들기',
            backHome: '홈으로',
            returnMain: '메인 페이지로 돌아가기',
            loveResult: '결과가 마음에 드셨나요?',
            signUpCta: '회원가입하고 포트레이트를 저장하세요!',
            createAccount: '무료 계정 만들기',
            shareMessage: 'DearMyKids로 만든 우리 아이의 미래 모습을 확인해보세요!',
            linkCopied: '이미지 링크가 복사되었습니다!',
            emptyState: '포트레이트를 만들어 컬렉션을 채워보세요!',
        },
        // Collection
        collection: {
            title: '나의 커리어 컬렉션',
            description: '모든 직업 카드를 모아 특별한 보상을 획득하세요!',
            badge: '커리어 여권',
            collected: '수집 완료',
            emptyState: '포트레이트를 만들어 컬렉션을 채워보세요!',
        },
        // Invite
        invite: {
            title: '친구 초대하고 무료 이용권 받기',
            description: '친구에게 링크를 공유하세요. 친구가 가입하면 두 분 모두에게 1회 무료 이용권을 드립니다!',
            badge: '초대 이벤트',
            shareBtn: '링크 공유하기',
            shareText: '우리 아이의 미래 모습을 확인해보세요! 지금 가입하면 1회 무료!',
        },
        // Themes
        themes: {
            astronaut: '우주비행사',
            doctor: '의사',
            scientist: '과학자',
            kpop_star: 'K-Pop 스타',
            chef: '요리사',
            pilot: '조종사',
            athlete: '운동선수',
            artist: '예술가',
            firefighter: '소방관',
            police: '경찰관',
            teacher: '선생님',
            veterinarian: '수의사',
        },
        // Formats
        formats: {
            square: '정사각형',
            portrait: '세로형',
            landscape: '가로형',
        },
        // Shot types
        shotTypes: {
            portrait: '상반신',
            full_body: '전신',
            headshot: '얼굴 클로즈업',
        },
        // Common
        common: {
            loading: '로딩 중...',
            error: '오류가 발생했습니다',
            noResult: '결과를 찾을 수 없습니다',
            createNew: '새로 만들기',
            unlock: '잠금 해제',
            collected: '수집됨',
        },
    },
    en: {
        // Landing page
        hero: {
            title: "Turn your child into their",
            titleHighlight: 'dream career',
            subtitle: 'Upload a photo and watch AI transform your child into an astronaut, doctor, or any career they dream of.',
            cta: 'Try it Free',
            ctaSubtext: 'No sign-up required for first creation',
        },
        howItWorks: {
            title: 'How it works',
            step1: 'Upload Photo',
            step1Desc: 'Clear front-facing photo',
            step2: 'Choose Career',
            step2Desc: 'Pick from 10+ careers',
            step3: 'Download & Share',
            step3Desc: 'Get it in seconds',
        },
        gallery: {
            title: 'Created by other parents',
            subtitle: 'Shared with permission by our users',
        },
        // Create page
        create: {
            chooseCareer: 'Choose a Dream Career',
            whatToBe: 'What does your child want to be?',
            free: 'FREE',
            premium: 'PREMIUM',
            comingSoon: 'Coming Soon',
            continue: 'Continue',
            customize: 'Customize Your Portrait',
            format: 'Image Format',
            shotType: 'Shot Type',
            uploadPhoto: 'Upload Photo',
            tips: 'Tips for best results:',
            tip1: 'Clear, front-facing photo',
            tip2: 'Good lighting, no shadows on face',
            tip3: 'Neutral background preferred',
            creating: 'Creating your portrait...',
            creatingTime: 'This takes about 10-20 seconds',
            back: 'Back',
            usePreviousPhoto: 'Use Previous Photo',
            usePreviousPhotoDesc: 'Create another career with the same photo',
            uploadNewPhoto: 'Upload New Photo',
            or: 'or',
            privacyNote: 'Photos are deleted after 24h & never used for training.',
            learnMore: 'Learn more',
        },
        // Result page
        result: {
            complete: 'Generation Complete!',
            yourFuture: 'Your Future',
            description: "Here's the portrait we created for your child",
            download: 'Download Image',
            share: 'Share',
            shareToGallery: 'Share to Gallery',
            shareReward: 'Share to get 1 free creation!',
            shareConfirm: 'Your portrait will be visible to other users',
            shareSuccess: 'Shared! You earned 1 free creation.',
            whatsNext: "What's Next?",
            tryAnother: 'Try Another Theme',
            createMore: 'Create more portraits',
            backHome: 'Back to Home',
            returnMain: 'Return to main page',
            loveResult: 'Love the result?',
            signUpCta: 'Sign up to save your portraits!',
            createAccount: 'Create Free Account',
            shareMessage: 'Check out this future portrait created with DearMyKids!',
            linkCopied: 'Image link copied!',
            emptyState: 'Start creating portraits to fill your collection!',
        },
        // Collection
        collection: {
            title: 'My Career Collection',
            description: 'Collect all career cards to unlock a special reward!',
            badge: 'Career Passport',
            collected: 'Collected',
            emptyState: 'Start creating portraits to fill your collection!',
        },
        // Invite
        invite: {
            title: 'Invite Friends & Get Free Credits',
            description: 'Share your link. When a friend signs up, you BOTH get 1 free credit!',
            badge: 'Referral Program',
            shareBtn: 'Share Link',
            shareText: 'Check out DearMyKids! Get 1 free credit when you sign up.',
        },
        // Themes
        themes: {
            astronaut: 'Astronaut',
            doctor: 'Doctor',
            scientist: 'Scientist',
            kpop_star: 'K-Pop Star',
            chef: 'Chef',
            pilot: 'Pilot',
            athlete: 'Athlete',
            artist: 'Artist',
            firefighter: 'Firefighter',
            police: 'Police Officer',
            teacher: 'Teacher',
            veterinarian: 'Veterinarian',
        },
        // Formats
        formats: {
            square: 'Square',
            portrait: 'Portrait',
            landscape: 'Landscape',
        },
        // Shot types
        shotTypes: {
            portrait: 'Upper Body',
            full_body: 'Full Body',
            headshot: 'Headshot',
        },
        // Common
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            noResult: 'No result found',
            createNew: 'Create New',
            unlock: 'Unlock',
            collected: 'Collected',
        },
    },
}

export function getTranslations(locale: Locale) {
    return translations[locale]
}

export function detectLocale(): Locale {
    if (typeof window === 'undefined') return 'en'

    // Check localStorage first
    const saved = localStorage.getItem('locale')
    if (saved === 'ko' || saved === 'en') return saved

    // Check browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('ko')) return 'ko'

    return 'en'
}
