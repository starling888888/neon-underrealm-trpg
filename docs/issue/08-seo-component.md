# 08-seo-component

## 目的

SEO / OGP 用の共通Componentを作成し、各ページで `title`、`description`、`og:*` などのメタ情報を安全に設定できる状態にする。

GitHub Pages のサブパス公開でも OGP 画像やURL参照が壊れないよう、base path / site URL を考慮したメタ情報生成を行う。

## 背景

`docs/plan.md` の Phase 1 では、Astro基盤の一部として `08-seo-component` が定義されている。

対象タスクは以下。

* `src/components/seo/Seo.astro` 作成
* 共通OGP設定を実装
* `title`, `description`, `og:*` を設定可能にする
* 共通OGP画像の参照パスをbase path対応にする

関連する要件は以下を参照する。

* `docs/plan.md`
* `docs/requirements.md`
* `docs/out-of-scope.md`
* `docs/TODO.md`
* `astro.config.mjs`
* `package.json`

特に `docs/requirements.md` では、GitHub Pages等のサブパス公開時にも内部リンク、画像、CSS、JS、OGP画像URLなどがルート `/` 固定に依存しないことが求められている。

また、`docs/out-of-scope.md` では個別OGP画像の自動生成は初期スコープ外だが、OGPメタ情報は必須であり、初期実装では共通OGP画像を利用してよいとされている。

このタスクでは、個別ページごとのOGP画像生成は行わず、ユーザー提供の共通OGP画像を参照できるSEO Component基盤までを扱う。

## 対象範囲

* `src/components/seo/Seo.astro`
* 必要に応じたSEO用の型定義、定数、ユーティリティ

  * 例：`src/lib/site/seo.ts`
  * 例：`src/lib/utils/paths.ts` または既存base path helper
* 必要に応じた既存サンプルページへの最小導入

  * 例：`src/pages/index.astro`
  * 例：`src/pages/mdx-test.mdx`
* 共通OGP画像パスの参照処理
* ユーザー提供の共通OGP画像を `public/` 配下から参照する方針の確認
* `Astro.site`、`import.meta.env.BASE_URL`、または既存base path helperを用いたURL生成
* `npm run build`
* 必要に応じて `npm run check`

## 初期スコープ外

* 個別ページごとのOGP画像生成を実装しない
* OGP画像を自動生成するスクリプトを作らない
* 画像生成AIやデザイン画像生成をこのタスクで実行しない
* アクセス解析を追加しない
* sitemap生成、RSS生成、robots.txt生成はこのタスクでは扱わない
* Header / Footer / Layout / SiteMenu などの画面レイアウトを実装しない
* ページ本文やルール本文の内容整理を行わない
* 検索機能、Pagefind連携、検索UIを実装しない
* DB、認証、SSR、CMS、常駐サーバーを追加しない
* 大規模UIライブラリを追加しない
* 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

