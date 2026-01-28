#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Main 브랜치 동기화 시작...${NC}"

# 1. 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}📍 현재 브랜치: ${CURRENT_BRANCH}${NC}"

# 2. genspark_ai_developer 최신화
echo -e "${YELLOW}📥 genspark_ai_developer 최신화...${NC}"
git checkout genspark_ai_developer
git pull origin genspark_ai_developer

# 3. main 브랜치로 전환
echo -e "${YELLOW}🔀 main 브랜치로 전환...${NC}"
git checkout main

# 4. main 최신화
echo -e "${YELLOW}📥 main 브랜치 최신화...${NC}"
git pull origin main

# 5. genspark_ai_developer를 main에 머지
echo -e "${YELLOW}🔗 genspark_ai_developer → main 머지...${NC}"
git merge genspark_ai_developer --no-edit

# 6. main을 원격에 푸시
echo -e "${YELLOW}📤 main 브랜치 푸시...${NC}"
git push origin main

# 7. 다시 작업 브랜치로 돌아가기
echo -e "${YELLOW}🔙 ${CURRENT_BRANCH} 브랜치로 복귀...${NC}"
git checkout ${CURRENT_BRANCH}

echo -e "${GREEN}✅ 동기화 완료!${NC}"
echo -e "${GREEN}🌐 Vercel 배포: https://jobsclass.vercel.app${NC}"
