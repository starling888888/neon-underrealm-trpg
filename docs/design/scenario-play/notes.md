# scenario-play

## Mode

- design fix

## Target

- page / component: `/rules/scenario-play` のPL向けシナリオ進行ルール本文。`MDXLayout`、`ImageBlock`、Callout、PageToc、MobilePageTocを含む。
- route: `/rules/scenario-play/`
- viewport:
  - desktop: `1440x1200`、full-page capture
  - mobile: `390x900`、full-page capture
- states:
  - hero画像、シーン進行、情報収集の例、縁、小銭、クライマックス前の装備変更、終了後処理を含む通常表示

## Referenced SSoT

- `AGENTS.md`
- `docs/issue/done/phase-3/24-2-scenario-play-page.md`（historical source issue）
- `docs/requirements.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/components.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/rules/notes.md`
- `docs/design/callout/notes.md`

## Design Direction

- visual direction: 白寄りのルール本文面に、交渉と跳躍を描くhero画像をH1直後へ置く。ページ全体をランディングページ風にせず、長いルール本文の読み順を優先する。
- layout direction: desktopでは左SiteMenu、中央本文、右PageTocの既存3カラムを維持する。mobileでは本文H1横のMobilePageTocを維持し、heroと本文を画面幅内へ収める。
- typography direction: シーン進行、各シーンの役割、情報収集、縁、小銭、クライマックス前の装備変更、終了後処理の見出し階層を保つ。情報収集の例は本文と区別されたCalloutで示す。
- color / accent usage: 既存の白寄り背景、濃いグレーの見出し罫線、青緑のリンク、青灰色の`example` Calloutを維持する。hero画像内の色彩は本文UIへ広げない。

## Existing Design Constraints

- `global-styles`の長文可読性と、過剰なhero装飾を避ける方針を維持する。
- `site-layout`のHeader、Footer、SiteMenu、PageToc、MobilePageTocを変更しない。
- `rules`のheroを本文幅内に置き、captionや追加overlayを加えない方針を継承する。
- `callout`の`example`は本文例として表示し、titleを目次見出しへ含めない。
- 提供hero画像の右下ゲームロゴは画像に焼き込まれた要素として保持し、ページ側で追加表示・隠蔽を行わない。

## Out Of Scope

- シナリオ、ハンドアウト、キャンペーン本文
- GM向けシナリオ作成支援、エネミー運用、裁定ガイド
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- ダイスローラー、計算フォーム、検索、パンくず、前後ナビゲーション
- hero画像の生成、差し替え、追加overlay、画像最適化パイプライン
- `docs/design/`以外の実装またはcontents変更

## Comparison Points For Implementation

- H1直後のheroが中央本文幅に収まり、desktop・mobileとも横overflowを起こさない。
- heroの後に短い導入、シーン進行、各シーンの役割が自然に続く。
- desktopのPageTocとmobileのMobilePageTocが本文の見出しを扱う。
- 情報収集の例Calloutが本文から区別され、判定数4から14の変化を読み取れる。
- 情報収集は登場PCのみ、各PCにつきシーンごとに1回、順番自由である。
- 縁は自身のPCが登場したシーンで、同じシーンに登場したキャラクター1人と結び、1シーンにつき1つである。
- 小銭の算出、非戦闘判定後の消費、クライマックス前の装備変更での範囲が段階的に読める。
- 許容差分: hero画像の具体的な描写、本文改稿、本文量によるfull-page高さ。
- 要レビュー差分: heroの本文幅超過、captionまたは追加overlay、global layoutの変更、画像により本文可読性が低下する状態。

## Generation Source

- prototype or generator source: ユーザー承認済みの現行実装をdesign fix modeで正本化した。
- source branch / commit when applicable: `24-2-scenario-play-page` / `e190558`
- route: `/rules/scenario-play/`
- viewport:
  - `design-desktop.png`: `1440x1200`、full-page
  - `design-mobile.png`: `390x900`、full-page
- capture source: `tests/visual/scenario-play.spec.ts` のPlaywright capture。ユーザーがdesign正本化を明示承認した現行実装を採用した。

## Open Questions

- なし。
