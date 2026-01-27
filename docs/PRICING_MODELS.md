# JobsClass 가격 책정 모델 (Pricing Models)

## 🎯 개요
JobsClass는 다양한 서비스 유형에 맞춰 **2가지 가격 책정 모델**을 지원합니다.

---

## 📋 가격 책정 모델 분류

### 1️⃣ **정액제 (Fixed Price)** 💰
명확하게 정의된 패키지로 제공되는 서비스

**적용 대상:**
- ✅ 온라인 강의 (Online Course)
- ✅ 디지털 콘텐츠 (Digital Products)
- ✅ 프리미엄 멤버십 (Premium Membership)
- ✅ 라이브 워크샵 (Live Workshop)
- ✅ 1:1 멘토링 (표준 세션 기준)
- ✅ 그룹 코칭 (정해진 커리큘럼)

**특징:**
- 서비스 범위가 명확하게 정의됨
- 즉시 구매 가능
- 가격이 사전에 공개됨
- 자동 결제 처리

**예시:**
```
제목: Next.js 14 완전 정복 강의
가격: ₩150,000 (정액)
내용: 
- 총 20개 강의 (10시간)
- 소스 코드 제공
- 평생 수강 가능
- 수료증 발급
```

---

### 2️⃣ **협의 후 결정 (Negotiable Price)** 🤝
프로젝트 범위와 요구사항에 따라 가격이 달라지는 서비스

**적용 대상:**
- 🔧 프로젝트 대행 (Project Service)
- 💼 컨설팅 (Consulting)
- 📢 대행 서비스 (Agency Service)
- 📣 홍보/마케팅 서비스 (Promotion Service)
- 👥 1:1 멘토링 (맞춤형)
- 👨‍👩‍👧‍👦 그룹 코칭 (커스터마이징)

**특징:**
- 서비스 범위가 유동적
- 클라이언트 요구사항에 따라 맞춤화
- 견적서 제공 후 협의
- 계약서 기반 진행

**예시:**
```
제목: 쇼핑몰 웹사이트 제작
가격: ₩3,000,000 ~ (협의 가능)
기준 범위:
- 상품 등록 페이지 (최대 100개)
- 장바구니 및 결제 연동
- 관리자 대시보드
추가 옵션:
- 회원 등급제 (+₩500,000)
- 모바일 앱 (+₩2,000,000)
- SEO 최적화 (+₩300,000)
```

---

## 🔄 협의 후 결정 프로세스 (Negotiable Flow)

### **단계 1: 서비스 등록 (파트너)**
파트너가 서비스를 등록할 때 다음을 설정:

```typescript
{
  pricing_model: 'negotiable',        // 협의 필요
  base_price: 3000000,                // 시작 가격 (참고용)
  price_range_min: 3000000,           // 최소 가격
  price_range_max: 10000000,          // 최대 가격 (선택)
  consultation_required: true,        // 상담 필수
  custom_quotation: true,             // 맞춤 견적 제공
}
```

**UI 표시:**
- "₩3,000,000 ~ (협의 가능)"
- "무료 상담 신청" 버튼
- "견적 요청하기" 버튼

---

### **단계 2: 견적 요청 (클라이언트)**
클라이언트가 서비스 상세 페이지에서 "견적 요청" 버튼 클릭

**견적 요청 폼:**
```typescript
{
  project_title: "쇼핑몰 웹사이트 제작 요청",
  project_description: "...",          // 상세 요구사항
  budget_range: {
    min: 3000000,
    max: 5000000
  },
  deadline: "2024-03-31",              // 완료 희망일
  specific_requirements: [             // 구체적 요구사항
    "상품 등록 500개",
    "모바일 반응형",
    "카카오페이 연동"
  ],
  reference_urls: [],                  // 참고 사이트
  contact_preference: "email",         // 연락 방법
}
```

이 정보는 `quotation_requests` 테이블에 저장됩니다.

---

### **단계 3: 견적서 작성 (파트너)**
파트너가 요청을 검토하고 맞춤 견적서 작성

