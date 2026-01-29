import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold mb-4">환불정책</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 1월 29일</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <p className="mb-4">
                JobsClass는 공정한 거래와 소비자 보호를 위해 명확한 환불 정책을 운영하고 있습니다. 
                서비스 타입별로 환불 기준이 다를 수 있으니 구매 전 반드시 확인해 주시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. 기본 환불 원칙</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>전자상거래법 및 관련 법령에 따라 소비자 보호를 최우선으로 합니다.</li>
                <li>환불 요청은 구매 후 7일 이내에 가능합니다(단, 서비스 타입별 예외 적용).</li>
                <li>환불 수수료는 결제 금액의 3%가 부과됩니다(PG사 수수료).</li>
                <li>환불 처리 기간은 영업일 기준 3~5일입니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. 서비스 타입별 환불 정책</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">가. 온라인 강의 (VOD)</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 수강 시작 전 (영상 시청 0%)</li>
                    <li><strong>부분 환불:</strong> 전체 강의의 30% 미만 시청 시 → 시청한 비율에 따라 차감 후 환불</li>
                    <li><strong>환불 불가:</strong> 전체 강의의 30% 이상 시청한 경우</li>
                  </ul>
                  <p className="mt-3 text-sm bg-blue-50 p-3 rounded">
                    <strong>예시:</strong> 100,000원 강의를 20% 시청 후 환불 요청 시 → 80,000원 환불 (시청한 20% 차감)
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">나. 멘토링 (1:1 코칭)</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 첫 세션 24시간 전까지 취소 시</li>
                    <li><strong>50% 환불:</strong> 첫 세션 24시간 이내 ~ 세션 시작 전 취소 시</li>
                    <li><strong>환불 불가:</strong> 첫 세션 진행 후 (단, 파트너의 귀책사유 시 전액 환불)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">다. 그룹 코칭</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 첫 세션 7일 전까지 취소 시</li>
                    <li><strong>50% 환불:</strong> 첫 세션 7일 이내 ~ 세션 시작 전 취소 시</li>
                    <li><strong>환불 불가:</strong> 첫 세션 진행 후</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">라. 디지털 상품 (전자책, 템플릿)</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 다운로드 전 구매 취소 시 (구매 후 7일 이내)</li>
                    <li><strong>환불 불가:</strong> 다운로드 완료 후 (디지털 콘텐츠 특성상)</li>
                  </ul>
                  <p className="mt-3 text-sm bg-orange-50 p-3 rounded">
                    <strong>⚠️ 중요:</strong> 디지털 상품은 다운로드 즉시 환불이 불가하므로 신중히 구매해 주세요.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">마. 프로젝트 대행</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 작업 시작 전 (계약 후 24시간 이내)</li>
                    <li><strong>부분 환불:</strong> 진행률에 따라 협의 (작업 시작 후 ~ 50% 진행 전)</li>
                    <li><strong>환불 불가:</strong> 프로젝트 50% 이상 진행 또는 최종 납품 후</li>
                  </ul>
                </div>

                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">바. 커뮤니티 & 네트워킹 (오프라인 모임)</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>전액 환불:</strong> 행사 7일 전까지 취소 시</li>
                    <li><strong>50% 환불:</strong> 행사 3~7일 전 취소 시</li>
                    <li><strong>환불 불가:</strong> 행사 3일 전 이후 또는 No-Show(불참)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. 환불 불가 사유</h2>
              <p className="mb-4">다음의 경우 환불이 제한될 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>이용자의 단순 변심 (서비스 특성상 환불 기간 경과 후)</li>
                <li>이용자의 귀책사유로 서비스 이용이 어려운 경우</li>
                <li>무단 복제, 재배포 등 저작권 침해 행위가 확인된 경우</li>
                <li>파트너와 협의 없이 일방적으로 서비스 취소를 요구하는 경우</li>
                <li>서비스 이용 후 결과물에 대한 주관적 불만족</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. 전액 환불 보장 사유</h2>
              <p className="mb-4">다음의 경우 100% 전액 환불이 보장됩니다:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>파트너가 서비스 제공을 거부하거나 일방적으로 취소한 경우</li>
                <li>서비스 설명과 실제 내용이 현저히 다른 경우</li>
                <li>파트너의 귀책사유로 서비스 제공이 불가능한 경우</li>
                <li>기술적 오류로 서비스 이용이 불가능한 경우</li>
                <li>플랫폼의 귀책사유로 거래가 성사되지 않은 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. 환불 신청 방법</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>마이페이지 접속</strong>
                  <p className="ml-6 text-gray-600">로그인 후 '구매 내역' 메뉴로 이동</p>
                </li>
                <li>
                  <strong>환불 요청 버튼 클릭</strong>
                  <p className="ml-6 text-gray-600">환불 사유 선택 및 상세 사유 작성</p>
                </li>
                <li>
                  <strong>파트너 및 플랫폼 검토</strong>
                  <p className="ml-6 text-gray-600">영업일 기준 1~2일 소요</p>
                </li>
                <li>
                  <strong>환불 처리 완료</strong>
                  <p className="ml-6 text-gray-600">승인 시 결제 수단에 따라 3~5일 내 환불</p>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. 환불 처리 기간</h2>
              <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">결제 수단</th>
                    <th className="border border-gray-300 p-3 text-left">환불 처리 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">신용카드</td>
                    <td className="border border-gray-300 p-3">승인 후 3~5 영업일 (카드사에 따라 다름)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">계좌이체</td>
                    <td className="border border-gray-300 p-3">승인 후 1~3 영업일</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">간편결제</td>
                    <td className="border border-gray-300 p-3">승인 후 3~5 영업일</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. 분쟁 해결</h2>
              <p className="mb-4">
                환불 관련 분쟁이 발생한 경우, 먼저 파트너와 클라이언트 간 협의를 권장합니다. 
                협의가 이루어지지 않을 경우 플랫폼이 중재에 나설 수 있으며, 최종적으로는 한국소비자원 또는 관할 법원의 판단을 따릅니다.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold mb-2">문의 및 도움</p>
                <ul className="space-y-1 text-sm">
                  <li>이메일: support@jobsclass.com</li>
                  <li>운영시간: 평일 10:00-18:00</li>
                  <li>한국소비자원: 국번없이 1372</li>
                </ul>
              </div>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">부칙</h2>
              <p>본 환불정책은 2025년 1월 29일부터 시행됩니다.</p>
              <p className="mt-2 text-sm text-gray-600">
                * 본 정책은 관련 법령 및 회사 정책 변경에 따라 수정될 수 있으며, 변경 시 최소 7일 전 공지합니다.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
            이용약관 보기 →
          </Link>
          <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
            개인정보처리방침 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
