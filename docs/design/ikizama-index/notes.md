# ikizama-index

## Mode

- initial draft

## Target

- page / component: 生き様一覧ページ、`IkizamaDataSection`による「生き様データの見方」
- route: `/data/ikizama`
- viewport: desktop `1440x1200`、mobile `390x900`
- states: default。desktopはPC SiteMenuとPageTocを表示し、mobileはMobilePageToc triggerを閉じた状態で表示する。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/31-2-ikizama-index-page.md`
- `.raw/contents/ikizama-index.md`
- `docs/plan.md` の `31-2-ikizama-index-page`
- `docs/requirements/pages.md` の `/data/ikizama`
- `docs/conversion/ikizama-index.md`
- `docs/conversion/ikizama-skills.md`
- `docs/TODO.md` の流儀・生き様サイドメニュー追跡項目
- `docs/out-of-scope.md`
- `docs/design/global-styles/`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/ikizama-detail/`（`IkizamaDataSection`の既存表示制約のみ）

対応するcontentsのユーザー編集Markdown本文とHTMLコメントは、ページ本文・可視の表示構成について、ユーザーの最新指示と安全・workflow規約を除く他の参照資料より優先する。

## Design direction

- visual direction: 白寄りの本文面、低彩度border、暗い本文色、青緑accentを維持する。生き様一覧は名称・短い説明・専用アイテムを罫線と余白で整理し、情報量を詳細ページへ重複させない。
- layout direction: desktopはHeader、左SiteMenu、中央本文、右PageTocの3レールを維持する。中央本文はH1、hero、導入、「生き様データの見方」、3項目説明、「生き様一覧」の順に置く。mobileは本文幅を保ち、H1横のMobilePageToc triggerだけを表示する。
- typography direction: H1はcontentsどおり`生き様`とする。H2は`生き様データの見方`、`生き様一覧`の順とし、H1はPageTocに含めない。各生き様名と専用アイテム名はリンクとして表示し、短い説明は自然に折り返す。
- color / accent usage: 青緑accentは生き様名・専用アイテム名リンク、見出し下の短いmarker、現在のSiteMenu項目に限定する。hero画像へ文字overlay、caption、追加の装飾を重ねない。

## Existing design constraints

- `global-styles`の白寄り背景、暗めグレーHeader、system font、低彩度border、spacing rhythmを維持する。
- `site-layout`のHeader、Footer、PC左SiteMenu、PC右PageToc、mobileのMobilePageToc triggerを再設計しない。
- `page-toc`の方針に従い、H1を目次に含めず、H2の`生き様データの見方`と`生き様一覧`だけを表示する。現在位置ハイライトは描かない。
- `ikizama-detail`の`IkizamaDataSection`のdesktop 3列・mobile上段2列＋副能力係数の下段全幅、`SkillCard`の情報順・密度を、ブライの代表例に再利用する。
- SiteMenuは既存の`データ`→`生き様`の階層を維持し、生き様詳細の子項目は追加しない。
- heroには`public/images/data/ikizama_hero.webp`を使い、ページ側の文字を重ねない。

## Out of scope

- 生き様詳細のSiteMenu項目、サイドメニューへの生き様リスト追加
- 検索、絞り込み、ソート、ページネーション、比較・計算UI
- 生き様詳細ページ、既存`IkizamaDataSection`、`SkillCard`、Header、Footer、SiteMenu、PageTocの再設計
- パンくず、前後ナビゲーション、ページ内目次の現在位置ハイライト
- Excel変換、JSON、schema、取得層、専用アイテム実体、アイテム一覧への導線
- キャラクター作成ウィザード、キャラクターシート、ダイスローラー、戦闘シミュレーター
- DB、認証、SSR、CMS、APIサーバー、新しいUIライブラリ

## Comparison points for implementation

- desktopで、`データ`の祖先表示と現在の`生き様`を含む左SiteMenu、中央本文、右PageTocが競合せず、本文幅を保つ。
- mobileで、H1、hero、ブライの生き様データgrid、3項目説明、一覧が横overflowせず読める。生き様データは生き様ボーナス・能力値ポイントの上段2列と、副能力係数の下段全幅を維持する。
- PageTocはH2の2項目だけを表示し、`IkizamaDataSection`内のH3、空の見出し、breadcrumb、前後ナビゲーション、検索UIを追加しない。
- 一覧は入力順を変えず、各生き様の名称リンク、`shortDescription`、専用アイテム名称リンクを対応付ける。説明が長い場合は切り詰めず自然に折り返し、IDや別途の詳細導線文言は表示しない。
- 専用アイテム名称は、一覧から各生き様詳細へ進む補助リンクとして扱い、アイテム種別ページへの導線にはしない。
- 許容差分: 実データの説明文による行数、一覧の縦方向の長さ、heroの自然な表示比率。
- 要レビュー差分: heroへの文字overlayまたはcaption、詳細ページ情報の過剰重複、入力順変更、サイドメニュー詳細項目の追加、SiteMenu / PageTocの役割混同、mobileの横overflow。

## Generation source

- prototype or generator source: standalone HTML/CSS prototypeをPlaywrightでcaptureした。実装済みサイト、Visual Review成果物、`test-results/`は画像源に使っていない。
- source branch / commit: `31-2-ikizama-index-page` / `75fa730`
- route: `/data/ikizama`（未実装のためprototypeで表現）
- viewport: desktop `1440x1200`、mobile `390x900`。両方ともfull-page screenshot。
- prototype path / capture notes:
  - `.tmp/design/ikizama-index/prototype.html`
  - `.tmp/design/ikizama-index/capture.mjs`
  - `public/images/data/ikizama_hero.webp` をdata URLとしてprototypeへ埋め込み、ページ側の文字overlayやcaptionは追加していない。
  - ブライの生き様データは既存の変換済みデータとスキルデータをもとにした代表例である。実装時は既存取得層を利用する。
  - 一覧は現在の生成データ4件を入力順に示す。実装時は固定記述せず`getIkizamaList()`を使う。

## Open questions

- initial draftの確認後、一覧行で専用アイテムへのリンクを、名称の直下に置く現在のmobile配置で進めてよいか。
