# common-skills

## Mode

- design fix

## Target

- page / component: 共通スキルをカテゴリごとに表示する `/data/common-skills` ページ。`CardContainer` 内へ `SkillCard` を配置する。
- route: `/data/common-skills/`
- viewport:
  - desktop: `1440x1200`、full-page capture
  - mobile: `390x900`、full-page capture
- states:
  - desktop: SiteMenu、MDX本文、PageTocを含む。`bonus`、`basic` の各カテゴリは3列のCardContainerで表示する。
  - mobile: MobileMenuとMobilePageToc triggerを含む。各カテゴリは2列のCardContainerで表示する。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/28-2-common-skills-page.md`
- `docs/requirements/data-display.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/common-skills.md`
- `docs/design/global-styles/notes.md`
- `docs/design/data/notes.md`
- `docs/design/skill-card/notes.md`
- `docs/design/site-layout/notes.md`

## Design direction

- visual direction: 白寄りsurfaceと低彩度borderによる、縦長で高密度なルール参照カードの一覧。shadow、gradient、強いneon glowは使わない。
- layout direction: カテゴリ本文の直後にCardContainerを置く。desktopは3列、mobileは2列とし、同じ行のカードは最も長い本文に合わせて高さを揃える。desktopでは既存のSiteMenu・PageToc、mobileではMobilePageToc triggerを維持する。
- typography direction: H1とカテゴリH2で本文構造を示す。各カードは名称を最上段へ単独で置き、`最大LV`はタイミング・コスト・技能と同じメタ行右端に置く。カード本文は通常本文より小さくし、長文を切り詰めない。
- color / accent usage: 青緑accentはSkillCardの名称下線と最大LVの控えめな強調に限定する。カード種別やカテゴリを色分けしない。

## Existing design constraints

- `global-styles` の白寄り背景、暗い本文色、低彩度border、青緑accent、system fontを維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `SkillCard` の名称、メタ情報、詳細枠、概要・効果の既存表示順と可変高さを維持する。
- `CardContainer` はslotで渡されたCardを配置するだけとし、データ配列の展開、個別アンカーID、Card props、Card内の表示仕様を担わない。
- カテゴリは生成JSONの順に `bonus`、`basic` を表示する。現在データがない `advanced` の見出し・空一覧は表示しない。

## Out of scope

- 上級スキルの仮データ、空見出し、準備中表示。
- 検索、絞り込み、ソート、ページネーション、カード詳細ページ、選択・計算UI。
- 新しい凡例Component、依存関係、クライアント側状態管理。
- Header、Footer、SiteMenu、PageToc、MobilePageTocの変更。
- Excel変換、JSON、schema、データ取得層、スキルID生成規則の変更。

## Comparison points for implementation

- desktopでカテゴリごとのカードが3列、mobileで2列を保ち、ページ全体に横overflowがない。
- CardContainerはカード表示を重複せず、slot内のSkillCardが既存の情報密度と可変高さを維持する。
- `bonus`、`basic` のカテゴリと各カテゴリ内のデータ配列順が維持され、`advanced` の空見出しが出ない。
- H1・H2、PageToc、MobilePageToc、個別アンカーが既存レイアウトの役割を保つ。
- 許容差分: スキルデータの追加に伴うカード数・本文量・ページ高の変化。
- 要レビュー差分: desktop 3列 / mobile 2列以外の配置、カード内の表示順変更、上級スキルの空表示、ページ全体の横overflow。

## Generation source

- canonicalization source: ユーザーレビュー済みの`/data/common-skills/`実装を、approved visual capture workflowでdesktop・mobileともにfull-page captureする。

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- common-skills --route /data/common-skills/`
- source branch: `28-2-common-skills-page`
- source commit: `e3aefb9d2aabd6841bae054bf9290b2ec2d15644`
- route: `/data/common-skills/`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- なし。
