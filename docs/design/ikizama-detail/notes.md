# ikizama-detail

## Mode

- initial draft

## Target

- page / component: 生き様詳細ページ / 生き様データComponent
- route: `/data/ikizama/[ikizamaId]`
- viewport: desktop `1440x1200`、mobile `390x900`
- states: default。ブライのデータを表示する。

## Referenced SSoT

- `.raw/contents/ikizama-detail.md`
- `docs/issue/32-2-ikizama-detail-page.md`
- `docs/requirements/pages.md` の FR-06
- `docs/requirements/data-display.md` の FR-04-01、FR-04-04
- `docs/out-of-scope.md`
- `docs/plan.md` の `32-2-ikizama-detail-page`
- `docs/TODO.md` のサイドメニューへの生き様リスト追加
- `docs/conversion/ikizama-index.md`
- `docs/conversion/ikizama-skills.md`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/skill-card/`
- `docs/design/ryugi-detail/`

## Design direction

- visual direction: 白寄りの本文面、低彩度border、暗い本文色、青緑accentを維持する。ブライのhero画像をH1直後へ置き、画像上の文字overlayやcaptionは追加しない。
- layout direction: desktopは既存の左右レールと中央本文の3レールlayoutを使う。本文ではH1、hero、説明、生き様データ、生き様スキル、専用アイテムをcontentsの順に置く。生き様データはdesktopで、生き様ボーナス、能力値ポイント、副能力係数をこの順の1行3列に置く。mobileは、生き様ボーナスと能力値ポイントを上段の2列、副能力係数を下段の全幅に置く。
- typography direction: H1は `生き様：ブライ` と表示し、underlineのaccentは既存prose見出しと同じ暗いグレーを使う。H2は左borderと下線を持つ。生き様データ内の生き様ボーナス、能力値ポイント、副能力係数はH3とする。スキルの名称、最大LV、メタ情報、詳細表、効果文の順は既存`SkillCard`を維持する。
- color / accent usage: 青緑はスキル名下線、最大LV、専用アイテムリンクに限定する。所属、カテゴリ、IDは可視ラベルにしない。

## Existing design constraints

- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `page-toc` に従い、H1を目次に含めず、H2 / H3の見出し階層を維持する。目次の現在位置ハイライトを描かない。
- `skill-card` のdesktop 3列・mobile 2列、情報の順序、可変高さ、summary非表示を維持する。
- 生き様データComponentは、hero、説明、基本・上級スキル、専用アイテムに依存しない。desktopでは生き様ボーナス、能力値ポイント、副能力係数の順で1行3列、mobileでは前2者を上段2列、副能力係数を下段全幅とする。
- heroは `public/images/data/ikizama/burai_hero.webp` を表示し、altは`ブライのイメージ`とする。実装時は静的公開のbase pathを考慮する。

## Out of scope

- 検索、絞り込み、ソート、ページネーション、詳細遷移、クライアント状態管理
- アイテム実体、個別ItemCard、個別アイテムアンカー、アイテム種別固有のルール本文
- キャラクター作成ウィザード、能力値・ボーナスの自動計算、ダイスローラー、キャラクターシート
- パンくず、前後ナビゲーション、目次の現在位置ハイライト、heroのcaptionや文字overlay
- Header、Footer、SiteMenu、PageToc、MobilePageToc、`CardContainer`、`SkillCard`の再設計
- DB、認証、SSR、CMS、APIサーバー、新しいUIライブラリ

## Comparison points for implementation

- desktopで、H1・hero・説明・生き様データ・スキル一覧・専用アイテムが中央本文レールに自然に収まり、左右レールと競合しない。生き様データは左から生き様ボーナス、能力値ポイント、副能力係数の1行3列とする。
- mobileで、H1とMobilePageToc trigger、hero、生き様ボーナスと能力値ポイントの上段2列、および副能力係数の下段全幅、2列のスキルカードが横overflowせず読める。
- `skills.bonus` は生き様データ内のH3 `生き様ボーナス` の直下に先頭要素だけを1カードで表示する。`basic`、`advanced` は入力順を維持し、空カテゴリでは見出しと一覧を出力しない。
- 能力値ポイントは入力順を保持し、副能力係数はレベル1〜3、4〜9、10以上の体力係数・精神力係数を表で示す。
- 専用アイテムは種別リンクだけを表示し、個別アイテムや個別アンカーを追加しない。
- 許容差分: 実データによる説明文・スキル本文の行数、カードの高さ、heroの自然なトリミング。
- 要レビュー差分: heroのoverlay / caption、データgridのdesktopでの1行3列またはmobileでの上段2列・下段全幅の崩れ、`SkillCard`の情報順・色・密度の変更、空カテゴリの見出し表示。

## Generation source

- prototype or generator source: standalone HTML/CSS prototypeをPlaywrightでcaptureした。実装済みサイト、`test-results/`、`playwright-report/`は画像源に使っていない。
- source branch / commit: `32-2-ikizama-detail-page` / `e062aba`
- route: `/data/ikizama/[ikizamaId]` の想定画面。prototype内ではブライを使った。
- viewport: desktop `1440x1200`（full page `1440x2655`）、mobile `390x900`（full page `390x2627`）
- prototype path / capture notes:
  - `.tmp/design/ikizama-detail/prototype.html`
  - `.tmp/design/ikizama-detail/capture.mjs`
  - `data/generated/ikizama.json` のブライの説明、能力値ポイント、副能力係数、専用アイテムを表示した。
  - `data/generated/ikizama-skills.json` のブライのボーナススキル、基本スキル、上級スキルを代表例として表示した。
  - `public/images/data/ikizama/burai_hero.webp` をprototypeへ埋め込んでcaptureした。
  - Chromium sandboxの制約により、captureは承認済みのローカル実行で行った。

## Open questions

- 初期draft。生き様ボーナスは生き様データ内のH3として扱い、desktopの1行3列とmobileの上段2列・下段全幅の配置を確認する。
- ブライ以外に任意の`note`を持つ生き様では、hero直後のCalloutを既存Componentの見た目のまま追加する。
