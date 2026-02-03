# 🚀 MoltStore 배포 체크리스트

## ✅ 완료된 작업

### 1. Supabase 마이그레이션 준비
- ✅ PostgreSQL 스키마 작성 (`supabase/migrations/001_init_schema.sql`)
- ✅ 함수 및 트리거 작성 (`supabase/migrations/002_functions.sql`)
- ✅ Supabase 클라이언트 설정 (`lib/supabase.ts`)
- ✅ DB 레이어 Supabase용으로 변환 (`lib/db.ts`)
- ✅ Seed 스크립트 async/await 변환
- ✅ 환경 변수 템플릿 작성 (`.env.local`)
- ✅ 설정 가이드 문서 작성 (`SUPABASE_SETUP.md`)

---

## 🔄 다음 단계

### 2. Supabase 프로젝트 설정
- [ ] Supabase 대시보드 로그인
- [ ] 프로젝트 ID 확인
- [ ] API 키 수집 (Anon, Service Role)
- [ ] `.env.local` 파일에 실제 값 입력

### 3. 데이터베이스 초기화
- [ ] SQL Editor에서 `001_init_schema.sql` 실행
- [ ] SQL Editor에서 `002_functions.sql` 실행
- [ ] 테이블 생성 확인

### 4. 로컬 테스트
```bash
cd /Users/ivan/clawd/agenthub

# 환경 변수 확인
cat .env.local

# 개발 서버 실행
npm run dev

# 새 터미널에서 샘플 데이터 추가
npm run seed
npm run seed:reviews
```

- [ ] http://localhost:3000 접속
- [ ] 홈페이지 로드 확인
- [ ] 앱 목록 표시 확인
- [ ] 앱 상세 페이지 확인
- [ ] 업로드 페이지 확인
- [ ] 관리자 페이지 확인

### 5. Vercel 배포
```bash
# Vercel 로그인
vercel login

# 프로젝트 링크
vercel link

# 환경 변수 설정 (Vercel Dashboard에서)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 프로덕션 배포
vercel --prod
```

- [ ] Vercel 환경 변수 설정
- [ ] 프로덕션 배포
- [ ] 배포 URL 확인

### 6. 배포 후 검증
- [ ] 프로덕션 URL 접속
- [ ] 모든 페이지 로드 확인
- [ ] 업로드 기능 테스트
- [ ] 리뷰 작성 테스트
- [ ] API 엔드포인트 테스트
- [ ] 에러 로그 확인 (Vercel/Supabase)

---

## 📝 환경 변수 체크리스트

### 로컬 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:AMKogqTV6yle8TUv@db.[PROJECT_ID].supabase.co:5432/postgres
```

### Vercel (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

---

## 🔒 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용
- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] API 엔드포인트에 Rate Limiting 적용
- [ ] Vercel 환경 변수는 암호화됨
- [ ] Supabase RLS (Row Level Security) 검토 (선택)

---

## 📊 모니터링 설정

### Supabase Dashboard
- [ ] Database 탭: 테이블 확인
- [ ] API 탭: 요청 모니터링
- [ ] Logs 탭: 에러 추적
- [ ] Performance 탭: 쿼리 성능

### Vercel Dashboard
- [ ] Deployments: 배포 상태
- [ ] Analytics: 트래픽 분석
- [ ] Logs: Runtime 로그
- [ ] Performance: 페이지 속도

---

## 🎯 성공 기준

배포가 성공적으로 완료되면:

✅ **기능:**
- 홈페이지에서 앱 목록이 표시됨
- 앱 검색이 동작함
- 앱 상세 페이지가 로드됨
- 리뷰 작성이 가능함
- 관리자 페이지에서 심사가 가능함

✅ **성능:**
- 페이지 로드 < 2초
- API 응답 < 500ms
- 에러율 < 1%

✅ **보안:**
- HTTPS 적용
- 환경 변수 안전하게 관리
- 민감 정보 노출 없음

---

## 🐛 문제 해결

### "Missing Supabase environment variables"
→ `.env.local` 파일 확인

### "Failed to fetch"
→ Supabase URL/키 확인, 네트워크 확인

### 테이블이 없음
→ SQL 마이그레이션 파일 실행 확인

### Vercel 배포 실패
→ 환경 변수 설정 확인, 로그 확인

---

## 📚 참고 문서

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Docs](https://supabase.com/docs)

---

**현재 진행 상태:** Step 1 완료 ✅  
**다음 작업:** Step 2 - Supabase 프로젝트 설정