* [x] `src/components/seo/Seo.astro` が作成されている
* [x] `title` を外部から指定できる
* [x] `description` を外部から指定できる
* [x] `og:title` を設定できる
* [x] `og:description` を設定できる
* [x] `og:type` を設定できる
* [x] `og:url` を設定できる
* [x] `og:image` を設定できる
* [x] `twitter:card` など、最低限のSNS表示用metaが設定されている
* [x] title / description / og 系の未指定時に、サイト共通のデフォルト値へフォールバックする
* [x] ユーザー提供の共通OGP画像が `public/` 配下に適切な名前で配置されている
* [x] 共通OGP画像として `public/neon-underrealm-ogp.png` を参照する方針になっている
* [x] 共通OGP画像の参照URLが、GitHub Pagesのサブパス公開で壊れない
* [x] ルート `/` 固定に依存した画像URL・ページURLを追加していない
* [x] 個別OGP画像生成を実装していない
* [x] アクセス解析や外部サービス連携を追加していない
* [x] 不要なnpm packageを追加していない
* [x] `npm run build` が通る
* [x] 必要に応じて `npm run check` が通る
* [x] UI系タスクとしてのdesign targetの扱いが記録されている
* [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている

## チェックポイント

* [x] 既存ルートが壊れていない
* [x] GitHub Pagesのサブパス公開に影響しない
* [x] OGP画像URLが `/` 固定になっていない
* [x] `astro.config.mjs` の `site` / `base` 設定と矛盾していない
* [x] ComponentがLayout未実装の段階でも単体で導入しやすい
* [x] 後続の `09-base-layout` で共通Layoutに組み込みやすい
* [x] ページごとの上書き可能項目とサイト共通デフォルトの責務が分離されている
* [x] 不要な依存関係を追加していない
* [x] 初期スコープ外の機能を実装していない
* [x] 関連する `docs/TODO.md` 項目と矛盾していない
* [x] 関連する `docs/design/` と矛盾していない
* [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `src/components/seo/Seo.astro`
* `src/lib/site/seo.ts`
* `src/lib/utils/paths.ts`
* `src/pages/index.astro`
* `src/pages/mdx-test.mdx`
* `public/neon-underrealm-ogp.png`

上記のうち、`src/lib/site/seo.ts`、`src/lib/utils/paths.ts`、既存ページへの導入は必要な場合のみ変更する。

共通OGP画像アセットはユーザー提供の `public/neon-underrealm-ogp.png` を使用する。実装時に別名や別画像へ差し替える場合は、issueの方針変更としてユーザー確認を行う。

## レビュー観点

SEO Componentの責務が、メタタグ生成と共通デフォルト設定に限定されているか確認する。

GitHub Pagesのサブパス公開に対して、`og:url` と `og:image` のURL生成が壊れないか確認する。

`Astro.site`、`import.meta.env.BASE_URL`、既存または新規のbase path helperの使い分けが過剰に複雑になっていないか確認する。

後続の `09-base-layout` で共通Layoutに自然に組み込める形になっているか確認する。

個別OGP画像生成、アクセス解析、sitemap、RSS、robots.txtなど、このissueの範囲外のSEO関連機能を混ぜていないか確認する。

ユーザー提供の共通OGP画像が `public/` 配下に適切な名前で配置され、SEO Componentのデフォルト画像として参照されているか確認する。

## 備考

このタスクは可視UIを持つComponentではなく、HTML `<head>` 内のmeta情報を生成するためのComponentである。

そのため、通常のUIデザイン画像は原則不要と判断する。共通OGP画像そのものはユーザー提供の `public/neon-underrealm-ogp.png` を使用し、このissueでは画像生成を行わない。

`docs/TODO.md` の未対応項目には、既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せるTODOがある。ただし、このissueはSEO / OGP Component作成であり、既存design notes整理とは直接関係しないため、このissueでは対応しない。

このissueはremote snapshot draftを元に作成したが、ローカルrepo上で `08-seo-component` branch、`docs/issue/08-seo-component.md`、`public/neon-underrealm-ogp.png`、実装対象ファイル、検証コマンドを確認済みである。

## 実装後検証

- `npm run check` 成功
- `npm run build` 成功
- 生成済み `dist/index.html` の `og:url` が `https://starling888888.github.io/neon-underrealm-trpg/` になることを確認
- 生成済み `dist/index.html` の `og:image` が `https://starling888888.github.io/neon-underrealm-trpg/neon-underrealm-ogp.png` になることを確認
- `public/neon-underrealm-ogp.png` が `1200x630` のPNGであることを確認

## レビュー指摘 1

### 指摘事項

- issue末尾にremote draft由来の `Source Snapshot` / `Unchecked / Not verified` / `Local Validation Required` が残っており、完了条件・チェックポイントが完了済みであることと矛盾して見える。
- `toAbsoluteUrl()` は内部で `withBase()` を適用するため、`ogUrl` / `ogImage` に渡す値はbase未付与のローカルパスまたは完全な絶対URLにする、という呼び出し契約を明文化した方がよい。

### 判定

- source: pr-review-draft
- classification: valid
- local validation: `.tmp/08-review.md` はPR #10のremote PR review draftであり、ローカル未検証項目を含むため鵜呑みにはしない。ローカル確認では、`docs/issue/08-seo-component.md` にremote draft由来の記述が残っている一方、完了条件とチェックポイントは完了済みであることを確認した。`src/lib/utils/paths.ts` の `toAbsoluteUrl()` は `withBase()` を内部で呼んでおり、base付与済みパスを渡すと二重付与になり得るため、呼び出し契約の明文化は現在issueの範囲に含まれる有効指摘と判断する。

### 対応方針

- `docs/issue/08-seo-component.md` のremote draft由来セクションを、実装後の検証済み状態に合わせて整理する。
- `npm run check`、`npm run build`、生成済み `dist/index.html` の `og:url` / `og:image` 確認結果を `実装後検証` として記録する。
- `src/lib/utils/paths.ts` の `toAbsoluteUrl()` 付近に、base未付与のローカルパスまたは絶対URLを渡す契約を短くコメントする。

### 対応完了チェックリスト

- [x] issue内のremote draft由来セクションが、完了済み状態と矛盾しない形に整理されている
- [x] `実装後検証` に `npm run check` / `npm run build` / `dist/index.html` の `og:url` / `og:image` 確認結果が記録されている
- [x] `toAbsoluteUrl()` の呼び出し契約が明文化されている
- [x] `npm run check` が通る
- [x] `npm run build` が通る
