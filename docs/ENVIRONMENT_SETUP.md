# ⚙️ 잡스빌드 환경 변수 설정 가이드

## 🎯 목적
잡스빌드를 로컬 또는 Vercel에 배포하기 위한 **필수 환경 변수** 설정 가이드입니다.

---

## 📋 필수 환경 변수 목록

### 1️⃣ Supabase 설정 (필수 ⭐⭐⭐⭐⭐)

\`\`\`bash
# Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon (공개) 키
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role (서버 전용) 키
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**어디서 찾나요?**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API**
4. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL`
5. **anon public** 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **service_role** 키 복사 → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2️⃣ JWT Secret (필수 ⭐⭐⭐⭐⭐)

\`\`\`bash
# JWT 토큰 암호화 키 (최소 32자)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_random_string
\`\`\`

**생성 방법**:
\`\`\`bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Maximum 256}))

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
\`\`\`

---

### 3️⃣ OpenAI API (필수 ⭐⭐⭐⭐⭐)

\`\`\`bash
# OpenAI API 키 (GPT-4o-mini + DALL-E 3)
OPENAI_API_KEY=sk-proj-...
\`\`\`

**어디서 발급받나요?**
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 및 로그인
3. **API Keys** → **Create new secret key**
4. 키 복사 후 안전하게 보관 (재조회 불가)

**비용**:
- GPT-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
- DALL-E 3: $0.040 / image (1024x1024, standard)

---

### 4️⃣ App URL (필수 ⭐⭐⭐⭐)

\`\`\`bash
# 로컬 개발
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel 배포 (배포 후 변경)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 커스텀 도메인 (나중에)
NEXT_PUBLIC_APP_URL=https://jobsbuild.com
\`\`\`

---

## 🚀 설정 방법

### 로컬 개발 환경

1. **`.env.local` 파일 생성**:
\`\`\`bash
cd /home/user/webapp
touch .env.local
\`\`\`

2. **환경 변수 작성**:
\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# OpenAI
OPENAI_API_KEY=sk-proj-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

3. **개발 서버 실행**:
\`\`\`bash
npm run dev
\`\`\`

---

### Vercel 배포

1. **Vercel Dashboard 접속**:
   - [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **프로젝트 선택** → **Settings** → **Environment Variables**

3. **모든 환경 변수 추가**:
   - Production ✓
   - Preview ✓
   - Development ✓

4. **Redeploy**:
   ```
   Deployments → ... → Redeploy
   ```

---

## ⚠️ 보안 주의사항

### ✅ DO (해야 할 것)
- ✓ `.env.local`을 `.gitignore`에 추가 (이미 추가됨)
- ✓ `SUPABASE_SERVICE_ROLE_KEY`는 **서버 전용**만 사용
- ✓ `OPENAI_API_KEY`는 **절대 클라이언트에 노출 금지**
- ✓ JWT_SECRET은 최소 32자 이상, 랜덤 문자열

### ❌ DON'T (하지 말아야 할 것)
- ✗ `.env.local` 파일을 Git에 커밋
- ✗ API 키를 코드에 하드코딩
- ✗ 공개 저장소에 키 노출
- ✗ 같은 키를 여러 환경에서 재사용

---

## 🧪 환경 변수 검증

### 자동 검증 스크립트

파일: `scripts/check-env.js` (생성 필요)

\`\`\`javascript
// scripts/check-env.js
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'OPENAI_API_KEY',
]

console.log('🔍 환경 변수 검증 시작...\n')

let missingVars = []

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.log(`❌ ${envVar}: 누락`)
    missingVars.push(envVar)
  } else {
    console.log(`✅ ${envVar}: 설정됨`)
  }
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━')

if (missingVars.length > 0) {
  console.error(`\n⚠️  ${missingVars.length}개 환경 변수 누락!`)
  console.error('누락된 변수:', missingVars.join(', '))
  process.exit(1)
} else {
  console.log('\n✅ 모든 환경 변수 설정 완료!')
}
\`\`\`

**실행**:
\`\`\`bash
node scripts/check-env.js
\`\`\`

---

## 📖 환경별 설정 예시

### 개발 환경 (.env.local)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev
JWT_SECRET=dev_secret_min_32_chars_random_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-...dev
\`\`\`

### 프로덕션 환경 (Vercel)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...prod
SUPABASE_SERVICE_ROLE_KEY=eyJ...prod
JWT_SECRET=prod_secret_min_32_chars_random_string
NEXT_PUBLIC_APP_URL=https://jobsbuild.vercel.app
OPENAI_API_KEY=sk-proj-...prod
\`\`\`

---

## 🔧 트러블슈팅

### 문제: "Supabase client error"
**해결**:
1. `NEXT_PUBLIC_SUPABASE_URL` 형식 확인 (https://)
2. 키 앞뒤 공백 제거
3. Supabase 프로젝트가 활성 상태인지 확인

### 문제: "OpenAI API key not found"
**해결**:
1. 키 유효성 확인 (sk-proj-로 시작)
2. OpenAI 계정에 크레딧 있는지 확인
3. API 키 권한 확인

### 문제: "JWT validation failed"
**해결**:
1. `JWT_SECRET` 길이 확인 (최소 32자)
2. 특수문자 이스케이프 확인
3. 환경 재시작

---

## 📚 추가 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [OpenAI API 가이드](https://platform.openai.com/docs)
- [Next.js 환경 변수](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

---

**최종 업데이트**: 2026-01-25  
**문의**: GitHub Issues 또는 팀 채널
