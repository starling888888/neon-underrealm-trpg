# introduction

## Mode

- design fix

## Target

- page / component: はじめにページ `/introduction`
- route: `/introduction`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktopの標準表示。既存Header、PC左SiteMenu、本文、PC右PageTocを含む。
  - mobileの標準表示。既存Header、本文H1、MobilePageToc triggerを含む。
  - ゴールデンルールのwarning Calloutが本文内に表示される状態。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/20-2-introduction-page.md`
- `docs/requirements/pages.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/components.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/introduction.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/callout/notes.md`

## Design Direction

- visual direction:
  - 既存の白寄り本文面、暗めのHeader / Footer、濃色本文、控えめな青緑accentを維持する。
  - このページは新しい画面様式を作る対象ではない。通常のルール本文ページとして、読み始める案内を落ち着いた密度で見せる。
  - 画像で強調して確認する対象は、ゴールデンルールのwarning Calloutだけとする。ほかの本文要素は既存の見出し、段落、箇条書きの方向を踏襲する。
- layout direction:
  - desktopでは既存site-layoutに従い、Header、PC左SiteMenu、中央本文、PC右PageTocを表示する。
  - mobileでは既存のHeaderとMobilePageToc triggerを使い、PC左SiteMenuとPC右PageTocを常設表示しない。
  - 本文はH1直下の短い案内文、必要なもの、基本的な用語、ゴールデンルール、次に読むページの順に置く。
  - ゴールデンルールは本文カラムの幅に収まるwarning Calloutとして表示する。可視titleはCallout内に1回だけ表示し、Callout直前に同じタイトルを大見出しとして重ねない。
- typography direction:
  - H1と通常のH2は既存proseの階層・余白・罫線処理を維持する。
  - ゴールデンルールの可視titleは、Callout内の単一H2として表示する。既存warning Calloutのラベルと同じ密度を基準にし、枠外へ同名の見出しを重ねない。
  - 基本的な用語は定義リスト風の読みやすい密度を保ち、長い説明で本文幅や行間を崩さない。
- color / accent usage:
  - ゴールデンルールには既存warning Calloutのwarning色、左線、ラベル、記号マーカーを使う。
  - warning色だけに依存せず、可視title、左線、記号マーカーで重要な原則の枠だと識別できるようにする。
  - 新しい配色、強いneon glow、gradient、大きなhero画像は追加しない。

## Existing Design Constraints

- `global-styles` の白寄り背景、暗め本文色、低彩度border、実務的な情報密度を維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocの役割とレスポンシブ挙動を変えない。
- `callout` の既定titleは見出し階層ではなくラベル相当であり、既存CalloutをPageTocへ混入させない。
- ゴールデンルールだけにHTML上のH2を持たせる場合は、明示的なopt-inまたはページ側の構造に限定する。既存Calloutのtitle仕様、見た目、PageToc非混入を変えない。
- Callout内にH2を持たせる場合も、可視titleの重複、余白の二重化、H1からの見出し階層飛びを起こさない。
- ゴールデンルール以外の本文に、新しいカード、装飾枠、アイコン、hero表現を足さない。

## Out of Scope

- Header / Footer / SiteMenu / MobileMenu / PageToc / MobilePageTocの再設計
- ゴールデンルール以外のCallout見た目・title仕様の変更
- 既存Callout全体を見出しにする変更
- `/support` のページ本体、オンラインセッションの進め方、特定ツールの紹介
- `/world`、`/character-making`、`/rules` のページ本体
- 検索、パンくず、前後ナビゲーション、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API、PWA
- 大きなキービジュアル、装飾cyberpunk art、過剰なneon表現

## Comparison Points for Implementation

- desktop / mobileとも、既存site-layout内の通常の本文ページに見えること。ゴールデンルール以外に新しい画面デザインが混入していないこと。
- H1直下の案内文がゲーム概要や世界観の再掲に見えず、短いページ案内として収まること。
- 必要なもの、基本的な用語、次に読むページが通常のproseとして読め、Calloutより強く目立たないこと。
- ゴールデンルールのwarning Calloutは、本文と区別できるがページ全体を支配しないこと。
- Calloutの可視titleが1回だけ表示され、同じ「ゴールデンルール」見出しが枠外と枠内に重複しないこと。
- 最終HTMLにゴールデンルールを表すH2が1つだけあり、PageTocとMobilePageTocから到達できること。スクリーンリーダーでtitleが重複して読まれないこと。
- 既存CalloutのtitleがPageTocへ入らず、既存callout designとの視覚的・意味的な差分がゴールデンルール用の明示的opt-inに限定されること。
- desktopではPageTocが必要なH2を自然に列挙し、mobileでは本文とMobilePageToc triggerの横幅が破綻しないこと。
- `/support` は未実装のためリンクを表示しないこと。また、「次に読むページ」に含めないこと。
- standard viewportで横overflowが発生しないこと。

## Generation Source

- prototype or generator source: Playwright actual screenshotを、ユーザー承認済みのdesign fix modeで正本化した。
- source branch / commit when applicable: `20-2-introduction-page` / `5eead14`
- route when applicable: `/introduction`
- viewport:
  - desktop `1440x1200` viewport capture: `test-results/visual/introduction-desktop.png` から `docs/design/introduction/design-desktop.png` へ正本化
  - mobile `390x900` viewport capture: `test-results/visual/introduction-mobile.png` から `docs/design/introduction/design-mobile.png` へ正本化
- prototype path / prompt summary / capture notes:
  - `tests/visual/introduction.spec.ts` がbuild後previewの`/introduction`をcaptureしたactual screenshotを使用した。
  - 初期prototypeとの差分は、実装済みproseの正確な行送り、用語説明の折り返し、Callout Componentの実際のpaddingと本文量である。いずれもrequirements、global styles、site-layout、calloutの方向と整合する。
  - 可視titleはCallout内の単一H2であり、PageTocとMobilePageTocから到達できる。既定Callout titleはspanのままで、既存CalloutのPageToc非混入は維持する。
  - user approval: `デザイン正本化`（2026-07-11）。Visual Reviewの差分を隠す目的ではなく、レビュー済み実装を導入ページの比較基準として採用する。

## Open Questions

- なし。`titleAsHeading` opt-inによりゴールデンルールだけをH2として出力し、既存Calloutの正本更新は不要と確認した。
