# 13-page-toc

## 目的

PC版で右サイドに表示するページ内目次を実装する。

このタスクでは、ページ本文中の見出しからページ内目次を生成し、PCレイアウトでは右サイドに固定表示する。

また、ユーザー承認済みの追加仕様として、画面・ページ種別によってページ内目次を表示しない制御を導入する。

具体的には以下を満たす。

* 長い本文ページではページ内目次を表示できる
* `.mdx` / `.astro` のどちらで生成されたページでも、最終HTMLを元にページ内目次を生成できる
* データページなど、`.astro` でHTMLを生成するページにもページ内目次を適用できる
* トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404` など、ページ内目次が不要な画面では表示しない
* Astro layout props からページ内目次の表示/非表示を制御できる
* MDX frontmatter からページ内目次の表示/非表示を制御できる
* 見出しIDは手作業で書かせず、build後postprocessで自動付与する
* 日本語見出しをそのまま `id` に使わず、ASCII-onlyの安定したアンカーIDを生成する
* 既存の非ASCII `id` はbuild後postprocessで検出し、TOC対象見出しではASCII-onlyの自動生成IDへ置換してwarningを出す
* 生成IDが衝突した場合は自動suffixで黙って解決せず、build時に検出する
* この追加仕様は、ユーザー承認済みの追加仕様として `docs/requirements.md` と `docs/plan.md` に反映する

## 背景

`docs/plan.md` の `13-page-toc` は、Phase 2 の「PC右ページ内目次を実装する」タスクである。

既存の要件では、PC版レイアウトにおいて左にサイトメニュー、中央に本文、右にページ内目次を表示する方針がある。

一方で、ページ内目次は全ページに常時表示するものではなく、長い本文ページやデータページを主対象とする。

トップページ、更新履歴ページ、404ページのように、入口・一覧・状態表示として使うページでは、ページ内目次を表示しない方が自然である。

また、当初はMDX / Markdownの見出し生成を中心に考えられていたが、このプロジェクトではデータページなど `.astro` ファイルでHTMLを生成するページにもページ内目次が必要になる。

そのため、MDX専用の `getHeadings()` のみに依存せず、build後に生成済みHTMLを解析してページ内目次を生成する方式を採用候補とする。

この方式により、以下を同一の仕組みで扱える。

* MDXで書かれたルール本文ページ
* Astroで作られたデータページ
* JSON / TS配列などから生成された一覧ページ
* 将来的な静的生成ページ

## ユーザー承認済み追加仕様

このIssueには、以下のユーザー承認済み追加仕様を含める。

* 画面によってはページ内目次を表示しない
* トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404` ではページ内目次を表示しない
* Layout propsでページ内目次の表示/非表示を制御可能にする
* MDX frontmatterでページ内目次の表示/非表示を制御可能にする
* `.astro` で生成されたデータページにもページ内目次を適用できるようにする
* 見出しIDは手作業で書かせない
* 日本語見出しをそのままアンカーIDにしない
* 自動生成IDはASCII-onlyのhash形式にする
* 既存の非ASCII `id` はASCII-onlyの自動生成IDへ置換してwarningを出す
* 同一ページ内で生成IDが衝突した場合はbuild時に検出する
* この追加仕様を `docs/requirements.md` と `docs/plan.md` に反映する

## 対象範囲

このタスクで扱う。

