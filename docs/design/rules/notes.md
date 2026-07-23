# rules

## VRT baseline

- test: `tests/visual/vrt/rules.spec.ts` の `@vrt @rules @<state> @<viewport>`
- route: `/rules/`
- state: default
- snapshots:
  - desktop `1440x1200`: `rules-default-desktop.png`
  - tablet `820x1180`: `rules-default-tablet.png`
  - mobile `390x900`: `rules-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: `/rules` のルールトップ本文。`MDXLayout`、`ImageBlock`、Callout、PageToc、MobilePageTocを含む。
- route: `/rules/`
- viewport:
  - desktop: `1440x1200`、full-page capture
  - mobile: `390x900`、full-page capture
- states:
  - 基本判定とhero画像を含むdesktop本文ページ
  - 基本判定とhero画像を含むmobile本文ページ

## Referenced SSoT

- `AGENTS.md`
- `docs/issue/done/phase-3/23-2-rules-page.md`（historical source issue）
- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/callout/notes.md`

## Design Direction

- visual direction: 白寄りのルール本文面へ、机上の交渉と2個の10面体ダイスを描くheroをH1直後に置く。heroはページの主題を示すが、ページ全体をランディングページ風にしない。
- layout direction: desktopは左SiteMenu・中央本文・右PageTocの既存3カラムを維持する。heroは中央本文幅に収め、captionや別のoverlayを加えない。mobileではheroを本文幅へ縮小し、H1横のMobilePageTocを維持する。
- typography direction: H1、hero、短い導入、番号付きの判定手順、H3、例Callout、目標値と対抗判定、次ページ導線の読み順を保つ。
- color / accent usage: 既存の白寄り背景、濃いグレーの見出し罫線、青緑のリンク、青灰色の`example` Calloutを維持する。hero内の紫青ネオンは画像内に限定する。

## Existing Design Constraints

- `global-styles` の長文可読性と、過剰なhero装飾を避ける方針を維持する。
- `site-layout` のHeader、SiteMenu、PageToc、MobilePageTocを変更しない。
- `page-toc` のH2/H3抽出と、本文幅を不自然に圧迫しない方針を維持する。
- `callout` の`example`は本文例として表示し、titleを目次見出しへ含めない。
- `public/images/rules/hero.webp` 内の右下ゲームロゴは、ユーザー提供assetに焼き込まれた意図した要素として採用する。ページ側で同じロゴや追加overlayを重ねない。

## Out Of Scope

- 新しいinitial design draft
- Header / Footer / SiteMenu / PageToc / MobilePageTocの再設計
- ダイスローラー、計算フォーム、検索、パンくず、前後ナビゲーション
- hero画像の差し替え、追加overlay、画像最適化パイプライン
- `docs/design/`以外の実装またはcontents変更

## Comparison Points For Implementation

- H1直後のheroが中央本文幅内に収まり、desktop・mobileとも横overflowを起こさない。
- heroの後に短い導入と判定手順が自然に続く。
- desktopのPageTocとmobileのMobilePageTocがhero追加後も本文の見出しを扱う。
- 判定例Calloutが本文から区別され、出目、達成値、効果値を読み取れる。
- hero内のロゴは画像内容であり、ページ側のUIや追加overlayと誤認させない。
- 許容差分: hero画像の具体的な人物・背景描写、本文の改稿、本文の長さによるfull-page高さ。
- 要レビュー差分: heroの本文幅を超える表示、captionまたは追加overlay、global layoutの変更、画像により本文可読性が低下する状態。

## Generation Source

- prototype or generator source: ユーザー承認済みの現行実装をdesign fix modeで正本化した。
- source branch / commit when applicable: `23-2-rules-page` / `42f0580`
- route: `/rules/`
- viewport: desktop `1440x1200`、tablet `820x1180`、mobile `390x900`
- current VRT: `tests/visual/vrt/rules.spec.ts` の`@vrt @rules`で、desktop / tablet / mobileを比較する。

## Open Questions

- なし。hero画像を将来再生成・差し替えする場合も、画像右下の焼き込みロゴを維持する。
