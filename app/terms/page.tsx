import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold mb-4">이용약관</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 1월 29일</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제1조 (목적)</h2>
              <p>
                이 약관은 JobsClass(이하 "회사")가 제공하는 지식 서비스 마켓플레이스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제2조 (정의)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>"서비스"란 회사가 제공하는 온라인 지식 서비스 거래 플랫폼을 의미합니다.</li>
                <li>"파트너"란 서비스를 통해 지식 상품 및 서비스를 판매하는 회원을 의미합니다.</li>
                <li>"클라이언트"란 서비스를 통해 지식 상품 및 서비스를 구매하는 회원을 의미합니다.</li>
                <li>"서비스 타입"이란 온라인 강의, 멘토링, 그룹 코칭, 디지털 상품, 프로젝트 대행, 커뮤니티 & 네트워킹 등 6가지 제공 방식을 의미합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.</li>
                <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                <li>회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 최소 7일 전부터 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제4조 (회원가입)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>회원가입은 이용자가 약관의 내용에 동의하고, 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 회원가입 신청을 하여 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다.
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>타인의 명의를 도용한 경우</li>
                    <li>허위 정보를 기재한 경우</li>
                    <li>기타 회원으로 등록하는 것이 회사의 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제5조 (서비스 이용)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>서비스는 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 제공합니다.</li>
                <li>회사는 시스템 정기점검, 증설 및 교체를 위해 회사가 정한 날이나 시간에 서비스를 일시 중단할 수 있으며, 예정된 작업으로 인한 서비스 일시 중단은 웹사이트를 통해 사전에 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제6조 (수수료)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>회사는 파트너가 판매한 서비스 금액의 10%를 플랫폼 수수료로 징수합니다.</li>
                <li>클라이언트는 서비스 이용에 대한 별도의 수수료를 부담하지 않습니다.</li>
                <li>수수료율은 회사의 정책에 따라 변경될 수 있으며, 변경 시 최소 30일 전에 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제7조 (결제 및 환불)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>서비스 이용료 결제는 회사가 제공하는 결제 수단을 통해 이루어집니다.</li>
                <li>환불 정책은 별도의 환불정책 페이지에 명시된 바에 따릅니다.</li>
                <li>부정한 방법으로 결제가 이루어진 경우 회사는 해당 거래를 취소하고 회원 자격을 정지할 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제8조 (파트너의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>파트너는 제공하는 서비스에 대해 정확하고 진실된 정보를 제공해야 합니다.</li>
                <li>파트너는 클라이언트와의 약속을 성실히 이행해야 합니다.</li>
                <li>파트너는 저작권, 특허권 등 제3자의 권리를 침해해서는 안 됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제9조 (클라이언트의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>클라이언트는 구매한 서비스를 개인적인 용도로만 사용해야 하며, 무단 복제, 배포, 재판매할 수 없습니다.</li>
                <li>클라이언트는 파트너에게 부당한 요구를 해서는 안 됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제10조 (회사의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
                <li>회사는 회원의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 준수합니다.</li>
                <li>회사는 파트너와 클라이언트 간의 분쟁 해결을 위해 노력하나, 최종 책임은 당사자에게 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제11조 (면책)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                <li>회사는 파트너가 제공하는 서비스의 내용, 품질, 정확성에 대해 보증하지 않으며, 이로 인한 손해에 대해 책임지지 않습니다.</li>
                <li>회사는 회원 간의 거래에서 발생하는 분쟁에 대해 개입 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">제12조 (분쟁 해결)</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>이 약관과 관련하여 발생한 분쟁에 대해 회사와 회원은 성실히 협의하여 해결하도록 노력합니다.</li>
                <li>협의가 이루어지지 않을 경우, 관할법원은 회사의 본사 소재지를 관할하는 법원으로 합니다.</li>
              </ol>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">부칙</h2>
              <p>본 약관은 2025년 1월 29일부터 시행됩니다.</p>
            </section>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
            개인정보처리방침 보기 →
          </Link>
          <Link href="/refund" className="text-primary-600 hover:text-primary-700 font-medium">
            환불정책 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
