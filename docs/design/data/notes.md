# data

## Mode

- initial draft

## Target

- page / component: `/data` の「スキルの見方」内に置くSkillCard凡例と、その右側の項目説明領域。
- route: `/data`
- viewport:
  - desktop: `1440x1200` viewport内で、既存Header、SiteMenu、中央本文、PageTocを含めてcaptureする。full-page captureは行わない。
  - mobile: `390x900` viewport内で、既存Headerと中央本文を含めてcaptureする。full-page captureは行わない。
- states:
  - desktop: 既存SkillCard gridの3列を使い、左1列にSkillCard凡例、右2列にカード項目の順序付き説明を置く。
  - mobile: 既存SkillCard gridの2列を使い、左1列にSkillCard凡例、右1列にカード項目の順序付き説明を置く。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/27-2-data-index-page.md`
- `docs/requirements/data-display.md`
- `docs/requirements/layout-navigation.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/data.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/skill-card/notes.md`

## Design direction

- visual direction: 既存の白寄り本文面と低彩度borderを維持する。SkillCardは個別データを読むための密度を保ち、凡例専用の派手な装飾にはしない。
- layout direction: desktopの中央本文カラムでは、既存SkillCard gridの3列へ凡例カード1列と右側説明領域2列を置く。mobileでは同じgridを2列へ切り替え、凡例カードと右側説明領域を各1列に置く。右側は「カードの項目」の見出しと、通常の順序付きリストを使う。既存Header、desktopのSiteMenuとPageToc、mobileのHeaderとMobilePageToc triggerを表示する。
- typography direction: Card内の名称、最大LV、短いメタ情報、2×2の詳細枠は既存SkillCard designに従う。右側の説明は通常本文のサイズと行間を保ち、項目名だけを太字にして、カードのラベルと混同させない。
- color / accent usage: 青緑accentは既存SkillCardの名称下線と最大LVに限定する。右側の説明には新しい色分けやアイコンを追加しない。重大事項Calloutはこの確認領域に含めない。

## Existing design constraints

- `global-styles` の白寄り背景、暗い本文色、低彩度border、青緑accent、system fontを維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。full-page画面は使わないが、viewport captureには既存Headerと該当するlayout railsを含める。
- `SkillCard` は既存の縦長・高密度なカードを使う。名称、`最大LV`、メタ情報、取得制限、使用制限、対象、射程、概要、効果の表示順を変えない。右側の説明も「取得制限」「使用制限」「対象」「射程」を個別項目として扱い、項目名は「効果」だけにする。
- 説明用のスキル凡例は実在データではない静的propsを既存`SkillCard`へ渡す。凡例専用Componentは作らない。
- カードの右側に置く説明領域は、`.raw/contents/data.md` の「カードの項目」指示をもとにする。カード内へ改めてラベルを増やすためのUIではない。`①`は凡例カードの名称用の文字列であり、右側リストの番号装飾には使わない。

## Out of scope

- H1、hero、データ導線、タイミング表、コストと制限、特別なスキルCallout、クロスコンボ、アイテム導線を含むページ全体のfull-page design。
- Search、絞り込み、ソート、ページネーション、カード選択、詳細遷移。
- 追加の凡例Component、依存関係、クライアント状態管理。
- Header、Footer、SiteMenu、PageToc、MobilePageTocの変更。
- 画像の再生成、追加overlay、caption、パンくず、前後ナビゲーション。

## Comparison points for implementation

- desktopで、SkillCard凡例と右側の説明領域が中央本文の幅内に収まり、カードが説明に押されて不自然に狭くならない。
- desktopの右側説明はカードの上端と揃い、順序付き項目を上から自然に読める。
- mobileで、カードと説明領域を既存gridと同じ2列へ置いても本文全体の横overflowを起こさない。
- SkillCardの既存の情報順、最小高さ、色・borderの扱いを変えない。
- 許容差分: 静的propsで表示する凡例の文言、説明文の行数、セクションの高さ。
- 要レビュー差分: Headerやlayout railsを省いたcapture、既存gridと異なるdesktop 2列・mobile 1列、右側リストへの丸囲み番号装飾、Card内の既存表示順の変更。

## Generation source

- prototype or generator source: standalone HTML/CSS prototypeを使うinitial draft。実サイトや未実装の`/data` routeはcaptureしない。
- source branch / commit when applicable: `27-2-data-index-page` / `93e8814`
- route: `/data`
- viewport: desktop `1440x1200`、mobile `390x900`。viewport screenshotを使い、full-page screenshotを使わない。
- prototype path / prompt summary / capture notes: `.tmp/design/data/prototype.html` と `.tmp/design/data/capture.mjs`。既存Headerとlayout文脈を含むviewport screenshotで、`design-desktop.png` と `design-mobile.png` を生成した。heroを含むページ全体はcaptureしない。

## Open questions

- なし。次段では、SkillCard凡例と右側の説明領域だけを画像で確認する。
