# 公開手順

このドキュメントは、ネオン・アンダーレルムTRPG ルールサイトの公開方針と、GitHub Pages公開手順を整理するための初期版です。

GitHub Actionsによる基本デプロイは `.github/workflows/deploy.yml` で管理します。

## 公開方針

- 静的サイトとして公開する。
- GitHub Pagesなどの静的ホスティングで公開できる構成を維持する。
- DB、常駐サーバー、認証、CMS、APIサーバーを前提にしない。
- CI/CD上のビルドはExcel本体に依存しない。
- 公開用ビルドは、Git管理されたMarkdown / MDX、生成済みJSON、サイトコード、設定ファイルだけで成立させる。

## 現時点の確認手順

ローカルで依存関係をインストールします。

```sh
npm install
```

公開前の基本確認として、以下を実行します。

```sh
npm run check
npm run build
```

ビルド済みサイトをローカルで確認する場合は、以下を実行します。

```sh
npm run preview
```

## GitHub Pages公開手順

GitHub Pages公開はGitHub Actionsで実行します。

workflowの基本処理は以下です。

1. `npm ci` を実行する。
2. `npm run check` を実行する。
3. `npm run build` を実行する。
4. `dist/` をGitHub Pages artifactとしてアップロードする。
5. GitHub Pagesへデプロイする。

この段階では検索インデックス生成を含めません。

workflowは `main` へのpushで実行します。

手動実行用に `workflow_dispatch` も設定しています。

ドキュメント更新、AGENTS / SKILL更新、README更新のみではデプロイが走らないよう、以下を `paths-ignore` に含めます。

- `docs/**`
- `.agents/**`
- `AGENTS.md`
- `README.md`

## サブパス公開

GitHub Pagesでは、以下のようなサブパス配下で公開される可能性があります。

```text
https://username.github.io/repository-name/
```

このリポジトリでは、Astroの `site` / `base` を以下の前提で設定します。

- `site`: `https://starling888888.github.io`
- `base`: `/neon-underrealm-trpg`

Astro ComponentやLayoutで内部リンクや `public/` 配下の静的アセットを参照するときは、ルート `/` 固定の文字列を直接埋め込まず、`src/lib/utils/paths.ts` の `withBase()` を使います。

```astro
---
import { withBase } from "../lib/utils/paths";
---

<a href={withBase("/rules/")}>ルール</a>
<img src={withBase("/assets/images/example.png")} alt="" />
```

Markdown / MDX本文では、通常の内部リンクはMarkdownリンク記法を優先します。

```mdx
[戦闘ルール](/rules/battle/)
```

base path補正や将来の外部リンク判定など、実装側の処理が必要なリンクは、MDX本文に `withBase()` を直接書かず、内部リンクComponentへ寄せます。

```mdx
<InternalLink href="/rules/battle/">戦闘ルール</InternalLink>
```

Markdown / MDX本文からAstro Componentを呼ぶ場合も、Component側で `withBase()` を使ってリンクや画像パスを組み立てます。

## SEO / OGP

共通SEO/OGP Componentは実装済みです。

共通OGP画像は `public/neon-underrealm-ogp.png` を使用し、GitHub Pagesのサブパス配下でも絶対URLとして解決できるようにします。

個別ページごとのOGP情報は上書き可能ですが、個別OGP画像生成は初期スコープ外です。個別OGP画像がないページは共通OGP画像を使用します。

ブラウザタブや `<title>` に表示される文言は、ページ固有 `title` がある場合は `ページ固有title | defaultSeo.title` とします。`defaultSeo.title` と `defaultSeo.siteName` はサイト共通のゲームタイトル定数 `gameTitle` を参照します。トップページ `/` は `defaultSeo.title` をそのまま使うため、`src/pages/index.astro` からLayoutへ `title` を渡しません。

## Excelデータの扱い

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

CI/CDではExcel変換を必須工程にしません。ビルドでは、Git管理済みの `data/generated/` 配下のJSONを参照する方針です。

## favicon

公開サイトのfaviconは、ユーザー提供の `public/favicon.ico` を使用します。

実装側ではfaviconの生成、変換、再デザインを行いません。

Layoutでは `withBase("/favicon.ico")` を使って参照し、GitHub Pagesのサブパス配下でも解決できるようにします。

## まだ実装していないもの

- Pagefind検索インデックス生成
- 個別OGP画像生成
- 本番公開環境でのリンク確認
