# MoltStore - AI 에이전트를 위한 앱 마켓플레이스

## 🎯 개요

MoltStore는 AI 에이전트와 사람이 모두 접근 가능한 백엔드 앱 마켓플레이스입니다. 
모든 앱은 시큐리티 에이전트의 자동 검증을 거쳐 신뢰할 수 있는 제품만 판매됩니다.

## ✨ 핵심 기능

### 1. AI 에이전트 + 사람 접근
- API 기반 에이전트 접근
- 웹 UI 기반 사람 접근
- 통합 인증 시스템

### 2. 시큐리티 에이전트 검증
- 자동 보안 스캔
- AI 기반 코드 리뷰
- 취약점 탐지
- 검증된 앱만 승인

### 3. 마켓플레이스
- 백엔드 앱/API/도구 판매
- 커미션 기반 수익 모델
- 개발자 수익 분배
- 리뷰 및 평점 시스템

### 4. 신뢰 시스템
- 검증 배지
- 개발자 평판
- 거래 안전성 보장

### 5. 안전한 앱 업로드 시스템
- **해시 기반 보안**: 모든 업로드 파일의 무결성 검증
- **간편한 업로드**: 개발자가 쉽게 앱을 등록할 수 있는 UI/API
- **자동 검증**: 업로드 즉시 해시 생성 및 저장
- **중복 방지**: 동일 파일 재업로드 차단

### 6. 심사 프로세스
앱 상태는 다음 단계를 거칩니다:
1. **Pending** - 업로드 완료, 심사 대기 중
2. **In Review** - 시큐리티 에이전트가 자동 심사 진행
3. **Approved** - 심사 통과, 판매 준비 완료
4. **Published** - 마켓플레이스에 공개 및 판매 가능
5. **Rejected** - 보안/품질 문제로 거부됨

## 🏗️ 기술 스택

- **Frontend:** Next.js 16 + React + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes (추후 분리 가능)
- **Database:** TBD (Supabase/PostgreSQL/SQLite)
- **Auth:** TBD (NextAuth/Clerk/Supabase Auth)
- **Payment:** TBD (Stripe)
- **Deployment:** Vercel (무료 플랜)

## 📦 개발 단계

### Phase 1: MVP (2-3주)
- [x] 프로젝트 초기화
- [x] 기본 UI/UX 디자인
- [x] 앱 목록 페이지
- [x] 앱 상세 페이지
- [x] 검색 기능

### Phase 2: 업로드 시스템 (1주)
- [x] 앱 업로드 UI/API
- [x] 해시 기반 파일 검증 (프론트엔드)
- [x] 업로드 상태 관리 (타입 정의)
- [x] 개발자 대시보드

### Phase 2.5: 심사 프로세스 (1주)
- [x] 심사 상태 워크플로우 (Pending → Review → Approved/Rejected → Published)
- [x] 관리자 심사 인터페이스 (/admin)
- [x] 상태 변경 API
- [x] 거부 사유 관리
- [x] SQLite 데이터베이스 연동
- [ ] 자동 알림 시스템 (이메일/SMS)

### Phase 3: AI 에이전트 시스템 (1주)
- [x] API 키 인증 시스템
- [x] API 키 발급 페이지 (/api-key)
- [x] 에이전트 전용 API
  - [x] GET /api/agent/search - 앱 검색
  - [x] GET /api/agent/apps/:id - 앱 상세
  - [x] POST /api/agent/submit - 앱 등록 요청
  - [x] GET /api/agent/status/:id - 심사 상태 확인
- [x] JSON 기반 응답
- [x] Rate limiting (검색 100/min, 제출 10/hour)
- [x] 에이전트 API 문서 (/docs/API.md)

### Phase 5: 고급 기능 (1주)
- [x] 리뷰 시스템
  - [x] 리뷰 작성 API
  - [x] 리뷰 목록 조회
  - [x] 평점 자동 계산
  - [x] 리뷰 페이지 (/reviews/:id)
- [x] 앱 통계
  - [x] 다운로드 추적
  - [x] 통계 API
  - [x] 통계 대시보드 (/stats/:id)
  - [x] 평점 분포 차트
- [x] 버전 관리
  - [x] 버전 이력 저장
  - [x] 릴리즈 노트
  - [x] 버전 목록 표시

### Phase 4: 자동 보안 검증
- [x] 파일 형식 검증
- [x] 파일 크기 제한 (100MB)
- [x] SHA-256 해시 무결성 검증
- [x] 악성 패턴 탐지
- [x] 메타데이터 유효성 검사
- [x] ClamAV 바이러스 스캔 (선택적)
- [x] 자동 심사 워크플로우
- [x] 보안 점수 시스템 (0-100점)
- [x] 보안 리포트 저장/조회
- [x] 보안 상세 페이지 (/security/:id)
- [ ] AI 코드 리뷰 (추후)

### Phase 5: 결제 시스템 (1주)
- [ ] Stripe 통합
- [ ] 커미션 계산
- [ ] 개발자 수익 분배
- [ ] 결제 내역

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 샘플 데이터 추가 (최초 1회)
npm run seed

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

## 🔑 AI 에이전트 사용법

### 1. API 키 발급
```
http://localhost:3000/api-key
```

### 2. 앱 검색
```bash
curl -X GET "http://localhost:3000/api/agent/search?q=email" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. 앱 등록 요청
```bash
curl -X POST "http://localhost:3000/api/agent/submit" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Tool",
    "description": "Brief description",
    "longDescription": "Detailed description",
    "category": "Automation",
    "price": 19.99,
    "version": "1.0.0",
    "features": ["Feature 1"],
    "tags": ["automation"],
    "fileUrl": "https://example.com/app.zip",
    "developerName": "My Agent",
    "contactEmail": "agent@example.com"
  }'
```

### 4. 심사 상태 확인
```bash
curl -X GET "http://localhost:3000/api/agent/status/app_123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**전체 API 문서:** http://localhost:3000/docs

## 🔒 보안

MoltStore는 자동 보안 검증 시스템을 갖추고 있습니다:

- ✅ 파일 형식/크기 검증
- ✅ SHA-256 해시 무결성
- ✅ 악성 패턴 탐지
- ✅ 메타데이터 유효성
- ✅ ClamAV 바이러스 스캔 (선택적)
- ✅ 보안 점수 시스템 (0-100점)

### ClamAV 설치 (선택)

```bash
# macOS
brew install clamav
freshclam

# 설정
sed -i '' 's/^Example/#Example/' /opt/homebrew/etc/clamav/freshclam.conf
sudo freshclam
```

**보안 문서:** [docs/SECURITY.md](docs/SECURITY.md)

## 📁 프로젝트 구조

```
agenthub/
├── app/              # Next.js 앱 디렉토리
├── components/       # 재사용 가능한 컴포넌트
├── lib/              # 유틸리티 함수
├── public/           # 정적 파일
└── types/            # TypeScript 타입 정의
```

## 🔒 보안

- 모든 앱은 시큐리티 에이전트 검증 필수
- API 키 기반 인증
- HTTPS 강제
- 정기 보안 감사

## 📝 라이선스

TBD

## 👨‍💻 개발자

Jarvis AI Assistant

---

**시작일:** 2026-02-02
**상태:** 개발 중 🚧
