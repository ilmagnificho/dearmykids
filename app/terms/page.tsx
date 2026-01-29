'use client'

import { useLocale } from '@/contexts/LocaleContext'

export default function TermsPage() {
    const { locale } = useLocale()

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">
                {locale === 'ko' ? '이용약관' : 'Terms of Service'}
            </h1>

            <div className="prose prose-slate max-w-none">
                {locale === 'ko' ? (
                    <>
                        <p className="text-sm text-gray-500 mb-8">최종 수정일: 2026년 1월 30일</p>

                        <h3>제1조 (목적)</h3>
                        <p>본 약관은 DearMyKids(이하 "회사")가 제공하는 AI 이미지 생성 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

                        <h3>제2조 (회원가입)</h3>
                        <p>이용자는 이메일 주소 또는 소셜 로그인을 통해 회원가입을 할 수 있으며, 본 약관에 동의함으로써 서비스 이용 계약이 체결됩니다.</p>

                        <h3>제3조 (서비스 이용 및 크레딧)</h3>
                        <p>1. 서비스는 유료 크레딧을 구매하여 이용할 수 있습니다.<br />
                            2. 구매한 크레딧은 유효기간이 없으며, 언제든지 사용할 수 있습니다.<br />
                            3. 생성된 이미지는 48시간 동안만 서버에 보관되므로, 이용자는 이를 즉시 다운로드하여야 합니다.</p>

                        <h3>제4조 (환불 정책)</h3>
                        <p>1. 미사용 크레딧은 구매일로부터 7일 이내에 환불을 요청할 수 있습니다.<br />
                            2. 포트레이트 생성에 이미 사용된 크레딧은 서비스 특성상 환불이 불가능합니다.</p>

                        <h3>제5조 (저작권 및 초상권)</h3>
                        <p>1. 생성된 이미지에 대한 권리는 이용자에게 귀속됩니다.<br />
                            2. 이용자는 타인의 초상권을 침해하는 사진을 업로드해서는 안 되며, 이에 따른 법적 책임은 이용자에게 있습니다.<br />
                            3. 회사는 이용자가 업로드한 원본 사진을 24시간 이내에 영구 삭제하며, AI 학습에 절대 사용하지 않습니다.</p>

                        <h3>제6조 (면책 조항)</h3>
                        <p>회사는 AI가 생성한 이미지의 품질이나 정확성을 보장하지 않으며, 이용자가 서비스를 통해 얻은 결과물의 사용으로 인한 결과에 대해 책임을 지지 않습니다.</p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-8">Last Updated: January 30, 2026</p>

                        <h3>1. Purpose</h3>
                        <p>These Terms of Service govern the use of the AI image generation service provided by DearMyKids (the "Company") and define the rights and obligations between the Company and the User.</p>

                        <h3>2. Account Registration</h3>
                        <p>Users may sign up using an email address or social login. By signing up, you agree to comply with these terms.</p>

                        <h3>3. Service Usage & Credits</h3>
                        <p>1. Services are accessed by purchasing credits.<br />
                            2. Purchased credits do not expire and can be used at any time.<br />
                            3. Generated images are stored on our servers for 48 hours only. Users must download them immediately.</p>

                        <h3>4. Refund Policy</h3>
                        <p>1. Refunds for unused credits are available within 7 days of purchase.<br />
                            2. Used credits cannot be refunded due to the irreversible nature of AI generation costs.</p>

                        <h3>5. Copyright & Privacy</h3>
                        <p>1. You own the rights to the images you generate.<br />
                            2. You must not upload photos that infringe on others' privacy or rights. You are solely responsible for such actions.<br />
                            3. We delete original uploaded photos within 24 hours and NEVER use them for AI training.</p>

                        <h3>6. Disclaimer</h3>
                        <p>The Company does not guarantee the quality or accuracy of AI-generated images and is not liable for any consequences arising from the use of the service results.</p>
                    </>
                )}
            </div>
        </div>
    )
}
