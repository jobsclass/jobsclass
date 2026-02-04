# Supabase 스키마 적용 가이드

## 📋 실행 순서

### 1. Supabase Dashboard 접속
```
URL: https://pzjedtgqrqcipfmtkoce.supabase.co
→ SQL Editor 메뉴 선택
```

### 2. JobsClass 스키마 실행

**파일**: `jobsclass_schema.sql` 전체 내용 복사해서 실행

**포함 내용**:
- ✅ 9개 테이블 생성
- ✅ 인덱스 생성
- ✅ 트리거 3개 (통계 자동 업데이트)

### 3. 실행 후 확인

```sql
-- 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'partner_profiles',
  'services', 
  'clients',
  'orders',
  'service_reviews',
  'carts',
  'notifications',
  'payouts',
  'coupons'
);

-- 결과: 9개 테이블이 모두 나와야 함
```

---

## 🔧 다음 단계

스키마 적용이 완료되면 자동으로 다음 작업 진행:

1. ✅ 파트너 회원가입 API 구현
2. ✅ 파트너 대시보드 레이아웃
3. ✅ 서비스 등록 폼 (7가지 유형)
4. ✅ 서비스 목록 페이지

---

## ⚠️ 주의사항

- **기존 데이터 백업**: 혹시 기존 테이블이 있다면 백업 필요
- **이름 충돌**: 동일한 테이블명이 있으면 에러 발생
- **권한 확인**: Service Role Key가 있어야 실행 가능

---

**준비되면 "완료" 또는 "다음"이라고 말씀해주세요!**
