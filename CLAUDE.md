# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

GitHub Pages로 배포되는 정적 포트폴리오 사이트입니다. 빌드 과정 없이 `index.html`을 main 브랜치에 push하면 자동 배포됩니다.

## 배포

```bash
git add .
git commit -m "docs: <변경 내용>"
git push origin main
```

GitHub Actions 없이 GitHub Pages가 파일을 직접 서빙합니다.

## 파일 구조

- `index.html` — 전체 포트폴리오 (CSS·JS 인라인 포함, 단일 파일)
- `*.png` — 아키텍처 다이어그램 및 CloudWatch 스크린샷
- `malang-architecture.xml` — draw.io 형식의 AWS 아키텍처 원본 파일

## 코드 아키텍처

`index.html` 한 파일에 모든 콘텐츠가 포함되어 있습니다.

**CSS 구조 (인라인 `<style>`):**
- CSS custom properties로 테마 색상 관리 (`--primary`, `--danger`, `--warning`, `--success`)
- BEM 스타일 클래스 네이밍
- 반응형 브레이크포인트: `900px`

**JavaScript (인라인 `<script>`, Vanilla JS):**
- Intersection Observer — 스크롤 시 섹션 활성화 및 애니메이션 트리거
- 좌측 세로 점 네비게이션 (`#nav-dots`) 활성 상태 동기화
- 문제해결 섹션 아코디언 토글

**섹션 구조 (네비게이션 dot ID 기준):**
hero → malang → arch-m → infra-m → cicd-m → ops-m → ts-m → load-test → wattup → flood

새 섹션 추가 시 `#nav-dots`에 dot 항목과 대응하는 `<section id="...">` 을 함께 추가해야 합니다.

## 아키텍처 다이어그램 수정

`malang-architecture.xml`은 [draw.io](https://draw.io)에서 편집 후 PNG로 내보내 `malang_archi.png`를 교체합니다.
