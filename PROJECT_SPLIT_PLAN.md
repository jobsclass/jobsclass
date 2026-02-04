# 🔀 프로젝트 분리 계획서

**작성일**: 2026-02-04  
**목적**: JobsVentures를 2개 프로젝트로 분리  

---

## 🎯 분리 목표

### 프로젝트 1: **JobsClass** (지식서비스 플랫폼)
- **위치**: 기존 JobsClass 프로젝트 (별도 저장소)
- **목적**: 전문가 ↔ 클라이언트 매칭 및 지식서비스 거래
- **핵심 기능**:
  - 전문가 서비스 등록/관리
  - 서비스 검색 및 매칭
  - 결제 시스템 (토스페이먼츠)
  - 리뷰 시스템
  - 크레딧 시스템
  - 포트폴리오/블로그

### 프로젝트 2: **JobsVentures** (구인구직 플랫폼)
- **위치**: 현재 프로젝트 (`/home/user/webapp`)
- **목적**: 스타트업 채용 플랫폼 (기업 ↔ 구직자)
- **핵심 기능**:
  - 채용 공고 등록/관리
  - 지원 시스템
  - 기업 프로필
  - 구직자 프로필
  - AI 매칭 (채용)
  - 스타트업 DB

---

## 📦 현재 프로젝트 구성 분석

### ✅ JobsVentures에 남길 기능 (구인구직)
```
✅ 인증 시스템 (auth/)
✅ 채용 공고 (jobs)
  - app/dashboard/jobs/
  - app/admin/jobs/
✅ 지원 시스템 (applications)
  - app/dashboard/applications/
✅ 프로필 시스템 (기업/구직자)
  - app/dashboard/profiles/
  - startup_profiles (기업)
  - seeker_profiles (구직자)
✅ 매칭 시스템 (채용 매칭)
  - app/dashboard/matching/
✅ 대시보드 (구인구직 중심)
  - FounderDashboard (채용 공고)
  - ProfessionalDashboard (구직자)
```

### ❌ JobsClass로 이동할 기능 (지식서비스)
```
❌ 전문가 서비스
  - app/dashboard/expert-services/
  - app/dashboard/services/
  - app/marketplace/services/
  - app/admin/services/
  
❌ 주문/결제
  - app/dashboard/orders/
  - app/api/payment/
  
❌ 리뷰 시스템
  - app/dashboard/orders/[id]/review/
  - app/admin/reviews/
  
❌ 포트폴리오/블로그
  - app/dashboard/portfolio/
  - app/dashboard/blog/
  
❌ 전문가 대시보드
  - components/dashboard/ExpertDashboard.tsx
  
❌ DB 테이블
  - expert_services
  - service_orders
  - service_reviews
  - expert_profiles (전문가 상세 정보)
  - credit_packages (크레딧 패키지)
```

### 🔄 양쪽에 필요한 공통 기능
```
🔄 크레딧 시스템 (각자 독립 운영)
  - JobsClass: 서비스 구매용
  - JobsVentures: 채용 공고 등록/매칭용
  
🔄 알림 시스템
  
🔄 메시징 시스템
```

---

## 🗄️ DB 테이블 분리

### JobsVentures (구인구직) - 유지할 테이블
```sql
✅ user_profiles (기본 사용자)
✅ profiles (다중 프로필)
✅ startup_profiles (기업 정보)
✅ seeker_profiles (구직자 정보)
✅ jobs (채용 공고)
✅ job_applications (지원)
✅ matching_requests (채용 매칭)
✅ matches (매칭 결과)
✅ user_credits (크레딧)
✅ credit_events (크레딧 이벤트)
✅ credit_transactions (크레딧 거래)
✅ notifications (알림)
✅ conversations (대화)
✅ messages (메시지)
```

### JobsClass (지식서비스) - 이동할 테이블
```sql
❌ expert_profiles (전문가 상세)
❌ expert_services (서비스)
❌ service_orders (주문)
❌ service_reviews (리뷰)
❌ credit_packages (크레딧 패키지)
❌ payments (결제)
```

### 제거할 테이블 (JobsVentures에서 불필요)
```sql
🗑️ investor_profiles (투자자 - 투자 플랫폼 아님)
🗑️ ai_consultations (AI 상담 - 지식서비스)
🗑️ ai_recommendations (AI 추천 - 고도화 시 추가)
🗑️ ai_training_data (AI 학습 - 고도화 시 추가)
🗑️ growth_predictions (성장 예측 - 고도화 시 추가)
🗑️ feedback_data (피드백 - 고도화 시 추가)
```

---

## 📁 파일 구조 변경

### JobsVentures (구인구직) - 삭제할 파일
```bash
# 전문가 서비스
rm -rf app/dashboard/expert-services/
rm -rf app/dashboard/services/
rm -rf app/marketplace/services/
rm -rf app/admin/services/

# 주문/결제
rm -rf app/dashboard/orders/
rm -rf app/api/payment/

# 리뷰
rm -rf app/admin/reviews/

# 포트폴리오/블로그
rm -rf app/dashboard/portfolio/
rm -rf app/dashboard/blog/

# 전문가 대시보드 컴포넌트
rm components/dashboard/ExpertDashboard.tsx
```

