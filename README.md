# ネオン・アンダーレルムTRPG ルールサイト

ネオン・アンダーレルムTRPG の公式ルールサイトを構築するための静的サイトプロジェクトです。

初期実装では、PL向けの基本ルール、世界観、キャラクターメイキング、データ、アイテム、戦闘ルール、成長ルール、更新履歴を、静的サイトとして公開・更新できる状態にすることを優先します。

## 技術スタック

- Astro
- TypeScript
- Biome
- Markdown / MDX
- Excel由来の生成JSON

MDX、データ表示Component、検索、デプロイ設定などは後続タスクで追加します。

## セットアップ

```sh
npm install
```

## 主要コマンド

```sh
npm run dev
npm run check
npm run build
npm run preview
npm run visual:capture
npm run visual:install
```

- `npm run dev`: ローカル開発サーバーを起動する
- `npm run check`: Astro / TypeScript / Biome の確認を実行する
- `npm run build`: 静的サイトをビルドする
- `npm run preview`: ビルド済みサイトをローカルで確認する
- `npm run visual:capture`: PlaywrightでVisual Review用スクリーンショットを取得する
- `npm run visual:install`: Visual Review用のChromiumをインストールする

## ディレクトリ概要

- `src/`: Astroサイトのソースコード
- `public/`: 静的アセット
- `docs/`: 要件、計画、運用ドキュメント
- `docs/design/`: Visual Reviewで参照するデザイン正本
- `docs/issue/`: タスクごとの作業定義
- `data/generated/`: Excelから変換した公開用JSONの配置先
- `.raw/`: ローカル作業用のExcel配置先。Git管理しない
- `.tmp/`: 一次レビュー用ファイルや一時メモの配置先。Git管理しない

## 主要ドキュメント

- [要件定義](docs/requirements.md)
- [初期スコープ外](docs/out-of-scope.md)
- [開発計画](docs/plan.md)
- [公開手順](docs/deployment.md)
- [本文作成ガイド](docs/content-writing-guide.md)
- [生成データ方針](data/generated/README.md)

## データ管理方針

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

Git管理するのは、Excelから変換された `data/generated/` 配下のJSONです。生成JSONは原則として手編集せず、元のExcelを修正して変換し直します。

## 一時ファイルの扱い

一時レビュー用の出力、比較用メモ、作業中のスクラッチファイルなど、Git管理しない一時ファイルは `.tmp/` 配下に置きます。

`.tmp/` の内容は共有成果物として扱わず、必要な情報だけを正式なドキュメントや作業報告へ反映します。

## Visual Review

Visual Reviewは、承認済みUI実装後にデザイン正本と実装スクリーンショットを比較するための確認フローです。

デザイン正本は `docs/design/<design-target>/` に置きます。Visual Reviewで取得したスクリーンショットやレポートはPlaywrightの `test-results/` / `playwright-report/` に出力し、Git管理しません。

`.tmp/*.md` は人間または外部レビューを `docs/issue/*.md` に取り込むための入力専用であり、Visual Review成果物の保存先には使いません。

## 初期スコープ外

GMガイド、シナリオ本文、キャラクターシート、ダイスローラー、CMS、認証、DB、サーバーサイド処理、アクセス解析などは初期実装に含めません。

詳細は [初期スコープ外](docs/out-of-scope.md) を参照してください。
