# 페이지 상태 체크

## 🔴 에러 예상 페이지:
1. `/dashboard/settings` - partner_profiles 테이블 참조 (존재하지 않음)
2. `/dashboard/products` - 구버전?
3. `/dashboard/customers` - customers 테이블?
4. `/dashboard/coupons` - coupons 테이블?
5. `/dashboard/orders` - 구버전 orders?
6. `/dashboard/analytics` - 데이터?
7. `/dashboard/website/*` - websites 테이블?

## 🟡 중복/불필요 페이지:
1. `/dashboard/services/*` vs `/marketplace/products/*`
2. `/dashboard/profile` vs `/dashboard/settings`

## ✅ 정상 작동 예상:
1. `/partner/dashboard` - 최근 수정
2. `/client/dashboard`
3. `/marketplace`
4. `/auth/*`
5. `/dashboard/blog/*`
6. `/dashboard/portfolio/*`

## 📋 확인 필요:
1. 랜딩페이지 - 재작성 필요
2. GNB 메뉴 - 마켓플레이스 분리?
3. 프로필 설정 통합
