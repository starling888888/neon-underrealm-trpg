# ikizama-index

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT ikizama-index default <viewport>`
- route: `/data/ikizama/`
- state: default
- snapshots:
  - desktop `1440x1200`: `ikizama-index-default-desktop.png`
  - tablet `820x1180`: `ikizama-index-default-tablet.png`
  - mobile `390x900`: `ikizama-index-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

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
- SiteMenuは既存の`データ`→`生き様`の階層を維持し、`getIkizamaList()`の入力順で各生き様詳細への第3階層リンクを表示する。SiteMenuの情報設計や表示方式は再設計しない。
- heroには`public/images/data/ikizama_hero.webp`を使い、ページ側の文字を重ねない。

## Out of scope

- 検索、絞り込み、ソート、ページネーション、比較・計算UI
- 生き様詳細ページ、既存`IkizamaDataSection`、`SkillCard`、Header、Footer、SiteMenu、PageTocの再設計
- パンくず、前後ナビゲーション、ページ内目次の現在位置ハイライト
- Excel変換、JSON、schema、取得層、専用アイテム実体、個別アイテムアンカー
- キャラクター作成ウィザード、キャラクターシート、ダイスローラー、戦闘シミュレーター
- DB、認証、SSR、CMS、APIサーバー、新しいUIライブラリ

## Comparison points for implementation

- desktopで、`データ`の祖先表示、現在の`生き様`、各生き様詳細への第3階層リンクを含む左SiteMenu、中央本文、右PageTocが競合せず、本文幅を保つ。
- mobileで、H1、hero、ブライの生き様データgrid、3項目説明、一覧が横overflowせず読める。生き様データは生き様ボーナス・能力値ポイントの上段2列と、副能力係数の下段全幅を維持する。
- PageTocはH2の2項目だけを表示し、`IkizamaDataSection`内のH3、空の見出し、breadcrumb、前後ナビゲーション、検索UIを追加しない。
- 一覧は入力順を変えず、各生き様の名称リンク、`shortDescription`、専用アイテム名称リンクを対応付ける。説明が長い場合は切り詰めず自然に折り返し、IDや別途の詳細導線文言は表示しない。
- 専用アイテム名称は対応するアイテム種別ページへのリンクとして扱う。個別アイテム、ItemCard、アイテム種別固有のルール本文は表示しない。
- 許容差分: 実データの説明文による行数、一覧の縦方向の長さ、heroの自然な表示比率。
- 要レビュー差分: heroへの文字overlayまたはcaption、詳細ページ情報の過剰重複、入力順変更、SiteMenu / PageTocの役割混同、mobileの横overflow。

## Generation source

- canonicalization source: ユーザー承認済みの`/data/ikizama/`実装を、公式visual capture workflowでdesktop / mobileともにfull-page captureする。初期draftとの差分は、実装済みの検索Header、SiteMenuの生き様第3階層、専用アイテム種別リンク、実データによる本文密度とFooterであり、いずれも現行のlayoutおよびcurrent issueと整合する。

## Differences from previous design references

- 初期draftでは対象外としていたSiteMenuの生き様詳細子項目を、`getIkizamaList()`由来の第3階層リンクとして含める。
- 初期draftで生き様詳細へ向けていた専用アイテム名称を、対応する専用アイテム種別ページへのリンクとして含める。
- 現行の横断layoutに合わせ、検索Header、Footer、実データによる一覧の高さを含むfull-page screenshotを採用する。

## Canonicalization rationale

- PRレビューで確認したdesign正本とcurrent issueのscope不整合を解消し、ユーザー確認済み実装を以後のVisual Review基準とする。

## Open questions

- なし。一覧行の専用アイテムリンクは、名称の直下に置く現在のmobile配置をdesign正本として採用済みである。
