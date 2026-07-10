# callout

## Mode

- initial draft

## Target

- page / component: `src/components/_common/Callout.astro`
- route: Component単体design。実装後の確認 route は `/mdx-test/` を想定する。
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - static default state
  - `note`, `tip`, `warning`, `danger`, `example`, `version` の6種
  - title省略時の既定ラベル表示を主対象にする

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/20-1-common-callout-component.md`
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

## Design Direction

- visual direction: 白寄り本文面、低彩度border、控えめな左線、ラベル、種別マーカーを組み合わせた本文内Calloutにする。通常本文より識別しやすいが、ページ全体の視線を奪いすぎない。
- layout direction: 本文カラム内で幅いっぱいに置かれる静的な情報枠にする。desktop / mobileとも縦積みを基本にし、6種を同じ条件で比較できるようにする。
- typography direction: system font、letter-spacing 0、本文より少し強いラベル、読みやすい本文行間を維持する。Calloutタイトルは見出し階層ではなくラベル相当として扱う。
- color / accent usage: `note` と `version` はneutral / prose accent系、`example` は淡い青灰色の背景と破線border、`tip` は青緑accent系、`warning` はwarning、`danger` はdangerを使う。TRPGルール本文では例示の重要度が高いため、`example` は `version` より視認しやすくする。6種すべてを強い別色へ分けず、ラベルと種別マーカーで意味差を補う。
- icon usage: 既存依存の `simple-icons` を使い、6種すべての種別マーカーを実装時に表示できるアイコンにする。初期案は `note` = `siNote`、`tip` = `siLighthouse`、`warning` = `siAdguard`、`danger` = `siOpenbugbounty`、`example` = `siBookstack`、`version` = `siGit` とする。

## Existing Design Constraints

- `global-styles` の白寄り背景、暗め本文色、低彩度border、実務的な情報密度を維持する。
- 青緑accentは操作対象や状態表示の印象が強くなりすぎない範囲で `tip` の補助色として使う。
- warning / danger以外に暖色を強く使わない。
- 過剰な発光、グラデーション、ぼかし、大面積のネオン表現は使わない。
- `src/styles/prose.css` の暫定 `.callout*` は実装時に整理対象とし、designでは6種すべてをComponentとして扱う。
- 本文カラム外のHeader、SiteMenu、PageToc、FooterはこのComponent単体designでは描かない。
- Calloutの種別は色だけでなく、ラベル、左線、`simple-icons` 由来の種別マーカーで判別できるようにする。
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
- 6種すべてに `simple-icons` 由来の色以外の種別マーカーがある。
- `warning` と `danger` は強度差が分かるが、`danger` が過剰に画面を支配しない。
- `example` は本文理解を助ける重要な例示として、`version` より視認しやすい。
- `note`, `tip`, `example`, `version` は色数を増やしすぎず、ラベルとマーカーで識別できる。
- `version` は専用のバージョン番号バッジや追加propsを持たず、必要な版表記はCallout本文内で扱う。
- desktopでは本文カラム幅でCalloutが自然に縦積みされる。
- mobileでは左右余白、ラベル、本文、折り返しが破綻しない。
- Calloutタイトルはページ内目次に入る見出し要素に見えすぎない。
- slot内の段落、箇条書き、リンク、inline code、`strong` を置いても余白が破綻しない方向になっている。
- 実装時に既存 `.prose .callout*` とComponent scoped styleの責務が重複しない。
- Playwright actual screenshotをこのdesign画像へ直接上書きしない。

## Generation Source

- generator or capture source: `simple-icons` のSVG pathを含む手製SVGを、Playwright / ChromiumでPNGへレンダリングしたinitial draft。`simple-icons` は既存依存を利用し、このdesign作成で新規npm packageは追加していない。
- source branch / commit when applicable: `20-1-common-callout-component`
- route when applicable: Component単体design。実装後の確認 route は `/mdx-test/` を想定する。
- viewport:
  - `design-desktop.png`: `1440x1200`
  - `design-mobile.png`: `390x900`
- prompt summary or capture notes: 6種のCalloutを同じ本文カラム条件で比較する。global stylesの白寄り背景、低彩度border、neutral / teal / warning / danger token方向を守り、色だけに依存しないラベルと `simple-icons` 由来の種別マーカーを配置した。元SVGは `.tmp/callout-design/` に作成した一時生成元であり、design正本ではない。

## Open Questions

- `simple-icons` はブランドアイコン集であるため、各Callout種別への割り当てが意味的に不自然でないか。
- `title` 指定時に既定ラベルを完全に置き換えるか、種別ラベルとtitleを併記するか。