* PC版右サイドのページ内目次
* ページ内目次の表示枠
* ページ内目次の差し込みスロット
* build後HTML postprocessによるTOC生成
* build後HTML postprocessによる見出しID自動付与
* `.mdx` ページの見出し抽出
* `.astro` ページの見出し抽出
* データ生成ページの見出し抽出
* 見出しリンクによるページ内ジャンプ
* `showPageToc` または同等のLayout props
* MDX frontmatterによる表示制御
* `BaseLayout.astro` からの表示制御
* `ContentLayout.astro` からの表示制御
* `data-page-content` などによる本文領域の明示
* `data-page-toc-slot` などによるTOC差し込み位置の明示
* `data-page-toc-enabled` などによるpostprocess対象ページの明示
* トップページ `/` でのページ内目次非表示
* 更新履歴ページ `/release-notes` でのページ内目次非表示
* 404ページ `/404` でのページ内目次非表示
* 見出しが少ないページで空のTOCを表示しない制御
* 既存の `id` がある見出しの扱い
* `data-toc-exclude` などによるTOC除外指定
* `data-anchor-id` などによる例外的な明示アンカーID指定
* `docs/requirements.md` への追加仕様反映
* `docs/plan.md` への追加仕様反映
* GitHub Pages subpath配下でもアンカーリンクが機能すること
* `nav` / `aria-label` などのアクセシビリティ属性
* 既存CSS tokens / layout設計との整合

## 初期スコープ外

このタスクでは扱わない。

* スマホ用ページ内目次
* `MobilePageToc.astro`
* スマホ用の開閉式「このページの目次」
* スマホ用TOC drawer
* Escキーで閉じる制御
* 現在位置ハイライト
* IntersectionObserverによるactive heading追跡
* スクロール連動表示
* パンくず
* 前後ページナビゲーション
* 検索UI
* Pagefind等の検索導入
* ルール本文の本格移植
* 新規本文ページの大量作成
* 404ページ本体の完成
* トップページ本体の完成
* Excel / Spreadsheet連携
* JSON変換パイプライン
* キャラクターシート
* ダイスローラー
* 戦闘シミュレーター
* DB
* 認証
* SSR
* CMS
* 外部UIライブラリの大規模導入
* 高度なアニメーション

## 技術方針

### 実装ステップとレビューゲート

このIssueは、以下の2段階に分けて実装する。

#### Step 1. UI側実装

Step 1では、PageTocを差し込むためのUI / Layout側の構造だけを実装する。

対象に含める。

* `PageToc.astro` または同等のTOC表示Component
* `BaseLayout.astro` / `ContentLayout.astro` の右レール差し替え
* `showPageToc` または同等のLayout props
* MDX frontmatterからLayout propsへ渡す表示制御
* `data-page-content` / `data-page-toc-slot` / `data-page-toc-enabled` など、postprocessが後で利用するHTML marker
* `/`、`/release-notes`、`/404` ではPageTocを表示しない制御
* `docs/design/page-toc/` のdesign画像に沿ったPC右サイド表示

Step 1では、以下を触らない。

* build後HTML postprocessの実装
* 見出しID自動付与
* HTMLパーサ導入
* hash ID生成
* TOC項目の実生成
* `npm run build` へのpostprocess組み込み

Step 1完了時は、そこで作業報告を行い、ユーザーの一次レビューを待つ。

ユーザーがStep 1を確認して明示的に承認するまで、Step 2へ進まない。

#### Step 2. postprocess実装

Step 2では、build後HTML postprocessと、それを検証するテストコードを実装する。

対象に含める。

* build後HTMLから本文領域の `h2` / `h3` を抽出する処理
* `data-page-toc-enabled="true"` のページだけを処理する制御
* TOC対象見出しへのASCII-only hash ID自動付与
* 既存 `id` / `data-anchor-id` / `data-toc-exclude` の扱い
* 生成IDの同一ページ内衝突検出
* TOC HTMLを `[data-page-toc-slot]` へ差し込む処理
* TOC項目がない、または少なすぎるページで空TOC枠を表示しない処理
* `npm run build` へのpostprocess実行組み込み
* postprocessロジックのテストコード

Step 2では、postprocessの主要ロジックに対してテストコードを実装する。

少なくとも以下をテスト観点に含める。

* `showPageToc=false` 相当のページがpostprocess対象外になる
* `showPageToc=true` 相当のページがpostprocess対象になる
* `h2` / `h3` からTOC項目が生成される
* 生成IDがASCII-onlyで `h-<short-hash>` 形式になる
* 同一ページ内の生成ID重複が検出される
* `data-anchor-id` で明示IDを指定できる
* `data-toc-exclude` でTOCから除外できる
* TOC項目が0件または1件の場合に空TOC枠が表示されない

