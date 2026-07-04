# 公開手順

このドキュメントは、ネオン・アンダーレルムTRPG ルールサイトの公開方針と、将来のGitHub Pages公開手順を整理するための初期版です。

現時点では、GitHub Actionsによる自動デプロイ設定はまだ実装していません。

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

## 将来のGitHub Pages公開手順

GitHub Pages公開は後続タスクで設定します。

想定する流れは以下です。

1. GitHub Actions workflowを追加する。
2. `npm ci` を実行する。
3. `npm run check` を実行する。
4. `npm run build` を実行する。
5. 必要になった段階で検索インデックス生成を追加する。
6. `dist/` をGitHub Pagesへデプロイする。

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

OGP画像URLやSEO Componentで使う絶対URLの最終調整は、後続のSEO/OGPタスクで扱います。

## Excelデータの扱い

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

CI/CDではExcel変換を必須工程にしません。ビルドでは、Git管理済みの `data/generated/` 配下のJSONを参照する方針です。

## まだ実装していないもの

- GitHub Actions workflow
- Pagefind検索インデックス生成
- OGP画像の公開URL調整
- 本番公開環境でのリンク確認
