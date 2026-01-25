# 🚀 Vercel 배포 가이드

## ❌ 현재 에러 원인

배포 실패의 가장 흔한 원인:
1. **환경 변수 누락** - Vercel에 환경 변수가 설정되지 않음
2. **빌드 명령어 오류** - Vercel 설정 불일치
3. **의존성 문제** - Node.js 버전 불일치

---

## ✅ 해결 방법

### 1️⃣ Vercel 대시보드에서 환경 변수 설정

**접속:** https://vercel.com/jobsclass/corefy/settings/environment-variables

**필수 환경 변수 7개를 추가하세요:**

#### Supabase 설정 (3개)
```
NEXT_PUBLIC_SUPABASE_URL=https://pzjedtgqrqcipfmtkoce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6amVkdGdxcnFjaXBmbXRrb2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjgxNTcsImV4cCI6MjA1Mjk0NDE1N30.3_dJRI0aeUxH48xD33eXo0KVDE0O3BxJJRPZY8YVCSU
SUPABASE_SERVICE_ROLE_KEY=(Supabase 대시보드에서 확인)
```

#### JWT & 앱 설정 (2개)
```
JWT_SECRET=(랜덤 문자열 32자 이상)
NEXT_PUBLIC_APP_URL=https://corefy.vercel.app
```

#### Toss Payments (2개) - 선택사항
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=(결제 연동 시 필요)
TOSS_SECRET_KEY=(결제 연동 시 필요)
```

**중요:**
- 모든 환경 변수는 `Production`, `Preview`, `Development` 모두 체크
- 저장 후 **Redeploy** 클릭

---

### 2️⃣ Vercel 프로젝트 설정 확인

**접속:** https://vercel.com/jobsclass/corefy/settings/general

#### Build & Development Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

#### Node.js 버전
```
Node.js Version: 18.x (권장) 또는 20.x
```

---

### 3️⃣ 재배포 실행

**방법 1: Git Push로 자동 배포**
```bash
cd /home/user/webapp
git add -A
git commit -m "fix: Vercel 배포 설정 수정"
git push origin main
```

**방법 2: Vercel 대시보드에서 수동 배포**
1. https://vercel.com/jobsclass/corefy
2. "Deployments" 탭
3. 최신 배포 클릭
4. "Redeploy" 버튼 클릭

---

## 🔍 배포 로그 확인

**배포 실패 시 로그 확인:**
1. https://vercel.com/jobsclass/corefy/deployments
2. 실패한 배포 클릭
3. "Building" 탭에서 에러 메시지 확인
4. "Runtime Logs" 탭에서 실행 에러 확인

**흔한 에러 메시지:**
- `Error: Cannot find module` → 의존성 설치 실패
- `Error: Missing environment variables` → 환경 변수 누락
- `Error: Build failed` → 빌드 시 TypeScript/ESLint 에러

---

## 📋 체크리스트

배포 전 확인사항:

- [ ] Supabase 환경 변수 3개 설정
- [ ] JWT_SECRET 설정 (32자 이상)
- [ ] NEXT_PUBLIC_APP_URL 설정
- [ ] 모든 환경 변수에 Production/Preview/Development 체크
- [ ] 로컬 빌드 테스트 성공 (`npm run build`)
- [ ] Git 커밋 & Push 완료
- [ ] Vercel 자동 배포 트리거 확인

---

## 🎯 빠른 수정 방법

### JWT_SECRET 생성
```bash
# 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 환경 변수 일괄 설정 (Vercel CLI)
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add JWT_SECRET production
```

---

## ⚠️ 주의사항

1. **환경 변수는 절대 Git에 커밋하지 마세요**
   - `.env.local`은 `.gitignore`에 포함되어 있음
   
2. **NEXT_PUBLIC_* 접두사**
   - 클라이언트에서 접근 가능한 변수
   - Supabase URL, Anon Key 등

3. **비밀 키는 서버에서만 사용**
   - SUPABASE_SERVICE_ROLE_KEY
   - TOSS_SECRET_KEY
   - JWT_SECRET

---

## 🚀 배포 성공 후

배포 성공 시:
- **Production URL:** https://corefy.vercel.app
- **Custom Domain 설정:** Vercel 대시보드 → Domains

**테스트:**
1. 회원가입/로그인 작동 확인
2. 대시보드 접속 확인
3. 데이터베이스 연결 확인
4. 파일 업로드 기능 테스트

---

## 📞 도움이 필요하면

1. Vercel 배포 로그 확인
2. 에러 메시지 스크린샷
3. 환경 변수 설정 확인 (값은 가리고)

그러면 구체적으로 도와드리겠습니다! 🎉
