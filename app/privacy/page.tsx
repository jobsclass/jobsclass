import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold mb-4">개인정보처리방침</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 1월 29일</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <p className="mb-4">
                JobsClass(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 
                관련 법령을 준수하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. 수집하는 개인정보 항목</h2>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">가. 회원가입 시</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>필수: 이메일, 비밀번호, 이름, 사용자 유형(파트너/클라이언트)</li>
                <li>선택: 프로필 사진, 자기소개</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">나. 파트너 인증 시</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>필수: 사업자등록번호, 사업자등록증, 연락처</li>
                <li>선택: 포트폴리오, 경력사항</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">다. 서비스 이용 및 결제 시</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>결제 정보: 결제 수단, 결제 금액, 결제 일시</li>
                <li>서비스 이용 기록: 접속 로그, 쿠키, 접속 IP</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. 개인정보의 수집 및 이용 목적</h2>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">가. 회원 관리</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>회원 식별, 본인 확인, 부정 이용 방지</li>
                <li>고지사항 전달, 고객 문의 응대</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">나. 서비스 제공</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>서비스 거래 중개, 결제 및 정산</li>
                <li>파트너-클라이언트 간 매칭 및 소통 지원</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">다. 마케팅 및 광고 활용</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>신규 서비스 개발 및 맞춤형 서비스 제공</li>
                <li>이벤트 및 프로모션 안내(동의 시에만)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>회원 탈퇴 시까지: 회원정보</li>
                <li>거래 완료 후 5년: 거래 기록, 결제 정보(전자상거래법)</li>
                <li>1년: 접속 로그, 쿠키</li>
              </ul>
              <p className="mt-4">
                단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. 개인정보의 제3자 제공</h2>
              <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우는 예외로 합니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                <li>결제 대행, 배송 등 서비스 제공을 위해 필요한 최소한의 정보를 제휴사에 제공하는 경우</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-800">결제 대행 업체</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>제공받는 자: Toss Payments</li>
                <li>제공 항목: 결제 정보, 거래 금액</li>
                <li>제공 목적: 안전한 결제 처리</li>
                <li>보유 기간: 거래 완료 후 5년</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. 개인정보 처리 위탁</h2>
              <p>회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다:</p>
              <table className="w-full mt-4 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">수탁업체</th>
                    <th className="border border-gray-300 p-3 text-left">위탁업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Supabase</td>
                    <td className="border border-gray-300 p-3">데이터베이스 관리 및 호스팅</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Vercel</td>
                    <td className="border border-gray-300 p-3">웹사이트 호스팅</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Toss Payments</td>
                    <td className="border border-gray-300 p-3">결제 처리</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. 이용자의 권리와 행사 방법</h2>
              <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정 요구</li>
                <li>개인정보 삭제 요구</li>
                <li>개인정보 처리 정지 요구</li>
              </ul>
              <p className="mt-4">
                권리 행사는 웹사이트 내 '마이페이지' 또는 이메일(support@jobsclass.com)을 통해 가능합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2"><strong>개인정보 보호책임자</strong></p>
                <ul className="space-y-1">
                  <li>이름: JobsClass 관리자</li>
                  <li>이메일: support@jobsclass.com</li>
                  <li>연락처: 준비중</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">8. 개인정보 처리방침 변경</h2>
              <p>
                이 개인정보처리방침은 2025년 1월 29일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">부칙</h2>
              <p>본 방침은 2025년 1월 29일부터 시행됩니다.</p>
            </section>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
            이용약관 보기 →
          </Link>
          <Link href="/refund" className="text-primary-600 hover:text-primary-700 font-medium">
            환불정책 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
