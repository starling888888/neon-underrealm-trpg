# page-navigation-links

## Mode

- initial draft

## Target

- page / component: `AppContainer` がページ本文末尾に表示する前後ページナビゲーション
- route: `/introduction` から `/advancement` までの対象ページ。初回draftでは、長いサイトメニュー名を併記するmobileの代表状態を描く。
- viewport:
  - mobile: `390x900`
  - desktop: `1440x1200`
- states:
  - `design-mobile.png`: リンク文字列のみ + 横向き三角
  - `design-desktop.png`: リンク文字列のみ + 横向き三角

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/ex-01-page-navigation-links.md`
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
- typography direction: `label` はサイトメニューの表示名を使う。`キャラクターメイキング` と `キャラクター成長` を390px幅で併記しても折り返し・省略表示を起こさないよう、11.5pxの太字と単一行を使う。
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

- prototype or generator source:
  - mobile: `.tmp/design/page-navigation-links/prototype.html`
  - desktop: `.tmp/design/page-navigation-links/prototype-desktop.html`
- capture source:
  - mobile: `.tmp/design/page-navigation-links/capture.mjs`
  - desktop: `.tmp/design/page-navigation-links/capture-desktop.mjs`
- source branch / commit when applicable: `ex-01-page-navigation-links` / `3222fef`
- route when applicable: standalone mobile layout prototype。実装routeは使用しない。
- viewport: mobile `390x900`、desktop `1440x1200`
- prototype path / prompt summary / capture notes: ユーザー指定の表示3種とicon2種を組み合わせた6案を比較し、枠なしテキストリンク + 横向き三角を採用した。`キャラクターメイキング` と `キャラクター成長` は同時に表示して確認した。

## Open questions

- 始端・終端の片側リンク状態を別途作成するか。