Step 2完了時も、そこで作業報告を行い、ユーザーの一次レビューを待つ。

### 基本方針

ページ内目次は、MDX / Markdown専用の `getHeadings()` のみに依存しない。

`.astro` で生成されるデータページにもページ内目次が必要になるため、最終的に生成されたHTMLをbuild後に解析し、本文領域内の見出しからページ内目次を生成する方式を採用する。

build後postprocessでは以下を行う。

* `dist/**/*.html` を対象にする
* `data-page-toc-enabled="true"` のページのみ処理する
* `[data-page-content]` 内の `h2` / `h3` を目次対象にする
* 見出しに `id` がない場合は自動生成して付与する
* 既存の `id` がASCII lower kebab-caseの場合は尊重する
* ただし、TOC対象見出しの `id` がASCII-only制約に違反する場合は検出し、ASCII-onlyの自動生成IDへ置換してwarningを出す
* 生成したTOCを `[data-page-toc-slot]` に差し込む
* TOC項目がない場合はTOC領域を表示しない
* 処理後のHTMLを同じ出力先へ書き戻す

この方式では、MDX / Markdown / Astro / データ生成ページを最終HTMLベースで統一的に扱う。

### Layout側の目印

`BaseLayout.astro` または同等のlayoutでは、本文領域とTOC差し込み領域をHTML上で明示する。

想定例：

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

実際のDOM構造は既存layoutに合わせて調整する。

重要なのは、postprocess側が以下を機械的に判断できることである。

* どのHTMLファイルがTOC生成対象か
* どの領域から見出しを拾うか
* どの領域へTOCを差し込むか

### 表示制御

Layout propsとして、以下のような制御を用意する。

```ts
showPageToc?: boolean
```

MDX frontmatterでも同等の制御を可能にする。

```yaml
---
title: "判定ルール"
showPageToc: true
---
```

デフォルト挙動は明示する。

想定デフォルトは以下。

* `ContentLayout.astro` を使う本文ページでは `showPageToc: true`
* `BaseLayout.astro` を直接使うページでは `showPageToc: false`
* トップページ `/` は `showPageToc: false`
* 更新履歴ページ `/release-notes` は `showPageToc: false`
* 404ページ `/404` は `showPageToc: false`
* 見出し数が0または1以下の場合は、TOC枠を表示しない

## アンカーID生成方針

### 手書きIDを標準運用にしない

ページ内目次用の見出しIDは、手作業で各見出しに書かせない。

MDX / Markdown本文についても、`.astro` ページについても、通常運用では見出しに `id` を手書きしない。

build後postprocessで本文領域内の見出しを解析し、`id` が存在しない見出しには自動でアンカーIDを付与する。

### 日本語IDを使わない

自動生成されるIDは、日本語見出し本文をそのまま使わない。

理由は、日本語IDをURLフラグメントに使用すると、リンクコピー時にpercent-encodeされて可読性が大きく落ちるため。

避けたい例：

```txt
/rules/combat/#%E5%88%A4%E5%AE%9A
```

したがって、自動生成IDはASCII-onlyの機械IDとする。

### ローマ字変換しない

日本語見出しをローマ字変換してIDにする方式は採用しない。

理由は以下。

* 変換品質が安定しない
* 固有語・造語・カタカナ語・英数字混在に弱い
* 表記揺れが起きやすい
* ライブラリ依存が増える
* 最終的に人間が修正したくなり、手運用に戻りやすい

表示名は日本語のまま、アンカーIDは機械IDとして割り切る。

### ID形式

自動生成IDは以下の形式とする。

```txt
h-<short-hash>
```

例：

```txt
h-b91d02f4
h-0c7eaa19
h-a8f31c22
```

