const fs = require('fs');
const path = require('path');

const root = __dirname;
let output = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const projects = [
  { id: 'wanderpool', dir: 'wanderpool', name: 'WanderPool' },
  { id: 'wattup', dir: 'wattup', name: 'Wattup' },
  { id: 'malang', dir: 'malang', name: '말랑이 메이커' },
  { id: 'flood', dir: 'flood', name: 'IoT 기반 침수사고 예방 시스템' },
];

const tableOfContents = `
    <section class="pdf-toc-page">
      <div class="pdf-toc-kicker">PORTFOLIO CONTENTS</div>
      <h2 class="pdf-toc-title">목차</h2>
      <div class="pdf-toc-list">
        <div class="pdf-toc-item">
          <div class="pdf-toc-number">01</div>
          <div><strong>WanderPool</strong><p class="pdf-toc-details">
            <span class="pdf-toc-line"><b>구성</b><span>서비스 화면 · 전체 시스템 아키텍처 · 기술 스택</span></span>
            <span class="pdf-toc-line"><b>의사결정</b><span>네트워크 기술 의사결정 · CI/CD · 기술 의사결정 기록 · 보안 의사결정 기록</span></span>
            <span class="pdf-toc-line"><b>운영</b><span>AI Observability Pipeline · 재해복구(DR) · AWS 마이그레이션</span></span>
            <span class="pdf-toc-line"><b>문제 해결·회고</b><span>트러블슈팅 · 배운 점 및 개선사항</span></span>
          </p></div>
        </div>
        <div class="pdf-toc-item">
          <div class="pdf-toc-number">02</div>
          <div><strong>말랑이 메이커</strong><p class="pdf-toc-details">
            <span class="pdf-toc-line"><b>구성</b><span>서비스 화면 · 시스템 아키텍처 · 기술 스택</span></span>
            <span class="pdf-toc-line"><b>의사결정</b><span>인프라 기술 의사결정 · CI/CD</span></span>
            <span class="pdf-toc-line"><b>검증</b><span>부하 테스트</span></span>
            <span class="pdf-toc-line"><b>문제 해결·회고</b><span>트러블슈팅 · 배운 점 및 개선사항</span></span>
          </p></div>
        </div>
        <div class="pdf-toc-item">
          <div class="pdf-toc-number">03</div>
          <div><strong>Wattup</strong><p class="pdf-toc-details">
            <span class="pdf-toc-line"><b>구성</b><span>기술 스택 · 네트워크 아키텍처</span></span>
            <span class="pdf-toc-line"><b>의사결정</b><span>온프레미스·kubeadm 구축 기술 의사결정</span></span>
            <span class="pdf-toc-line"><b>최적화</b><span>메모리 최적화</span></span>
            <span class="pdf-toc-line"><b>문제 해결·회고</b><span>트러블슈팅 · 배운 점 및 개선사항</span></span>
          </p></div>
        </div>
        <div class="pdf-toc-item">
          <div class="pdf-toc-number">04</div>
          <div><strong>IoT 기반 침수사고<br>예방 시스템</strong><p class="pdf-toc-details">
            <span class="pdf-toc-line"><b>버전 변화</b><span>캡스톤 버전 · 개선 버전</span></span>
            <span class="pdf-toc-line"><b>문제 해결</b><span>실시간 통신 개선 · 트러블슈팅</span></span>
          </p></div>
        </div>
      </div>
    </section>`;

function reorderTableOfContents(html) {
  const items = [...html.matchAll(/        <div class="pdf-toc-item">[\s\S]*?        <\/div>\n(?=        <div class="pdf-toc-item">|      <\/div>)/g)]
    .map(match => match[0]);
  if (items.length !== 4) return html;

  const orderedItems = [items[0], items[2], items[1], items[3]]
    .map((item, index) => item.replace(/<div class="pdf-toc-number">\d+<\/div>/, `<div class="pdf-toc-number">${String(index + 1).padStart(2, '0')}</div>`));

  let itemIndex = 0;
  return html.replace(/        <div class="pdf-toc-item">[\s\S]*?        <\/div>\n(?=        <div class="pdf-toc-item">|      <\/div>)/g, () => orderedItems[itemIndex++]);
}

const orderedTableOfContents = reorderTableOfContents(tableOfContents);

