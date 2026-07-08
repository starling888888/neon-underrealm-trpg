# 14-mobile-page-toc

## 目的

スマホ / タブレット幅で利用できる、開閉式のページ内目次を実装する。

このタスクでは、PC版右サイドに常設表示する `PageToc` とは別に、`1024px` 未満の画面で「このページの目次」をワンタッチで開き、目次項目を選択すると該当見出しへジャンプできるUIを追加する。

具体的には以下を満たす。

- `1024px` 未満ではPC右サイド常設目次を表示しない
- スマホ / タブレット幅では「このページの目次」を開閉できる
- 目次項目は、既存のページ内目次生成結果を利用する
- 目次項目を選択すると該当見出しへジャンプする
- 項目選択後、開閉UIは閉じる
- サイトメニューとは導線、文言、UI上の役割を分離する
- トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404`、見出し数が少ないページでは不要な目次UIを表示しない
- 不要な大規模UIライブラリを追加しない
- 現在位置ハイライトはこのIssueでは完成させない

## 背景

`docs/plan.md` の `14-mobile-page-toc` は、Phase 2 の「スマホ用ページ内目次を実装する」タスクである。

先行タスク `13-page-toc` では、PC右サイドのページ内目次、TOC対象見出しの抽出、アンカーID自動付与、build後postprocessによるTOC生成が実装済みである。

一方、`13-page-toc` では以下を明示的にスコープ外として残している。

- スマホ用ページ内目次
- `MobilePageToc.astro`
- スマホ用の開閉式「このページの目次」
- スマホ用TOC drawer
- Escキーで閉じる制御
- 現在位置ハイライト
- IntersectionObserverによるactive heading追跡
- スクロール連動表示

このIssueでは、そのうちスマホ / タブレット幅での開閉式ページ内目次に集中する。

ただし、現在位置ハイライト、スクロール追跡、IntersectionObserverによるactive heading追跡は、後続タスクまたは別Issueで扱う。

## ローカル検証結果

このIssue draftはremote snapshot由来だったため、local repository modeで検証した。

検証済み:

- local branch: `14-mobile-page-toc`
- local issue file: `docs/issue/done/phase-2/14-mobile-page-toc.md`
- `docs/plan.md` に `14-mobile-page-toc` が存在する
- `docs/requirements.md` のスマホ版ページ内目次要件と整合する
- `docs/out-of-scope.md` のページ内目次現在位置ハイライト方針と整合する
- `docs/TODO.md` に `14-mobile-page-toc` へ直接取り込むべき未対応TODOはない
- `docs/design/page-toc/` と `docs/design/mobile-menu/` は存在する
- `docs/design/mobile-page-toc/` は `design-image-generation initial draft mode` で作成済み
- 採用designは `docs/design/mobile-page-toc/design-mobile-closed.png` と `docs/design/mobile-page-toc/design-mobile-open.png`
- `src/components/layout/PageToc.astro`、`scripts/postprocess-page-toc.ts`、`scripts/lib/page-toc-postprocess.ts`、`tests/node/page-toc-postprocess.test.ts` は存在する

未検証:

- `npm run check`
- `npm run build`
- mobile / tablet viewportでのVisual Review結果

実装前提:

- `docs/design/mobile-page-toc/notes.md`、`design-mobile-closed.png`、`design-mobile-open.png` を参照designとして扱う
- 実装では、本文内のH1要素横に控えめな目次triggerを置き、H1直下に開く軽いoverlay表示に従う

## 対象範囲

このタスクで扱う。

- スマホ / タブレット幅向けのページ内目次UI
- `MobilePageToc.astro` または同等のComponent
- 本文内H1要素横の控えめな目次trigger
- H1直下に表示する軽いoverlay UI
- 既存のTOC生成結果の再利用
- TOC項目リンクによるページ内ジャンプ
- 項目選択後にMobilePageTocを閉じる制御
- Escキーで閉じる制御
- 開閉ボタンの `aria-expanded`
- 開閉対象の `aria-controls`
- 目次領域の `nav` / `aria-label`
- focusが大きく破綻しないこと
- サイトメニューとページ内目次の導線分離
- Header / MobileMenu / SiteMenu / PageToc とのレイアウト競合回避
- `1024px` 未満でPC右サイド常設TOCを表示しない制御との整合
- `768px` 未満のスマホレイアウト
- `768px` 以上 `1024px` 未満のタブレット / 狭幅PCレイアウト
- `/`、`/release-notes`、`/404` では表示しない制御
- TOC項目が0件または1件のページでは表示しない制御
- GitHub Pages subpath配下でもアンカーリンクが機能すること
- 不要なクライアントJSを増やしすぎない実装
- 既存CSS tokens / layout設計との整合
- `docs/design/mobile-page-toc/` のdesign参照
- 実装後のmobile viewport確認

## 初期スコープ外

このタスクでは扱わない。

- PC右サイド常設PageTocの再実装
- build後HTML postprocessの再設計
- 見出しID自動生成ルールの変更
- hash ID生成ルールの変更
- `data-anchor-id` / `data-toc-exclude` の仕様変更
- TOC対象見出しを `h2` / `h3` 以外へ拡張すること
- 現在位置ハイライト
- IntersectionObserverによるactive heading追跡
- スクロール連動表示
- スクロール位置に応じた目次自動展開
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI
- Pagefind導入
- サイトメニュー現在ページハイライト
- `aria-current="page"` のサイトメニュー実装
- ルール本文の本格移植
- 新規本文ページの大量作成
- トップページ本体の完成
- 404ページ本体の完成
- Excel / Spreadsheet連携
- JSON変換パイプライン
- キャラクターシート
- ダイスローラー
- 戦闘シミュレーター
- DB
- 認証
- SSR
- CMS
- 外部UIライブラリの大規模導入
- 高度なアニメーション
- 過剰なneon glow表現

## 技術方針

### 基本方針

MobilePageTocは、既存 `13-page-toc` のTOC生成結果を再利用する。

このIssueでは、見出し抽出・アンカーID生成・TOC HTML生成のロジックを重複実装しない。

想定方針:

- postprocessで生成されたTOC項目をmobile用表示領域にも差し込む
- または、既存 `PageToc` / TOC描画Componentをmobile表示モードで再利用する
- 同じページにPC用とmobile用のTOC差し込み先を置く場合、postprocessが両方へ同じTOCを差し込めるようにする
- PC用・mobile用でTOC項目の内容が分岐しないようにする

### Layout側の目印

既存 `13-page-toc` のHTML marker方針を尊重する。

既存想定:

```astro
<main data-page-content>
  <slot />
