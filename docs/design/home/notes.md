# home

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT home default <viewport>`
- route: `/`
- state: default
- snapshots:
  - desktop `1440x1200`: `home-default-desktop.png`
  - tablet `820x1180`: `home-default-tablet.png`
  - mobile `390x900`: `home-default-mobile.png`
- viewport state: `home-home-viewport-desktop.png`, `home-home-viewport-tablet.png`, `home-home-viewport-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- `18-2-home-page` の実装結果を、ユーザー承認に基づきトップページdesign正本として正本化した。
- 初期draftとの差分を隠す目的ではなく、人間レビュー後の現行実装を今後のVisual Review基準にする。

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
- canonical images:
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
- `docs/requirements/pages.md`
- `docs/requirements/release-notes.md`
- `docs/out-of-scope.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `.raw/contents/home.md`

## Historical source issue

- `docs/issue/done/phase-3/18-2-home-page.md`

## Design Direction

- visual direction:
  - 現行サイトの白から薄灰の背景、暗めのHeader / Footer、濃色本文、控えめな青緑accentを維持する。
  - 近未来・裏社会の気配はキャッチコピーとロゴで出す。
  - 派手なランディングページではなく、ルール参照サイトとして落ち着いた見た目にする。
  - 大きな装飾hero画像、強いneon glow、紫主体のgradient、magenta accent、黒背景主体のcyberpunk UI、ぼかし装飾は使わない。
- layout direction:
  - 表示順は以下を維持する。
    1. ゲームキャッチコピー
    2. タイトルロゴ
    3. 最新リリースノート
    4. `/release-notes` と `/introduction` への導線
    5. ゲームのかんたんな説明
    6. `.raw/contents/home.md` に含まれる短いクレジットと利用案内
  - トップページではPageToc / MobilePageTocを表示しない。
  - Header、本文領域、Footerは `docs/design/site-layout/` と一貫したリズムにする。
  - desktopでは `03-balanced-compact` 方針に寄せ、first viewportでロゴ、最新リリースノート、はじめに導線までのつながりを強める。
  - mobileでは、人間レビューで良いと判断された余白とロゴサイズを維持する。
- typography direction:
  - `.raw/contents/home.md` のページタイトルは、通常の可視H1として表示しない。
  - HTML構造上H1が必要な場合は、視覚的に非表示にする。
  - キャッチコピーはH1 / H2ではなく、本文より少し大きいリードコピーとして扱う。
  - キャッチコピーは02b相当の明朝寄りフォント、少し薄い文字色、太字斜体キーワードを使う。
  - キーワードは `＿近未来`、`＿裏社会`、`＿抗争` とし、キーワード後の `。` は付けない。
  - キーワードと後続文章の間隔を少し広げる。
  - `letter-spacing` は `0` とする。
  - 「最新リリースノート」「ゲームのかんたんな説明」「クレジット」「利用について」などの見出しは、hero的な大見出しではなく落ち着いた本文見出しにする。
- color / accent usage:
  - 青緑accentはリンクや小さな状態表現に限定する。
  - `はじめに` 導線はheaderと同系統の濃色背景、白抜き文字で、主要導線として中央に置く。
  - リリースノート項目は、細い罫線や薄いsurfaceで整理する。ただしcard-heavyなmarketing blockにしない。
  - クレジットと利用案内は、主要導線より控えめに見える扱いにする。

## Content Instructions

- `.raw/contents/home.md` 内のHTMLコメントはagent向け指示であり、画面上に表示しない。
- `<!-- release-notes-list:auto latest=5 -->` は可視テキストではなく、最新リリースノート枠として表現する。
- 最新リリースノート枠は、実装では生成済みリリースノートデータ由来の最大5件を表示する。
- canonical image上では、現行 `data/generated/release-notes.json` 由来の件数と文言をそのまま表示する。
- タイトルロゴは `public/images/top_logo.webp` を使い、altは `光都暗域〈ネオン・アンダーレルム〉TRPG` とする。
- 以下のリンクを含める。
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
  - 過剰なglow、blur、gradient、高彩度neonを使わない
- `site-layout` の方向性を維持する。
  - desktopでは既存Header / Footerと左SiteMenuのlayout挙動を前提にする。
  - mobileでは既存HeaderとMobileMenuの挙動を前提にする。
  - `/` では不要なPageToc / MobilePageTocや空のTOC枠を表示しない。
  - 新しいnavigation modelを要求するdesignにしない。
- Component慣例を維持する。
  - linkは内部リンクComponentの見た目と整合させる。
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
- reviewが必要な差分:
  - 落ち着いたルールサイトではなく派手なheroに変わっている。
  - credit / usageが欠落している。
  - 初期スコープ外のnavigationやtoolが追加されている。
  - logoがfirst viewportを支配し、release notesとのつながりが弱くなっている。
  - `/` にPageToc / MobilePageTocが表示されている。

## Generation Source

- generator or capture source: `tests/visual/home.spec.ts` のPlaywright actual screenshotをdesign fixとして正本化した。
- source actual artifacts:
  - `test-results/visual/home-desktop.png`
  - `test-results/visual/home-desktop-full.png`
  - `test-results/visual/home-mobile.png`
  - `test-results/visual/home-mobile-full.png`
- source branch / commit when applicable: `18-2-home-page` / `f521a11`
- route when applicable: `/`
- route URL during capture: `http://localhost:4321/neon-underrealm-trpg/`
- viewport / output:
  - `/`, desktop `1440x1200`, viewport screenshot: `design-desktop.png`
  - `/`, desktop `1440x1200`, fullPage screenshot: `design-desktop-full.png`
  - `/`, mobile `390x900`, viewport screenshot: `design-mobile.png`
  - `/`, mobile `390x900`, fullPage screenshot: `design-mobile-full.png`
- prompt summary or capture notes:
  - `18-2-home-page` の実装結果を、人間レビュー後のdesign正本として採用した。
  - desktop / mobileそれぞれで、標準画面に写り切る範囲の画像と、上から下までのfull-page画像を作成した。
  - 初期スコープ外UIや新しいアプリ機能は描いていない。
  - `test-results/visual/home-*.png` のactual artifactをユーザー承認後にdesign正本へ反映した。

## Differences From Initial Draft

- 実装済みHeader / SiteMenu / Footerを含む現行site-layoutとして正本化した。
- キャッチコピーは `＿近未来`、`＿裏社会`、`＿抗争` に変更し、02b相当の明朝寄りフォントと薄めの文字色を反映した。
- desktopは `03-balanced-compact` 方針に寄せ、初期draftより上部とロゴ周辺の余白を詰めた。
- `はじめに` 導線は更新履歴リンク横ではなく、濃色背景の中央配置リンクとして扱う。
- リリースノートは現行生成データ由来の1件表示になっている。実装仕様は最大5件表示であり、データ追加時に増える。
- Headerの検索UIは既存layout由来として写っている。このissueで新規追加したものではない。

## Canonicalization Rationale

- `18-2-home-page` の実装とレビュー指摘 1 / 2 の対応が完了し、ユーザーからdesign正本化の明示指示があった。
- 初期draftより現行実装のほうが、実際のHeader / SiteMenu / Footer、生成リリースノート、トップページ導線の状態を正確に示す。
- 今後のVisual Reviewでは、この正本画像を基準にトップページの見た目差分を評価する。

## Open Questions

- なし。
