# ryugi-detail

## Mode

- initial draft
- ケンカヤの実データと個別hero画像を使ったdesktop / mobile design画像を作成した。流儀スキル一覧はユーザー指示により画像へ含めない。

## Target

- page / component: 流儀詳細ページ。`src/pages/data/ryugi/[ryugiId].astro` で共通テンプレートから静的生成する。
- route: `/data/ryugi/[ryugiId]`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop: Header、左SiteMenu、中央本文、右PageTocを含む通常状態
  - mobile: Header、中央本文、H1横のMobilePageToc triggerを含む通常状態
  - mobile menu open、MobilePageToc openなどの状態別画像は、このpage designでは作成しない。既存 `site-layout` を参照する。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/30-2-ryugi-detail-page.md`
- `docs/requirements/pages.md` の FR-05
- `docs/requirements/architecture.md` の AC-14
- `docs/requirements/data-display.md` の FR-04-01、FR-04-04
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md` の `30-2-ryugi-detail-page`
- `docs/TODO.md` の流儀サイドメニューと共通スキルボーナス構造化の未対応項目
- `.raw/contents/ryugi-detail.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/skill-card/notes.md`

## Design direction

- visual direction: 白寄りの本文面、低彩度border、暗い本文色、青緑accentを維持する。個別流儀のhero画像はページ固有の視覚的な入口とし、過剰なneon glow、shadow、gradient、文字overlayを加えない。
- layout direction: H1の直後に対象流儀のhero画像を置き、説明と任意のCalloutを続ける。`流儀データ`は、実際のスキル名を表示した`SkillCard`を含むプライマリボーナス、基礎能力値、副能力増加値をdesktopの1行3列に並べる。共通スキルボーナスはその下の全幅に置く。mobileでは、プライマリボーナスと縦型の基礎能力値を1行目の2列、副能力増加値と縦に積む共通スキルボーナスを2行目の2列に置く。能力値、増加値、共通スキルボーナスは外枠のないデータ表示とする。流儀スキルは既存の`CardContainer`に従うが、今回の初期draft画像には含めない。
- typography direction: H1は流儀名だけを明確に表示し、hero画像へページ側のtitleやcaptionを重ねない。能力値と増加値は太字の黒で表示する。短いボーナス文は枠ではなく区切り線で読み取りやすくし、長い説明・複数行ボーナス・スキル本文を切り詰めない。H2 / H3の階層は `.raw/contents/ryugi-detail.md` を維持する。
- color / accent usage: 青緑accentは既存リンク、focus、`SkillCard`の名称下線と最大LVの強調に限る。流儀ID、スキル区分、スキルIDを色やラベルで可視化しない。

## Existing design constraints

- `global-styles` の白寄り背景、暗いHeader / Footer、system font、低彩度border、spacing rhythmを維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。desktopは左右レールと中央本文の3カラム、mobileは既存の本文幅とH1周辺のMobilePageToc triggerを前提とする。
- `page-toc` の方針に従い、H1は目次に含めない。H2 / H3から抽出されるページ内目次を妨げる空見出しや見出し階層の飛びを作らない。
- `skill-card` の密度、情報順、可変高さ、desktop 3列 / mobile 2列を維持する。`CardContainer`や`SkillCard`へ流儀詳細専用の表示仕様を足さない。
- heroは `public/images/data/ryugi/<ryugiId>_hero.webp` を使う。画像内に焼き込まれた要素以外のoverlay、caption、別の装飾画像は追加しない。ケンカヤのheroは初期表示に含まれるため `loading="eager"` とし、altは `刀を構えた仕事人と跳び蹴りを放つ仕事人が戦う、ケンカヤのイメージ` とする。
- `ryugi.note` がある流儀だけ既存 `Callout` のtypeと本文を表示する。Calloutがない流儀に空の領域を残さない。

## Out of scope

- 流儀一覧、生き様詳細、サイドメニューへの流儀リスト追加
- Excel変換、生成JSON、schema、取得層、スキルID規則の変更
- 検索、フィルタ、ソート、ページネーション、カード詳細遷移、クライアント状態管理
- キャラクター作成ウィザード、能力値・ボーナスの自動計算、ダイスローラー、キャラクターシート
- Header、Footer、SiteMenu、PageToc、MobilePageToc、`SkillCard`、`CardContainer`の再設計
- パンくず、前後ナビゲーション、現在位置ハイライト、画像caption、heroへの文字overlay
- ログイン、CMS、DB、SSR、APIサーバー、新しいUIライブラリ

## Comparison points for implementation

- desktopで、hero、説明、任意のCallout、`流儀データ`、流儀スキル一覧が中央本文カラムに自然に収まり、左右レールと競合しない。
- mobileで、H1とMobilePageToc trigger、hero、プライマリボーナスと基礎能力値の1行目、副能力増加値と縦積み共通スキルボーナスの2行目から成る2列2行のデータgrid、2列のスキルカードが横overflowせず、名称・数値・複数行のボーナスが読める。
- 既存`SkillCard`の情報順、最低高さ、カテゴリ内の配列順、個別アンカーが変わらない。
- `skills.bonus`、`skills.basic`、`skills.advanced`のうちデータがないカテゴリは、見出しと空の一覧を表示しない。
- hero画像は対象流儀を取り違えず、代替テキストは画像内容と流儀名の両方を説明する。初期表示のheroは `loading="eager"` とする。
- 許容差分: 実データによる説明文・ボーナス文・スキル本文の行数、各データ枠の高さ、画像の自然なトリミング。
- 要レビュー差分: heroへの文字overlayまたはcaption、プライマリボーナス・基礎能力値・副能力増加値のdesktop 1行3列を崩す変更、共通スキルボーナスをdesktopの2行目から動かす変更、mobileの2列2行を崩す変更、既存`SkillCard`の情報順・色・高さの変更、PageTocを空表示または現在位置ハイライトのように見せる変更。

## Generation source

- prototype or generator source: standalone HTML/CSS prototypeをPlaywrightでcaptureした。実装済みサイトやVisual Review成果物は画像源に使っていない。
- source branch / commit when applicable: `30-2-ryugi-detail-page` / `4a8d344`
- route when applicable: `/data/ryugi/[ryugiId]`
- viewport: desktop `1440x1200`（full page `1440x1659`）、mobile `390x900`（full page `390x1469`）
- prototype path / prompt summary / capture notes:
  - `.tmp/design/ryugi-detail/prototype.html`
  - `.tmp/design/ryugi-detail/capture.mjs`
  - `data/generated/ryugi-list.json` のケンカヤの説明、補足、基礎能力値、副能力増加値、共通スキルボーナスを表示した。
  - `data/generated/ryugi-skills.json` のケンカヤのプライマリボーナス `気合十分` を表示した。
  - `public/images/data/ryugi/kenkaya_hero.webp` をprototypeへ埋め込んでcaptureした。
  - `design-desktop.png` と `design-mobile.png` は、流儀スキル一覧の前で終えるfull-page screenshotである。

## Open questions

- なし。流儀スキル一覧は既存の共通スキルページ／`SkillCard` designを使うため、今回の初期draft画像では比較対象から外す。