</main>

<aside
  data-page-toc-slot
  data-page-toc-enabled={showPageToc ? "true" : "false"}
  aria-label="このページの目次"
>
</aside>
```

MobilePageTocで追加が必要な場合は、PC用slotと区別できるmarkerを検討する。

想定例:

```astro
<MobilePageToc
  showPageToc={showPageToc}
  client:load
/>

<div
  data-mobile-page-toc-slot
  data-page-toc-enabled={showPageToc ? "true" : "false"}
></div>
```

または、既存slotを内部で再利用できる場合は、新規markerを増やさない。

実装時に決めるべきこと:

- `data-page-toc-slot` をPC / mobile両方へ使えるか
- `data-mobile-page-toc-slot` を新設するか
- postprocess側を拡張する必要があるか
- dev時とbuild後preview時で表示差が許容範囲に収まるか

### UI方針

スマホ用ページ内目次は、サイトメニューではない。

文言・位置・見た目で以下を区別する。

- サイトメニュー: サイト全体のページ移動
- ページ内目次: 現在ページ内の見出し移動

採用する表示方針:

- スマホ幅では、本文内のH1要素横に、ボタン感を弱めた目次triggerを置く
- H1そのものの見出し表現を大きく崩さないよう、H1とMobilePageTocをラップして横並びにする
- triggerは大きな枠付きbuttonではなく、短いラベル、控えめなchevron、必要最小限のaccentで操作可能性を示す
- 開いた状態では、H1直下に軽いoverlayとしてページ内見出しリンク一覧を表示する
- overlayはmobile site menu drawerほど強く画面を占有しない
- overlay表示中の背景本文は必要最小限にdimしてよいが、site menu drawerと同じ強いmodal表現にはしない

表示文言:

```txt
このページの目次
```

ただし、狭いスマホ幅では可視ラベルを `目次` または `TOC` 相当に短縮できる。正確なアクセシブル名称は `aria-label` などで補う。

開閉triggerは、mobile Headerのサイトメニューbuttonとは別の導線にする。

このIssueでは、本文内の大きな枠付きbutton、強い常時floating button、site menu drawerに見える強いoverlayは避ける。

### 開閉挙動

MobilePageTocは、以下の挙動を持つ。

- 初期状態では閉じている
- 本文内H1要素横の目次triggerで開く
- 同じtrigger、またはoverlay内の閉じる操作で閉じる
- Escキーで閉じる
- 目次項目を選択すると該当見出しへジャンプし、MobilePageTocを閉じる
- 開いている間、サイトメニューと同時に開いた状態にならないことが望ましい
- サイトメニューが開いた場合、MobilePageTocは閉じることが望ましい

focus trapは必須にはしないが、focus移動が破綻しないようにする。

### JavaScript方針

開閉制御に必要な最小限のクライアントJSは許容する。

ただし、以下は避ける。

- React / Vue / Svelte等の追加導入
- 大規模UIライブラリ
- IntersectionObserverによる現在位置追跡
- スクロール監視によるactive heading更新
- 複雑な状態管理ライブラリ
- サイトメニューと共通化しすぎて責務が混ざる実装

Astro component内の小さなinline script、または既存のclient script方針に合わせた最小scriptで実装する。

### アクセシビリティ方針

最低限、以下を満たす。

- 開閉buttonに `aria-expanded` を設定する
- 開閉buttonに `aria-controls` を設定する
- 目次領域は `nav` または同等のlandmarkとして扱う
- 目次領域に `aria-label="このページの目次"` または同等のラベルを付与する
- Escキーで閉じられる
- 目次項目は通常のアンカーリンクとして機能する
- focus outlineを消さない
- タップ領域を十分に確保する
- 色だけに依存して開閉状態を表現しない

## design参照

このIssueはUI実装タスクであるため、実装前にdesign targetを確認する。

期待するdesign target:

```txt
docs/design/mobile-page-toc/
```

期待するartifacts:

```txt
docs/design/mobile-page-toc/notes.md
docs/design/mobile-page-toc/design-mobile-closed.png
docs/design/mobile-page-toc/design-mobile-open.png
```

`docs/design/mobile-page-toc/` は作成済みであり、実装時は以下のdesign artifactsを参照する。

design notesでは、少なくとも以下を記録する。

- target component
- target viewport
- closed / open state
- 参照SSoT
- 既存mobile menuとの差分
- site menuとの導線分離
- out-of-scope
- comparison points
- open questions

## 完了条件

- [x] `MobilePageToc.astro` または同等のスマホ用ページ内目次UIが実装されている
- [x] `1024px` 未満ではPC右サイド常設PageTocが表示されない
- [x] スマホ幅で本文内H1要素横に控えめな目次triggerが表示されている
- [x] H1横の控えめな目次triggerからMobilePageTocを開閉できる
- [x] MobilePageTocはH1直下の軽いoverlayとして表示される
- [x] `768px` 未満のスマホ幅で表示が破綻しない
- [x] `768px` 以上 `1024px` 未満のタブレット / 狭幅PC幅で表示が破綻しない
- [x] 目次項目は既存のTOC生成結果を利用している
- [x] TOC項目の内容がPC用とmobile用で不自然に分岐していない
- [x] 目次項目を選択すると該当見出しへジャンプする
- [x] 目次項目選択後、MobilePageTocが閉じる
- [x] EscキーでMobilePageTocを閉じられる
- [x] 開閉buttonに `aria-expanded` が設定されている
- [x] 開閉buttonに `aria-controls` が設定されている
- [x] 目次領域に `nav` / `aria-label` などのアクセシビリティ属性が付与されている
- [x] focus outlineを消していない
- [x] タップ領域が小さすぎない
- [x] サイトメニューの開閉buttonとページ内目次の開閉buttonがUI上混同されない
- [x] サイトメニューdrawerとMobilePageTocが同時に開いて表示崩れしない
- [x] `/` ではMobilePageTocが表示されない
- [x] `/release-notes` ではMobilePageTocが表示されない
- [x] `/404` ではMobilePageTocが表示されない
- [x] TOC項目が0件または1件のページではMobilePageTocが表示されない
- [x] GitHub Pages subpath配下でもアンカーリンクが壊れない
- [x] 現在位置ハイライトはこのIssueでは実装していない
- [x] IntersectionObserverによるactive heading追跡はこのIssueでは実装していない
- [x] 不要な大規模UIライブラリを追加していない
- [x] 不要なクライアントJSを増やしすぎていない
- [x] `docs/design/mobile-page-toc/notes.md`、`design-mobile-closed.png`、`design-mobile-open.png` を参照している
- [x] 参照するdesign targetとdesign画像の扱いが実装報告に記録されている
- [x] `npm run build` が成功する
- [x] 必要に応じて `npm run check` が成功する

## チェックポイント

- [x] `/` が壊れていない
- [x] `/` にMobilePageTocが表示されない
- [x] `/release-notes` にMobilePageTocが表示されない
- [x] `/404` にMobilePageTocが表示されない
- [x] 本文ページではMobilePageTocを開ける
- [x] データページではMobilePageTocを開ける
- [x] 見出し0件のページで空の目次buttonが出ない
- [x] 見出し1件だけのページで不自然な目次buttonが出ない
- [x] `h2` / `h3` の階層がMobilePageTocに反映される
- [x] `h1` はページタイトル相当としてMobilePageTocに含まれない
- [x] 目次項目の日本語見出しが読める
- [x] 目次リンクのhrefは既存postprocessのアンカーIDと一致している
- [x] URL fragmentに日本語見出し本文をそのまま使っていない
- [x] PageToc postprocessの既存テストが壊れていない
- [x] Header / MobileMenu / SiteMenu と競合しない
- [x] Headerのmenu buttonとMobilePageTocのtriggerが別機能だと分かる
- [x] MobileMenuを開いた状態でMobilePageTocが残留して表示崩れしない
- [x] MobilePageTocを開いた状態でMobileMenuを開いた場合の挙動が破綻しない
- [x] 目次項目選択後にoverlayが閉じる
- [x] Escで閉じられる
- [x] キーボード操作で開閉できる
- [x] focusが画面外や非表示領域へ飛ばない
- [x] tap targetが小さすぎない
- [x] PC幅で右サイドPageTocの表示が壊れていない
- [x] `1024px` 付近のbreakpointでPC用 / mobile用TOCが二重表示されない
- [x] `768px` 付近のbreakpointでHeader / MobileMenuと衝突しない
- [x] design notesと実装が矛盾していない
- [x] ユーザー未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/done/phase-2/14-mobile-page-toc.md`
- `docs/design/mobile-page-toc/notes.md`
- `docs/design/mobile-page-toc/design-mobile-closed.png`
- `docs/design/mobile-page-toc/design-mobile-open.png`
- `src/layouts/BaseLayout.astro`
- `src/layouts/ContentLayout.astro`
- `src/components/layout/PageToc.astro`
- `src/components/layout/MobilePageToc.astro`
- `src/lib/site/page-toc.ts`
- `scripts/lib/page-toc-postprocess.ts`
- `scripts/postprocess-page-toc.ts`
- `tests/node/page-toc-postprocess.test.ts`
- 必要に応じて `src/components/layout/Header.astro`
- 必要に応じて `src/components/layout/MobileMenu.astro`
- 必要に応じて `src/styles/global.css`
- 必要に応じて `src/styles/prose.css`
- 必要に応じて検証用の既存MDXページ
- 必要に応じて検証用の既存Astroページ

