# callout

## Mode

- design fix

## Target

- page / component: `src/components/_common/Callout.astro`
- route: `/-local/callouts/`
- viewport:
  - desktop: `1440x1200` viewport, full-page capture
  - mobile: `390x900` viewport, full-page capture
- states:
  - static default state
  - `note`, `tip`, `warning`, `danger`, `example`, `version` の6種
  - title省略時の既定ラベル表示
  - `title` 指定時の表示
  - `titleHeadingLevel` 指定時の見出し化

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/done/phase-3/20-1-common-callout-component.md`
- `docs/requirements.md`
- `docs/requirements/components.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `src/styles/tokens.css`
- `src/styles/prose.css`
- `src/components/_common/Callout.astro`
- `src/pages/-local/callouts.mdx`
- `tests/visual/callout.spec.ts`

## Canonicalization Note

- このdesignは、initial draftの `simple-icons` / 破線border案を、実装レビュー後の現行実装に合わせて正本化したもの。
- 旧initial draft画像では `simple-icons` 由来のマーカーと `example` の破線borderを使っていたが、現在の正本では新規依存を追加しない記号マーカーを採用する。
- 現行マーカーは `note`: `i`、`tip`: `?`、`warning`: `!`、`danger`: `!!`、`example`: `#`、`version`: `v` とする。
- `example` は破線borderではなく、青灰色系の背景、実線border、左線、ラベル、記号マーカーで識別する。

## Design Direction

- visual direction: 白寄り本文面、低彩度border、控えめな左線、ラベル、種別マーカーを組み合わせた本文内Calloutにする。通常本文より識別しやすいが、ページ全体の視線を奪いすぎない。
- layout direction: 本文カラム内で幅いっぱいに置かれる静的な情報枠にする。desktop / mobileとも縦積みを基本にし、6種を同じ条件で比較できるようにする。
- typography direction: system font、letter-spacing 0、本文より少し強いラベル、読みやすい本文行間を維持する。Calloutタイトルは既定では見出し階層ではなくラベル相当として扱う。ページの見出し構造へ含める必要がある場合だけ、`titleHeadingLevel`でH2〜H6を明示指定できる。指定時もCallout titleの視覚サイズはラベル相当の密度を維持する。
- color / accent usage: `note` と `version` はneutral / prose accent系、`example` は淡い青灰色の背景と実線border、`tip` は青緑accent系、`warning` はwarning、`danger` はdangerを使う。TRPGルール本文では例示の重要度が高いため、`example` は `version` より視認しやすくする。6種すべてを強い別色へ分けず、ラベルと種別マーカーで意味差を補う。
- marker usage: 新規アイコンpackageを追加せず、6種すべての種別マーカーを短い記号で表示する。マーカーは装飾要素として扱い、支援技術で重複して読ませない。

## Existing Design Constraints

- `global-styles` の白寄り背景、暗め本文色、低彩度border、実務的な情報密度を維持する。
- 青緑accentは操作対象や状態表示の印象が強くなりすぎない範囲で `tip` の補助色として使う。
- warning / danger以外に暖色を強く使わない。
- 過剰な発光、グラデーション、ぼかし、大面積のネオン表現は使わない。
- `src/styles/prose.css` の暫定 `.callout*` は実装時に整理対象とし、designでは6種すべてをComponentとして扱う。
- full-page captureでは、既存SiteLayoutのHeader、SiteMenu、PageToc、Footerを含むが、評価対象は本文カラム内のCallout表示とする。
- Calloutの種別は色だけでなく、ラベル、左線、記号マーカーで判別できるようにする。
- `titleHeadingLevel`は、支援技術の見出し階層を指定するためのopt-inとする。既存PageToc / MobilePageTocの対象はH2とH3だけであり、H4〜H6は目次へ入れない。未指定の既定titleと`title`指定titleも、引き続き目次へ入れない。
- 画像内の本文は見た目確認用の短い代表文であり、正式なゲームルール本文ではない。

## Out Of Scope

- `Callout.astro` の実装
- `/introduction.mdx` や後続ルールページの作成
- `.raw/contents/*.md` の作成または編集
- Google Drive上の原稿更新
- raw Markdown向けの独自directive記法
- remark / rehype plugin追加
- collapsible / dismissible / toast / modal / dynamic alert
- `role="alert"` を使う即時通知UI
- 任意色、任意アイコン、任意class注入、追加variant
- hover animation、発光表現、UI framework、新規アイコンpackage追加
- 検索UI、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API server

## Comparison Points For Implementation

- 6種すべてに視覚表示されるラベルまたはタイトルがある。
- 6種すべてに色以外の記号マーカーがある。
- `warning` と `danger` は強度差が分かるが、`danger` が過剰に画面を支配しない。
- `example` は本文理解を助ける重要な例示として、`version` より視認しやすい。
- `note`, `tip`, `example`, `version` は色数を増やしすぎず、ラベルとマーカーで識別できる。
- `version` は専用のバージョン番号バッジや追加propsを持たず、必要な版表記はCallout本文内で扱う。
- desktopでは本文カラム幅でCalloutが自然に縦積みされる。
- mobileでは左右余白、ラベル、本文、折り返しが破綻しない。
- 未指定のCalloutタイトルはページ内目次に入る見出し要素に見えすぎない。`titleHeadingLevel`を明示した場合だけ、指定レベルの見出しとして出力する。H2とH3だけが既存PageToc / MobilePageTocへ入り、H4〜H6は見出し構造だけに反映する。
- slot内の段落、箇条書き、リンク、inline code、`strong` を置いても余白が破綻しない方向になっている。
- 実装時に既存 `.prose .callout*` とComponent scoped styleの責務が重複しない。
- Playwright actual screenshotをこのdesign画像へ直接上書きしない。

## Generation Source

- generator or capture source: `tests/visual/callout.spec.ts` のPlaywright captureを確認し、ユーザー承認済みのdesign fix modeで現行実装を正本化した。
- source branch / commit when applicable: `20-1-common-callout-component` / `51f58d4`
- route when applicable: `/-local/callouts/`
- viewport:
  - `design-desktop.png`: `1440x1200` viewport, full-page capture
  - `design-mobile.png`: `390x900` viewport, full-page capture
- prompt summary or capture notes: 6種のCalloutとtitle指定例を実ページの本文カラム条件で比較する。global stylesの白寄り背景、低彩度border、neutral / teal / warning / danger token方向を守り、色だけに依存しないラベルと記号マーカーを配置した。`titleHeadingLevel`の追加はHTML構造だけを変え、H2とH3の指定時だけ既存PageToc階層へ反映する。Calloutの視覚的なtitle密度は変えないため、design画像の更新は不要と判断した。

## Open Questions

- `title` 指定時に既定ラベルを完全に置き換えるか、種別ラベルとtitleを併記するか。
