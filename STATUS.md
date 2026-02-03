# MoltStore - 프로젝트 현황

**마지막 업데이트:** 2026-02-02

---

## ✅ 완료된 기능

### Phase 1: MVP
- ✅ 기본 UI/UX 디자인
- ✅ 앱 목록 페이지 (/apps)
- ✅ 앱 상세 페이지 (/apps/:id)
- ✅ 검색 및 필터링
- ✅ 카테고리별 분류

### Phase 2: 업로드 시스템
- ✅ 앱 업로드 UI (/upload)
- ✅ 파일 해시 검증 (SHA-256)
- ✅ 업로드 상태 관리
- ✅ 개발자 대시보드 (/dashboard)
- ✅ SQLite 데이터베이스 연동

### Phase 2.5: 심사 프로세스
- ✅ 심사 상태 워크플로우 (Pending → In Review → Approved → Published / Rejected)
- ✅ 관리자 심사 인터페이스 (/admin)
- ✅ 상태 변경 API
- ✅ 거부 사유 관리
- ✅ 실시간 통계

### Phase 3: AI 에이전트 시스템
- ✅ API 키 인증 시스템
- ✅ API 키 발급 페이지 (/api-key)
- ✅ 에이전트 전용 API:
  - GET /api/agent/search - 앱 검색
  - GET /api/agent/apps/:id - 앱 상세
  - POST /api/agent/submit - 앱 등록 요청
  - GET /api/agent/status/:id - 심사 상태 확인
- ✅ Rate limiting (검색 100/min, 제출 10/hour)
- ✅ JSON 기반 응답
- ✅ 에이전트 API 문서 (/docs/API.md)
- ✅ 웹 문서 페이지 (/docs)

### Phase 4: 자동 보안 검증
- ✅ 파일 검증 시스템
  - 파일 형식 검증 (ZIP, TAR.GZ)
  - 파일 크기 제한 (100MB)
  - SHA-256 해시 무결성
  - 악성 패턴 탐지
- ✅ 메타데이터 검증
  - 이름/설명/가격/카테고리 유효성
- ✅ 보안 점수 시스템 (0-100점)
  - 자동 승인 (100점)
  - 수동 심사 (70-99점)
  - 자동 거부 (0-69점)
- ✅ ClamAV 바이러스 스캔 (선택적)
- ✅ 자동 심사 워크플로우
- ✅ 보안 리포트 저장/조회
- ✅ 보안 상세 페이지 (/security/:id)

### Phase 5: 고급 기능
- ✅ 리뷰 시스템
  - 리뷰 작성/조회 API
  - 평점 자동 계산
  - 리뷰 페이지 (/reviews/:id)
  - 평점 분포 시각화
- ✅ 앱 통계
  - 다운로드 추적
  - 통계 API
  - 통계 대시보드 (/stats/:id)
  - 다운로드/리뷰 통계
- ✅ 버전 관리
  - 버전 이력 저장
  - 릴리즈 노트
  - 버전 목록 표시

---

## 🔒 보안 기능

- ✅ SHA-256 파일 해시 검증
- ✅ API 키 기반 인증
- ✅ Rate limiting (DDoS 방지)
- ✅ 파일 무결성 보장
- ✅ SQL Injection 방지 (Prepared Statements)
- ✅ 샌드박스 격리 (개념적)

---

## 📁 프로젝트 구조

```
moltstore/
├── app/                    # Next.js 앱 디렉토리
│   ├── page.tsx           # 메인 페이지
│   ├── apps/              # 앱 목록/상세
│   ├── upload/            # 앱 업로드
│   ├── dashboard/         # 개발자 대시보드
│   ├── admin/             # 관리자 심사 페이지
│   ├── api-key/           # API 키 발급
│   ├── docs/              # API 문서 페이지
│   └── api/               # API 엔드포인트
│       ├── upload/        # 파일 업로드
│       ├── apps/          # 앱 조회
│       ├── admin/         # 관리자 API
│       ├── developer/     # 개발자 API
│       ├── agent/         # 에이전트 API
│       │   ├── search/    # 검색
│       │   ├── apps/      # 앱 상세
│       │   ├── submit/    # 앱 제출
│       │   └── status/    # 심사 상태
│       └── auth/          # 인증
│           └── api-key/   # API 키 발급
├── lib/                   # 라이브러리
│   ├── db.ts             # 데이터베이스 (SQLite)
│   └── auth.ts           # 인증 및 Rate Limiting
├── data/                  # 데이터
│   ├── sample-apps.ts    # 샘플 앱 데이터
│   └── moltstore.db      # SQLite 데이터베이스
├── docs/                  # 문서
│   └── API.md            # AI 에이전트 API 문서
├── scripts/              # 유틸리티 스크립트
│   └── seed.ts           # 샘플 데이터 생성
└── uploads/              # 업로드 파일 저장소
```

---

## 🚧 다음 단계 (비용 없이 진행 가능)

### Phase 6: 추가 보안 기능
- [ ] 의존성 취약점 검사
- [ ] 자동 샌드박스 테스트
- [ ] 실시간 위협 모니터링
- [ ] 2FA (Two-Factor Authentication)

### Phase 7: 추가 고급 기능
- [ ] 사용자 인증 (OAuth)
- [ ] 개발자 프로필
- [ ] 앱 카테고리 확장
- [ ] 검색 필터 개선
- [ ] 앱 비교 기능
- [ ] 위시리스트
- [ ] 앱 추천 시스템 (AI 기반)

---

## 💰 비용 필요한 기능 (나중에)

### Phase 6: 결제 시스템
- [ ] Stripe 연동
- [ ] 구매 프로세스
- [ ] 수익 분배
- [ ] 환불 처리
- [ ] 인보이스 생성

### Phase 7: 인프라
- [ ] 프로덕션 배포 (Vercel/AWS)
- [ ] CDN 설정
- [ ] 이메일 서비스 (SendGrid)
- [ ] 모니터링 (Sentry)
- [ ] 로깅 (LogRocket)

---

## 📊 현재 상태

- **데이터베이스:** SQLite (로컬)
- **파일 저장소:** 로컬 파일 시스템 (/uploads)
- **인증:** API 키 기반
- **보안:** Rate limiting, 해시 검증
- **샘플 앱:** 6개 (seeded)

---

## 🎯 핵심 가치

1. **AI 에이전트 친화적** - 에이전트가 직접 앱을 검색, 등록, 구매 가능
2. **보안 우선** - 모든 앱은 자동 검증 및 심사
3. **개발자 친화적** - 간편한 업로드 및 심사 프로세스
4. **확장 가능** - 모듈화된 구조로 기능 추가 용이

---

## 🔗 주요 링크

- **메인 페이지:** http://localhost:3000
- **앱 목록:** http://localhost:3000/apps
- **앱 업로드:** http://localhost:3000/upload
- **개발자 대시보드:** http://localhost:3000/dashboard
- **관리자 페이지:** http://localhost:3000/admin
- **API 키 발급:** http://localhost:3000/api-key
- **API 문서:** http://localhost:3000/docs
- **앱 통계:** http://localhost:3000/stats/[id]
- **앱 리뷰:** http://localhost:3000/reviews/[id]
- **보안 리포트:** http://localhost:3000/security/[id]

---

**개발자:** Jarvis AI Assistant  
**시작일:** 2026-02-02  
**마지막 업데이트:** 2026-02-02 18:00  
**상태:** 개발 중 (Phase 4, 5 완료) 🔒✨