実際の変更ファイルは実装時に確定する。

## レビュー観点

- `1024px` 未満で開閉式UIに切り替える方針でよいか
- `768px` 未満だけでなく、`768px` 以上 `1024px` 未満もMobilePageToc対象にしてよいか
- 本文内H1要素横に控えめな目次triggerを置く方針でよいか
- triggerの可視文言は短い `目次` / `TOC` 相当にし、アクセシブル名称で `このページの目次` を補う方針でよいか
- Header内にMobilePageToc buttonを置かない方針でよいか
- サイトメニューdrawerとは別導線にする方針でよいか
- MobilePageTocはH1直下の軽いoverlayとして表示する方針でよいか
- 既存TOC生成結果をPC / mobileで再利用する方針でよいか
- postprocess側に `data-mobile-page-toc-slot` を追加するか、既存slot / Componentを再利用するか
- TOC項目が0件または1件ならbutton自体を表示しない方針でよいか
- 項目選択後にMobilePageTocを閉じる方針でよいか
- Escキーで閉じる制御をこのIssueに含める方針でよいか
- focus trapまでは必須にしない方針でよいか
- サイトメニューとMobilePageTocが同時に開いた場合、片方を閉じる方針でよいか
- 現在位置ハイライトはこのIssueでは扱わない方針でよいか
- IntersectionObserverによるactive heading追跡を後続へ残す方針でよいか
- `docs/design/mobile-page-toc/` の採用designに沿って実装してよいか

