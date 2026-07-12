# advancement

## Mode

- design fix

## Target

- page / component: 成長ルールページ
- route: `/advancement/`
- viewport: desktop `1440x1200`、mobile `390x900`
- states: desktop standard layout、mobile standard layout、MobilePageToc closed

## Referenced SSoT

- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/issue/26-2-advancement-page.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/mobile-page-toc/notes.md`
- `docs/design/callout/notes.md`

## Design direction

- visual direction: 白寄り本文面、暗めHeader / Footer、青緑accentを既存共通designと同じ用途に保つ。
- layout direction: desktopでは左SiteMenu、中央本文、右PageTocを表示する。mobileではMobilePageTocを使い、表はページ全体をoverflowさせず本文内で扱う。
- typography direction: 長文ルールの可読性を優先し、H1、H2、表、Calloutを既存MDX本文の密度に合わせる。
- color / accent usage: heroのasset内ロゴをそのまま表示し、ページ側のoverlayや追加装飾は加えない。

## Existing design constraints

- `site-layout`、`page-toc`、`mobile-page-toc`、`callout`の正本を変更しない。
- heroはH1直後に置き、captionを追加しない。
- Callout titleはPageTocの見出しにしない。
- 長い表は本文幅と既存のtable overflow方針を維持する。

## Out of scope

- 初期design draftの作成
- キャンペーン管理、入力フォーム、自動計算、キャラクターシート、ダイスローラー
- Header、Footer、SiteMenu、PageToc、MobilePageToc、Callout、ImageBlockの再設計
- hero画像の再生成・加工、ロゴの追加または隠蔽

## Comparison points for implementation

- desktop / mobileの本文幅、余白、見出し、hero、表、Callout、PageToc / MobilePageTocが既存共通designと整合する。
- 画面全体の横overflowを発生させない。
- 表の横スクロールが必要な場合は、ページ全体ではなく本文コンテナ内に限定する。

## Generation source

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- advancement --route /advancement/`
- source branch: `26-2-advancement-page`
- source commit: `fcc2fefe7201f30c08275279d5c23937ed05f835`
- route: `/advancement/`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- 「生き様係数」表の全列を初期表示で見せる改善は、`docs/TODO.md` の後続検討で扱う。
