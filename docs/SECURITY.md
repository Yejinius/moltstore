# MoltStore Security Guide

## 자동 보안 검증 시스템

MoltStore는 업로드된 모든 앱에 대해 자동 보안 검증을 수행합니다.

---

## 검증 항목

### 1. 파일 형식 검증 (20점)
- 허용된 형식: `.zip`, `.tar.gz`, `.tgz`, `.tar`
- 기타 실행 파일 형식 차단 (`.exe`, `.dll`, `.bat`, 등)

### 2. 파일 크기 검증 (15점)
- 최대 크기: 100MB
- 초과 시 자동 거부

### 3. 해시 무결성 검증 (20점)
- SHA-256 해시 자동 생성
- 업로드 후 재검증
- 파일 변조 탐지

### 4. 악성 패턴 검사 (25점)
- 의심스러운 파일명 패턴 탐지
- 악성 코드 키워드 검사
- 실행 파일 확장자 차단

### 5. 메타데이터 검증 (20점)
- 이름: 3-50자
- 설명: 10-500자
- 가격: 0-1000 USD
- 카테고리: 유효한 카테고리만 허용

---

## 보안 점수 기준

| 점수 | 결과 | 조치 |
|------|------|------|
| 100점 | 완벽 | 자동 승인 |
| 70-99점 | 양호 | 수동 심사 필요 |
| 0-69점 | 불량 | 자동 거부 |

---

## ClamAV 바이러스 스캔 (선택적)

### macOS 설치

```bash
# Homebrew로 설치
brew install clamav

# 바이러스 DB 업데이트
freshclam

# 설정 파일 생성
cp /opt/homebrew/etc/clamav/freshclam.conf.sample /opt/homebrew/etc/clamav/freshclam.conf
cp /opt/homebrew/etc/clamav/clamd.conf.sample /opt/homebrew/etc/clamav/clamd.conf

# freshclam.conf 수정 (Example 주석 제거)
sed -i '' 's/^Example/#Example/' /opt/homebrew/etc/clamav/freshclam.conf

# DB 업데이트
sudo freshclam
```

### 수동 스캔

```bash
# 파일 스캔
clamscan /path/to/file.zip

# 디렉토리 스캔
clamscan -r /path/to/directory

# 자세한 출력
clamscan -v /path/to/file.zip
```

### MoltStore 통합

ClamAV가 설치되어 있으면 자동으로 사용됩니다.
설치되어 있지 않으면 이 단계는 스킵됩니다.

```typescript
// lib/security.ts에서 자동으로 처리
const virusScanPassed = await scanWithClamAV(filePath)
```

---

## 보안 리포트 확인

### 관리자 페이지
```
http://localhost:3000/admin
```

각 앱의 보안 점수와 검증 결과를 확인할 수 있습니다.

### 보안 상세 리포트
```
http://localhost:3000/security/[appId]
```

개별 앱의 상세 보안 검증 결과를 볼 수 있습니다.

---

## API 보안

### Rate Limiting
- 검색: 100 requests/min
- 앱 제출: 10 requests/hour
- 상태 확인: 60 requests/min

### API 키 인증
모든 API 요청에 Bearer 토큰 필요:
```bash
Authorization: Bearer YOUR_API_KEY
```

### 자동 차단
- 악성 요청 탐지 시 API 키 자동 차단
- Rate limit 초과 시 429 에러

---

## 보안 모범 사례

### 개발자용
1. **HTTPS URL 사용**: 파일 URL은 반드시 HTTPS 사용
2. **정확한 해시 제공**: SHA-256 해시를 정확히 계산
3. **검증된 패키지**: 신뢰할 수 있는 소스의 파일만 제출
4. **버전 관리**: 업데이트 시 릴리즈 노트 작성

### 사용자용
1. **검증된 앱만 다운로드**: 보안 배지 확인
2. **리뷰 확인**: 다른 사용자의 피드백 참고
3. **정기 업데이트**: 최신 버전 유지
4. **의심 신고**: 문제 발견 시 즉시 신고

---

## 보안 사고 대응

### 문제 발견 시
1. **즉시 보고**: security@moltstore.com
2. **상세 설명**: 재현 가능한 정보 제공
3. **증거 보존**: 스크린샷, 로그 첨부

### 대응 절차
1. 48시간 내 확인
2. 즉시 해당 앱 비공개 전환
3. 보안 패치 적용
4. 공지 및 사과

---

## 추가 보안 기능 (예정)

- [ ] 실시간 악성 코드 스캔
- [ ] 샌드박스 자동 실행 테스트
- [ ] 의존성 취약점 검사
- [ ] 2FA (Two-Factor Authentication)
- [ ] IP 기반 접근 제한
- [ ] 감사 로그 (Audit Log)

---

**마지막 업데이트:** 2026-02-02  
**보안 정책 버전:** 1.0
