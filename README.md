# ネオン・アンダーレルムTRPG ルールサイト

ネオン・アンダーレルムTRPG の公式ルールサイトを構築するための静的サイトプロジェクトです。

初期実装では、PL向けの基本ルール、世界観、キャラクターメイキング、データ、アイテム、戦闘ルール、成長ルール、更新履歴を、静的サイトとして公開・更新できる状態にすることを優先します。

## 技術スタック

- Astro
- TypeScript
- Biome
- Markdown / MDX
- Playwright
- Node.js test runner
- Excel由来の生成JSON

MDX、GitHub Pages向けbase path、共通SEO/OGP、基本レイアウト、ナビゲーション、Visual Review基盤、GitHub Actions基本デプロイは導入済みです。

データ変換、データ表示Component、Pagefind検索、検索index生成込みのデプロイは後続タスクで追加します。

## セットアップ

```sh
npm install
```

## 主要コマンド

```sh
npm run dev
npm run check
npm run build
npm test
npm run format
npm run format:md
npm run check:md
npm run preview
npm run visual:capture
npm run visual:install
```

- `npm run dev`: ローカル開発サーバーを起動する
- `npm run check`: Astro / TypeScript / Biome の確認を実行する
- `npm run build`: 静的サイトをビルドする
- `npm test`: Node.js test runnerでユニットテストを実行し、結果を `test-results/` に出力する
- `npm run format`: BiomeとMarkdown formatterを実行する
- `npm run format:md`: Git管理対象のMarkdown `.md` を整形する
- `npm run check:md`: Markdown `.md` のformat / 最小style ruleを確認する
- `npm run preview`: ビルド済みサイトをローカルで確認する
- `npm run visual:capture`: PlaywrightでVisual Review用スクリーンショットを取得する
- `npm run visual:install`: Visual Review用のChromiumをインストールする

`npm test` はロジック検証用です。Visual Review用スクリーンショット取得は `npm run visual:capture` を使います。

## 任意の開発支援設定

`.mcp.json` では、必要に応じて Context7 MCP サーバーを利用できるようにしています。

Context7 を使う場合は、direnv や `.env` ではなく、シェルの環境変数として `CONTEXT7_API_KEY` を設定してから開発ツールを起動します。

```sh
export CONTEXT7_API_KEY="your-api-key"
```

Context7 を使わない場合、この環境変数の設定は不要です。

## Google Drive由来のローカル入力

ユーザー編集用の正本はGoogle Drive上で管理し、ローカル作業時に必要なファイルだけリポジトリルート直下の `.raw/` 配下へ同期します。

開発時は、リポジトリルート直下に `raw-google-drive.url` を作成し、Google Drive同期対象フォルダのURLを1件だけ書いてください。

```text
https://drive.google.com/drive/folders/...
```

Codexから同期するには、ChatGPT / Codexの作業環境でGoogle Drive Connectorを利用でき、接続済みGoogleアカウントが同期対象フォルダを閲覧できる必要があります。

フォルダを「リンクを知っている全員が閲覧者」にする必要はありません。共有設定を変更する場合は、未公開コンテンツを含む可能性を考慮し、ユーザーが明示的に判断します。

`raw-google-drive.url` と `.raw/` はローカル環境ごとの作業入力です。Git管理しません。

同期後の `.raw/` 配下は以下の構造にします。

```text
.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

Google DocsはMarkdown `.md` として `.raw/contents/` へ、Google SheetsはExcel `.xlsx` として `.raw/release-notes.xlsx` または `.raw/data/` へ取得します。

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
- `.raw/`: Google Drive由来ファイルを同期するローカル作業入力。Git管理しない
- `raw-google-drive.url`: Google Drive同期対象フォルダURLを置くローカル設定ファイル。Git管理しない
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
- `post-merge-plan-update`: merge後にplan / TODO / issueのtrackingを更新し、完了済み項目をdone側へ退避する

remote snapshot draftやPRレビュー草案は、ローカルrepoで検証されるまで正式な作業記録ではありません。

### コンテキスト運用

issue対応中は、原則としてCodexの作業コンテキストを圧縮せず、Codexセッションも終了しません。

issue対応中にコンテキストが途切れると、承認済み範囲、未commit差分、未確認項目、レビュー停止点を取り違えるリスクがあります。自動圧縮などでコンテキストが変わった場合は、最新のissue、branch、作業ツリー、直近のユーザー指示を確認してから続行します。

issueのPRがmergeされ、`post-merge-plan-update` workflowまで完了した後であれば、必要な情報は正式ドキュメントとGit履歴に残っているため、Codexの作業コンテキストを完全にクリアして問題ありません。

コンテキストを完全にクリアする手順は以下です。

1. 対象issueのPR mergeと `post-merge-plan-update` 完了を確認する。
2. 現在のCodexセッションを終了する。
3. 次のissueを開始するときは、新しいCodexセッションで開始する。
4. 新しいセッションでは、旧issueの会話要約を引き継がず、`AGENTS.md`、該当SKILL、`docs/plan.md`、`docs/TODO.md`、対象issueを改めて参照する。

クリアしてよいのは、旧issue由来の会話文脈、判断、作業仮定だけです。`AGENTS.md`、`.agents/skills/*`、`.agents/rules/*`、MCPサーバー接続情報、repository設定はクリア対象ではありません。

## データ管理方針

Excel本体やページ作成用Markdown入力は `.raw/` 配下でローカル管理し、Git管理しません。

Google Driveからローカル入力を同期する場合、同期対象フォルダのURLは `raw-google-drive.url` に置きます。このファイルもGit管理しません。

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
