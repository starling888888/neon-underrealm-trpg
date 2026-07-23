# base-layout

## VRT baseline

- test: `tests/visual/vrt/base-layout.spec.ts` の `@vrt @base-layout @<state> @<viewport>`
- route: `/-local/mdx-test/`
- state: default
- snapshots:
  - desktop `1440x1200`: `base-layout-default-desktop.png`
  - tablet `820x1180`: `base-layout-default-tablet.png`
  - mobile `390x900`: `base-layout-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## モード

- initial draft

## 対象

- page / component: `BaseLayout.astro` と `ContentLayout.astro`
- route: 共通Layout基盤。最初の適用先は `/`
- viewport: デスクトップのみ
- states: デスクトップ標準状態

## 参照したSSoT

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`

## Historical source issues

- `docs/issue/done/phase-2/09-base-layout.md`

## デザイン方針

- visual direction: 白寄りのルール参照面、暗めのニュートラルグレーヘッダー、控えめな青緑アクセントを使う。
- layout direction: 上部ヘッダー、左レールのプレースホルダー、本文カラム、右補助レールのプレースホルダー、フッターで構成するデスクトップ向けページシェルにする。
- typography direction: system fontを使い、日本語本文を読みやすくする。見出しは大きくしすぎず、letter-spacingは負値にしない。
- color / accent usage: アクセントはリンク、フォーカス、小さな状態表示に限定する。強い発光や大きなネオン演出は避ける。

## 既存デザイン制約

- `docs/design/global-styles/` の方向性を維持する。白寄り背景、暗めグレーヘッダー、青緑アクセント、控えめな面、ルール閲覧に耐える密度を守る。
- 左レールと右レールは構造プレースホルダーに留める。このタスクでは完成版のSiteMenuやPageTocにしない。
- 右補助エリアだけが背景色で強く分離される見た目は避ける。本文面と自然につながる白寄りの面、薄い境界線、控えめな余白で区切る。
- このタスクではHeaderとFooterの表示をlayout内にベタ書きしてよい。ただし、後続Componentへ置き換えやすい範囲に留める。
- このデザインはデスクトップ専用である。モバイルレイアウト、SiteMenuのモバイル非表示、モバイルメニュー挙動は意図的に表現しない。
- design画像は、今回実装するLayout構造の判断に必要な要素だけを描く。初期スコープ外または後続タスクで扱う具体UIは、ドラフトであっても描き込まない。

## スコープ外

- 完成版のHeader / Footer Component
- 完成版のPC SiteMenu挙動
- SiteMenuのモバイルでのハイド
- モバイルレイアウトとモバイルメニュー
- PageToc実装
- 検索UI
- パンくずリスト
- 前後ナビゲーション
- ページ内目次の現在位置ハイライト
- 完成版SiteMenu、完成版PageToc、パンくずリスト、検索UI、前後ナビゲーション、モバイルメニューは、Visual Review時の誤解を避けるためdesign画像にも含めない。
- キャラクターシート、ダイスローラー、戦闘シミュレーター、ログイン、CMS、DB、SSR、API連携機能

## 実装時の比較観点

- デスクトップレイアウトとして、暗めのヘッダー、ページ全体のシェル、左構造レール、読みやすい本文領域、右構造レール、フッターが存在する。
- メインコンテンツは読み物として成立し、ランディングページ風のヒーローになっていない。
- 右補助エリアの背景が色面として浮きすぎていない。本文面と一体感があり、境界線や余白で控えめに分かれている。
- プレースホルダーのレールは構造として分かるが、視覚的には控えめである。
- Header / Footer / rail は、後続タスクで置き換えやすい単純さに留まっている。
- モバイル専用挙動を実装または示唆していない。

## 生成元

- generator or capture source: SVGモックをImageMagickでPNGへ変換
- source branch / commit when applicable: `09-base-layout`
- route when applicable: `/`
- viewport: デスクトップ、1440px幅の参照画像
- prompt summary or capture notes: デスクトップ専用のルールサイトLayout基盤。Header / Footer / rail のプレースホルダーをlayout内ベタ書き前提で示し、global style tileの方向性を守る。スコープ外のナビゲーション機能は描き込まない。元SVGは `.tmp/` 配下で生成したもので、design正本ではない。

## 未決事項

- 左レールをすべてのデスクトップ幅で表示し続けるか、後続のbreakpointで折りたたむかは、後続のナビゲーションタスクで扱う。
- 右レールをPageTocにするか、別の補助領域にするかは、後続のPageTocタスクで扱う。

## site-layout正本化後の扱い

- `base-layout` は初期draftとして、Header / Footer / left rail / main content / right railの構造を確認するためのdesign targetとして維持する。
- `16-layout-screenshot-design-refresh` 以降の完成状態の横断正本は `docs/design/site-layout/` を参照する。
- `docs/design/site-layout/` では、left railはSiteMenu、right railはPageTocとして実装済み状態を扱う。
- mobile / tabletを含む現在のlayout全体、MobileMenu、MobilePageToc、現在ページハイライトを確認する場合も `docs/design/site-layout/` を参照する。
