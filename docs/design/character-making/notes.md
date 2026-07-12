# character-making

## Mode

- design fix

## Target

- page / component: 仕事人を作成する手順を示すキャラクターメイキングページ
- route: `/character-making/`
- viewport:
  - desktop: `1440x1200`、fullPage
  - mobile: `390x900`、fullPage
- states:
  - desktop: SiteMenu、PageToc、本文、表、Callout
  - mobile: Header、MobilePageToc trigger、本文、表、Callout

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `.agents/skills/visual-implementation-review/SKILL.md`
- `docs/issue/22-2-character-making-page.md`
- `docs/requirements/pages.md`
- `docs/requirements/components.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/callout/notes.md`
- `.raw/contents/character-making.md`

## Design direction

- visual direction: 白寄りの本文面、暗めのHeader / Footer、控えめな青緑accent、実務的な情報密度を維持する。
- layout direction: desktopでは既存SiteMenu、本文、PageTocの3列layoutを保つ。mobileではMobilePageToc triggerをH1横に残し、表とCalloutを本文幅に収めて縦に読めるようにする。
- typography direction: H1からH3までで、基本要素、初期縁、作成方式、個別手順の順を追える構造にする。Calloutのタイトルは見出しではなくラベルとして扱う。
- color / accent usage: 通常本文と表は既存のneutralな表現を使う。`tip`は青緑、`example`は青灰、`warning`は暖色の既存Calloutを使い、色だけに依存しないラベルと記号マーカーを維持する。

## Existing design constraints

- `site-layout`のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `callout`の6種の表示、ラベル、記号マーカー、見出し化の既定を変更しない。
- desktop / mobileとも、長い初期縁表とスキル表を含めて本文カラム内に収め、横overflowを起こさない。
- ページ固有のhero画像、バナー、装飾画像を追加しない。
- 未実装のデータ・ルール詳細ページへの導線は、既存の内部リンク表現として残す。

## Out of scope

- キャラクター作成ウィザード、能力値・副能力値の自動計算、入力フォーム、保存、Webキャラクターシート
- ダイスローラー、戦闘シミュレーター、検索、パンくず、前後ナビゲーション
- Header、Footer、SiteMenu、PageToc、MobilePageToc、Calloutの再設計
- 新規画像、画像生成、CMS、DB、認証、SSR、API、PWA

## Comparison points for implementation

- desktopでは基本要素、初期縁、コンストラクション、フルスクラッチをPageTocとともに上から追える。
- mobileではH1とMobilePageToc triggerが成立し、長い表とCalloutに横overflowがない。
- `tip`、`example`、`warning`のCalloutが既存Componentの種別・ラベル・記号マーカーで区別できる。
- CalloutタイトルがH2 / H3として出力されず、PageTocへ混入しない。
- 内部リンクがGitHub Pagesのbase pathを通り、本文と既存navigationが混同されない。

## Generation source

- source branch: `22-2-character-making-page`
- source route: `/character-making/`
- capture: `tests/visual/character-making.spec.ts`を`npm run build`後の`npm run preview -- --host 127.0.0.1`に対して実行した。
- source artifacts:
  - `test-results/visual/character-making-desktop.png`
  - `test-results/visual/character-making-mobile.png`
- canonicalization: ユーザーは2026-07-12に、実装後のdesign正本作成までを明示承認した。ページ固有の初期draftは作成せず、既存layoutとCallout designに整合する実装actualをdesign fixとして採用する。

## Open questions

- なし。
