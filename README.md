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
- `docs/design/`: Visual Reviewで参照するデザイン正本とdesign notes
- `docs/issue/`: タスクごとの作業定義
- `docs/TODO.md`: 現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補
- `.agents/skills/`: 生成AIエージェント用の定型workflow
- `tests/visual/`: Visual Review用のPlaywright capture
- `data/generated/`: Excelから変換した公開用JSONの配置先
- `.raw/`: ローカル作業用のExcel配置先。Git管理しない
- `.tmp/`: 一次レビュー用ファイルや一時メモの配置先。Git管理しない

## 主要ドキュメント

- [要件定義](docs/requirements.md)
- [初期スコープ外](docs/out-of-scope.md)
- [開発計画](docs/plan.md)
- [TODO](docs/TODO.md)
- [公開手順](docs/deployment.md)
- [本文作成ガイド](docs/content-writing-guide.md)
- [生成データ方針](data/generated/README.md)
- [Visual Review Tests](tests/visual/README.md)

## 生成AIエージェント運用

生成AIエージェントの最上位ルールは `AGENTS.md` に置きます。

詳細な定型workflowは `.agents/skills/*/SKILL.md` に分離します。

主なskillは以下です。

- `issue-first-development`: 実装前にbranch / issue contractを作成または検証する
- `review-to-issue`: `.tmp/*.md` のレビュー指摘をローカルSSoTで検証し、current issue / `docs/TODO.md` / `docs/plan.md` へ振り分ける
- `pr-review-draft`: GitHub PR snapshotから、ローカル検証前のPRレビュー草案を作る
- `design-image-generation`: `docs/design/<design-target>/` のdesign画像・notesを作成または正本化する
- `visual-implementation-review`: 実装スクリーンショットをdesign正本と比較し、issue内にVisual Review結果を記録する
- `post-merge-plan-update`: merge後に `docs/plan.md` の完了チェックを更新し、対応済みTODOがある場合は `docs/TODO.md` の完了済みへ移動する

remote snapshot draftやPRレビュー草案は、ローカルrepoで検証されるまで正式な作業記録ではありません。

## データ管理方針

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

Git管理するのは、Excelから変換された `data/generated/` 配下のJSONです。生成JSONは原則として手編集せず、元のExcelを修正して変換し直します。

## 一時ファイルの扱い

一時レビュー用の出力、比較用メモ、作業中のスクラッチファイルなど、Git管理しない一時ファイルは `.tmp/` 配下に置きます。

`.tmp/` の内容は共有成果物として扱わず、必要な情報だけを正式なドキュメントや作業報告へ反映します。

`.tmp/*.md` は、人間レビュー、外部レビュー、PRレビュー草案などを `review-to-issue` workflowへ渡すための入力として扱います。

## TODO管理

`docs/TODO.md` は、現在のissueでは対応しないが将来対応すべきレビュー指摘・改善候補を追跡するためのファイルです。

current issueで対応すべき修正をTODOへ逃がしてはいけません。

TODO項目は、可能な限り `docs/plan.md` の計画項目へ紐づけます。適切な計画がない場合は、`review-to-issue` workflowで `docs/plan.md` の適切な箇所に未完了タスクを追加したうえでTODOへ紐づけます。

merge済みPRでTODO項目まで対応した場合は、`post-merge-plan-update` workflowでそのTODOを完了済みに移動します。

## Design Images

デザイン正本は `docs/design/<design-target>/` に置きます。

各design targetには、画像だけでなく `notes.md` を併置し、対象route / viewport / 参照SSoT / out-of-scope / Visual Review比較観点を記録します。

デザイン画像の作成・更新は `design-image-generation` skill に従います。

- initial draft: 実装前に要件、out-of-scope、既存global design、layout designに基づいてdesign案を作る
- design fix: レビュー済み実装スクリーンショットを、明示承認後にdesign正本へ昇格する

未承認のinitial draftを最終的なdesign正本として扱ってはいけません。

out-of-scopeの機能は、実装だけでなくdesign画像にも描き込まない方針です。

## Visual Review

Visual Reviewは、承認済みUI実装後にデザイン正本と実装スクリーンショットを比較するための確認フローです。

デザイン正本は `docs/design/<design-target>/` に置きます。Visual Reviewで取得したスクリーンショットやレポートはPlaywrightの `test-results/` / `playwright-report/` に出力し、Git管理しません。

Playwrightで取得したスクリーンショットは actual artifact であり、design正本ではありません。

実装スクリーンショットを新しいdesign正本として採用する場合は、`design-image-generation` skill の design fix mode で、既存designとの差分と正本化理由を記録し、明示承認後に `docs/design/<design-target>/` へ反映します。

Visual Reviewの失敗を隠す目的で、actual screenshotを直接 `docs/design/` にコピーしてはいけません。

## 初期スコープ外

GMガイド、シナリオ本文、キャラクターシート、ダイスローラー、CMS、認証、DB、サーバーサイド処理、アクセス解析などは初期実装に含めません。

詳細は [初期スコープ外](docs/out-of-scope.md) を参照してください。
