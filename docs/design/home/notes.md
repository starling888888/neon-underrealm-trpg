# home

## Mode

- initial draft
- このnotesは、画像生成前のレビュー用checkpointである。
- initial draft画像は、人間レビューで承認されるまで最終design正本として扱わない。

## Target

- page / component: トップページ `/`
- route: `/`
- viewport:
  - desktop標準画面: `1440x1200`
  - mobile標準画面: `390x900`
- states:
  - desktop標準画面に写り切る範囲
  - desktop上から下までのfull-page
  - mobile標準画面に写り切る範囲
  - mobile上から下までのfull-page
- 作成予定のdraft画像:
  - `docs/design/home/design-desktop.png`
    - desktop `1440x1200`
    - 標準画面に写り切る範囲。full-pageではない。
  - `docs/design/home/design-desktop-full.png`
    - desktop `1440x1200`
    - 上から下までのfull-page画像。
  - `docs/design/home/design-mobile.png`
    - mobile `390x900`
    - 標準画面に写り切る範囲。full-pageではない。
  - `docs/design/home/design-mobile-full.png`
    - mobile `390x900`
    - 上から下までのfull-page画像。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/18-2-home-page.md`
- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/requirements/release-notes.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `.raw/contents/home.md`

## Design Direction

- visual direction:
  - 現行サイトの白から薄灰の背景、暗めのHeader / Footer、濃色本文、控えめな青緑accentを維持する。
  - 近未来・地下都市の気配は出してよいが、派手なランディングページではなく、ルール参照サイトとして落ち着いた見た目にする。
  - 大きな装飾hero画像、強いneon glow、紫主体のgradient、magenta accent、黒背景主体のcyberpunk UI、ぼかし装飾は使わない。
- layout direction:
  - 表示順は以下を維持する。
    1. ゲームキャッチコピー
    2. タイトルロゴ
    3. 最新リリースノート5件
    4. ゲームのかんたんな説明
    5. `.raw/contents/home.md` に含まれる短いクレジットと利用案内
  - トップページではPageToc / MobilePageTocを表示しない。
  - Header、本文領域、Footerは `docs/design/site-layout/` と一貫したリズムにする。
  - first viewportでは、サイトID、タイトルロゴ、更新確認の役割が分かるようにする。ただし過大なhero sectionにはしない。
  - タイトルロゴは目立たせるが、最新リリースノートが遠くなりすぎるほど大きくしない。
  - mobileでは、左右余白を確保したうえでタイトルロゴを横幅いっぱいに近いサイズで表示する。
- typography direction:
  - system fontを使い、`letter-spacing` は `0` とする。
  - `.raw/contents/home.md` のページタイトルは、通常の可視H1として表示しない。
  - HTML構造上H1が必要な場合は、視覚的に非表示にする。
  - キャッチコピーはH1 / H2ではなく、本文より少し大きいリードコピーとして扱う。
  - `近未来。`、`裏社会。`、`抗争。` は斜体で強調する。
  - 「最新リリースノート」「ゲームのかんたんな説明」「クレジット」「利用について」などの見出しは、hero的な大見出しではなく落ち着いた本文見出しにする。
- color / accent usage:
  - 青緑accentはリンクや小さな状態表現に限定する。
  - リリースノート項目は、細い罫線や薄いsurfaceで整理してよい。ただしcard-heavyなmarketing blockにしない。
  - クレジットと利用案内は、主要導線より控えめに見える扱いにする。

## Content Instructions

- 暫定版のdraft画像でも、`.raw/contents/home.md` のコンテンツ指示を遵守する。
- `.raw/contents/home.md` 内のHTMLコメントはagent向け指示であり、画面上に表示しない。
- `<!-- release-notes-list:auto latest=5 -->` は可視テキストではなく、最新リリースノート枠として表現する。
- 最新リリースノート枠は、実装では生成済みリリースノートデータ由来の最大5件を表示する。
- 生成画像内の正確な日本語テキストには依存しない。draft画像では短い代表文や省略表現を使ってよい。
- 正確な文言と構造要件は、画像だけに持たせず、このnotesと実装側で管理する。
- タイトルロゴは既存候補の `public/top_logo.webp` を使い、altは `光都暗域〈ネオン・アンダーレルム〉TRPG` とする。
- draftには以下のリンクを含める。
  - `/release-notes`
  - `/introduction`
- `.raw/contents/home.md` に含まれる短いクレジットと利用案内をページ下部に含める。
- Footerからのクレジット導線は追加しない。

## Existing Design Constraints

- `global-styles` の方向性を維持する。
  - 白から薄灰の本文面
  - 暗めのHeader / Footer
  - 高コントラストの濃色テキスト
  - 控えめな青緑accent
  - 日本語本文が読める本文リズム
  - Web font不要
  - 過剰なglow、blur、gradient、高彩度neonを使わない
- `site-layout` の方向性を維持する。
  - desktopでは既存Header / Footerと左SiteMenuのlayout挙動を前提にする。
  - mobileでは既存HeaderとMobileMenuの挙動を前提にする。
  - `/` では不要なPageToc / MobilePageTocや空のTOC枠を表示しない。
  - 新しいnavigation modelを要求するdesignにしない。
- Component慣例を維持する。
  - 画像表示は `ImageBlock` または同等のbase path対応済み実装と相性のよい見た目にする。
  - linkは通常のsite linkまたは控えめなtext linkとして扱い、promotional CTA buttonにしない。
  - リリースノートの繰り返し項目は、compactなlist rowまたは薄い罫線つきsurfaceに留め、cardの入れ子にしない。

## Out Of Scope

- search UI
- breadcrumbs
- previous / next navigation
- dice roller
- character sheet機能
- combat support tool
- CMS、編集UI、login、authentication、API server、DB、SSR、PWA
- `/release-notes` ページ本体の実装
- `/introduction` ページ本体の実装
- release-note Excel変換処理の変更
- トップページ内へのrelease-note本文の手書き固定
- 新規ロゴ生成、ロゴ描き直し、AIロゴ差し替え
- Footerからのcredit導線
- `/credits` 専用ページ
- site menu redesign
- PageToc / MobilePageToc仕様変更
- 大きなhero背景画像や装飾cyberpunk art

## Comparison Points For Implementation

- 標準画面画像:
  - `design-desktop.png` はdesktop `1440x1200` の標準画面に写り切る範囲を示す。
  - `design-mobile.png` はmobile `390x900` の標準画面に写り切る範囲を示す。
  - これらの画像では、first viewport構成、タイトルロゴの大きさ、リリースノートとの距離、mobile余白を確認する。
- full-page画像:
  - `design-desktop-full.png` はdesktopのページ全体をHeaderからFooterまで示す。
  - `design-mobile-full.png` はmobileのページ全体をHeaderからFooterまで示す。
  - これらの画像では、全section、credit / usageの配置、縦方向のリズム、横overflowがないことを確認する。
- content orderはissueとrequirementsに一致していること。
- PageToc / MobilePageTocが表示されていないこと。
- `.raw/contents/home.md` のMarkdown H1が通常の可視見出しとして表示されていないこと。
- HTMLコメントやdirective文字列が可視表示されていないこと。
- 最新リリースノートは生成データ由来の枠として見え、手書き固定本文に見えないこと。
- `/release-notes` と `/introduction` のリンクはあるが、このtaskでページ本体を実装したようには見せないこと。
- トップページが `site-layout` と同じサイトに見え、別サイトのlanding pageに見えないこと。
- 実装後に許容できる差分:
  - 正確な改行や日本語表示の細部がdraft画像と異なる。
  - release-note項目の文言がgenerated JSON由来でdraft画像と異なる。
  - required orderと可読性を守ったうえで、余白が軽微に変わる。
- reviewが必要な差分:
  - 落ち着いたルールサイトではなく派手なheroに変わっている。
  - credit / usageが欠落している。
  - 初期スコープ外のnavigationやtoolが追加されている。
  - logoがfirst viewportを支配し、release notesとのつながりが弱くなっている。
  - `/` にPageToc / MobilePageTocが表示されている。

## Generation Source

- generator or capture source: `.tmp/home-design.html` をPlaywrightでPNG化したinitial draft画像。
- source branch / commit when applicable: `18-2-home-page`
- route when applicable: `/` のdesign draft。実装routeのactual screenshotではない。
- viewport:
  - desktop標準画面: `1440x1200`
  - desktop full-page: `1440x1200` viewportから上から下まで
  - mobile標準画面: `390x900`
  - mobile full-page: `390x900` viewportから上から下まで
- prompt summary or capture notes:
  - `.raw/contents/home.md` のコンテンツ指示、current issue scope、global style、site layout制約を守ったトップページinitial draft designとして作成した。
  - desktop / mobileそれぞれで、標準画面に写り切る範囲の画像と、上から下までのfull-page画像を作成した。
  - draft画像は実装結果ではなく、Visual Review用の初期design参照である。
  - 初期スコープ外UIや新しいアプリ機能は描いていない。

## Open Questions

- `design-desktop.png` / `design-mobile.png` を標準画面crop、`*-full.png` を上から下までの確認用として扱う方針でよいか。
- リリースノート枠はcompactな罫線listにするか、ごく薄いsurface groupにするか。
- credit / usageは通常prose sectionにするか、やや控えめなsmall text sectionにするか。
- `public/top_logo.webp` をhome designで使う最終TOPlogo画像として確定してよいか。
