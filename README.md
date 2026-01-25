# Corefy WebBuilder 🚀

**문제-해결 중심의 No-Code 웹사이트 빌더**

Corefy는 지식 창작자, 코치, 컨설턴트, 프리랜서를 위한 완전한 웹사이트 빌더입니다. 드래그 앤 드롭 없이 **간단한 폼 작성만으로** 전문적인 웹사이트를 만들고, 상품을 판매하고, 고객을 관리할 수 있습니다.

## ✨ 주요 기능

### 🎯 문제-해결 중심 구조
- **8개 문제 카테고리**: 수익 창출, 비즈니스 성장, 시간 자유, 기술 습득 등
- **8개 솔루션 타입**: 온라인 강의, 전자책, 컨설팅, 코칭, 템플릿 등
- **타겟 고객 명확화**: 누구의 어떤 문제를 해결하는지 명확한 메시지

### 📊 완전한 대시보드
- **웹사이트 관리**: 설정, 섹션 관리, 디자인 커스터마이징
- **프로필 관리**: 경력, 학력, 자격증, 전문 분야
- **상품 관리**: 온라인 강의, 전자책, 컨설팅 등 다양한 상품 등록
- **블로그**: 콘텐츠 마케팅을 위한 블로그 시스템
- **포트폴리오**: 프로젝트 사례 및 포트폴리오 관리
- **고객 관리**: 문의 관리 및 고객 데이터베이스
- **결제 관리**: 주문, 매출 통계, 환불 관리
- **통계/분석**: 방문자, 전환율, 매출 분석

### 🎨 공개 웹사이트 템플릿
- **섹션별 렌더링**: Hero, Profile, Products, Blog, Portfolio, Contact
- **동적 섹션 관리**: 섹션 표시/숨김 및 순서 조정
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 대응
- **SEO 최적화**: 메타 태그, OG 이미지, 검색 엔진 최적화

---

## 🛠 기술 스택

### Frontend
- **Next.js 15.5.9**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리

### Backend & Database
- **Supabase**: PostgreSQL 데이터베이스, 인증, 실시간 기능
- **Supabase Auth**: 이메일/소셜 로그인

### Deployment
- **Vercel**: Next.js 최적화 호스팅
- **GitHub**: 버전 관리 및 CI/CD

---

## 📁 프로젝트 구조

```
corefy/
├── app/                          # Next.js App Router
│   ├── [username]/[slug]/        # 공개 웹사이트 (동적 라우팅)
│   ├── auth/                     # 인증 (로그인/회원가입)
│   ├── dashboard/                # 대시보드
│   │   ├── analytics/            # 통계/분석
│   │   ├── blog/                 # 블로그 관리
│   │   │   └── new/              # 블로그 글쓰기
│   │   ├── customers/            # 고객 관리
│   │   ├── orders/               # 결제/주문 관리
│   │   ├── portfolio/            # 포트폴리오 관리
│   │   │   └── new/              # 포트폴리오 추가
│   │   ├── products/             # 상품 관리
│   │   │   └── new/              # 상품 등록 (4단계)
│   │   ├── profile/              # 프로필 관리
│   │   ├── settings/             # 설정
│   │   ├── website/              # 웹사이트 설정
│   │   │   ├── design/           # 디자인 설정
│   │   │   └── sections/         # 섹션 관리
│   │   └── websites/             # 웹사이트 목록
│   └── api/                      # API 엔드포인트
├── components/                   # React 컴포넌트
│   └── dashboard/                # 대시보드 컴포넌트
│       └── Sidebar.tsx           # 사이드바 네비게이션
├── lib/                          # 유틸리티 함수
│   └── supabase/                 # Supabase 클라이언트
├── supabase/                     # Supabase 설정
│   ├── complete_schema.sql       # 완전한 DB 스키마
│   └── migrations/               # DB 마이그레이션
├── public/                       # 정적 파일
└── README.md                     # 프로젝트 문서
```

---

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/jobsclass/corefy.git
cd corefy
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabase 설정
1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. SQL Editor에서 `/supabase/complete_schema.sql` 실행
3. 환경 변수에 프로젝트 URL과 API 키 입력

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📦 데이터베이스 스키마

