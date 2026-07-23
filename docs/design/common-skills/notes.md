# common-skills

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT common-skills default <viewport>`
- route: `/data/common-skills/`
- state: default
- snapshots:
  - desktop `1440x1200`: `common-skills-default-desktop.png`
  - tablet `820x1180`: `common-skills-default-tablet.png`
  - mobile `390x900`: `common-skills-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: 共通スキルをカテゴリごとに表示する `/data/common-skills` ページ。`CardContainer` 内へ `SkillCard` を配置する。
- route: `/data/common-skills/`
- viewport:
  - desktop: `1440x1200`、full-page capture
  - tablet: `820x1180`。既存`site-layout`のtablet正本と同じviewportでVisual Reviewを行う。共通スキル固有のcanonical imageはdesktop／mobileの2枚とする。
  - mobile: `390x900`、full-page capture
- states:
  - desktop: SiteMenu、MDX本文、PageTocを含む。`bonus`、`basic` の各カテゴリは3列のCardContainerで表示する。
  - tablet: SiteMenuを残し、PageTocは常設しない。各カテゴリはCardContainerの2列で表示する。
  - mobile: MobileMenuとMobilePageToc triggerを含む。各カテゴリは2列のCardContainerで表示する。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements/data-display.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `.raw/contents/common-skills.md`
- `docs/design/global-styles/notes.md`
- `docs/design/data/notes.md`
- `docs/design/skill-card/notes.md`
- `docs/design/site-layout/notes.md`

## Design direction

- visual direction: 白寄りsurfaceと低彩度borderによる、縦長で高密度なルール参照カードの一覧。shadow、gradient、強いneon glowは使わない。
- layout direction: カテゴリ本文の直後にCardContainerを置く。desktopは3列、tabletとmobileは2列とし、同じ行のカードは最も長い本文に合わせて高さを揃える。desktopでは既存のSiteMenu・PageToc、tabletではSiteMenu、mobileではMobilePageToc triggerを維持する。
- typography direction: H1とカテゴリH2で本文構造を示す。各カードは名称を最上段へ単独で置き、`最大LV`は名称行の下の独立行に置く。summaryは全スキル分の内容が完成するまで表示せず、効果本文だけを通常本文より小さく表示する。長文を切り詰めない。
- color / accent usage: 青緑accentはSkillCardの名称下線と最大LVの控えめな強調に限定する。カード種別やカテゴリを色分けしない。

## Existing design constraints

- `global-styles` の白寄り背景、暗い本文色、低彩度border、青緑accent、system fontを維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `SkillCard` の名称、名称行下の最大LV、メタ情報、詳細枠、効果本文の表示順と可変高さを維持する。summaryはデータとして保持するが、全スキル分の内容が完成するまで表示しない。
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
- 820px tabletで左SiteMenuが残る場合も、CardContainerは2列となりカードの可読幅と横overflowなしを保つ。
- CardContainerはカード表示を重複せず、slot内のSkillCardが既存の情報密度と可変高さを維持する。
- `bonus`、`basic` のカテゴリと各カテゴリ内のデータ配列順が維持され、`advanced` の空見出しが出ない。
- H1・H2、PageToc、MobilePageToc、個別アンカーが既存レイアウトの役割を保つ。
- 許容差分: スキルデータの追加に伴うカード数・本文量・ページ高の変化。
- 要レビュー差分: desktop 3列 / mobile 2列以外の配置、カード内の表示順変更、上級スキルの空表示、ページ全体の横overflow。

## Generation source

- canonicalization source: ユーザーレビュー済みの`/data/common-skills/`実装を、approved visual capture workflowでdesktop・mobileともにfull-page captureする。tabletは同じcaptureで確認するが、canonical imageはdesktop／mobileの2枚に限定する。

- implementation state: `8327e05`後の未コミット変更。summaryを非表示にする共有`SkillCard`の表示方針を含む。

## Open questions

- なし。
