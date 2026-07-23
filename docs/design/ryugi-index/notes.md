# ryugi-index

## VRT baseline

- test: `tests/visual/vrt/ryugi-index.spec.ts` の `@vrt @ryugi-index @<state> @<viewport>`
- route: `/data/ryugi/`
- state: default
- snapshots:
  - desktop `1440x1200`: `ryugi-index-default-desktop.png`
  - tablet `820x1180`: `ryugi-index-default-tablet.png`
  - mobile `390x900`: `ryugi-index-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- `29-2-ryugi-index-page`のレビュー済み実装を、ユーザー承認に基づき流儀一覧のdesign正本として更新する。

## Target

- page / component: 流儀一覧ページ、`RyugiDataSection`による「流儀データの見方」、流儀詳細項目が展開されたSiteMenu
- route: `/data/ryugi`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop: 流儀一覧を開き、左SiteMenuの流儀詳細項目を展開した状態
  - mobile: 通常の本文表示。SiteMenu drawerとMobilePageTocは閉じた状態

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/29-2-ryugi-index-page.md`
- `.raw/contents/ryugi-index.md`
- `docs/plan.md` の `29-2-ryugi-index-page`
- `docs/TODO.md` の流儀・生き様サイドメニュー、および流儀データの参照
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/out-of-scope.md`
- `docs/design/global-styles/notes.md`

対応するcontentsのユーザー編集Markdown本文とHTMLコメントは、ページ本文・可視の表示構成について、ユーザーの最新指示と安全・workflow規約を除く他の参照資料より優先する。

- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/ryugi-detail/notes.md`
- `docs/design/skill-card/notes.md`

## Design direction

- visual direction: 白寄りの本文面、低彩度border、暗い本文色、青緑accentを維持する。流儀一覧は名称リンクとshortDescriptionだけを、区切り線と余白で整理する。
- layout direction: desktopはHeader、左SiteMenu、中央本文、右PageTocの3レールを維持する。中央本文はH1、generic hero、導入、「流儀データの見方」、流儀一覧の順に置く。mobileは本文幅を保ち、H1横のMobilePageToc triggerだけを表示する。
- typography direction: H1はcontentsどおり`流儀`とする。H2は`流儀データの見方`、`流儀一覧`の順とし、H1はPageTocに含めない。流儀名は本文見出しより大きくしない明確なリンクとし、shortDescriptionはリンクの横に置いて長い場合も自然に折り返す。別途の「流儀詳細を見る」文言は置かない。
- color / accent usage: 青緑accentは流儀名リンク、見出し下の短いmarker、現在のSiteMenu項目に限る。hero画像へ文字overlay、caption、追加の装飾を重ねない。

## Existing design constraints

- `global-styles`の白寄り背景、暗めHeader、system font、低彩度border、spacing rhythmを維持する。
- `site-layout`のHeader、Footer、PC左SiteMenu、PC右PageToc、mobileのMobilePageToc triggerを再設計しない。
- `page-toc`の方針に従い、H1を目次に含めず、H2だけをPageTocに表示する。現在位置ハイライトは描かない。
- `ryugi-detail`のデータgridと`SkillCard`の情報密度を、一覧の「流儀データの見方」にあるケンカヤの代表例へ使う。流儀一覧そのものへ流儀スキル一覧や個別heroを重複表示しない。
- SiteMenuは既存の`データ`→`流儀`の階層を維持し、流儀詳細は`流儀`の子項目として入力順に表示する。生き様詳細は表示しない。
- heroにはユーザーが明示承認してcommitした`public/images/data/ryugi_hero.webp`を使う。画像内の既存ロゴ以外に、ページ側の文字を重ねない。

## Out of scope

- 生き様一覧・生き様詳細のSiteMenu項目
- 検索、絞り込み、ソート、ページネーション、比較・計算UI
- キャラクター作成ウィザード、キャラクターシート、ダイスローラー、戦闘シミュレーター
- 流儀詳細ページ、既存`RyugiDataSection`、`SkillCard`、Header、Footer、SiteMenu、PageTocの再設計
- パンくず、前後ナビゲーション、ページ内目次の現在位置ハイライト
- Excel変換、JSON、schema、取得層、共通スキルボーナスの構造化
- 新規画像生成または追加の`.webp`commit

## Comparison points for implementation

- desktopで、流儀詳細項目を展開した左SiteMenu、中央本文、右PageTocが競合せず、本文と一覧が読める幅を保つ。
- mobileで、H1、hero、流儀データの2列grid、4項目の説明、流儀一覧が横overflowせず読める。共通スキルボーナス値の改行は、ケンカヤの`RyugiDataSection`で保持する。
- 流儀一覧は生成データの入力順を変えず、各流儀の名称リンクと、横に置いたshortDescriptionだけを対応付ける。説明が長い場合は切り詰めず自然に折り返し、「流儀詳細を見る」の補助文言は置かない。
- `流儀データの見方`はケンカヤの代表例として`RyugiDataSection`を用い、流儀一覧と役割を混同しない。
- PageTocはH2の2項目だけを表示し、空の見出し、breadcrumb、前後ナビゲーション、検索UIを追加しない。
- 許容差分: 実データの説明文・ボーナス文による行数、一覧の縦方向の長さ、heroの自然な表示比率。
- 要レビュー差分: heroへの文字overlayまたはcaption、流儀詳細を一覧に過剰重複する変更、流儀の入力順変更、生き様詳細の追加、SiteMenu / PageTocの役割混同、mobileの横overflow。

## Generation source

- initial draft source: standalone HTML/CSS prototypeをPlaywrightでcaptureした。実装済みサイトやVisual Review成果物は画像源に使っていない。
- source branch / commit: `29-2-ryugi-index-page` / `8388c86`
- route: `/data/ryugi`（未実装のためprototypeで表現）
- viewport: desktop `1440x1200`、mobile `390x900`。両方ともfull-page screenshot。
- prototype path / capture notes:
  - `.tmp/design/ryugi-index/prototype.html`
  - `.tmp/design/ryugi-index/capture.mjs`
  - `public/images/data/ryugi_hero.webp` をdata URLとしてprototypeへ埋め込み、ページ側の文字overlayやcaptionは追加していない。
  - 流儀一覧は入力順の代表6件を表示し、名称リンクとshortDescriptionだけを示す。実装時は全件を生成データから表示する。
- canonicalization source: review済み実装の`/data/ryugi`を、ユーザー承認後に公式visual capture workflowでdesktop / mobileともにcaptureする。

## Open questions

- なし。current時のカテゴリ初期展開と実データでの余白・表示密度は、レビュー済み実装を正本とする。
