# ⚠️ Vercel 배포 설정 수정 필요

## 현재 문제:
- Vercel이 `genspark_ai_developer` 브랜치로 자동 배포 중
- `main` 브랜치가 Production이 되어야 함

## 해결 방법:

### Option 1: Vercel Dashboard에서 수정 (권장)
1. https://vercel.com/dashboard 접속
2. JobsClass 프로젝트 선택
3. Settings → Git
4. **Production Branch** 변경:
   - 기존: `genspark_ai_developer`
   - 변경: `main`
5. Save

### Option 2: vercel.json 설정
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "genspark_ai_developer": false
    }
  }
}
```

## 이후 작업 흐름:
1. `genspark_ai_developer`에서 개발
2. PR 생성
3. `main`으로 머지
4. Vercel이 자동으로 Production 배포

---

## 📌 주의사항:
- 지금 즉시 Vercel 설정을 변경해야 합니다
- 현재는 개발 브랜치가 그대로 배포되고 있음
- `main` 브랜치로 변경 후 PR 머지하면 정상 배포됨
