# 開発構造方針

このドキュメントは、実装作業で参照するリポジトリ構造の方針を定義する。

要件そのものは `docs/requirements.md` および `docs/requirements/*` に置く。このファイルでは、実装ファイル、スクリプト、Component、補助ドキュメントの配置方針を扱う。

## 目的

- 静的サイトとして保守しやすい構造を維持する
- Markdown / MDX本文、生成データ、Component、scriptの責務を分離する
- 各ファイルの役割を明確にし、将来の人間作業者とagent作業者が参照しやすくする
- 複数の責務を抱えた長大ファイルを避ける
- ファイル移動に挙動変更を混ぜない

## トップレベル構造

```text
.github/                 GitHub ActionsとGitHubテンプレート
.agents/                 agent専用SKILLと常設ルール
.codex/                  reviewer agent定義
.raw/                    Git管理しないGoogle Spreadsheetローカル入力
.tmp/                    Git管理しない一時作業ファイル
backend/                 Cloudflare Worker、local service Compose、Terraform用workspace
frontend/                静的サイトの実装workspace
frontend/.env            Git管理しないGoogle Spreadsheet同期設定
frontend/.env.example    Google Spreadsheet同期設定のキー名だけを示すtemplate
frontend/canonical-snapshots/ Visual Review用のGit管理しないbaseline
frontend/data/generated/ Git管理する生成JSON
frontend/public/         静的アセット
frontend/scripts/        Node / TypeScriptの保守・変換プログラム
frontend/tests/          Node、Vitest、E2E、VRT、contract test
frontend/src/            Astro / Reactのサイト実装
packages/shared/         frontendと将来のbackendで共有する型・定数
docs/                    プロジェクト文書とtask tracking
docs/design/             design正本
```

## Git管理しないファイル

Git管理しないファイルは `.gitignore` を正本とする。

初期実装では、少なくとも以下をGit管理しない。

```text
node_modules/
frontend/dist/
frontend/.astro/
frontend/test-results/
frontend/playwright-report/
.raw/
.tmp/
frontend/canonical-snapshots/visual/
*.xlsx
*.xlsm
~$*.xlsx
```

`frontend/data/generated/` 配下のJSONは、Excelから変換された静的サイト用データとしてGit管理する。

`.raw/`、workspace-local `.env`、`.tmp/`、Visual Review出力、Excel本体をGit管理しない理由や運用詳細は `AGENTS.md` を参照する。

`npm --workspace=@neon-underrealm/frontend run sync:google-sheets`は、`frontend/.env`で指定したDriveフォルダ配下のGoogle Spreadsheetを、同じフォルダ構造のXLSXとして`.raw/`へ保存する。Google Docsは同期しない。`.raw/contents/`が必要な場合は手動で配置し、MDX / Astroをページ本文・可視構成のGit管理上の正本とする。

## Docs

長大なドキュメントは、作業時の参照単位で分割する。

索引ファイルには以下を書く。

- 各子ファイルが何を扱うか
- どの作業時に読むか
- 内容が重なる場合にどのファイルを正本とするか

agentが全詳細ファイルを常時読む構造にしない。

`docs/agent-failure-log/`はagent failureの記録を用途別に分ける。日常taskで参照・追記する正本は`active.md`とし、`done.md`、`no-action.md`、`archive.md`はfailure-log auditまたは明示的な履歴確認時だけ読む。

`docs/issue/` には進行中または未完了の実装契約だけを置く。完了済みissueは同名のGitHub closed Issueへ記録してローカルから削除する。`docs/issue/milestone-<NN>/plan.md` と `docs/issue/milestone-<NN>/plans/` は軽量なローカル履歴として残し、完了issueの名称とGitHub Issue番号だけを記録する。

## Scripts

scriptが小さな単一ファイルを超えて大きくなる場合は、プログラム単位のディレクトリに分ける。

推奨構造は以下とする。

```text
frontend/scripts/<program>/main.ts
frontend/scripts/<program>/lib.ts
frontend/scripts/<program>/lib/
frontend/scripts/_common/
```

`main.ts` はCLI entrypointとし、引数処理、process I/O、終了処理、高レベルの実行順を扱う。

`lib.ts` および `lib/` は、テストしやすい実処理を持つ。

