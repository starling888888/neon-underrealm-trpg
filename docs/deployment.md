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

`astro.config.mjs` の `site` / `base` 設定、内部リンク、画像パス、OGP画像URLなどの具体的な対応は後続タスクで扱います。

## Excelデータの扱い

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

CI/CDではExcel変換を必須工程にしません。ビルドでは、Git管理済みの `data/generated/` 配下のJSONを参照する方針です。

## まだ実装していないもの

- GitHub Actions workflow
- GitHub Pagesの `site` / `base` 設定
- Pagefind検索インデックス生成
- OGP画像の公開URL調整
- 本番公開環境でのリンク確認
