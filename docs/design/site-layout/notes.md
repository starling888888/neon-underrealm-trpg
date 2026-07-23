# site-layout

## VRT baseline

- test: `tests/visual/vrt/site-layout.spec.ts` の `@vrt @site-layout @<state> @<viewport>`
- route: `/-local/mdx-test/`
- state: default
- snapshots:
  - desktop `1440x1200`: `site-layout-default-desktop.png`
  - tablet `820x1180`: `site-layout-default-tablet.png`
  - mobile `390x900`: `site-layout-default-mobile.png`
- mobile state snapshots: `site-layout-mobile-menu-open-mobile.png`, `site-layout-mobile-page-toc-open-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: layout一式。`AppContainer.astro`、ToCあり本文用 `TocPageLayout.astro`、ToCなし本文用 `NoTocPageLayout.astro`、MDX本文用 `MDXLayout.astro`、Header、Footer、SiteMenu、`MobileSiteMenuDrawer.astro`、PageToc、MobilePageToc、現在ページハイライトを含む。
- route:
  - standard layout / mobile page toc open: `/-local/mdx-test/`
  - mobile menu open: `/-local/data-cards/`
- viewport:
  - desktop: `1440x1200`
  - tablet: `820x1180`
  - mobile: `390x900`
- states:
  - desktop standard layout
  - tablet standard layout
  - mobile standard layout
  - mobile site menu drawer open
  - mobile page toc open

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/notes.md`
- `docs/design/site-menu/notes.md`
- `docs/design/mobile-menu/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/mobile-page-toc/notes.md`
- `docs/design/current-menu-highlight/notes.md`

## Historical source issues

- `docs/issue/done/phase-2/16-layout-screenshot-design-refresh.md`

## Design direction

- visual direction: 白寄り本文面、暗めHeader / Footer、青緑accentを維持し、Phase 2で実装したレイアウト / ナビゲーションを横断的な完成状態として扱う。
- layout direction: desktopではHeader、Footer、PC左SiteMenu、中央本文、PC右PageTocを組み合わせる。tablet / mobileではPC右PageTocを常設表示せず、MobilePageTocを本文H1横から開ける構造にする。本文H1とMobilePageToc triggerを含むheading rowは上部にsticky表示し、スクロール後も目次へ戻れるようにする。mobileではPC左SiteMenuを常設表示せず、Header左のMobileMenu drawerから開く。
- typography direction: system font、letter-spacing 0、本文可読性を維持する。SiteMenuとPageTocは本文より小さく、役割差が分かる密度にする。
- color / accent usage: 青緑accentはリンク、focus、現在ページハイライトなど操作対象と状態表示に限定する。過剰な発光、マゼンタ主体、hero的な大面積装飾は使わない。

## Existing design constraints

- `global-styles` の白寄り背景、暗めHeader、青緑accent、実務的な密度を維持する。
- `base-layout` の共通layout構造を、実装済みHeader / Footer / navigationを含む完成状態として扱う。
- `site-menu` と `page-toc` は役割差を維持する。SiteMenuはサイト内移動、PageToc / MobilePageTocは現在ページ内移動である。
- `mobile-menu` と `mobile-page-toc` は役割差を維持する。MobileMenuはサイト全体のdrawer、MobilePageTocはH1付近から開く現在ページ内目次である。
- `current-menu-highlight` の方針に従い、現在ページそのものとancestor表示は見分けられるが、hover / focusやページ内目次の現在位置ハイライトとは混同しない。
- このdesign targetの正本化時点では `/release-notes` と `/404` は未実装routeだった。現在の `/release-notes` は `docs/design/release-notes/` を正本として扱い、このdesign targetでは横断layout状態の代表routeには含めない。
- `/-local/data-cards/` は、MobileMenu open stateを比較する横断layout用fixtureである。

## Out of scope