## 備考

このIssueは、スマホ / タブレット幅のページ内目次実装に集中する。

`13-page-toc` で実装済みのPC右サイドTOC、postprocess、アンカーID生成方針を変更しない。

MobilePageTocは、サイトメニューではなく、現在ページ内の見出しへ移動するための補助UIである。

現在位置ハイライトは初期リリース必須要件外として扱い、このIssueでは実装しない。

このIssueはremote snapshot由来のdraftをlocal repository modeで検証したものである。

`docs/design/mobile-page-toc/` は `design-image-generation initial draft mode` で作成済みである。

採用designは、本文内H1要素横の控えめな目次triggerと、H1直下に開く軽いoverlay表示とする。

tablet専用design画像は作成しない。タブレット / 狭幅PC幅は、採用済みmobile designを基準に実装後のviewport確認で扱う。

## レビュー指摘 1

### 指摘事項

- `1024px` ちょうどでPC右サイドPageTocもMobilePageTocも表示されない可能性がある。
- `docs/design/mobile-page-toc/notes.md` は固定ページタイトルバー案を正としているが、現行実装とissue本文は本文内H1横trigger案を正としており、design正本と実装方針が不一致になっている。

### 判定

- source: pr-review-draft
- classification: valid
- local validation:
  - `.tmp/14-review.md` はPR #18のremote PR review draftであり、`Source Snapshot` と `Unchecked / Not verified` を含むため、ローカル状態で再検証した。
  - `src/layouts/BaseLayout.astro` ではPC右サイドPageTocを `@media (max-width: 64rem)` で非表示にしている。
  - `src/components/layout/MobilePageToc.astro` ではMobilePageTocを `@media (max-width: 63.999rem)` で表示している。
  - そのため、通常のroot font-size 16px前提では `1024px` ちょうどで両方が非表示になる境界不整合が残っている。
  - `docs/design/mobile-page-toc/notes.md` には「スマホ固定ページタイトルバー」「本文領域とは別」「fixed titlebar overlay案を正式採用する」などの記述が残っている。
  - 現行実装は `scripts/lib/page-toc-postprocess.ts` で最初のH1とMobilePageTocを `.mobile-page-heading` にラップし、H1横triggerとH1直下overlayとして表示する方針である。
  - `docs/issue/done/phase-2/14-mobile-page-toc.md` は本文内H1横trigger案へ更新済みのため、design notes側を現行実装方針へ追従させるのが最小対応である。

### 対応方針

- `1024px` 境界でページ内目次が消えないよう、PC右サイドPageTocの非表示breakpointをMobilePageToc側と揃える。
- 境界確認として `1023px` / `1024px` / `1025px` の表示状態を確認し、PC用 / mobile用TOCが二重表示にも無表示にもならないことを確認する。
- `docs/design/mobile-page-toc/notes.md` の固定ページタイトルバー前提を、本文内H1横triggerとH1直下overlay前提へ更新する。
- design notes更新後、issueの未チェック項目 `design notesと実装が矛盾していない` と、該当する完了条件を確認して更新する。

### 対応完了チェックリスト

- [x] `1024px` ちょうどでPC右サイドPageTocまたはMobilePageTocのどちらかが表示される
- [x] `1023px` / `1024px` / `1025px` でPC用 / mobile用TOCが二重表示にも無表示にもならない
- [x] `docs/design/mobile-page-toc/notes.md` が本文内H1横triggerとH1直下overlay方針に更新されている
- [x] issueのdesign notes関連チェックが更新されている
- [x] `npm run check` が通る
- [x] `npm run build` が通る
