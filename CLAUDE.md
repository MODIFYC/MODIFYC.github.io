# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

GitHub Pages로 배포되는 정적 포트폴리오 사이트입니다. 빌드 과정 없이 파일을 main 브랜치에 push하면 자동 배포됩니다.

## 배포

```bash
git add .
git commit -m "docs: <변경 내용>"
git push origin main
```

GitHub Actions 없이 GitHub Pages가 파일을 직접 서빙합니다.

## 파일 구조

```
/index.html              — 루트 페이지 (히어로 + 프로젝트 요약 카드 4개 + 침수사고)
/style.css                — 전체 사이트 공용 스타일시트 (모든 페이지가 공유)
/wanderpool/index.html    — WanderPool 상세 페이지 + 관련 이미지
/malang/index.html        — 말랑이 메이커 상세 페이지 + 관련 이미지·xml
/wattup/index.html        — Wattup 상세 페이지 + 관련 이미지
/flood/index.html         — 침수사고 상세 페이지
```

각 프로젝트 폴더 안에는 해당 프로젝트에서만 쓰는 이미지(아키텍처 다이어그램, 스크린샷 등)를 함께 둡니다. 여러 프로젝트가 공유하는 리소스는 없으므로 루트에는 `index.html`과 `style.css`만 남기고, 새 이미지를 추가할 때도 반드시 해당 프로젝트 폴더 안에 넣습니다.

## 라우팅 구조

루트 `index.html`은 각 프로젝트를 **요약 카드**(썸네일 + 태그 + 핵심 지표 + 하이라이트 4개 + "자세히 보기" 링크)로만 보여주고, 클릭하면 `/프로젝트명/index.html` 상세 페이지로 이동합니다. 침수사고만 예외적으로 분량이 적어 요약 카드는 있지만 상세 페이지(`/flood/index.html`)도 동일한 패턴을 따릅니다 — 즉 현재는 4개 프로젝트 모두 카드+상세페이지 구조로 통일되어 있습니다.

서브페이지에서 루트 CSS를 참조할 때는 `../style.css`, 서브페이지 내부 이미지는 같은 폴더에 있으므로 상대경로 없이 파일명만 사용합니다 (예: `<img src="overall.png">`).

## 코드 아키텍처

각 HTML 파일은 CSS·JS 없이 `<link rel="stylesheet" href="style.css">`(또는 `../style.css`)만 사용하고, 페이지별 JS는 인라인 `<script>`로 둡니다.

**CSS 구조 (`style.css`, 전체 페이지 공용):**
- CSS custom properties로 테마 색상 관리 (`--blue`, `--danger`, `--warn`, `--ok` 등)
- 반응형 브레이크포인트: `900px`
- 프로젝트 요약 카드 전용 클래스: `.pcard-top`(썸네일+본문 그리드), `.pthumb`(썸네일), `.phighlights`(하이라이트 리스트)
- 담당 범위 표기 클래스: `.scope-legend`, `.scope-tag.lead` / `.scope-tag.team`
- 네트워크 다이어그램: `.net-diagram`, `.net-box`, `.net-arrow`
- 이미지 업로드 대기 placeholder: `.imgph`

**JavaScript (각 페이지 인라인 `<script>`, Vanilla JS, 페이지마다 거의 동일한 패턴 반복):**
- Intersection Observer — 스크롤 시 섹션 활성화(`.fi.on`) 및 좌측 dot 네비게이션(`.dots .dot.on`) 동기화
- 트러블슈팅 아코디언 토글 (`tog()`)
- `secs` 배열에 그 페이지의 `<section id="...">` 목록을 순서대로 나열 — dot 개수·순서와 반드시 일치해야 함
- Wattup처럼 `.mbars`(메모리 바 애니메이션)가 있는 페이지만 `barObs` 추가

**새 섹션을 페이지에 추가할 때:** 해당 페이지의 `<nav class="dots">`에 dot 항목과 대응하는 `<section id="...">`, 그리고 `<script>`의 `secs` 배열을 함께 갱신해야 합니다.

## 새 프로젝트 추가 시

1. `/프로젝트명/index.html` 생성 (기존 서브페이지 중 하나를 템플릿으로 복사 — 헤더/dot nav/hero/footer/script 구조 동일)
2. 루트 `index.html`에 요약 카드 섹션 추가 (`.pcard-top` + `.hmetrics` + `.phighlights` + `.hlink.pri` "자세히 보기" 링크), dot·hnav·`secs` 배열 갱신
3. 이미지는 전부 `/프로젝트명/` 폴더 안에 저장, 파일명에 공백 사용 금지

## 아키텍처 다이어그램 수정

`malang/malang-architecture.xml`은 [draw.io](https://draw.io)에서 편집 후 PNG로 내보내 `malang/malang_archi.png`를 교체합니다.