ID本体にページ内出現順の連番を含めない。

連番を含めると、前方に見出しを追加した際に後続見出しのIDが変化し、既存リンクが壊れるためである。

避ける形式：

```txt
h-001-b91d02f4
h-002-0c7eaa19
```

### hash入力

hash入力は、以下を基本とする。

```txt
<heading depth>|<normalized heading text>
```

例：

```txt
2|コンボ
3|コンボ中のリアクション
```

正規化では、最低限以下を行う。

* 前後空白を除去する
* 連続空白を単一空白にする
* 改行を空白に寄せる
* HTMLタグを除去し、見出しの可視テキストを使う
* 全角/半角の正規化を行うかどうかは実装時に判断し、決定したら記録する

hashアルゴリズムは実装時に選定する。

ただし、同じ入力に対して同じIDが生成されることを必須とする。

### 重複時の扱い

同一ページ内で自動生成IDが重複した場合、安易に `-2`, `-3` などの順序suffixで黙って解決しない。

理由は、同名見出しの追加・削除によりsuffixが変動し、リンク安定性が損なわれるためである。

自動生成IDが同一ページ内で衝突した場合は、原則としてbuild errorにする。

初期実装上の都合でwarningに留める場合は、その理由を明記し、後続でerror化する前提を残す。

重複見出しや恒久リンクを固定したい見出しでは、例外的に `data-anchor-id` による明示指定を許可する。

例：

```astro
<h2 data-anchor-id="reaction-check">判定</h2>
```

この場合、postprocess後は以下のようになる。

```html
<h2 id="reaction-check" data-anchor-id="reaction-check">判定</h2>
```

ただし、これは例外運用であり、通常の本文執筆者に要求するものではない。

### 既存IDの扱い

見出しに既に `id` がある場合は、ASCII lower kebab-caseの範囲ではそのIDを尊重する。

ただし、TOC対象見出しの既存 `id` が日本語などの非ASCII文字を含む場合は検出し、ASCII-onlyの自動生成IDへ置換してwarningを出す。

この方針は、Astro / MDXが日本語見出しから非ASCII `id` を生成済みの場合でも、標準運用で本文執筆者に手修正を要求しないためである。

TOC対象として許容する明示IDは、原則としてASCII lower kebab-caseに寄せる。

想定許容例：

```txt
reaction-check
combat-flow
rule-visibility
```

想定非推奨・検出対象例：

```txt
判定
コンボ
リアクション 判定
```

既存IDが不適切な場合は、postprocessが自動生成IDへ置換する。恒久的に人間が読める固定IDを指定したい場合は、以下のいずれかで対応する。

* `data-anchor-id` にASCII-onlyの明示IDを指定する
* 見出しから既存IDを削除し、自動生成IDに任せる
* `data-toc-exclude` でTOC対象から除外する

### TOC除外

TOCに載せたくない見出しは、以下のような属性で除外可能にする。

```astro
<h2 data-toc-exclude>内部用見出し</h2>
```

`data-toc-exclude` が付いた見出しは、TOC項目として扱わず、必要であればID自動付与対象からも除外する。

## postprocess実装方針

### 実行タイミング

初期実装では、PageToc postprocessはproduction build後に実行する。

`astro dev` 上でPageTocが常に完全再現されることは必須条件にしない。

ただし、visual確認や最終確認はpostprocess後のbuild成果物を対象にする。

実装方式は、TypeScriptの独立scriptを `npm run build` に組み込む方式を採用する。

```json
"build": "astro build && node --import tsx scripts/postprocess-page-toc.ts"
```

生のJavaScript scriptは作成せず、TypeScriptを直接実行できる `tsx` を開発依存に追加する。

### HTMLパーサ

build後のHTMLを安全に編集するため、HTMLパーサとして `parse5` を採用する。

依存追加理由:

