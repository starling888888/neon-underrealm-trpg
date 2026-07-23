# ネオン・アンダーレルムTRPG ルールサイト

ネオン・アンダーレルムTRPG の公式ルールサイトを構築するための静的サイトプロジェクトです。

初期実装では、PL向けの基本ルール、世界観、キャラクターメイキング、Webキャラクターシート、データ、アイテム、戦闘ルール、成長ルール、更新履歴を、静的サイトとして公開・更新できる状態にすることを優先します。1st stepでは、初回告知を見た人がなるべく長くサイトを読み、「遊んでみたい」と思えることを目指します。

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
npm run build:public
npm test
npm run format
npm run format:md
npm run check:md
npm run preview
npm run visual:build
npm run visual:test
npm run visual:install
```

- `npm run dev`: ローカル開発サーバーを起動する
- `npm run check`: Astro / TypeScript / Biome の確認を実行する
- `npm run build`: 静的サイトをビルドする
- `npm run build:public`: GitHub Pages公開用にビルドし、`-local` 配下のローカル確認用routeを `dist/` から除外する
- `npm test`: Node.js unit testに加え、GitHub Pages公開用buildと公開HTMLのcontract testを実行する。buildにより `dist/` を再生成し、`dist/-local/` を除外する。unit test結果は `test-results/` に、contract test結果は標準出力に出力する
- `npm run format`: BiomeとMarkdown formatterを実行する
- `npm run format:md`: Git管理対象のMarkdown `.md` を整形する
- `npm run check:md`: Markdown `.md` のformat / 最小style ruleを確認する
- `npm run preview`: ビルド済みサイトをローカルで確認する
- `npm run visual:build`: `-local` fixtureとPagefind indexを含むVRT用buildを作成する
- `npm run visual:test`: Playwright標準VRT baselineを比較する
- `npm run visual:update`: ユーザー明示指示時にだけVRT baselineを作成・更新する
- `npm run visual:install`: Visual Review用のChromiumをインストールする

`npm test` はロジックと公開HTMLのcontract検証用です。VRTは `npm run visual:test` で比較し、baseline更新は明示指示時だけ `npm run visual:update` を使います。

## 別端末からCodexセッションへ接続する

tmuxとSSHサーバーを導入済みの環境では、Codexをtmux内で起動しておくことで、スマホなどの別端末から実行中のセッションへ接続し、必要な承認操作を行えます。

最初に、接続先PCでIPアドレスを確認します。

```sh
hostname -I
```

次に、作業対象のリポジトリでtmuxセッションを作成または再接続し、その中でCodexを起動します。

```sh
tmux new-session -A -s codex
codex
```

スマホなどの別端末から、表示されたIPアドレスを使ってSSHログインします。ログイン後、次のコマンドで既存のCodexセッションへ接続できます。

```sh
tmux attach -t codex
```

同じtmuxセッションには複数端末から接続できますが、同時に入力すると操作が競合します。操作する端末を1つに決めてください。

### Ubuntu上のVS Code統合ターミナルでtmux過去出力をスクロールする任意設定

この手順はUbuntu上のVS Code統合ターミナルを使う場合を対象にします。tmux内の過去出力をマウスホイールで遡りたい場合は、`~/.tmux.conf` に次の設定を追加します。

```tmux
set -g mouse on
```

この設定を有効にすると、tmuxが出力領域のマウス操作を受け取ります。VS Code側で文字を範囲選択するときは、Shiftを押しながらマウスで選択してください。選択した文字列のコピーは`Ctrl+Shift+C`で行います。`Ctrl+C`はコピーではなくCodexなど実行中のプログラムへ割り込みを送る場合があります。

マウスホイール操作でtmuxのcopy modeに入っている場合は、emacs方式ではEsc、vi方式ではqでcopy modeを抜けてCodexの入力へ戻ります。

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

Google DocsはMarkdownソースをプレーンテキストとして保持し、`text/plain` exportでMarkdown `.md` として `.raw/contents/` へ取得します。Google SheetsはExcel `.xlsx` として `.raw/release-notes.xlsx` または `.raw/data/` へ取得します。

contents markdown用Google Docには、frontmatter、Markdown本文、HTMLコメントによるagent向け指示を、Markdownソースとしてプレーンテキストで貼り付けます。通常貼り付けでGoogle Docsのリッチテキスト変換が発生する環境では、「プレーンテキストとして貼り付け」を使ってください。

Google Docsの見出し、箇条書き、表、リンクなどのリッチテキスト書式でレイアウト済みドキュメントを作らないでください。

contents markdown用Google Docは、agentが解釈する作業入力です。requirements、plan、issue、designの正本ではなく、公開ページ本文そのものでもありません。

### contents指示書でのCallout指定例

contents markdown上でCalloutを配置したい場合は、Markdown本文そのものに独自記法を混ぜず、HTMLコメントでagent向けの配置指示を書きます。

例:

```md
## 判定の補足