`frontend/scripts/_common/` は、複数のscriptプログラムから実際に参照される処理だけを置く。

将来使いそうという理由だけで `_common/` に移さない。

## Components

`frontend/src/components/` は目的ごとに分ける。

想定する分類は以下とする。

```text
frontend/src/components/layout/
frontend/src/components/seo/
frontend/src/components/data/
frontend/src/components/_common/
frontend/src/components/search/
frontend/src/components/analytics/
frontend/src/components/character-making/
frontend/src/components/character-sheet/
```

新しいComponent分類は、安定した責務がある場合だけ作る。

`frontend/src/components/_common/` は、特定の機能領域へ属さず複数領域から参照される小さな共通Componentだけを置く。

ページ固有本文を汎用Componentに混ぜない。

## Libraries

`frontend/src/lib/` は責務ごとに分ける。

想定する分類は以下とする。

```text
frontend/src/lib/data/
frontend/src/lib/schemas/
frontend/src/lib/schemas/conversion/
frontend/src/lib/site/
frontend/src/lib/types/
frontend/src/lib/utils/
frontend/src/lib/search/
```

データ駆動ページは、生成JSONへのアクセスを `frontend/src/lib/data/` 経由にする。

Excel変換・生成JSON検証・ID生成に使うZod Schemaは `frontend/src/lib/schemas/conversion/` に置く。ブラウザでも安全に参照する型と定数は `frontend/src/lib/types/` に置き、通常表示処理は変換用Schemaを実行時importしない。

サイトmetadata、menu定義、URL helperは、責務に応じて `frontend/src/lib/site/` または `frontend/src/lib/utils/` に置く。

## Browser Scripts

ブラウザ側controllerは `frontend/src/scripts/` に置く。

menu disclosure、mobile menu、page TOCなど、挙動単位で分ける。

小さな静的サイト向けinteractionのために、framework規模のclient state managementを追加しない。

## Package Scripts

実行可能なnpm scriptは各workspaceの `package.json` を正本とする。rootの `package.json` には、全workspace共通のformat、lint、型検査だけを置く。

script名は、作業者が目的を判断しやすい名前にする。

初期実装で想定する基本操作は以下。

- `npm --workspace=@neon-underrealm/frontend run dev`: ローカル開発サーバーを起動する
- `npm --workspace=@neon-underrealm/frontend run build`: 静的サイトをビルドする
- `npm --workspace=@neon-underrealm/frontend run preview`: ビルド済みサイトを確認する
- `npm --workspace=@neon-underrealm/frontend run check`: Astro型検査とlint確認を実行する
- `npm --workspace=@neon-underrealm/frontend run test`: Node.jsテストを実行する
- `npm --workspace=@neon-underrealm/frontend run visual:capture`: 指定VRT targetの一時snapshotを`frontend/test-results/visual/`へ取得する。canonical baselineは更新しない
- `npm --workspace=@neon-underrealm/frontend run visual:build`: `-local` fixtureとPagefind indexを含むVRT用buildを作成する
- `npm --workspace=@neon-underrealm/frontend run visual:test`: Playwright標準VRT baselineを比較する
- `npm --workspace=@neon-underrealm/frontend run visual:update`: ユーザー明示指示時にだけVRT baselineを作成・更新する
- `npm run check`: format検査、Markdown検査、backend/frontend/shared packageのlintと型検査を実行する
- `npm --workspace=@neon-underrealm/backend run test`: backend workspaceのdummy境界を型検査する

workspace固有のbuild、test、runtime出力は各workspaceの`.gitignore`で無視する。rootの`.gitignore`は`.raw/`、`.tmp/`、`**/.env`、Excelなどworkspace共通のローカル入力を扱う。

Excel変換、検索index生成、データ検証などのscriptは、該当機能が実装されるtaskで追加する。

package scriptを追加または変更する場合は、対象issueの範囲内で理由を記録する。

## ファイル移動

ファイルを移動する場合は、以下を守る。

- 挙動を変えない
- import path修正を必要範囲に留める
- 無関係なformatting churnを避ける
- 可能な場合は `npm run check` と `npm run build` で確認する
- rename / moveとしてレビュー可能な差分にする

挙動変更が必要な場合は、別Groupまたは別taskへ分離する。