function addClass(openingTag, className) {
  if (/class="/.test(openingTag)) {
    return openingTag.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
  }
  return openingTag.replace('>', ` class="${className}">`);
}

function makePathsRootRelative(html, dir) {
  return html
    .replace(/(src|href)="(?!https?:|mailto:|#|\/)([^"]+)"/g, (_, attr, value) => {
      return `${attr}="${dir}/${value}"`;
    })
    .replace(/<a\b[^>]*class="[^"]*(?:hlink|backlink|ncard)[^"]*"[^>]*>[\s\S]*?<\/a>/g, '');
}

function formatChapterLabel(labelHtml) {
  const raw = labelHtml.replace(/<[^>]+>/g, '').trim();
  const labels = {
    Security: '보안 · SECURITY',
    Architecture: '아키텍처 · ARCHITECTURE',
    Preview: '서비스 화면 · PREVIEW',
    'Decision Making': '기술 의사결정 · DECISION MAKING',
    Operations: '운영 · OPERATIONS',
    Operation: '운영 · OPERATIONS',
    Optimization: '최적화 · OPTIMIZATION',
    'CI/CD': 'CI/CD · PIPELINE',
    'CI/CD Pipeline': 'CI/CD · PIPELINE',
    Troubleshooting: '트러블슈팅 · TROUBLESHOOTING',
    Retrospective: '회고 · RETROSPECTIVE',
    'Tech Stack': '기술 스택 · TECH STACK',
    'Cloud Migration': '클라우드 마이그레이션 · CLOUD MIGRATION',
    'Load Testing': '부하 테스트 · LOAD TESTING',
    Versions: '버전 비교 · VERSIONS',
  };
  return labels[raw] || raw;
}

