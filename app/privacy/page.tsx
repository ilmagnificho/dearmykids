'use client'

import { useLocale } from '@/contexts/LocaleContext'

export default function PrivacyPage() {
    const { locale } = useLocale()

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">
                {locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
            </h1>

            <div className="prose prose-slate max-w-none">
                {locale === 'ko' ? (
                    <>
                        <p className="text-sm text-gray-500 mb-8">최종 수정일: 2026년 1월 30일</p>

                        <h3>1. 수집하는 개인정보 항목</h3>
                        <p>회사는 서비스 제공을 위해 이메일 주소, 프로필 이름, 프로필 사진, 그리고 사용자가 업로드하는 이미지를 수집합니다.</p>

                        <h3>2. 개인정보의 수집 및 이용목적</h3>
                        <p>수집된 정보는 서비스 제공, 회원 관리, 고객 문의 처리 및 서비스 개선을 위해서만 사용됩니다.</p>

                        <h3>3. 이미지 데이터의 처리</h3>
                        <p><strong>가장 중요한 원칙:</strong> 사용자가 업로드한 아이의 원본 사진은 오직 포트레이트 생성 목적으로만 사용되며, <strong>생성 완료 후 24시간 이내에 자동 삭제</strong>됩니다. 회사는 이 데이터를 별도로 저장하거나 AI 학습 데이터로 절대 활용하지 않습니다.</p>

                        <h3>4. 개인정보의 보유 및 이용기간</h3>
                        <p>- 회원 정보: 회원 탈퇴 시까지<br />
                            - 생성된 포트레이트: 생성 후 48시간 (사용자 편의를 위한 임시 보관)</p>

                        <h3>5. 제3자 제공</h3>
                        <p>회사는 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 법령에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>

                        <h3>6. 정보주체와 법정대리인의 권리</h3>
                        <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보 이용 동의를 철회할 수 있습니다.</p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-8">Last Updated: January 30, 2026</p>

                        <h3>1. Information We Collect</h3>
                        <p>We collect email addresses, profile names, profile pictures, and images uploaded by users for service provision.</p>

                        <h3>2. Purpose of Collection</h3>
                        <p>Collected data is used solely for service provision, user management, customer support, and service improvement.</p>

                        <h3>3. Processing of Image Data</h3>
                        <p><strong>Critical Policy:</strong> Original photos uploaded by users are processed ONLY for generating portraits and are <strong>automatically permanently deleted within 24 hours</strong>. We do NOT store this data elsewhere or use it for AI training.</p>

                        <h3>4. Retention Period</h3>
                        <p>- Account Info: Until account deletion<br />
                            - Generated Portraits: 48 hours (temporary storage for download)</p>

                        <h3>5. Third-Party Disclosure</h3>
                        <p>We do not provide your personal information to third parties without your consent, except where required by law.</p>

                        <h3>6. User Rights</h3>
                        <p>Users may access or modify their personal information at any time and withdraw consent by deleting their account.</p>
                    </>
                )}
            </div>
        </div>
    )
}