### 주요 테이블
- `user_profiles`: 사용자 프로필 정보
- `websites`: 웹사이트 설정 및 콘텐츠
- `products`: 상품 (온라인 강의, 전자책 등)
- `blog_posts`: 블로그 글
- `portfolios`: 포트폴리오 프로젝트
- `experiences`: 경력 사항
- `educations`: 학력 사항
- `certifications`: 자격증 및 수상
- `customers`: 고객 데이터
- `inquiries`: 문의 관리
- `orders`: 주문 및 결제

전체 스키마는 `/supabase/complete_schema.sql` 참조

---

## 🎨 주요 페이지

### 대시보드
- **홈**: `/dashboard` - 주요 지표 및 빠른 액션
- **웹사이트 설정**: `/dashboard/website` - 기본 정보, SEO, 도메인
- **섹션 관리**: `/dashboard/website/sections` - 섹션 표시/숨김 및 순서
- **디자인 설정**: `/dashboard/website/design` - 색상, 폰트, 레이아웃
- **프로필 관리**: `/dashboard/profile` - 프로필, 경력, 학력, 자격증
- **상품 관리**: `/dashboard/products` - 상품 목록 및 등록
- **블로그 관리**: `/dashboard/blog` - 블로그 글 목록 및 작성
- **포트폴리오 관리**: `/dashboard/portfolio` - 포트폴리오 목록 및 추가
- **고객 관리**: `/dashboard/customers` - 고객 및 문의 관리
- **결제 관리**: `/dashboard/orders` - 주문, 매출, 환불 관리
- **통계/분석**: `/dashboard/analytics` - 방문자, 전환율, 매출 분석

### 공개 웹사이트
- **메인 페이지**: `/[username]/[slug]` - 섹션별 동적 렌더링

---

## 🔒 인증 시스템

### Supabase Auth 기반
- **회원가입**: `/auth/user/signup`
- **로그인**: `/auth/user/login`
- **자동 프로필 생성**: 회원가입 시 `user_profiles` 자동 생성
- **세션 관리**: 서버 사이드 세션 관리

---

## 🎯 상품 등록 프로세스

### 4단계 마법사
1. **문제 정의**: 8개 문제 카테고리 중 선택, 타겟 고객 정의
2. **솔루션 선택**: 8개 솔루션 타입 중 다중 선택 가능
3. **상품 정보**: 제목, 설명, 썸네일 이미지
4. **가격 및 특징**: 판매 가격, 정가, 주요 특징

---

## 🌐 공개 웹사이트 섹션

### 동적 섹션 시스템
- **Hero**: 메인 배너, 문제 카테고리, 솔루션 타입
- **Profile**: 프로필, 경력, 학력, 자격증
- **Products**: 상품 카드 그리드
- **Blog**: 최근 블로그 글 목록
- **Portfolio**: 프로젝트 갤러리
- **Contact**: 문의 정보 (이메일, 전화, 위치)

### 섹션 관리
- `sections_enabled`: 섹션 표시/숨김 설정 (JSONB)
- `sections_order`: 섹션 순서 배열 (TEXT[])

---

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 최적화
- Next.js Image 컴포넌트 사용
- Lazy loading
- 호버 인터랙션
- 터치 제스처 지원

---

## 🚢 배포

### Vercel 배포 (추천)
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com/)에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

### 수동 빌드
```bash
npm run build
npm start
```

---

## 📝 라이선스

MIT License

---

## 👥 기여

이슈 및 PR은 언제든 환영합니다!

---

## 📧 문의

- **Email**: startupjobs824@gmail.com
- **GitHub**: [https://github.com/jobsclass/corefy](https://github.com/jobsclass/corefy)

---

## 🎉 특징

### 왜 Corefy인가?

1. **드래그 앤 드롭 없음**: 복잡한 UI 대신 간단한 폼 작성
2. **문제-해결 중심**: 고객의 문제를 명확히 정의하고 해결책 제시
3. **완전한 비즈니스 시스템**: 웹사이트 + 상품 + 블로그 + 포트폴리오 + 고객관리
4. **반응형 디자인**: 모든 디바이스에서 완벽한 경험
5. **SEO 최적화**: 검색 엔진 친화적
6. **빠른 로딩**: Next.js 최적화

---

**Corefy로 당신의 지식을 비즈니스로 만드세요! 🚀**
