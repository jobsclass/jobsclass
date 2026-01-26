# ✅ JobsBuild 배포 세팅 체크리스트

> **프로젝트**: JobsBuild (구 Corefy)  
> **작성일**: 2026-01-25  
> **예상 소요 시간**: 약 60분  
> **최종 커밋**: [6a5545b](https://github.com/jobsclass/corefy/commit/6a5545b)

---

## 📋 전체 체크리스트

### 1️⃣ Supabase 설정 (15분)
- [ ] 기존 프로젝트 확인 (`corefy` → `jobsbuild`)
- [ ] API 키 3개 복사 (URL, anon key, service_role key)
- [ ] 마이그레이션 4개 순서대로 실행
  - [ ] `schema.sql` (기본 스키마)
  - [ ] `add_onboarding_complete.sql` (온보딩)
  - [ ] `add_profile_and_service_types.sql` (프로필/서비스 타입)
  - [ ] `add_orders_payments_fixed.sql` ⭐ **최신 수정본** (주문/결제)
- [ ] Table Editor에서 10개 테이블 확인
- [ ] RLS 정책 확인 (Authentication → Policies)
- [ ] 스토리지 버킷 3개 생성 (`avatars`, `thumbnails`, `uploads`)

### 2️⃣ OpenAI API 설정 (10분)
- [ ] OpenAI Platform 가입 (https://platform.openai.com)
- [ ] 결제 정보 등록 (신용카드)
- [ ] API 키 발급 (`sk-proj-...`)
- [ ] 사용량 제한 설정
  - [ ] Hard limit: $10/월
  - [ ] Soft limit: $5/월
  - [ ] 이메일 알림 활성화

### 3️⃣ Toss Payments 설정 (15분)
- [ ] Toss Payments 가입 (https://www.tosspayments.com)
- [ ] 테스트 API 키 발급
  - [ ] Client Key: `test_ck_...`
  - [ ] Secret Key: `test_sk_...`
- [ ] 테스트 카드 정보 저장
  - 카드번호: `4000-0000-0000-0008`
  - 유효기간: `01/26`
  - CVC: `123`
  - 비밀번호: `1234`
- [ ] (운영 전환 시) 사업자 서류 제출

### 4️⃣ Vercel 배포 설정 (20분)
- [ ] GitHub 저장소 연결 (`jobsclass/corefy`)
- [ ] 프로젝트 기본 설정 확인
  - Framework: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] 환경 변수 6개 입력
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `NEXT_PUBLIC_TOSS_CLIENT_KEY`
  - [ ] `TOSS_SECRET_KEY`
- [ ] Deploy 버튼 클릭
- [ ] 빌드 성공 확인 (약 3-5분 소요)
- [ ] 배포 URL 확인 (`https://[프로젝트명].vercel.app`)

### 5️⃣ 배포 후 테스트 (15-20분)
- [ ] **기본 접속**
  - [ ] 홈페이지 로딩
  - [ ] 모바일 반응형 확인
  
- [ ] **회원가입/로그인**
  - [ ] 이메일 형식 검증
  - [ ] 비밀번호 + 비밀번호 확인 매칭
  - [ ] 사용자 이름 중복 체크 (실시간)
  - [ ] 회원가입 성공 → 온보딩 페이지 이동
  
- [ ] **온보딩 (AI 웹사이트 생성)**
  - [ ] 프로필 타입 선택 (개인 / 조직)
  - [ ] 5개 질문 응답
  - [ ] AI 생성 시작
  - [ ] 생성 완료 → 대시보드 이동
  
- [ ] **대시보드**
  - [ ] 프로필 정보 표시
  - [ ] AI 생성 콘텐츠 확인
    - [ ] 프로필 (1개)
    - [ ] 서비스 (3-5개)
    - [ ] 블로그 포스트 (3-5개)
    - [ ] 포트폴리오 (3-5개)
  
- [ ] **서비스 등록**
  - [ ] 서비스 타입 선택 (바로 결제 / 외부 링크 / 문의 받기)
  - [ ] 카테고리 선택
  - [ ] 정보 입력 (제목, 설명, 가격 등)
  - [ ] AI 이미지 생성 (DALL·E 3)
  - [ ] 서비스 등록 완료
  
- [ ] **결제 테스트 (Toss)**
  - [ ] 서비스 상세 페이지 이동
  - [ ] "구매하기" 버튼 클릭
  - [ ] Toss 결제 위젯 표시
  - [ ] 테스트 카드로 결제
  - [ ] 결제 성공 페이지 확인
  - [ ] 대시보드에서 주문 내역 확인
  
- [ ] **공개 웹사이트**
  - [ ] `/{username}` 프로필 페이지
  - [ ] 서비스 목록 표시
  - [ ] 블로그 목록 표시
  - [ ] 포트폴리오 목록 표시
  - [ ] 문의하기 버튼 동작

---

## 🔑 환경 변수 템플릿

```bash
# Supabase (데이터베이스)
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (AI 기능)
OPENAI_API_KEY=sk-proj-...

# Toss Payments (결제)
# 테스트 환경
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# 운영 환경 (실제 결제)
# NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
# TOSS_SECRET_KEY=live_sk_...
```

---

## 🎯 주요 기능 요약

### 완료된 기능 (8/14 = 57%)
1. ✅ 회원가입 비밀번호 확인 (프론트엔드 + 백엔드 검증)
2. ✅ 사용자 이름 중복 체크 (실시간 API)
3. ✅ 온보딩 완료 필수 검증 (DB + UI)
4. ✅ AI 기능 비용 기반 수익모델 (FREE/STARTER/PRO)
5. ✅ AI 이미지 생성 UI (DALL·E 3)
6. ✅ 개인/조직 프로필 + 서비스 타입 3종
7. ✅ 고객 관리 시스템 (문의 폼 + 대시보드)
8. ✅ **주문/결제 시스템 (Toss Payments)** ⭐ **최신**

### 진행 중 (0/6 = 0%)
- (없음)

### 보류 (6/14 = 43%)
9. ⏳ 템플릿 시스템 (Modern/Minimal/Creative 3종)
10. ⏳ 구독 관리 시스템 (플랜 변경/결제 내역)
11. ⏳ 커스텀 도메인 연결
12. ⏳ SEO 최적화 대시보드
13. ⏳ 분석 대시보드 (방문자 통계)
14. ⏳ 이메일 알림 시스템

---

## 🚨 문제 해결 가이드

### 1. 마이그레이션 실패: "column 'service_id' does not exist"

**원인**: `customers` 테이블이 이미 존재하는데 `CREATE TABLE`로 시도

**해결**:
```sql
-- ❌ 기존 파일 (실패)
supabase/migrations/add_orders_payments.sql

-- ✅ 수정본 사용 (성공)
supabase/migrations/add_orders_payments_fixed.sql
```

**실행 방법**:
1. Supabase Dashboard → SQL Editor → New query
2. `add_orders_payments_fixed.sql` 파일 내용 복사
3. 붙여넣기 후 Run

---

### 2. Supabase 연결 오류

**증상**: `Failed to fetch`, `Network error`

**확인사항**:
```bash
# 1. 환경 변수 확인
✅ NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
❌ NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co/  # 끝에 / 금지

# 2. anon key 확인 (eyJ로 시작)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY=sk-...  # OpenAI key와 혼동 금지

# 3. Vercel에서 재배포
Vercel Dashboard → Deployments → Redeploy
```

---

### 3. OpenAI API 에러

**증상**: `Insufficient quota`, `Rate limit exceeded`

**해결**:
1. OpenAI Platform → Usage → Billing 확인
2. 크레딧 충전 ($5 이상 권장)
3. Limits 설정 확인 (Hard limit $10/월)

---

### 4. Toss 결제 위젯이 안 보임

**원인**: 클라이언트 키 설정 오류

**확인**:
```bash
# ✅ 올바른 환경 변수명 (NEXT_PUBLIC_ 접두사 필수)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...

# ❌ 잘못된 환경 변수명 (클라이언트에서 접근 불가)
TOSS_CLIENT_KEY=test_ck_...
```

**해결**: Vercel 환경 변수 수정 후 재배포

---

### 5. 빌드 실패

**증상**: Vercel 배포 중 빌드 에러

**확인**:
```bash
# 로컬에서 빌드 테스트
cd /home/user/webapp
npm install
npm run build

# 성공하면 재배포
git push origin main
```

---

## 📊 데이터베이스 테이블 구조

### Core Tables (기본 - 5개)
| 테이블 | 용도 | 주요 필드 |
|--------|------|-----------|
| `user_profiles` | 사용자 프로필 | profile_type, organization_name |
| `services` | 서비스/상품 | service_type, price, external_url |
| `blog_posts` | 블로그 | title, content, slug |
| `portfolios` | 포트폴리오 | title, images, category |
| `experiences` | 경력/경험 | company, position, period |

### Customer & Orders (고객/주문 - 3개)
| 테이블 | 용도 | 주요 필드 |
|--------|------|-----------|
| `customers` | 고객 문의 | name, email, status, **service_id** ⭐ |
| `orders` | 주문 관리 | order_number, service_id, status |
| `payments` | 결제 내역 | payment_key, method, amount |

### Subscriptions & AI (구독/AI - 3개)
| 테이블 | 용도 | 주요 필드 |
|--------|------|-----------|
| `subscriptions` | 구독 관리 | plan, ai_images_used |
| `subscription_invoices` | 구독 결제 | amount, billing_period |
| `ai_usage_logs` | AI 사용 로그 | feature_type, cost_usd |

**총 11개 테이블** (Core 5 + Customer/Orders 3 + Subscriptions/AI 3)

---

## 🎓 참고 자료

### 공식 문서
- [Supabase](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Toss Payments](https://docs.tosspayments.com)
- [Vercel](https://vercel.com/docs)
- [Next.js 15](https://nextjs.org/docs)

### 프로젝트 문서
- [데이터베이스 설정 가이드](./DATABASE_SETUP_GUIDE.md) ⭐ **최신**
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT_GUIDE.md)
- [결제 시스템 설계](./PAYMENT_SYSTEM_DESIGN.md)
- [최종 개발 현황](./FINAL_PROGRESS_REPORT_2026_01_25.md)

### GitHub
- Repository: https://github.com/jobsclass/corefy
- Latest Commit: https://github.com/jobsclass/corefy/commit/6a5545b

---

## ✨ 완료 후 확인사항

배포 완료 후 아래 URL에서 테스트:

```bash
# Vercel 배포 URL (예시)
https://corefy.vercel.app

# 테스트 계정으로 회원가입
이메일: test@jobsbuild.com
비밀번호: Test1234!

# 테스트 결제 (Toss)
카드번호: 4000-0000-0000-0008
유효기간: 01/26
CVC: 123
비밀번호: 1234
```

---

**🎉 축하합니다! JobsBuild 배포가 완료되었습니다!**

다음 단계:
1. ⚡ 구독 관리 시스템 구현 (2일)
2. 🎨 템플릿 시스템 3종 추가 (5일)
3. 🔗 커스텀 도메인 연결 (2일)
4. 📊 분석 대시보드 구축 (3일)
5. 🚀 베타 론칭 (1주)

**작성자**: Claude (AI Assistant)  
**최종 업데이트**: 2026-01-25 23:00 KST