* `parse5`: build後HTMLを文字列置換ではなくHTMLとしてparse / serializeするため。標準HTMLに近い挙動で、postprocess対象が静的HTML全体である今回の用途に合う。
* `tsx`: `scripts/postprocess-page-toc.ts` と `tests/node/**/*.test.ts` をTypeScriptのまま直接実行するため。生のJavaScript scriptを避けるユーザー指示に対応する。
* `@types/node`: TypeScript script / Node testで `node:fs/promises`、`node:test`、`node:assert/strict`、`node:crypto` などのNode組み込みAPIを型付きで扱うため。

代替案:

* 正規表現 / 文字列置換: HTML構造の入れ子や属性処理に弱いため採用しない。
* Astro integration: 初期実装では独立scriptの方がbuild後成果物への処理範囲とテスト対象を分けやすいため採用しない。
* `ts-node`: TypeScript直接実行の代替だが、ESM構成では `tsx` の方が設定が少なく、今回のscript用途に合う。
* `htmlparser2` / `linkedom` / `cheerio`: 今回はブラウザDOM互換APIやjQuery風APIより、生成HTMLのparse / serializeの安定性を優先して `parse5` を採用する。

大規模UIライブラリや不要なクライアントJSは導入しない。

### 処理概要

postprocessは概ね以下の流れで行う。

```txt
for each dist/**/*.html:
  parse html

  if [data-page-toc-enabled="true"] がない:
    skip

  content = querySelector("[data-page-content]")
  slot = querySelector("[data-page-toc-slot]")

  if content or slot がない:
    skip or warning

  headings = content.querySelectorAll("h2, h3")

  for heading in headings:
    if heading has data-toc-exclude:
      continue

    if heading has data-anchor-id:
      validate data-anchor-id
      set heading.id = data-anchor-id

    else if heading has id:
      if existing id is ASCII lower kebab-case:
        use existing id
      else:
        generate hash id from depth + normalized visible text
        replace heading.id with generated id
        warn

    else:
      generate hash id from depth + normalized visible text
      set heading.id = generated id

    collect toc item

  if generated/used ids duplicate:
    fail build or warn according to configured severity

  if tocItems is empty or too small:
    hide/remove toc slot
  else:
    render toc html into toc slot

  serialize html
  write html
```

## 完了条件

### Step 1完了条件

* [ ] `PageToc` または同等のTOC描画構造が実装されている
* [ ] PC版で右サイドにページ内目次を表示できる
* [ ] `data-page-content` などで本文領域が明示されている
* [ ] `data-page-toc-slot` などでTOC差し込み位置が明示されている
* [ ] `data-page-toc-enabled` などでpostprocess対象ページが明示されている
* [ ] Layout propsでページ内目次の表示/非表示を制御できる
* [ ] MDX frontmatterでページ内目次の表示/非表示を制御できる
* [ ] トップページ `/` ではページ内目次が表示されない
* [ ] 更新履歴ページ `/release-notes` ではページ内目次が表示されない
* [ ] 404ページ `/404` ではページ内目次が表示されない
* [ ] Step 1ではbuild後HTML postprocessを実装していない
* [ ] Step 1完了報告を行い、ユーザーの一次レビューを待っている

### Step 2完了条件

