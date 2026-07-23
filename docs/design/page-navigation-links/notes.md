# page-navigation-links

## VRT baseline

- test: `tests/visual/vrt/page-navigation-links.spec.ts` の `@vrt @page-navigation-links @<state> @<viewport>`
- route: `/-local/page-navigation/`
- state: default
- snapshots:
  - desktop `1440x1200`: `page-navigation-links-default-desktop.png`
  - tablet `820x1180`: `page-navigation-links-default-tablet.png`
  - mobile `390x900`: `page-navigation-links-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: `AppContainer` がページ本文末尾に表示する前後ページナビゲーション
- route: `/-local/page-navigation/`。キャラクターメイキングとキャラクター成長を同時に表示する公開対象外の確認routeを、design正本化のcaptureに使う。
- viewport:
  - mobile: `390x900`
  - desktop: `1440x1200`
- states:
  - `design-mobile.png`: リンク文字列のみ + 横向き三角
  - `design-desktop.png`: リンク文字列のみ + 横向き三角

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- historical issue (provenance only): `docs/issue/done/cross-phase/ex-01-page-navigation-links.md`
- `docs/requirements.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/mobile-page-toc/notes.md`

## Design direction

- visual direction: 白寄りの本文面、暗めのHeader / Footer、控えめな青緑の操作accentを維持する。ページ下部の導線であり、heroや大きなCTAにはしない。ナビゲーション領域だけの背景色や区切り線は使わず、本文と同じ白から余白でつなげる。
- layout direction: 本文直後かつFooter前に、見出しを置かず前ページと次ページを横並びで置く。片側しかない始端・終端では、存在するリンクだけを表示できる構造とする。
- typography direction: `label` はサイトメニューの表示名を使う。本文フォントサイズの太字と単一行を使い、`キャラクターメイキング` と `キャラクター成長` を390px幅で併記しても折り返し・省略表示を起こさないようにする。
- color / accent usage: リンク文字列と横向き三角iconは青緑にする。下線はlabelだけに付け、iconには付けない。枠、button surface、過剰な発光、マゼンタは使わない。

## Existing design constraints

- `global-styles` の白寄り本文面、暗めグレーHeader、青緑accent、system fontを維持する。
- `site-layout` のHeader / Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- SiteMenuはサイト全体の移動、PageTocは現在ページ内の移動、前後ナビゲーションは読書順の移動として役割を分ける。
- 44px以上を目安にタップできる高さを持たせ、始端・終端で空の枠を表示しない。

## Out of scope

- サイトメニュー、ページ内目次、パンくずリスト、検索UIの再設計
- トップページ、更新履歴、サポート、Webキャラクターシート、404ページへの前後ナビゲーション表示
- 複数ページを一括設定する共通config
- ダイスローラー、キャラクター作成ウィザード、永続保存、DB、認証、SSR、CMS
- hover、focus、disabled、片側リンクのみの個別画像。選択後のdesignで必要なら追加する。

## Comparison points for implementation

- 本文直後・Footer前に置かれ、SiteMenuやPageTocと混同しない。
- `label` が対応するサイトメニュー名と一致する。
- 390px幅で長い2つのlabelが横並びのまま、ページ全体に横overflowを起こさない。
- 枠なしのテキストリンクでも、少なくとも44px相当のタップ領域を持つ。
- 片側だけのページでは存在しないリンクとその空枠を表示しない。
- 矢印または横向き三角が前後の方向を示し、本文の装飾記号と混同しない。

## Generation source

- initial draft source:
  - mobile: `.tmp/design/page-navigation-links/prototype.html`
  - desktop: `.tmp/design/page-navigation-links/prototype-desktop.html`
- current VRT: `tests/visual/vrt/page-navigation-links.spec.ts` の`@vrt @page-navigation-links`

## Open questions

- 始端・終端の片側リンク状態を別途作成するか。
