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
raw-google-drive.url     Git管理しないGoogle Drive同期対象フォルダURL
.raw/                    Git管理しないGoogle Drive由来ローカル入力
.tmp/                    Git管理しない一時作業ファイル
data/generated/          Git管理する生成JSON
docs/                    プロジェクト文書とtask tracking
docs/design/             design正本
public/                  静的アセット
scripts/                 Node / TypeScriptの保守・変換プログラム
src/components/          Astro UI Component
src/layouts/             Astro Layout
src/lib/                 共通TypeScript helperとdata access
src/pages/               Astro / MDX route
src/scripts/             ブラウザ側TypeScript controller
src/styles/              global CSS、tokens、prose styles
```

## Git管理しないファイル

Git管理しないファイルは `.gitignore` を正本とする。

初期実装では、少なくとも以下をGit管理しない。

```text
node_modules/
dist/
.astro/
.raw/
raw-google-drive.url
.tmp/
test-results/
playwright-report/
*.xlsx
*.xlsm
~$*.xlsx
```

`data/generated/` 配下のJSONは、Excelから変換された静的サイト用データとしてGit管理する。

`.raw/`、`raw-google-drive.url`、`.tmp/`、Visual Review出力、Excel本体をGit管理しない理由や運用詳細は `AGENTS.md` を参照する。

Google Drive由来のローカル入力は以下の構造に固定する。

```text
.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

`.raw/sheets/`、`raw/`、`contents/`、`data/` をGoogle Drive同期先として追加しない。

## Docs

長大なドキュメントは、作業時の参照単位で分割する。

索引ファイルには以下を書く。

- 各子ファイルが何を扱うか
- どの作業時に読むか
- 内容が重なる場合にどのファイルを正本とするか

agentが全詳細ファイルを常時読む構造にしない。

## Scripts

scriptが小さな単一ファイルを超えて大きくなる場合は、プログラム単位のディレクトリに分ける。

推奨構造は以下とする。

```text
scripts/<program>/main.ts
scripts/<program>/lib.ts
scripts/<program>/lib/
scripts/_common/
```

`main.ts` はCLI entrypointとし、引数処理、process I/O、終了処理、高レベルの実行順を扱う。

`lib.ts` および `lib/` は、テストしやすい実処理を持つ。

`scripts/_common/` は、複数のscriptプログラムから実際に参照される処理だけを置く。

将来使いそうという理由だけで `_common/` に移さない。

## Components

`src/components/` は目的ごとに分ける。

想定する分類は以下とする。

```text
src/components/layout/
src/components/seo/
src/components/data/
src/components/_common/
src/components/search/
```

新しいComponent分類は、安定した責務がある場合だけ作る。

`src/components/_common/` は、特定の機能領域へ属さず複数領域から参照される小さな共通Componentだけを置く。

ページ固有本文を汎用Componentに混ぜない。

## Libraries

`src/lib/` は責務ごとに分ける。

想定する分類は以下とする。

```text
src/lib/data/
src/lib/schemas/
src/lib/schemas/conversion/
src/lib/site/
src/lib/types/
src/lib/utils/
```

データ駆動ページは、生成JSONへのアクセスを `src/lib/data/` 経由にする。

Excel変換・生成JSON検証・ID生成に使うZod Schemaは `src/lib/schemas/conversion/` に置く。ブラウザでも安全に参照する型と定数は `src/lib/types/` に置き、通常表示処理は変換用Schemaを実行時importしない。

サイトmetadata、menu定義、URL helperは、責務に応じて `src/lib/site/` または `src/lib/utils/` に置く。

## Browser Scripts

ブラウザ側controllerは `src/scripts/` に置く。

menu disclosure、mobile menu、page TOCなど、挙動単位で分ける。

小さな静的サイト向けinteractionのために、framework規模のclient state managementを追加しない。

## Package Scripts

実行可能なnpm scriptは `package.json` を正本とする。

script名は、作業者が目的を判断しやすい名前にする。

初期実装で想定する基本操作は以下。

- `npm run dev`: ローカル開発サーバーを起動する
- `npm run build`: 静的サイトをビルドする
- `npm run preview`: ビルド済みサイトを確認する
- `npm run check`: Astro型検査とlint / format確認を実行する
- `npm run test`: Node.jsテストを実行する
- `npm run visual:capture`: 指定VRT targetの一時snapshotを`test-results/visual/`へ取得する。canonical baselineは更新しない
- `npm run visual:build`: `-local` fixtureとPagefind indexを含むVRT用buildを作成する
- `npm run visual:test`: Playwright標準VRT baselineを比較する
- `npm run visual:update`: ユーザー明示指示時にだけVRT baselineを作成・更新する

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
