# character-making

## Mode

- design fix

## Target

- page / component: 仕事人を作成する手順を示すキャラクターメイキングページ
- route: `/character-making/`
- viewport:
  - desktop: `1440x1200`、fullPage
  - tablet: `820x1180`、fullPage（Visual Reviewのみ。ページ固有のdesign正本は作成しない）
  - mobile: `390x900`、fullPage
- states:
  - desktop: SiteMenu、PageToc、hero、本文、表、Callout
  - tablet: MobilePageToc trigger、hero、本文、初期縁の対表示、Callout
  - mobile: Header、MobilePageToc trigger、hero、本文、表、Callout

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

- visual direction: 白寄りの本文面、暗めのHeader / Footer、控えめな青緑accent、実務的な情報密度を維持する。heroはH1の直後に置き、作成前の準備を見せる本文の入口として使う。画像内の公式ゲームロゴはユーザー提供素材の一部であり、追加のoverlayは重ねない。
- layout direction: desktopでは既存SiteMenu、本文、PageTocの3列layoutを保つ。初期縁は対象ごとにポジティブとネガティブを対にしたカードで示す。tabletでは対象カードを1列にしつつ感情を横並びで比較できるようにし、mobileでは感情ごとの説明を縦に積む。mobileではMobilePageToc triggerをH1横に残し、hero、表、Calloutを本文幅に収めて縦に読めるようにする。
- typography direction: H1からH3までで、基本要素、初期縁、作成方式、個別手順の順を追える構造にする。Calloutのタイトルは見出しではなくラベルとして扱う。
- color / accent usage: 通常本文と表は既存のneutralな表現を使う。`tip`は青緑、`example`は青灰、`warning`は暖色の既存Calloutを使い、色だけに依存しないラベルと記号マーカーを維持する。

## Existing design constraints

- `site-layout`のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `callout`の6種の表示、ラベル、記号マーカー、見出し化の既定を変更しない。
- H1直後に既存`ImageBlock`を置き、heroには意味のあるaltを持たせる。画像内の公式ロゴ以外のoverlayは追加しない。
- desktop / tablet / mobileとも、初期縁カード、スキル表、Calloutを本文カラム内に収め、横overflowを起こさない。
- ユーザー提供のhero以外のページ固有画像、バナー、装飾画像を追加しない。
- 未実装のデータ・ルール詳細ページへの導線は、既存の内部リンク表現として残す。

## Out of scope

- キャラクター作成ウィザード、能力値・副能力値の自動計算、入力フォーム、保存、Webキャラクターシート
- ダイスローラー、戦闘シミュレーター、検索、パンくず、前後ナビゲーション
- Header、Footer、SiteMenu、PageToc、MobilePageToc、Calloutの再設計
- 新規画像、画像生成、CMS、DB、認証、SSR、API、PWA

## Comparison points for implementation

- desktopではH1直後のheroと作成方式の案内、基本要素、初期縁、コンストラクション、フルスクラッチをPageTocとともに上から追える。
- mobileではH1、hero、作成方式の案内、MobilePageToc triggerが成立し、長い表とCalloutに横overflowがない。
- `tip`、`example`、`warning`のCalloutが既存Componentの種別・ラベル・記号マーカーで区別できる。
- CalloutタイトルがH2 / H3として出力されず、PageTocへ混入しない。
- 内部リンクがGitHub Pagesのbase pathを通り、本文と既存navigationが混同されない。

## Generation source

- source branch: `22-2-character-making-page`
- source route: `/character-making/`
- capture: `tests/visual/character-making.spec.ts`を`npm run build`後の`npm run preview -- --host 127.0.0.1`に対して実行した。
- source artifacts:
  - `test-results/visual/character-making-desktop.png`
  - `test-results/visual/character-making-tablet.png`
  - `test-results/visual/character-making-mobile.png`
- hero asset: `public/images/character-making/hero.webp`
- hero prompt: `.tmp/hero-prompt.md`
- canonicalization: ユーザーは2026-07-12に、contents review後のdesktop / mobile Visual Review actualをdesign正本へ反映することを明示承認した。ページ固有のinitial draftは作成せず、既存layoutとCallout designに整合する実装actualをdesign正本として採用する。

## Differences from previous design references

- 初期縁一覧は横長の4列tableから、対象ごとにポジティブとネガティブを対にしたカードへ変更した。長い関係説明を各感情のラベルとともに読めるようにし、mobileでは縦積みにする。
- 最大体力・最大精神力の決定要素を基本説明へ追加した。構成や既存Calloutの見た目は変更していない。
- tabletは既存`site-layout`の正本と同じbreakpoint・MobilePageToc挙動を確認するためのVisual Review対象とし、ページ固有のcanonical imageはdesktopとmobileだけを維持する。
- ユーザー提供のheroをH1直後へ追加した。画像内の公式ゲームロゴをそのまま用い、追加のoverlayやcaptionは設けていない。
- 導入直後にコンストラクションとフルスクラッチの選び方を置き、手順を先に進めながら基本要素を参照できることを明記した。
- 得意技能を選んだ非戦闘判定での判定数増加と、キャラクターシートへの記録を両作成方式に明記した。

## Open questions

- なし。