function splitLargeArchitectureSection(section) {
  if (!/<section\b[^>]*id="network"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const bodyStart = section.indexOf(title) + title.length;
  const bodyEnd = section.lastIndexOf('</div>\n    </section>');
  const body = section.slice(bodyStart, bodyEnd);
  const parts = body.split(/(?=\s*<!-- Network:)/).filter(part => part.trim());

  return parts.map((part, index) => {
    const pageOpening = opening.replace('id="network"', `id="network-${index + 1}"`);
    const pageLabel = index === 0 ? label : '<div class="slabel">Decision Making</div>';
    const pageTitle = index === 0 ? title : '<h2 class="stitle">네트워크 기술 의사결정</h2>';
    return `${pageOpening}\n      <div class="fi">\n        ${pageLabel}\n        ${pageTitle}\n        ${part.trim()}\n      </div>\n    </section>`;
  });
}

function splitCicdImageSection(section) {
  if (!/<section\b[^>]*id="cicd-wp"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const cardStart = section.indexOf('<div class="card">');
  const cardContentStart = cardStart + '<div class="card">'.length;
  const cardEnd = section.lastIndexOf('</div>\n      </div>\n    </section>');
  const cardContent = section.slice(cardContentStart, cardEnd);
  const splitMarker = '<div class="subh">역할 분리</div>';
  const splitAt = cardContent.indexOf(splitMarker);

  if (splitAt < 0) return [section];

  const parts = [cardContent.slice(0, splitAt), cardContent.slice(splitAt)];
  return parts.map((part, index) => {
    const pageOpening = opening.replace('id="cicd-wp"', `id="cicd-wp-${index + 1}"`);
    return `${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="card">${part.trim()}\n        </div>\n      </div>\n    </section>`;
  });
}

function splitDecisionSection(section) {
  if (!/<section\b[^>]*id="decisions"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const markers = [...section.matchAll(/<!-- (?:Kong vs Spring Cloud Gateway|MetalLB|GitLab CI vs Jenkins|Lambda 역할 분리) -->/g)];
  const gridEnd = section.lastIndexOf('\n        </div>\n      </div>\n    </section>');
  const cards = markers.map((marker, index) => {
    const end = index < markers.length - 1 ? markers[index + 1].index : gridEnd;
    return section.slice(marker.index, end).trim();
  });

  if (cards.length !== 4) return [section];

  return [cards.slice(0, 2), cards.slice(2, 4)].map((group, index) => {
    const pageOpening = opening.replace('id="decisions"', `id="decisions-${index + 1}"`);
    return `${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="card-grid">\n${group.join('\n')}\n        </div>\n      </div>\n    </section>`;
  });
}

function splitObservabilitySection(section) {
  if (!/<section\b[^>]*id="ops-ai"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const cardOpening = '<div class="card">';
  const cardStart = section.indexOf(cardOpening) + cardOpening.length;
  const cardEnd = section.lastIndexOf('</div>\n      </div>\n    </section>');
  const cardContent = section.slice(cardStart, cardEnd);
  const splitMarker = '<div class="subh">어떤 데이터를 넣었는지</div>';
  const splitAt = cardContent.indexOf(splitMarker);

  if (splitAt < 0) return [section];

  const parts = [cardContent.slice(0, splitAt), cardContent.slice(splitAt)];
  return parts.map((part, index) => {
    const pageOpening = opening.replace('id="ops-ai"', `id="ops-ai-${index + 1}"`);
    return `${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="card">${part.trim()}\n        </div>\n      </div>\n    </section>`;
  });
}

function splitMalangInfraSection(section) {
  if (!/<section\b[^>]*id="infra-m"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const cards = extractBalancedDivs(section, 'card');
  if (cards.length !== 5) return [section];

  const stackPage = `${opening.replace('id="infra-m"', 'id="infra-m-stack"')}
      <div class="fi">
        <div class="slabel">Tech Stack</div>
        <h2 class="stitle">기술 스택</h2>
        ${cards[0]}
      </div>
    </section>`;

  const decisionCards = cards.slice(1);
  const decisionPages = [decisionCards.slice(0, 2), decisionCards.slice(2, 4)].map((group, index) => `${opening.replace('id="infra-m"', `id="infra-m-decisions-${index + 1}"`)}
      <div class="fi">
        ${label}
        <h2 class="stitle">인프라 기술 의사결정</h2>
        <div class="card-grid">
${group.join('\n')}
        </div>
      </div>
    </section>`);

  return [stackPage, ...decisionPages];
}

function splitLoadTestSection(section) {
  if (!/<section\b[^>]*id="load-test"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const cardOpening = '<div class="card">';
  const cardStart = section.indexOf(cardOpening) + cardOpening.length;
  const resultsMarker = '<div class="subh">1차 테스트 결과 (종합 시나리오)</div>';
  const overview = section.slice(cardStart, section.indexOf(resultsMarker)).trim();

  const page = (id, title, body) => `${opening.replace('id="load-test"', `id="${id}"`)}
      <div class="fi">
        ${label}
        <h2 class="stitle">${title}</h2>
        ${body}
      </div>
    </section>`;

  const overviewPage = page('load-test-overview', '부하 테스트 · 목적과 시나리오', `<div class="card">${overview}</div>`);

  const resultsPage = page('load-test-results', '부하 테스트 · 결과 비교', `<div class="card pdf-load-results">
          <table class="ops-table pdf-load-table">
            <thead><tr><th>지표</th><th>1차 종합</th><th>2차 쓰다듬기</th><th>2차 똥치우기</th><th>3차 웜업 후</th></tr></thead>
            <tbody>
          <tr><td>평균 응답</td><td>45ms</td><td>50ms</td><td>56ms</td><td> </td></tr>
          <tr><td>p95 응답</td><td>63.84ms</td><td>70ms</td><td>75ms</td><td>78.63ms</td></tr>
          <tr><td>최대/첫 요청</td><td>1.52s</td><td> </td><td> </td><td>284ms / &lt;100ms</td></tr>
          <tr><td>에러율</td><td>6.62%</td><td>0%</td><td>0%</td><td>0%</td></tr>
          <tr><td>Throttle</td><td>0건</td><td>미발생</td><td>미발생</td><td>미발생</td></tr>
            </tbody>
          </table>
          <div class="pdf-load-notes">
        <div class="rbox"><div class="rbox-t">1차 테스트에서 버그 발견</div><p><code>KeyError: 'none'</code> 확인 후 사망 상태 체크 로직을 추가해 재배포했습니다.</p></div>
        <div class="rbox"><div class="rbox-t">콜드 스타트 개선</div><p>15분 유휴 후 첫 요청 최대 6s에서 EventBridge 웜업 적용 후 100ms 미만, 최대 284ms로 개선했습니다.</p></div>
          </div>
        </div>`);

  const capturesPage = page('load-test-captures', '부하 테스트 · CloudWatch 결과', `<div class="pdf-load-shots">
          <figure><img src="cloudwatch_1st.png" alt="1차 테스트 CloudWatch 대시보드"><figcaption>1차 종합 시나리오</figcaption></figure>
          <figure><img src="cloudwatch_2nd.png" alt="2차 테스트 CloudWatch 대시보드"><figcaption>2차 버그 수정 후</figcaption></figure>
          <figure><img src="cloudwatch_3rd.png" alt="3차 테스트 CloudWatch 대시보드"><figcaption>3차 EventBridge 웜업 적용 후</figcaption></figure>
        </div>
        <div class="pdf-load-caption-list">
          <p><strong>01 · 1차 종합</strong><span>에러율 6.62%에서 <code>KeyError: 'none'</code> 운영 버그를 발견했습니다.</span></p>
          <p><strong>02 · 수정 후</strong><span>예외 처리 재배포 후 쓰다듬기·똥치우기 에러율 0%를 확인했습니다.</span></p>
          <p><strong>03 · 웜업 적용</strong><span>첫 요청 6초를 100ms 미만으로, 최대 응답시간을 284ms로 개선했습니다.</span></p>
        </div>`);

  return [overviewPage, resultsPage, capturesPage];
}

function extractBalancedDivs(html, className) {
  const items = [];
  const openingPattern = /<div class="([^"]*)"[^>]*>/g;
  let opening;

  while ((opening = openingPattern.exec(html))) {
    if (!opening[1].split(/\s+/).includes(className)) continue;
    const tokenPattern = /<div\b[^>]*>|<\/div>/g;
    tokenPattern.lastIndex = opening.index;
    let depth = 0;
    let token;

    while ((token = tokenPattern.exec(html))) {
      depth += token[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        items.push(html.slice(opening.index, tokenPattern.lastIndex));
        openingPattern.lastIndex = tokenPattern.lastIndex;
        break;
      }
    }
  }
  return items;
}

function splitTroubleshootingSection(section) {
  if (!/<section\b[^>]*id="ts-wp"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const items = extractBalancedDivs(section, 'titem');
  if (items.length !== 9) return [section];

  // Keep six technically distinct cases in the PDF; the web detail retains all nine.
  const selectedItems = [items[0], items[2], items[3], items[5], items[6], items[7]]
    .map((item, index) => item.replace(/<span class="tnum">\d+<\/span>/, `<span class="tnum">${String(index + 1).padStart(2, '0')}</span>`));

  return [selectedItems.slice(0, 3), selectedItems.slice(3, 6)].map((group, index) => {
    const pageOpening = opening.replace('id="ts-wp"', `id="ts-wp-${index + 1}"`);
    return `${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="twrap pdf-ts-grid">\n${group.join('\n')}\n        </div>\n      </div>\n    </section>`;
  });
}

function splitMalangTroubleshootingSection(section) {
  if (!/<section\b[^>]*id="ts-m"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const items = extractBalancedDivs(section, 'titem');
  if (items.length !== 6) return [section];

  const selectedItems = [items[0], items[2], items[5]]
    .map((item, index) => item.replace(/<span class="tnum">\d+<\/span>/, `<span class="tnum">${String(index + 1).padStart(2, '0')}</span>`));
  const pageOpening = opening
    .replace('id="ts-m"', 'id="ts-m-1"')
    .replace(/\sstyle="[^"]*"/, '');

  return [`${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="twrap pdf-ts-grid">\n${selectedItems.join('\n')}\n        </div>\n      </div>\n    </section>`];
}

function splitWattupTroubleshootingSection(section) {
  if (!/<section\b[^>]*id="ts-wt"/.test(section)) return [section];

  const opening = section.match(/^<section\b[^>]*>/)?.[0];
  const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
  const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
  const items = extractBalancedDivs(section, 'titem');
  if (items.length !== 6) return [section];

  const selectedItems = items.slice(0, 3);
  const pageOpening = opening
    .replace('id="ts-wt"', 'id="ts-wt-1"')
    .replace(/\sstyle="[^"]*"/, '');

  return [`${pageOpening}\n      <div class="fi">\n        ${label}\n        ${title}\n        <div class="twrap pdf-ts-grid">\n${selectedItems.join('\n')}\n        </div>\n      </div>\n    </section>`];
}

function mergeCicdRoleAndBff(sections) {
  const roleIndex = sections.findIndex(section => /id="cicd-wp-2"/.test(section));
  const bffIndex = sections.findIndex(section => /id="fe-bff"/.test(section));
  if (roleIndex < 0 || bffIndex < 0) return sections;

  const extractBody = section => {
    const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
    const start = section.indexOf(title) + title.length;
    const end = section.lastIndexOf('</div>\n    </section>');
    return section.slice(start, end).trim();
  };

  const roleBody = extractBody(sections[roleIndex]);
  let bffBody = extractBody(sections[bffIndex]);
  bffBody = bffBody.replace(
    /<div class="pipe" style="margin-bottom:20px">[\s\S]*?(?=<div class="subh")/,
    `<div class="pdf-inline-flow">
      <div><strong>GitLab main Merge</strong><small>main 브랜치 병합 감지</small></div>
      <span>→</span>
      <div><strong>Vercel 자동 배포</strong><small>별도 빌드 서버 없이 Vercel이 직접 빌드·배포</small></div>
    </div>`
  );

  const merged = `<section id="cicd-wp-2">
      <div class="fi">
        <div class="slabel">CI/CD · Frontend</div>
        <h2 class="stitle">역할 분리 · Frontend CI/CD · BFF</h2>
        <div class="pdf-cicd-combined">${roleBody}${bffBody}</div>
      </div>
    </section>`;

  const result = [...sections];
  result[roleIndex] = merged;
  result.splice(bffIndex, 1);
  return result;
}

function moveWanderpoolStackAfterArchitecture(sections) {
  const result = [...sections];
  const stackIndex = result.findIndex(section => /id="stack-wp"/.test(section));
  if (stackIndex < 0) return result;

  const [stackPage] = result.splice(stackIndex, 1);
  const architectureIndex = result.findIndex(section => /id="network-1"/.test(section));
  if (architectureIndex < 0) return sections;

  result.splice(architectureIndex + 1, 0, stackPage);
  return result;
}

function moveWanderpoolTroubleshootingLast(sections) {
  const result = [...sections];
  const troubleshootingIndex = result.findIndex(section => /id="ts-wp"/.test(section));
  if (troubleshootingIndex < 0) return result;

  const [troubleshootingPage] = result.splice(troubleshootingIndex, 1);
  const migrationIndex = result.findIndex(section => /id="migration"/.test(section));
  const anchorIndex = migrationIndex >= 0
    ? migrationIndex
    : result.findIndex(section => /id="dr-wp"/.test(section));
  if (anchorIndex < 0) return sections;

  result.splice(anchorIndex + 1, 0, troubleshootingPage);
  return result;
}

function moveWanderpoolMigrationAfterDr(sections) {
  const result = [...sections];
  const migrationIndex = result.findIndex(section => /id="migration"/.test(section));
  if (migrationIndex < 0) return result;

  const [migrationPage] = result.splice(migrationIndex, 1);
  const drIndex = result.findIndex(section => /id="dr-wp"/.test(section));
  if (drIndex < 0) return sections;

  result.splice(drIndex + 1, 0, migrationPage);
  return result;
}

for (const project of projects) {
  const detail = fs.readFileSync(path.join(root, project.dir, 'index.html'), 'utf8');
  const preparedSections = [...detail.matchAll(/<section\b[\s\S]*?<\/section>/g)]
    .map(match => match[0])
    .filter((section, index) => {
      if (index === 0) return false;
      if (/<section\b[^>]*id="links/.test(section)) return false;
      if (/<section\b[^>]*id="ops-m"/.test(section)) return false;
      return true;
    })
    .flatMap(splitLargeArchitectureSection)
    .flatMap(splitCicdImageSection);
  const orderedSections = moveWanderpoolStackAfterArchitecture(preparedSections);
  const migrationOrderedSections = moveWanderpoolMigrationAfterDr(orderedSections);
  const finalOrderedSections = moveWanderpoolTroubleshootingLast(migrationOrderedSections);
  const pagedSections = finalOrderedSections
    .flatMap(splitDecisionSection)
    .flatMap(splitObservabilitySection)
    .flatMap(splitTroubleshootingSection)
    .flatMap(splitMalangTroubleshootingSection)
    .flatMap(splitWattupTroubleshootingSection)
    .flatMap(splitMalangInfraSection)
    .flatMap(splitLoadTestSection);

  const sections = mergeCicdRoleAndBff(pagedSections)
    .filter(section => !/id="cicd-wp-2"/.test(section))
    .map(section => {
      const title = section.match(/<h2 class="stitle">[\s\S]*?<\/h2>/)?.[0] || '';
      const label = section.match(/<div class="slabel">[\s\S]*?<\/div>/)?.[0] || '';
      let sectionBody = title ? section.replace(title, '') : section;
      sectionBody = label ? sectionBody.replace(label, '') : sectionBody;
      const chapterTag = label ? `<div class="pdf-chapter-tag">${formatChapterLabel(label)}</div>` : '';
      return sectionBody.replace(/^<section\b[^>]*>/, tag => {
      const openingTag = addClass(tag.replace(/\sstyle="[^"]*"/, ''), `pdf-detail-page pdf-project-${project.id}`);
      return `${openingTag}\n    <div class="pdf-detail-content">\n      <div class="pdf-project-context"><span>PROJECT DETAIL</span><strong>${project.name}</strong>${chapterTag}</div>\n      ${title}`;
    }).replace(/<\/section>$/, '    </div>\n</section>');
    })
    .map(section => section.replace(/class="([^"]*\bfi\b[^"]*)"/g, 'class="$1 on"'))
    .map(section => makePathsRootRelative(section, project.dir))
    .join('\n\n');

  const summaryPattern = new RegExp(`(<section\\b[^>]*id="${project.id}"[\\s\\S]*?<\\/section>)`);
  output = output.replace(summaryPattern, `$1\n\n${sections}`);
}

// The source homepage keeps its original order; only the PDF groups Wattup before Malang.
const malangStart = output.indexOf('    <section id="malang"');
const wattupStart = output.indexOf('    <section id="wattup"');
const floodStart = output.indexOf('    <section id="flood"');
if (malangStart >= 0 && wattupStart > malangStart && floodStart > wattupStart) {
  const malangBundle = output.slice(malangStart, wattupStart);
  const wattupBundle = output.slice(wattupStart, floodStart);
  output = `${output.slice(0, malangStart)}${wattupBundle}${malangBundle}${output.slice(floodStart)}`;
}

output = output
  .replace('<body>', '<body class="pdf-view">')
  .replace('<title>최수정 Portfolio</title>', '<title>최수정 Portfolio PDF</title>')
  .replace('<div class="hname">최수정 Portfolio</div>', '<a href="index.html" class="hname" title="원본 포트폴리오로 돌아가기">최수정 Portfolio</a>')
  .replace(/(<section id="hero">[\s\S]*?<\/section>)/, `$1\n\n${orderedTableOfContents}`)
  .replace('<a href="pdf.html" class="pdf-action">PDF로 저장</a>', '<a href="#" class="pdf-action" id="pdfAction">PDF 저장 / 인쇄</a>')
  .replace('  <script>\n    function tog', `  <script>
    function fitPdfDetailPages() {
      document.querySelectorAll('.pdf-detail-page').forEach(page => {
        const wrapper = page.querySelector('.pdf-detail-content');
        const content = wrapper.querySelector('.fi');
        content.style.zoom = 1;
        void content.offsetHeight;
        const styles = getComputedStyle(page);
        const fixedHeaderHeight = [...wrapper.children]
          .filter(element => element !== content && !element.classList.contains('pdf-chapter-tag'))
          .reduce((height, element) => height + element.getBoundingClientRect().height + parseFloat(getComputedStyle(element).marginBottom || 0), 0);
        const availableHeight = page.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom) - fixedHeaderHeight;
        const fitRatio = availableHeight / content.scrollHeight;
        const scale = fitRatio < 1 ? fitRatio * .96 : 1;
        content.style.zoom = Number.isFinite(scale) && scale > 0 ? scale : 1;
      });
    }
    addEventListener('load', fitPdfDetailPages);
    if (document.fonts?.ready) document.fonts.ready.then(fitPdfDetailPages);
    document.getElementById('pdfAction').addEventListener('click', e => { e.preventDefault(); window.print(); });
    function tog`);

let pdfPageNumber = 0;
output = output.replace(
  /<section\b[^>]*class="[^"]*\b(?:pdf-summary-page|pdf-detail-page)\b[^"]*"[^>]*>/g,
  openingTag => `${openingTag}\n    <div class="pdf-page-number">${++pdfPageNumber}</div>`
);
output = output.replace(/[ \t]+$/gm, '');

fs.writeFileSync(path.join(root, 'pdf.html'), output, 'utf8');
