# Supabase Setup Guide for MoltStore

## 📋 준비 사항

- ✅ Supabase 계정: yejinius@gmail.com
- ✅ 프로젝트: Moltstore
- ✅ DB 비밀번호: AMKogqTV6yle8TUv

---

## 1️⃣ Supabase 프로젝트 접속

### 웹 대시보드
https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]

### 필요한 정보 수집
1. **Project URL**: `https://[PROJECT_ID].supabase.co`
2. **Anon/Public Key**: Project Settings > API > `anon` `public`
3. **Service Role Key**: Project Settings > API > `service_role` (비밀!)

---

## 2️⃣ 데이터베이스 마이그레이션

### 방법 A: Supabase 대시보드 (추천)

1. 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: **Moltstore**
3. 좌측 메뉴: **SQL Editor** 클릭
4. **New Query** 클릭
5. 다음 SQL 파일 내용을 차례대로 실행:
   - `supabase/migrations/001_init_schema.sql`
   - `supabase/migrations/002_functions.sql`

### 방법 B: Supabase CLI (고급)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref [YOUR_PROJECT_ID]

# 마이그레이션 실행
supabase db push
```

---

## 3️⃣ 환경 변수 설정

`.env.local` 파일을 수정하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# Database Direct Connection (optional)
DATABASE_URL=postgresql://postgres:AMKogqTV6yle8TUv@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
```

**⚠️ 중요:**
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출 금지!
- `.env.local`은 `.gitignore`에 추가되어 있는지 확인

---

## 4️⃣ Row Level Security (RLS) 설정 (선택)

보안을 위해 RLS를 활성화할 수 있습니다:

```sql
-- Enable RLS on all tables
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;

-- Public read access for published apps
CREATE POLICY "Public can view published apps"
  ON apps FOR SELECT
  USING (status = 'published');

-- Service role has full access
CREATE POLICY "Service role has full access"
  ON apps FOR ALL
  USING (auth.role() = 'service_role');
```

**현재는 RLS 비활성화 상태로 진행** (서비스 로직으로 제어)

---

## 5️⃣ 샘플 데이터 추가

```bash
cd /Users/ivan/clawd/agenthub

# 기존 seed 스크립트를 Supabase용으로 실행
npm run seed        # 앱 샘플 데이터
npm run seed:reviews # 리뷰 샘플 데이터
```

**주의:** `scripts/seed.ts`가 Supabase를 사용하도록 수정 필요 (다음 단계)

---

## 6️⃣ 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저 접속
open http://localhost:3000
```

### 확인 사항
- ✅ 홈페이지 로드
- ✅ 앱 목록 표시
- ✅ 앱 상세 페이지
- ✅ 업로드 폼 동작
- ✅ 관리자 페이지 (/admin)

---

## 7️⃣ 배포 준비 (Vercel)

### Vercel 환경 변수 설정

Vercel Dashboard > Project > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

### 배포

```bash
# Vercel CLI 설치 (없다면)
npm install -g vercel

# 배포
vercel --prod
```

---

## 🔧 문제 해결

### 1. "Missing Supabase environment variables"
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인

### 2. "Failed to fetch"
- Supabase URL이 정확한지 확인
- 네트워크 연결 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 3. 테이블이 없음
- SQL Editor에서 마이그레이션 파일을 실행했는지 확인
- 에러 메시지 확인

### 4. RLS 에러
- 현재는 RLS 비활성화 상태로 진행
- 필요하면 나중에 활성화

---

## 📊 모니터링

### Supabase Dashboard
- **Database**: 테이블, 데이터 확인
- **SQL Editor**: 쿼리 실행
- **Logs**: 에러 로그 확인
- **API**: Usage, Performance

### 유용한 쿼리

```sql
-- 앱 통계
SELECT * FROM get_app_stats();

-- 최근 업로드
SELECT name, status, uploaded_at 
FROM apps 
ORDER BY uploaded_at DESC 
LIMIT 10;

-- 인기 앱
SELECT name, downloads, rating 
FROM apps 
WHERE status = 'published' 
ORDER BY downloads DESC 
LIMIT 10;
```

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성/확인
- [ ] 마이그레이션 파일 실행 (001, 002)
- [ ] `.env.local` 설정
- [ ] 코드 수정 완료 (lib/db.ts)
- [ ] seed 스크립트 수정
- [ ] 로컬 테스트
- [ ] Vercel 환경 변수 설정
- [ ] 프로덕션 배포
- [ ] 배포 후 테스트

---

**다음 단계:** Seed 스크립트를 Supabase용으로 수정하고 샘플 데이터를 추가합니다.