**견적서 구조:**
```typescript
{
  quotation_id: "QT-2024-0001",
  request_id: "REQ-123",
  
  // 기본 정보
  service_title: "쇼핑몰 웹사이트 제작",
  total_price: 4500000,                // 총 견적가
  
  // 상세 항목
  line_items: [
    {
      category: "기본 개발",
      items: [
        { name: "반응형 웹사이트", price: 2000000 },
        { name: "상품 관리 시스템", price: 800000 },
        { name: "결제 연동", price: 500000 }
      ]
    },
    {
      category: "추가 기능",
      items: [
        { name: "카카오페이 연동", price: 300000 },
        { name: "회원 등급제", price: 400000 },
        { name: "쿠폰 시스템", price: 500000 }
      ]
    }
  ],
  
  // 일정
  timeline: {
    planning: "1주",
    development: "6주",
    testing: "1주",
    total: "8주"
  },
  
  // 조건
  terms: {
    payment_schedule: [
      { stage: "계약금", percentage: 30, amount: 1350000 },
      { stage: "중도금", percentage: 40, amount: 1800000 },
      { stage: "잔금", percentage: 30, amount: 1350000 }
    ],
    revisions: 2,                      // 무료 수정 횟수
    warranty: "3개월",                 // 하자 보증
    cancellation_policy: "..."
  },
  
  valid_until: "2024-02-15",           // 견적서 유효기간
  status: "pending"                    // pending/accepted/rejected
}
```

---

### **단계 4: 견적서 협의 (클라이언트 ↔ 파트너)**
클라이언트가 견적서를 검토하고 협의

**클라이언트 옵션:**
1. **견적 수락** → 계약 진행
2. **수정 요청** → 파트너에게 메시지 전송
3. **거절** → 프로세스 종료

**협의 메시지 시스템:**
```typescript
{
  thread_id: "MSG-QT-2024-0001",
  messages: [
    {
      sender: "client",
      message: "회원 등급제는 빼고, 대신 리뷰 시스템을 추가할 수 있나요?",
      timestamp: "2024-02-01 10:30"
    },
    {
      sender: "partner",
      message: "네, 가능합니다. 리뷰 시스템 추가는 +₩350,000입니다.",
      timestamp: "2024-02-01 11:15"
    }
  ]
}
```

---

### **단계 5: 계약 체결**
견적 수락 후 정식 계약

**계약서 생성:**
```typescript
{
  contract_id: "CT-2024-0001",
  quotation_id: "QT-2024-0001",
  
  parties: {
    client_id: "user123",
    partner_id: "partner456"
  },
  
  agreed_price: 4850000,               // 최종 합의 금액
  payment_schedule: [...],
  deliverables: [...],
  timeline: {...},
  terms_and_conditions: "...",
  
  signatures: {
    client_signed_at: "2024-02-02 14:00",
    partner_signed_at: "2024-02-02 14:30"
  },
  
  status: "active"                     // draft/active/completed/cancelled
}
```

---

### **단계 6: 결제 및 에스크로**
안전 거래를 위한 단계별 결제

**계약금 결제 (30%):**
```typescript
{
  payment_id: "PAY-001",
  contract_id: "CT-2024-0001",
  amount: 1455000,                     // 계약금 + 플랫폼 수수료
  type: "deposit",
  status: "escrow",                    // 에스크로 보관
  
  breakdown: {
    contract_amount: 1350000,
    platform_fee: 135000,              // 10%
    payment_gateway_fee: 14550         // 1%
  }
}
```

**마일스톤 기반 결제:**
- 계약금 지불 → 작업 시작
- 중도금 지불 → 중간 검수 후
- 잔금 지불 → 최종 납품 후

---

### **단계 7: 프로젝트 진행 & 추적**
진행 상황 실시간 공유

**프로젝트 대시보드:**
```typescript
{
  project_id: "PROJ-2024-0001",
  contract_id: "CT-2024-0001",
  
  milestones: [
    {
      id: "MS-001",
      title: "기획 및 디자인",
      status: "completed",
      due_date: "2024-02-10",
      completed_at: "2024-02-08"
    },
    {
      id: "MS-002",
      title: "프론트엔드 개발",
      status: "in_progress",
      progress: 60,
      due_date: "2024-03-01"
    },
    {
      id: "MS-003",
      title: "백엔드 개발",
      status: "pending",
      due_date: "2024-03-15"
    }
  ],
  
  communications: [...],               // 메시지 히스토리
  file_deliveries: [...],              // 파일 전달 기록
}
```