- 新しいUI機能の追加
- Header / Footerの再設計
- SiteMenu / MobileMenuの階層構造変更
- PageToc / MobilePageTocの見出し抽出仕様変更
- ページ内目次の現在位置ハイライト
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI、検索結果、Pagefind導入
- `/release-notes`、`/404` の新規作成。このdesign targetでは扱わず、現在の `/release-notes` は `docs/design/release-notes/` を参照する。
- ルール本文の本格移植
- Excel変換、JSON変換パイプライン、データカード、一覧フィルタ
- キャラクターシート、ダイスローラー、戦闘シミュレーター
- DB、認証、SSR、CMS、APIサーバー
- 高度なアニメーション、過剰なneon glow表現

## Comparison points for implementation

- Header / Footer / SiteMenu / MobileMenu / PageToc / MobilePageToc / 現在ページハイライトが1つのサイトとして一貫して見える。
- desktopではPC左SiteMenuとPC右PageTocが同時に成立し、本文幅を不自然に圧迫しない。
- tablet / mobileではPC右PageTocが常設表示されず、MobilePageTocが本文H1横に表示される。
- mobileではPC左SiteMenuが常設表示されず、MobileMenu drawerから開ける。
- MobileMenu open stateとMobilePageToc open stateが視覚的に混同されない。
- スクロール後も本文H1とMobilePageToc triggerが上部に残り、目次triggerが画面外へ消えない。
- 現在ページハイライトはSiteMenu上で識別でき、hover / focus / disclosure open stateと混同されない。
- `/` では不要なPageToc / MobilePageTocや空のTOC枠が表示されない。
- `/release-notes` / `/404` をこのdesign targetで作成または描き足していない。現在の `/release-notes` の比較は `docs/design/release-notes/` で扱う。
- VRT baselineで、コンテンツ全体像と縦方向の破綻有無を確認できる。

## Generation source

- source branch / commit when applicable: `16-layout-screenshot-design-refresh`
- route / viewport / snapshots:
  - `/-local/mdx-test/`, desktop `1440x1200`, tablet `820x1180`, mobile `390x900`: default state
  - `/-local/data-cards/`, mobile `390x900`: mobile menu open
  - `/-local/mdx-test/`, mobile `390x900`: mobile page toc open
- baseline rationale: Phase 2完了時点の横断layoutを後続比較の基準とする。Visual Review失敗を隠す目的で更新しない。

## Differences from previous design references

- `base-layout` の左右レールplaceholderではなく、実装済みのSiteMenu / PageTocを含む。
- `site-menu` / `mobile-menu` の初期draftでは扱わなかった現在ページハイライトとancestor表示を、`current-menu-highlight` 実装後の完成状態として含む。
- `mobile-page-toc` のtrigger可視ラベルは現行実装の `目次` に寄せる。
- `mobile-page-toc` のH1横triggerは、スクロール時にH1とともに上部sticky表示される現行実装に寄せる。
- `page-toc` の `/release-notes` / `/404` 非表示状態は、このdesign target正本化時点では未実装routeだったため新規画像化していない。現在の `/release-notes` は `docs/design/release-notes/` を参照する。
- 正本画像はviewport cropではなくfullPage screenshotを含む。コンテンツ全体像と縦方向の破綻確認を優先するためである。

## Canonicalization rationale

- `15-current-menu-highlight` までのlayout / navigation実装が積み上がり、個別Componentのinitial draftより現行実装の横断状態を後続比較基準にする必要がある。
- `site-layout` は個別design targetを置き換えるものではなく、完成状態の横断正本として扱う。
- fullPage screenshotを採用することで、HeaderからFooterまでの縦方向のつながり、MobilePageToc open時の本文全体との重なり、余白や横スクロールの破綻を確認しやすくする。

## Open questions

- `/404` 実装後に、site-layout正本へ非表示状態画像を追加するか。
- `/data/items/weapons/` のMobileMenu open stateを、横断layoutの代表routeとして維持するか。
- fullPageとviewport cropの両方を将来のVisual Reviewで扱う必要があるか。