通常本文として判定手順を説明する。

<!-- agent:
ここに type="note" の Callout を配置する。
title は省略し、既定ラベル「補足」を使う。
本文:
この補足は判定に慣れていないPL向けの読み替えです。
-->

## コンボの注意

通常本文としてコンボ手順を説明する。

<!-- agent:
ここに type="warning" title="コンボ中の注意" の Callout を配置する。
本文:
この処理はコンボ中に一度だけ行えます。
-->

<!-- agent:
ここに type="version" の Callout を配置する。
version専用propsは使わず、V1.5 などの版表記は本文内に書く。
本文:
V1.5で処理順を明確化しました。
-->
```

実装時は、agentが該当ページのMDXへ `<Callout type="...">...</Callout>` を配置します。`.raw/contents/*.md` 内でAstro Componentを直接実行する仕組みや、`:::warning` などの独自directiveは初期実装では使いません。

## ディレクトリ概要

- `src/`: Astroサイトのソースコード
- `src/pages/-local/`: dev serverで確認するローカル確認ページの本文ソース
- `public/`: 静的アセット
- `docs/`: 要件、計画、運用ドキュメント
- `docs/design/`: design intentとVRT参照情報のnotes
- `docs/issue/`: タスクごとの作業定義
- `docs/TODO.md`: 現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補
- `.agents/skills/`: 生成AIエージェント用の定型workflow
- `tests/visual/`: Playwright VRTと、VRTでは確認できないUI操作のテスト
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
- [ゲーム画像生成用ベースプロンプト](docs/image-generation/base-prompt.md)
- [生成データ方針](data/generated/README.md)
- [Visual Review Tests](tests/visual/README.md)

## 生成AIエージェント運用

生成AIエージェントの最上位ルールは `AGENTS.md` に置きます。

詳細な定型workflowは `.agents/skills/*/SKILL.md` に分離します。

主なskillは以下です。

- `issue-first-development`: 実装前にbranch / issue contractを作成または検証する
- `contents-markdown-authoring`: `.raw/contents/*.md` 用のMarkdownソース草案を作成または確認する
- `review-to-issue`: `.tmp/*.md` のレビュー指摘をローカルSSoTで検証し、current issue / `docs/TODO.md` / `docs/plan.md` へ振り分ける
- `pr-review-draft`: GitHub PR snapshotから、ローカル検証前のPRレビュー草案を作る
- `design-image-generation`: `docs/design/<design-target>/` のdesign intent・VRT参照情報を作成または更新し、明示承認時だけbaselineを更新する
- `visual-implementation-review`: 変更targetのVRTをbaselineと比較し、issue内にVisual Review結果を記録する
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

`.raw/contents/*.md` は、Google Docs上でプレーンテキストとして保持したMarkdownソースを同期した作業入力です。frontmatterをページメタ情報、Markdown本文をページ内容、HTMLコメントをagent向け指示として扱います。

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

## Design References

`docs/design/<design-target>/` はnotes-onlyです。各design targetの意図、対象route、状態、viewport、参照SSoT、out-of-scope、比較観点、VRT testとsnapshot名を`notes.md`へ記録します。

視覚比較の正本は、Playwright標準の`toHaveScreenshot()` snapshotを`canonical-snapshots/visual/<target>/`で管理します。

design intentの作成・更新と、明示承認済みVRT baselineの更新は `design-image-generation` skill に従います。

- design notes: 実装前に要件、out-of-scope、既存global design、layout designに基づく意図と比較条件を記録する
- baseline update: レビュー済み実装との差分を確認し、明示承認後に該当targetのVRT baselineだけを更新する

`docs/design/`へ画像を作成・コピーしてはいけません。VRT baselineを明示承認なく更新してはいけません。

out-of-scopeの機能は、実装だけでなくdesign notesやVRT対象にも含めない方針です。

## Visual Review

Visual Reviewは、承認済みUI実装後に変更targetのVRTをbaselineと比較する確認フローです。

通常のローカル開発では全件VRTを実行しません。UI、CSS、layout、page、Componentを変更した場合だけ、PRレビュー直前に変更targetへ限定して比較します。

Playwrightの`test-results/` / `playwright-report/`に出力されるartifactは診断用であり、Git管理しません。

baseline更新が必要な場合は、`design-image-generation` skillで既存baselineとの差分と更新理由を記録し、明示承認後に該当targetだけを更新します。

Visual Reviewの失敗を隠す目的でbaselineを更新してはいけません。

## 初期スコープ外

GMガイド、シナリオ本文、キャラクター作成ウィザード、ダイスローラー、CMS、認証、DB、サーバーサイド処理、アクセス解析などは初期実装に含めません。Webキャラクターシートのログイン、サーバー保存、共有、PDF出力も初期スコープ外です。

詳細は [初期スコープ外](docs/out-of-scope.md) を参照してください。