* [ ] `.mdx` で生成されたページの見出しからTOCを生成できる
* [ ] `.astro` で生成されたページの見出しからTOCを生成できる
* [ ] データページの見出しからTOCを生成できる
* [ ] 見出しIDを各ページ本文に手作業で書く運用を前提にしていない
* [ ] `id` がないTOC対象見出しに、build後postprocessでIDを自動付与できる
* [ ] 自動生成IDに日本語見出し本文をそのまま使っていない
* [ ] 自動生成IDがASCII-onlyである
* [ ] 自動生成IDは `h-<short-hash>` 形式である
* [ ] 自動生成IDにページ内出現順の連番を含めていない
* [ ] 同じ入力から同じIDが生成される
* [ ] 同一ページ内で自動生成IDが重複した場合、build時に検出される
* [ ] 重複検出時に黙って `-2`, `-3` suffixで解決しない
* [ ] 重複時は原則build errorになる
* [ ] 初期実装でwarningに留める場合、その理由と後続error化方針が記録されている
* [ ] `data-anchor-id` による例外的な明示ID指定ができる
* [ ] `data-anchor-id` の値はASCII-only制約で検証される
* [ ] 既存のASCII lower kebab-case `id` がある見出しは尊重される
* [ ] 既存の `id` がTOC対象として不適切な場合は検出される
* [ ] 既存の非ASCII `id` はASCII-onlyの自動生成IDへ置換され、warningが出る
* [ ] `data-toc-exclude` によってTOC対象から除外できる
* [ ] TOC項目がない、または少なすぎるページでは空のTOC枠を表示しない
* [ ] TOCリンクでページ内ジャンプできる
* [ ] GitHub Pages subpath配下でもアンカーリンクが壊れない
* [ ] postprocessロジックのテストコードが実装されている
* [ ] postprocess対象 / 対象外、ID生成、重複検出、`data-anchor-id`、`data-toc-exclude`、空TOC非表示のテストがある
* [ ] Step 2完了報告を行い、ユーザーの一次レビューを待っている

### Issue全体の完了条件

* [ ] `nav` / `aria-label` などのアクセシビリティ属性が付与されている
* [ ] スマホ用ページ内目次はこのIssueでは実装していない
* [ ] 現在位置ハイライトはこのIssueでは実装していない
* [ ] 不要なクライアントJSを追加していない
* [ ] 不要な大規模UIライブラリを追加していない
* [ ] `docs/requirements.md` にユーザー承認済み追加仕様が反映されている
* [ ] `docs/plan.md` にユーザー承認済み追加仕様が反映されている
* [ ] `npm run build` が成功する
* [ ] 必要に応じて `npm run check` が成功する

## チェックポイント

* `/` が壊れていない
* `/` にページ内目次が表示されない
* `/release-notes` にページ内目次が表示されない
* `/404` にページ内目次が表示されない
* 本文ページではページ内目次が表示される
* データページではページ内目次が表示される
* `showPageToc=false` のページはpostprocess対象外になる
* `showPageToc=true` のページはpostprocess対象になる
* MDX frontmatterの指定がLayoutへ渡る
* `ContentLayout.astro` から `BaseLayout.astro` へTOC表示制御が渡る
* SEO propsとTOC propsが衝突していない
* 見出しが0件のページで空TOCが出ない
* 見出しが1件だけのページで不自然なTOCが出ない
* `h2` / `h3` の階層がTOCに反映される
* `h1` はページタイトル相当としてTOC対象外になっている
* 見出しテキストが日本語でも生成IDはASCII-onlyになる
* URLコピー時に日本語ID由来のpercent-encodeが発生しない
* 同一見出しが重複したときにbuild時検出される
* 重複見出しが自動suffixで黙って処理されない
* `data-anchor-id` を使うと衝突を明示的に解決できる
* `data-toc-exclude` を使うとTOCから除外できる
* 既存のASCII `id` が破壊されない
* 既存の非ASCII `id` が検出される
* postprocess後のHTMLで見出しに `id` が付与されている
* postprocess後のHTMLでTOCが差し込まれている
* 右サイド目次が本文幅を不自然に圧迫しない
* Header / Footer / SiteMenu と競合しない
* `1024px` 未満ではPC右サイド常設目次を表示しない方針と矛盾しない
* スマホ用目次タスク `14-mobile-page-toc` の実装余地を潰していない
* 現在位置ハイライトの後続実装余地を潰していない
* design notesと実装が矛盾していない
* ユーザー未コミット変更を破壊していない

## 想定変更ファイル