---

### **단계 8: 검수 및 완료**
최종 납품물 검수

**검수 프로세스:**
1. 파트너가 납품물 제출
2. 클라이언트가 검수 (7일 이내)
3. 수정 요청 또는 승인
4. 승인 시 잔금 자동 정산

```typescript
{
  delivery_id: "DEL-001",
  contract_id: "CT-2024-0001",
  
  submitted_at: "2024-03-20",
  review_deadline: "2024-03-27",
  
  status: "pending_review",            // pending_review/revision_requested/approved
  
  // 검수 결과
  review: {
    approved: false,
    revision_requests: [
      "모바일 메뉴 동작 오류 수정 필요",
      "결제 완료 페이지 디자인 수정"
    ],
    reviewed_at: "2024-03-22"
  }
}
```

---

## 💡 프로세스 흐름도 (Flow Chart)

```
[클라이언트]                [시스템]                [파트너]

1. 서비스 발견
   └─→ 상세 페이지 조회
                          
2. 견적 요청 폼 작성
   └─→ quotation_requests ─→ 알림 받음
   
                                        3. 견적서 작성
                          ←─ quotation ←─┘
   
4. 견적서 검토
   ├─→ 수정 요청 ─────────→ 협의 메시지 ─→ 검토 & 재견적
   └─→ 수락
                          
5. 계약서 확인 & 서명
   └─→ contract ←────────┘ 서명
   
6. 계약금 결제
   └─→ escrow (에스크로)
   
                                        7. 작업 진행
                          ←─ milestones ←─┘
   
8. 중간 검수
   └─→ 중도금 결제
   
                                        9. 최종 납품
   ←────────────────────←─ delivery
   
10. 검수 & 승인
    └─→ 잔금 정산 ─────────→ 수수료 제외 ─→ 파트너 정산
```

---

## 🗄️ 데이터베이스 스키마

### `quotation_requests` (견적 요청)
```sql
CREATE TABLE quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  client_id UUID REFERENCES user_profiles(id),
  
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  deadline DATE,
  requirements JSONB,
  
  status TEXT DEFAULT 'pending',       -- pending/quoted/accepted/rejected
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `quotations` (견적서)
```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES quotation_requests(id),
  partner_id UUID REFERENCES user_profiles(id),
  
  total_price INTEGER NOT NULL,
  line_items JSONB NOT NULL,           -- 상세 항목
  timeline JSONB,                      -- 일정
  terms JSONB,                         -- 조건
  
  valid_until DATE,
  status TEXT DEFAULT 'pending',       -- pending/accepted/rejected/expired
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `contracts` (계약서)
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id),
  client_id UUID REFERENCES user_profiles(id),
  partner_id UUID REFERENCES user_profiles(id),
  
  agreed_price INTEGER NOT NULL,
  payment_schedule JSONB NOT NULL,
  deliverables JSONB NOT NULL,
  terms_and_conditions TEXT,
  
  client_signed_at TIMESTAMPTZ,
  partner_signed_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'draft',         -- draft/active/completed/cancelled
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `project_milestones` (마일스톤)
```sql
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  progress INTEGER DEFAULT 0,          -- 0-100
  status TEXT DEFAULT 'pending',       -- pending/in_progress/completed
  
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `deliveries` (납품)
```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  milestone_id UUID REFERENCES project_milestones(id),
  
  title TEXT NOT NULL,
  description TEXT,
  files JSONB,                         -- 파일 URL 배열
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  review_deadline TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending_review', -- pending_review/revision_requested/approved
  review_feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 정리

### **정액제 서비스**
- 즉시 구매 가능
- 명확한 가격 표시
- 자동 결제 처리
- 빠른 구매 전환

### **협의 후 결정 서비스**
- 견적 요청 → 견적서 작성 → 협의 → 계약 → 에스크로 → 진행 → 검수 → 정산
- 맞춤형 서비스 제공
- 안전한 에스크로 시스템
- 마일스톤 기반 진행 관리
- 체계적인 검수 프로세스

이 시스템으로 **정액제**와 **맞춤형** 서비스를 모두 지원하며, 
명확한 프로세스로 분쟁을 최소화할 수 있습니다.
