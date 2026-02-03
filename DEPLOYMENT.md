# MoltStore - Vercel 배포 가이드

## 사전 준비

### 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 이름: `moltstore`
4. 데이터베이스 비밀번호 설정 (저장!)
5. Region: `Northeast Asia (Seoul)` 선택
6. 프로젝트 생성 (약 2분 소요)

### 2. Supabase 데이터베이스 설정

1. 프로젝트 대시보드에서 **SQL Editor** 클릭
2. `supabase/schema.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. "RUN" 클릭하여 실행
5. 완료 확인

### 3. Supabase API 키 확인

1. 프로젝트 대시보드에서 **Settings** → **API** 클릭
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key** (secret): `eyJhbGci...`

⚠️ **중요**: `service_role` 키는 절대 공개하지 마세요!

---

## Vercel 배포

### 1. Vercel 계정 연동

```bash
# Vercel CLI 설치 (전역)
npm i -g vercel

# 로그인
vercel login
```

### 2. 프로젝트 초기화

```bash
cd /Users/ivan/clawd/agenthub

# Vercel 프로젝트 연결
vercel
```

질문에 답변:
- Set up and deploy? **Y**
- Which scope? (본인 계정 선택)
- Link to existing project? **N**
- What's your project's name? `moltstore`
- In which directory? `./`
- Want to override settings? **N**

### 3. 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택 → **Settings** → **Environment Variables**
2. 다음 변수들 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

또는 CLI로:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 값 입력: https://xxxxx.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 값 입력: eyJhbGci...
```

### 4. 배포

```bash
# 프로덕션 배포
vercel --prod
```

배포 완료! 🎉

URL: `https://moltstore-xxxxx.vercel.app`

---

## 배포 후 확인

### 1. 앱 목록 확인
```
https://your-domain.vercel.app/apps
```

### 2. API 테스트
```bash
# API 키 발급
curl https://your-domain.vercel.app/api/auth/api-key \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "developerName": "Test User",
    "developerEmail": "test@example.com"
  }'

# 앱 검색
curl https://your-domain.vercel.app/api/agent/search?q=email \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 도메인 연결 (선택)

### Vercel 대시보드에서:
1. **Settings** → **Domains**
2. 도메인 추가 (예: `moltstore.com`)
3. DNS 설정 (A 레코드 또는 CNAME)
4. 확인 대기 (최대 24시간)

---

## 문제 해결

### 데이터베이스 연결 오류
- Supabase URL과 키가 정확한지 확인
- 환경 변수가 프로덕션에 설정되었는지 확인
- Vercel 로그 확인: `vercel logs`

### 빌드 실패
```bash
# 로컬 빌드 테스트
npm run build

# 오류 확인 후 수정
```

### API 응답 없음
- Vercel Functions 로그 확인
- Network 탭에서 요청/응답 확인
- CORS 설정 확인 (Next.js는 자동 처리)

---

## 추가 설정 (선택)

### Vercel Blob 파일 스토리지

1. Vercel 대시보드 → **Storage** → **Create Database**
2. **Blob** 선택
3. 환경 변수 자동 추가됨

파일 업로드가 Vercel Blob으로 자동 전환됩니다.

---

## 로컬 개발

로컬에서는 SQLite를 사용하므로 환경 변수 없이도 동작합니다.

```bash
npm run dev
# http://localhost:3000
```

프로덕션 환경 변수로 테스트하려면:
```bash
# .env.local 생성
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

npm run dev
```

---

## 모니터링

### Vercel Analytics
- Vercel 대시보드에서 자동 제공
- 트래픽, 성능, 오류 모니터링

### Supabase Logs
- Supabase 대시보드 → **Logs**
- 쿼리 성능, 오류 확인

---

## 업데이트

```bash
# 코드 수정 후
git add .
git commit -m "Update features"
git push

# 또는 직접 배포
vercel --prod
```

Vercel은 GitHub 연동 시 자동 배포됩니다.

---

**배포 완료!** 🚀

문의: support@moltstore.com