### JobsVentures (구인구직) - 수정할 파일
```bash
# 사이드바 메뉴 수정
components/dashboard/Sidebar.tsx
  - "상품 관리", "상품 등록" 메뉴 제거
  - "포트폴리오", "블로그" 메뉴 제거
  - "서비스" 관련 메뉴 제거
  
# 대시보드 수정
components/dashboard/AllDashboard.tsx
  - 서비스 관련 통계 제거
  
# 프로필 생성 수정
app/dashboard/profiles/new/page.tsx
  - "전문가" 프로필 타입 제거
  - "투자자" 프로필 타입 제거
  - "창업자" → "기업" 으로 변경
  - "구직자" → "직장인/구직자" 유지
  
# 관리자 사이드바 수정
app/admin/layout.tsx
  - "상품 관리" 메뉴 제거
  - "리뷰 관리" 메뉴 제거
  - "매칭 관리" → "채용 매칭" 으로 변경
```

---

## 🎨 브랜드 및 포지셔닝 변경

### JobsVentures (구인구직)
```typescript
// 기존
"AI 기반 스타트업 매칭 플랫폼"

// 변경 후
"스타트업을 위한 채용 플랫폼"

// 메인 기능
- 채용 공고 등록 (기업)
- 채용 지원 (구직자)
- AI 매칭 (기업 ↔ 구직자)
- 스톡옵션 계산기
- 기업 문화 소개
```

### JobsClass (지식서비스)
```typescript
// 포지셔닝
"전문가 지식과 서비스를 거래하는 플랫폼"

// 메인 기능
- 전문가 서비스 등록
- 서비스 검색/구매
- 프로젝트 매칭
- 결제/리뷰 시스템
- 포트폴리오/블로그
```

---

## 🚀 실행 계획

### Phase 1: 현재 프로젝트 정리 (JobsVentures → 구인구직)
**소요 시간**: 1-2시간

1. **불필요한 파일 삭제** (30분)
   - 전문가 서비스 관련 페이지
   - 주문/결제 페이지
   - 포트폴리오/블로그
   
2. **메뉴 및 UI 수정** (30분)
   - 사이드바 메뉴 정리
   - 프로필 타입 정리 (기업/구직자만)
   - 대시보드 수정
   
3. **DB 마이그레이션 새로 작성** (30분)
   - 불필요한 테이블 제거
   - 구인구직에 필요한 테이블만
   
4. **README 업데이트** (10분)
   - 프로젝트 설명 변경
   - 기능 목록 업데이트

### Phase 2: JobsClass 프로젝트에 반영
**소요 시간**: 2-3시간

1. **기존 JobsClass 프로젝트 확인**
   - 현재 구조 파악
   - 중복 기능 확인
   
2. **지식서비스 기능 통합**
   - expert-services 페이지 복사
   - 주문/결제 시스템 복사
   - 리뷰 시스템 복사
   - 포트폴리오/블로그 복사
   
3. **DB 마이그레이션 추가**
   - expert_services 테이블
   - service_orders 테이블
   - service_reviews 테이블
   
4. **테스트 및 배포**

---

## ⚠️ 주의사항

### 1. 데이터 손실 방지
- **백업 필수**: 현재 프로젝트 전체 백업
- **Git 커밋**: 삭제 전 반드시 커밋
- **테이블 확인**: DB 마이그레이션 전 데이터 확인

### 2. 의존성 확인
- **공통 컴포넌트**: 양쪽에서 사용하는 컴포넌트 복사
- **API 함수**: Supabase 클라이언트 함수 확인
- **타입 정의**: TypeScript 타입 정의 복사

### 3. 크레딧 시스템
- **독립 운영**: 각 프로젝트에서 별도 크레딧 시스템
- **테이블 분리**: user_credits 테이블 각자 관리
- **패키지 차별화**: 
  - JobsClass: 서비스 구매용 (소액)
  - JobsVentures: 채용 공고 등록용 (고액)

---

## 📊 예상 결과

### JobsVentures (구인구직) - 개선 효과
```
✅ 명확한 포지셔닝: "스타트업 채용 플랫폼"
✅ 집중된 기능: 채용 공고 + 지원 + 매칭
✅ 빠른 로딩: 불필요한 코드 제거
✅ 쉬운 유지보수: 단순화된 구조
✅ 명확한 수익 모델: 채용 공고 유료화
```

### JobsClass (지식서비스) - 개선 효과
```
✅ 명확한 포지셔닝: "전문가 지식 거래 플랫폼"
✅ 집중된 기능: 서비스 등록 + 구매 + 리뷰
✅ 수익 모델 명확: 거래 수수료 10-20%
✅ 전문가 집중: 포트폴리오/블로그 강화
```

---

## ✅ 체크리스트

### 시작 전 확인
- [ ] 현재 프로젝트 백업 완료
- [ ] Git 커밋 완료
- [ ] DB 현황 파악 완료

### JobsVentures 정리
- [ ] 불필요한 파일 삭제
- [ ] 메뉴 수정
- [ ] 프로필 타입 정리
- [ ] DB 마이그레이션 재작성
- [ ] README 업데이트
- [ ] 테스트 완료

### JobsClass 통합
- [ ] 기존 프로젝트 확인
- [ ] 지식서비스 기능 복사
- [ ] DB 마이그레이션 추가
- [ ] 테스트 완료
- [ ] 배포 완료

---

## 🎯 최종 목표

### JobsVentures
- **타겟**: 스타트업 + 구직자
- **핵심**: 채용 공고 + AI 매칭
- **차별화**: 스타트업 문화 강조, 스톡옵션 계산기

### JobsClass
- **타겟**: 전문가 + 클라이언트
- **핵심**: 지식서비스 거래 + 프로젝트 매칭
- **차별화**: 포트폴리오/블로그, 전문가 인증

---

**문서 작성**: AI Assistant  
**프로젝트 경로**: `/home/user/webapp/PROJECT_SPLIT_PLAN.md`