* `docs/issue/13-page-toc.md`
* `docs/requirements.md`
* `docs/plan.md`
* `docs/design/page-toc/notes.md`
* `docs/design/page-toc/design-desktop.png`
* `src/layouts/BaseLayout.astro`
* `src/layouts/ContentLayout.astro`
* `src/components/layout/PageToc.astro`
* `src/lib/site/page-toc.ts`
* `src/lib/site/heading-anchor.ts`
* `scripts/lib/page-toc-postprocess.ts`
* `scripts/postprocess-page-toc.ts`
* `tests/node/page-toc-postprocess.test.ts`
* `package.json`
* `package-lock.json`
* 必要に応じて `src/pages/index.astro`
* 必要に応じて `src/pages/404.astro`
* 必要に応じて検証用の既存MDXページ
* 必要に応じて検証用の既存Astroページ

実際の変更ファイルは実装時に確定する。

## `docs/requirements.md` 反映方針

`FR-01-05. ページ内目次` または同等箇所に、以下の趣旨を追記する。

```md
ページ内目次は全ページに常時表示するものではなく、長い本文ページやデータページを主対象とする。

トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404`、その他目次が不要な画面ではページ内目次を表示しない。

ページ内目次の表示/非表示は、Astro layout propsで制御できること。

MDXページでは、frontmatterからページ内目次の表示/非表示を制御できること。

ページ内目次は、MDX / Markdownだけでなく、Astroで生成されたデータページにも適用できること。

ページ内目次の生成は、最終HTMLをbuild後に解析するpostprocess方式を採用候補とする。

見出しIDは標準運用では手作業で書かせない。

日本語見出し本文をそのままアンカーIDにせず、ASCII-onlyの安定したIDを自動生成する。

自動生成IDはページ内出現順に依存しないhash形式とする。

同一ページ内で生成IDが衝突した場合は、黙ってsuffixを付与して解決せず、build時に検出する。

この表示制御およびアンカーID生成方針は、ユーザー承認済みの追加仕様として扱う。
```

## `docs/plan.md` 反映方針

`13-page-toc` に以下を追加する。

```md
- [ ] Layout propsでページ内目次の表示/非表示を制御可能にする
- [ ] MDX frontmatterでページ内目次の表示/非表示を制御可能にする
- [ ] トップページ、更新履歴ページ、404ページではページ内目次を表示しない
- [ ] MDX / Markdown / Astro / データ生成ページを最終HTMLベースで統一的にTOC生成する
- [ ] build後postprocessでTOC対象見出しにアンカーIDを自動付与する
- [ ] 日本語見出し本文をそのままアンカーIDにしない
- [ ] ASCII-onlyのhash形式アンカーIDを生成する
- [ ] 自動生成IDにページ内出現順の連番を含めない
- [ ] 自動生成IDが同一ページ内で衝突した場合はbuild時に検出する
- [ ] 重複見出しは黙ってsuffix付与せず、必要に応じて `data-anchor-id` で明示解決する
- [ ] ユーザー承認済み追加仕様として、表示制御要件とアンカーID生成方針を `docs/requirements.md` に反映する
```

## design参照

`docs/design/base-layout/` では、右補助レールはPageTocタスクで扱う未決事項として残されている。

このタスクでは、既存のbase layout設計と矛盾しないようにPC右サイド目次を追加する。

`docs/design/page-toc/` が未作成の場合は、実装前にdesign notesと必要なdesign imageを作成する。

## レビュー観点

* 実装をStep 1 UI側実装、Step 2 postprocess実装の2段階に分ける方針でよいか
* Step 1ではpostprocess、HTMLパーサ、hash ID生成、TOC実生成を触らない方針でよいか
* Step 1完了時に作業報告し、ユーザー一次レビューを待ってからStep 2へ進む方針でよいか
* Step 2でpostprocess実装とテストコード実装を同じ段階で扱う方針でよいか
* Step 2完了時にも作業報告し、ユーザー一次レビューを待つ方針でよいか
* build後HTML postprocess方式でよいか
* MDX専用 `getHeadings()` 依存をやめ、最終HTMLベースに統一する方針でよいか
* `.astro` で生成されるデータページもTOC対象に含める方針でよいか
* `data-page-content` / `data-page-toc-slot` / `data-page-toc-enabled` のようなHTML marker方式でよいか
* Layout props名は `showPageToc` でよいか
* MDX frontmatter名は `showPageToc` でよいか
* `ContentLayout.astro` 使用ページのデフォルトを `showPageToc: true` にしてよいか
* `BaseLayout.astro` 直使用ページのデフォルトを `showPageToc: false` にしてよいか
* トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404` を明示的にTOC対象外にする方針でよいか
* TOC対象見出しは初期実装では `h2` / `h3` でよいか
* `h1` をTOC対象外にしてよいか
* 見出しが0件または1件のページではTOC枠を非表示にしてよいか
* 日本語IDを使わない方針でよいか
* ローマ字変換しない方針でよいか
* 自動生成ID形式は `h-<short-hash>` でよいか
* 自動生成IDにページ内連番を含めない方針でよいか
* hash入力を `<heading depth>|<normalized heading text>` とする方針でよいか
* 同一ページ内で生成IDが衝突した場合、原則build errorにしてよいか
* 初期実装でwarningに留める余地を残すか
* `data-anchor-id` による例外的な明示ID指定を許可してよいか
* `data-toc-exclude` による除外指定を許可してよいか
* 既存IDが非ASCIIの場合に検出する方針でよいか
* postprocess実装をAstro integrationにするか、独立scriptにするか
* HTMLパーサ依存を追加してよいか
* `astro dev` でTOC完全再現を必須にしない方針でよいか
* visual確認をpostprocess後のbuild成果物で行う方針でよいか
* スマホ用ページ内目次を `14-mobile-page-toc` に残す方針でよいか
* 現在位置ハイライトを初期スコープ外に残す方針でよいか

