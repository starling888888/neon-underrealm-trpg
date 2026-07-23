# items

## VRT baseline

- test: `tests/visual/vrt/items.spec.ts` の `@vrt @items @<state> @<viewport>`
- route: `/data/items/`
- state: default
- snapshots:
  - desktop `1440x1200`: `items-default-desktop.png`
  - tablet `820x1180`: `items-default-tablet.png`
  - mobile `390x900`: `items-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- initial draft

## Target

- page / component: アイテムトップページ
- route: `/data/items/`
- viewport:
  - desktop: `1440x1200`、full-page
  - mobile: `390x900`、full-page
- states:
  - desktop standard layout。Header、SiteMenu、本文、PageTocを表示する。
  - mobile standard layout。Header、本文、MobilePageToc triggerを表示する。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/done/phase-3/33-2-items-index-page.md`
- `docs/requirements/pages.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/items.md` のH1以下
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`

## Design direction

- visual direction: 白寄りの本文面と暗めのHeader / Footerを維持する。Heroは内容説明を担わない装飾画像としてH1直後に置き、文字、overlay、captionを重ねない。
- layout direction: desktopは既存の3レールlayout内で、中央本文にH1、hero、2段落の導入、「アイテムの種類」の表を順に置く。mobileは既存HeaderとMobilePageToc triggerを使い、同じ順序で1列に収める。
- typography direction: H1とH2は既存の本文ページと同じ濃いグレーの罫線付き見出しにする。表の種別名は青緑のリンク、説明本文は通常の本文密度にする。
- color / accent usage: 青緑は内部リンクと現在ページ表示に限定する。表全体へ色面・カード装飾・発光を追加しない。

## Existing design constraints

- `global-styles` の白寄り背景、暗めグレーのHeader、system font、低彩度border、青緑accentを維持する。
- `site-layout` のHeader、Footer、SiteMenuを再設計しない。PageTocとMobilePageTocは、目次対象の見出しが1件以上なら表示し、0件なら「見出しがありません」と表示する共通仕様に従う。この仕様以外の再設計はしない。
- heroは`public/images/data/items_hero.webp`を全幅で自然な縦横比のまま表示し、装飾画像として空`alt`にする。
- 「アイテムの種類」は、武器、防具、お守り、サイバネ、ナノマシン、ドラッグの順を変えない。お守り以降は対応する生き様へのリンクを説明文に含める。「生き様専用アイテム」の重複注釈は表示しない。
- 表はdesktop・mobileともにページ全体の横overflowを生まず、長い説明が自然に折り返されることを優先する。mobileの種別名は改行せず、説明列が折り返す。

## Out of scope

- アイテムカード、カード凡例、個別アイテム一覧、個別種別ページ。
- 検索、絞り込み、ソート、ページネーション、比較・計算、アイテム選択支援。
- パンくず、前後ナビゲーション、準備中表示、画像上の文字・overlay・caption。
- Header、Footer、SiteMenuの変更、および単一見出し表示・0件空状態以外のPageToc、MobilePageTocの再設計。
- `public/images/data/items/`配下の後続個別ページ用画像の表示。

## Comparison points for implementation

- H1、hero、導入文、「アイテムの種類」表がcontents指定の順で表示される。
- desktopでは中央本文幅にheroと表が収まり、左SiteMenuと右PageTocを圧迫しない。
- mobileではhero、導入文、表が390px幅で自然に収まり、ページ全体の横overflowを起こさない。`ナノマシン`を含む種別名は1行で表示する。
- 表の種別名と生き様名だけを青緑のリンクとして扱い、カードUIや過剰な色分けを加えない。
- 「アイテムの種類」だけでもdesktop PageTocとMobilePageTocへ表示される。目次対象の見出しがないページでは、共通Componentが「見出しがありません」と表示する。
- 許容差分: 段落・表セルの改行位置、導入文と表の高さ。
- 要レビュー差分: heroへのcaptionやoverlayの追加、表の順序変更、表をカード一覧へ置換、検索・操作UIの追加、global navigationの再設計。

## Generation source

- prototype or generator source: standalone HTML/CSS prototype
- source branch / commit: `33-2-items-index-page` / `911967bad6c6db1bb5b6443aca69d77031e7f116`
- route: `/data/items/`
- viewport: desktop `1440x1200`、mobile `390x900`、いずれもfull-page
- prototype path: `.tmp/design/items/prototype.html`
- capture path: `.tmp/design/items/capture.mjs`
- capture notes: `public/images/data/items_hero.webp`をprototype内へdata URLとして読み込み、アプリケーションrouteを使わずにcaptureした。

## Open questions

- 初期draftの表を、実装時も通常のHTML tableとして維持するか。contentsの表形式指定に従うため、現時点ではtableを採用している。
- PageTocには「アイテムの種類」のみを表示する。H1はPageToc対象外であり、contentsに追加のH2はない。
