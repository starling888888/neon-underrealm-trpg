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
npm run visual:capture
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
- `npm run visual:capture`: Visual Review / contents review向けに、指定VRT targetの一時snapshotを取得する。canonical baselineは更新しない
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

## Google Spreadsheetのローカル入力

Google Spreadsheetをローカル作業入力へ取得する場合は、Google Cloudのservice accountを用意し、同期対象Driveフォルダをそのservice accountのメールアドレスへ閲覧共有します。Google Drive APIを有効化してから、リポジトリルートにGit管理しない`.env`を作成します。

service accountの作成とJSON鍵の取得は、Google公式の[service account作成手順](https://cloud.google.com/iam/docs/service-accounts-create)および[service account key作成手順](https://cloud.google.com/iam/docs/keys-create-delete)に従います。Google Drive APIは[Google公式の有効化手順](https://developers.google.com/workspace/drive/api/guides/enable-sdk)で有効にします。

```dotenv
GOOGLE_DRIVE_ROOT_FOLDER_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

`.env.example`にはキー名だけを示しています。秘密情報をコミットしてはいけません。

`GOOGLE_DRIVE_ROOT_FOLDER_ID`には、対象フォルダをブラウザで開いたURLの`https://drive.google.com/drive/folders/<folder-id>`に含まれる`<folder-id>`だけを設定します。末尾にクエリ文字列がある場合も、その前までの文字列を使います。

次のcommandは、指定フォルダ配下を再帰的にたどり、Google SpreadsheetだけをXLSXとして同じフォルダ構造のまま`.raw/`配下へ保存します。

```sh
npm run sync:google-sheets
```

個別のフォルダ列挙・export・書込みエラーはログ出力し、残りのSpreadsheet処理を継続します。個別エラーが1件でもあれば、すべての処理後に終了コード`1`で終了します。Google Docsその他のファイル、Google Driveへの書込み、差分・削除同期は行いません。

`.raw/`と`.env`はローカル環境ごとの作業入力です。Git管理しません。`.raw/contents/`を使う場合は手動で配置し、公開ページ本文・可視構成のGit管理上の正本は`src/pages/`配下のMDX / Astroとします。

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
- `tests/e2e/`: Playwright browser behavior E2E
- `tests/vrt/`: Playwright visual regression tests
- `data/generated/`: Excelから変換した公開用JSONの配置先
- `.raw/`: Google Drive由来ファイルを同期するローカル作業入力。Git管理しない
- `.env`: Google Spreadsheet同期のフォルダIDとservice account認証情報を置くローカル設定ファイル。Git管理しない
- `.tmp/`: 一次レビュー用ファイルや一時メモの配置先。Git管理しない

## 主要ドキュメント

- [要件定義](docs/requirements.md)
- [初期スコープ外](docs/out-of-scope.md)
- [開発計画](docs/issue/milestone-01/plan.md)
- [テストと検証方針](docs/testing.md)
- [AI Ops方針](docs/ai-ops.md)
- [TODO](docs/TODO.md)
- [公開手順](docs/deployment.md)
- [本文作成ガイド](docs/content-writing-guide.md)
- [生成データ方針](data/generated/README.md)
- [Visual Review Tests](tests/vrt/README.md)

## 生成AIエージェント運用

生成AIエージェントの最上位ルールは `AGENTS.md` に置きます。

詳細な定型workflowは `.agents/skills/*/SKILL.md` に分離します。

主なskillは以下です。

- `issue-first-development`: 実装前にbranch / issue contractを作成または検証する
- `contents-markdown-authoring`: `.raw/contents/*.md` 用のMarkdownソース草案を作成または確認する
- `review-to-issue`: `.tmp/*.md` のレビュー指摘をローカルSSoTで検証し、current issue / `docs/TODO.md` / `docs/issue/milestone-01/plan.md` へ振り分ける
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
4. 新しいセッションでは、旧issueの会話要約を引き継がず、`AGENTS.md`、該当SKILL、`docs/issue/milestone-01/plan.md`、`docs/TODO.md`、対象issueを改めて参照する。

クリアしてよいのは、旧issue由来の会話文脈、判断、作業仮定だけです。`AGENTS.md`、`.agents/skills/*`、`.agents/rules/*`、MCPサーバー接続情報、repository設定はクリア対象ではありません。

## データ管理方針

Excel本体やページ作成用Markdown入力は `.raw/` 配下でローカル管理し、Git管理しません。

`.raw/contents/*.md` は、必要に応じて手動で配置するGit非管理の補助入力です。Google Docsから自動同期しません。frontmatter、Markdown本文、HTMLコメントは作業時の参考にできますが、公開ページ本文・可視構成のGit管理上の正本は`src/pages/`配下のMDX / Astroです。

Google Spreadsheetからローカル入力を同期する場合、同期対象フォルダIDとservice account認証情報は`.env`に置きます。このファイルもGit管理しません。

Git管理するのは、Excelから変換された `data/generated/` 配下のJSONです。生成JSONは原則として手編集せず、元のExcelを修正して変換し直します。

## 一時ファイルの扱い

一時レビュー用の出力、比較用メモ、作業中のスクラッチファイルなど、Git管理しない一時ファイルは `.tmp/` 配下に置きます。

`.tmp/` の内容は共有成果物として扱わず、必要な情報だけを正式なドキュメントや作業報告へ反映します。

`.tmp/*.md` は、人間レビュー、外部レビュー、PRレビュー草案などを `review-to-issue` workflowへ渡すための入力として扱います。

## TODO管理

`docs/TODO.md` は、現在のissueでは対応しないが将来対応すべきレビュー指摘・改善候補を追跡するためのファイルです。

current issueで対応すべき修正をTODOへ逃がしてはいけません。

TODO項目は、可能な限り `docs/issue/milestone-01/plan.md` の計画項目へ紐づけます。適切な計画がない場合は、`review-to-issue` workflowで `docs/issue/milestone-01/plan.md` の適切な箇所に未完了タスクを追加したうえでTODOへ紐づけます。

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

GMガイド、シナリオ本文、キャラクター作成ウィザード、ダイスローラー、CMS、認証、DB、サーバーサイド処理、外部解析providerの追加などは初期スコープ外です。Cloudflare Web Analyticsのmanual beaconは本番deployだけで出力する現行の最小解析として含めます。Webキャラクターシートのログイン、サーバー保存、共有、PDF出力も初期スコープ外です。

詳細は [初期スコープ外](docs/out-of-scope.md) を参照してください。