## 備考

このIssueは、PC版ページ内目次実装に集中する。

今回の追加仕様により、`docs/requirements.md` と `docs/plan.md` の更新は対象範囲に含める。

追加仕様はユーザー承認済みであり、TODO送りにしない。

スマホ用ページ内目次は `14-mobile-page-toc` で扱う。

現在位置ハイライトは初期必須要件外として扱う。

見出しIDは、通常運用では手作業で書かせない。

日本語見出しをそのままURL fragmentにしない。

重複見出しは黙って自動suffixで解決せず、build時に検出して明示対応させる。

## ローカル検証サマリー

このIssue draftはremote snapshot由来の草案を、ローカルrepositoryで検証したものである。

検証済み:

* local branch: `13-page-toc`
* local issue file: `docs/issue/13-page-toc.md`
* `docs/plan.md` に `13-page-toc` が存在する
* `docs/TODO.md` に `13-page-toc` へ直接紐づく未対応TODOはない
* `docs/design/page-toc/` は未作成
* `docs/design/base-layout/notes.md` では右レールのPageToc実装が後続タスクとして残されている
* `src/layouts/BaseLayout.astro` には右補助レールのプレースホルダーが存在する
* `src/layouts/ContentLayout.astro` は `BaseLayout.astro` をラップして本文を表示している
* `docs/requirements.md` にPC右サイドページ内目次とスマホ用目次の要件が存在する
* `docs/out-of-scope.md` でページ内目次の現在位置ハイライトは初期必須外とされている

未検証:

* `npm run check`
* `npm run build`
* 実際に選定するHTMLパーサ
* 実際に選定するhashアルゴリズム
* postprocess方式をAstro integrationにするか独立scriptにするか
* 既存MDX frontmatterの実運用
* 既存AstroページのTOC対象可否
* 既存データページのDOM構造

実装前に必要:

* `design-image-generation` initial draft modeで `docs/design/page-toc/notes.md` と `docs/design/page-toc/design-desktop.png` を作成し、承認済みdesign参照として扱える状態にする
* このIssueで `docs/requirements.md` と `docs/plan.md` に追加仕様を反映してよいか、人間レビューで確認する
