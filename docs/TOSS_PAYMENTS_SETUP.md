# 💳 Toss Payments 환경 변수 설정 가이드

**작성일**: 2025-01-27  
**대상**: 개발자 / 운영자  
**소요 시간**: 약 15분  
**난이도**: ⭐☆☆☆☆ (하)

---

## 📋 목차
1. [Toss Payments 계정 준비](#toss-payments-계정-준비)
2. [API 키 발급](#api-키-발급)
3. [Vercel 환경 변수 설정](#vercel-환경-변수-설정)
4. [설정 검증](#설정-검증)
5. [테스트 결제](#테스트-결제)

---

## 🎯 Toss Payments 계정 준비

### 1단계: 회원가입
1. https://developers.tosspayments.com/ 접속
2. 우측 상단 **시작하기** 또는 **로그인** 클릭
3. 회원가입 (이메일, Google, GitHub 계정 사용 가능)

### 2단계: 앱 생성
1. 로그인 후 대시보드 이동
2. 좌측 메뉴 **내 앱** 클릭
3. **새 앱 만들기** 클릭
4. 앱 정보 입력:
   ```
   앱 이름: JobsClass
   서비스 설명: 전문가 매칭 플랫폼
   카테고리: 중개/플랫폼
   ```
5. **만들기** 클릭

---

## 🔑 API 키 발급

### 1단계: 테스트 모드 활성화
1. 좌측 메뉴 **개발 정보** 클릭
2. 상단에서 **테스트 모드** 선택 (중요!)
   - 운영 모드는 실제 결제가 진행되므로 주의!

### 2단계: API 키 확인
테스트 모드에서 다음 2개 키를 확인:

#### 1) Client Key (공개 키)
```
형식: test_ck_xxxxxxxxxx
용도: 프론트엔드에서 사용 (공개 가능)
위치: NEXT_PUBLIC_TOSS_CLIENT_KEY
```

**복사 방법**:
1. "클라이언트 키" 섹션에서 복사 버튼 클릭
2. 안전한 곳에 임시 저장

#### 2) Secret Key (비밀 키)
```
형식: test_sk_xxxxxxxxxx
용도: 백엔드 API에서 사용 (절대 공개 금지!)
위치: TOSS_SECRET_KEY
```

**복사 방법**:
1. "시크릿 키" 섹션에서 **보기** 클릭
2. 복사 버튼 클릭
3. 안전한 곳에 임시 저장

**⚠️ 주의사항**:
- Secret Key는 절대 GitHub 등에 커밋하지 마세요!
- Secret Key는 한 번 보고 나면 다시 확인할 수 없으므로 안전하게 보관
- 분실 시 새로 발급 필요

### 3단계: 키 저장
임시로 메모장이나 비밀번호 관리 도구에 저장:
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_abcd1234efgh5678ijkl
TOSS_SECRET_KEY=test_sk_wxyz9876mnop5432qrst
```

---

## ⚙️ Vercel 환경 변수 설정

### 1단계: Vercel Dashboard 접속
1. https://vercel.com/dashboard 로그인
2. JobsClass 프로젝트 선택
3. 상단 탭에서 **Settings** 클릭
4. 좌측 메뉴에서 **Environment Variables** 클릭

### 2단계: 환경 변수 추가

#### 변수 1: NEXT_PUBLIC_TOSS_CLIENT_KEY
1. **Add New** 버튼 클릭
2. 입력:
   ```
   Name: NEXT_PUBLIC_TOSS_CLIENT_KEY
   Value: test_ck_abcd1234efgh5678ijkl (실제 키 입력)
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
3. **Save** 클릭

#### 변수 2: TOSS_SECRET_KEY
1. **Add New** 버튼 클릭
2. 입력:
   ```
   Name: TOSS_SECRET_KEY
   Value: test_sk_wxyz9876mnop5432qrst (실제 키 입력)
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
3. **Save** 클릭

### 3단계: 환경 변수 확인
설정 후 다음과 같이 표시되어야 함:

| Name | Value | Environments |
|------|-------|--------------|
| NEXT_PUBLIC_TOSS_CLIENT_KEY | test_ck_... | Production, Preview, Development |
| TOSS_SECRET_KEY | test_sk_... (hidden) | Production, Preview, Development |

---

## 🚀 재배포

### 1단계: 환경 변수 적용을 위한 재배포
환경 변수는 **배포 시점**에 적용되므로 재배포 필요!

1. Vercel Dashboard → **Deployments** 탭
2. 최신 배포 우측 **...** 메뉴 클릭
3. **Redeploy** 클릭
4. **Redeploy** 재확인

### 2단계: 배포 완료 대기
- 약 2-3분 소요
- 상태가 "Ready"로 변경되면 완료

### 3단계: 배포 로그 확인
1. 배포 항목 클릭
2. **Build Logs** 확인
3. 에러 없이 완료되었는지 확인

---

## ✅ 설정 검증

### 1단계: 프론트엔드 키 확인
1. 배포된 사이트 접속: https://jobsclass.vercel.app
2. 브라우저 개발자 도구 열기 (F12)
3. Console 탭에서 입력:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY)
   ```
4. **기대 결과**: `test_ck_...` 형태의 키 출력

**❌ "undefined" 출력 시**:
- Vercel에서 재배포했는지 확인
- 환경 변수 이름 오타 확인 (`NEXT_PUBLIC_` 접두사 필수)

### 2단계: 백엔드 키 확인
백엔드 Secret Key는 보안상 직접 확인 불가 (정상)

### 3단계: API 엔드포인트 확인
1. 브라우저 주소창에 입력:
   ```
   https://jobsclass.vercel.app/api/payments/health
   ```
2. **기대 결과**:
   ```json
   {
     "status": "ok",
     "tossConfigured": true
   }
   ```

**❌ "tossConfigured": false 시**:
- Vercel 환경 변수 설정 재확인
- 재배포 필요

---

## 💳 테스트 결제

### 1단계: 크레딧 충전 페이지 접속
1. https://jobsclass.vercel.app/credits/charge 접속
2. 로그인 (회원가입 안 되어 있으면 먼저 가입)

### 2단계: 충전 패키지 선택
5가지 패키지 중 하나 선택:
- 💎 스타터: 10,000 크레딧 (₩10,000)
- 💎 베이직: 30,000 크레딧 (₩30,000)
- 💎 프로: 50,000 크레딧 (₩50,000)
- 💎 비즈니스: 100,000 크레딧 (₩100,000)
- 💎 엔터프라이즈: 200,000 크레딧 (₩200,000)

### 3단계: 결제 진행
1. **충전하기** 버튼 클릭
2. Toss Payments 결제창 표시 확인
3. 테스트 카드 정보 입력:
   ```
   카드번호: 4242 4242 4242 4242
   유효기간: 12/25 (미래 날짜)
   CVC: 123
   비밀번호 앞 2자리: 12
   생년월일: 900101
   ```
4. **결제하기** 클릭

### 4단계: 결제 성공 확인
1. `/credits/charge/success` 페이지로 리다이렉트 확인
2. 성공 메시지 표시:
   ```
   ✅ 결제가 완료되었습니다!
   충전된 크레딧: 10,000
   ```
3. 크레딧 잔액 반영 확인

### 5단계: 데이터베이스 확인 (선택)
Supabase SQL Editor에서:
```sql
-- 주문 내역 확인
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 크레딧 거래 내역 확인
SELECT * FROM credit_transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 결제 거래 로그 확인
SELECT * FROM payment_transactions 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔧 문제 해결

### 문제 1: "결제창이 뜨지 않아요"
**원인**: Client Key 미설정 또는 오타  
**해결**:
1. 브라우저 Console에서 에러 메시지 확인
2. Vercel 환경 변수 이름 확인 (`NEXT_PUBLIC_TOSS_CLIENT_KEY`)
3. 재배포 후 캐시 삭제 (Ctrl+Shift+R)

### 문제 2: "결제 후 에러 페이지로 이동해요"
**원인**: Secret Key 미설정 또는 잘못된 키  
**해결**:
1. Vercel 환경 변수에서 `TOSS_SECRET_KEY` 확인
2. Toss Payments Dashboard에서 키 재확인
3. 재배포

### 문제 3: "테스트 카드가 승인되지 않아요"
**원인**: Toss Payments가 운영 모드로 설정됨  
**해결**:
1. Toss Payments Dashboard → 개발 정보
2. 상단 모드를 **테스트**로 변경
3. API 키 다시 확인 (test_ck_, test_sk_ 접두사 확인)

### 문제 4: "CORS 에러가 발생해요"
**원인**: Vercel 도메인이 Toss Payments에 등록되지 않음  
**해결**:
1. Toss Payments Dashboard → 개발 정보
2. 허용된 도메인에 추가:
   ```
   https://jobsclass.vercel.app
   https://*.vercel.app
   http://localhost:3000
   ```

### 문제 5: "결제는 성공했는데 크레딧이 안 늘어요"
**원인**: 결제 승인 API 에러 또는 DB 마이그레이션 미완료  
**해결**:
1. 마이그레이션 완료 확인
2. Vercel Logs에서 `/api/payments/confirm` 에러 확인
3. Supabase에서 orders, credit_transactions 테이블 존재 확인

---

## 📊 테스트 체크리스트

### ✅ 설정 완료 확인
- [ ] Toss Payments 계정 생성
- [ ] 앱 생성 및 테스트 모드 활성화
- [ ] Client Key 복사
- [ ] Secret Key 복사
- [ ] Vercel 환경 변수 2개 추가
- [ ] Vercel 재배포 완료
- [ ] 배포 성공 확인

### ✅ 기능 테스트 완료
- [ ] Client Key 브라우저 Console 확인
- [ ] 크레딧 충전 페이지 접속
- [ ] 결제창 정상 표시
- [ ] 테스트 결제 성공
- [ ] 크레딧 정상 반영
- [ ] DB 레코드 생성 확인

---

## 🎉 다음 단계

### 환경 변수 설정 완료 후
1. ✅ Toss Payments 환경 변수 설정 완료
2. ➡️ [통합 테스트 실행](./INTEGRATION_TEST_GUIDE.md)
3. ➡️ [베타 런칭 준비](../LAUNCH_GUIDE.md)

---

## 📝 참고 자료

### Toss Payments 문서
- **개발자 센터**: https://developers.tosspayments.com/
- **결제창 연동**: https://docs.tosspayments.com/guides/payment-widget/integration
- **테스트 카드**: https://docs.tosspayments.com/reference/test-card

### JobsClass 관련 문서
- **결제 시스템 설계**: `/docs/PAYMENT_SYSTEM_DESIGN.md`
- **Toss Payments 가이드**: `/docs/TOSS_PAYMENTS_GUIDE.md`
- **API 문서**: `/app/api/payments/confirm/route.ts`

---

## 🔐 보안 주의사항

### ✅ 해야 할 것
- Secret Key는 Vercel 환경 변수에만 저장
- 테스트 모드로 개발/검증
- 운영 전환 시 운영 키로 교체

### ❌ 하지 말아야 할 것
- Secret Key를 코드에 하드코딩
- Secret Key를 GitHub에 커밋
- Secret Key를 프론트엔드에서 사용
- 운영 키로 테스트

---

## 📞 지원

### 문의
- **Toss Payments 지원**: https://developers.tosspayments.com/support
- **JobsClass GitHub**: https://github.com/jobsclass/jobsclass/issues

---

**작성자**: AI Developer  
**최종 수정**: 2025-01-27  
**버전**: 1.0
