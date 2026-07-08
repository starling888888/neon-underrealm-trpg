# phase-2-prep-google-drive-mcp-raw-sync-policy

## 目的

Phase 2のページ作成作業に入る前に、Google Drive上のユーザー編集正本を、リポジトリルート直下の `<repo-root>/.raw/` 配下へ同期する運用ルールを整備する。

このissueでは、Google Drive MCPを第一候補として、Google Docs / Google Sheetsをローカル作業入力へ変換・取得する手順と制約を定義する。

既存方針として、ローカル作業時に `<repo-root>/.raw/` 配下を参照し、`<repo-root>/.raw/` をGit管理しないことは維持する。

このissueは、`docs/plan.md` の通常タスク番号体系には入れない。

そのため、`NN-M` 形式の番号プレフィクスは付けない。

このissueは、Phase 2本体に入る前の準備作業として扱い、issue名には `phase-2-prep` プレフィクスを用いる。

## 背景

現行のサイト制作方針では、ユーザー作成由来のデータやページ内容指示は、ローカル作業時に `<repo-root>/.raw/` 配下へ置き、Codex / 生成AIエージェントがそれを参照して `src/pages/**/*.mdx` / `.astro` や `data/generated/**/*.json` へ反映する。

一方で、`<repo-root>/.raw/` はGit管理しないローカル作業入力であるため、ユーザーが直接編集する正本としては弱い。

具体的には、以下の問題がある。

* バックアップが弱い
* 複数端末から編集しづらい
* ユーザーが普段編集する場所として扱いづらい
* ローカル環境差分によって作業入力が古くなる可能性がある
* Codex / 生成AIエージェントが参照する入力と、ユーザーが編集する正本の所在が曖昧になりやすい

そのため、ユーザー編集用の正本はGoogle Drive上で管理し、ローカル作業時に必要なファイルだけ `<repo-root>/.raw/` 配下へ同期する運用に整理する。

関連する要件、運用、調査結果は以下を参照する。

* `AGENTS.md`
* `.agents/rules/data-management.md`
* `.agents/rules/mcp.md`
* `.agents/rules/file-structure.md`
* `.agents/skills/README.md`
* `.agents/skills/issue-first-development/SKILL.md`
* `docs/content-writing-guide.md`
* `docs/development-structure.md`
* `docs/requirements.md`
* `docs/requirements/data-display.md`
* `docs/requirements/release-notes.md`
* `docs/plan.md`

このタスクはUI、CSS、layout、page、Component実装を主目的としないため、新規design画像は不要である。

## 対象範囲

このタスクで変更してよい範囲は以下とする。

### issue定義

* `docs/issue/phase-2-prep-google-drive-mcp-raw-sync-policy.md`

### AGENTS / agent rules / skills

* `AGENTS.md`
* `.agents/skills/README.md`
* `.agents/skills/drive-to-raw-sync/SKILL.md`
* 必要に応じて `.agents/rules/data-management.md`
* 必要に応じて `.agents/rules/mcp.md`
* 必要に応じて `.agents/rules/file-structure.md`

### docs

* `README.md`
* 必要に応じて `docs/requirements/architecture.md`
* 必要に応じて `docs/content-writing-guide.md`
* 必要に応じて `docs/development-structure.md`

### Git管理除外

* `.gitignore`

### 基本方針

ユーザーが編集する正本はGoogle Drive上で管理する。

対象は以下。

* Google Docs
* Google Sheets
* 必要に応じて、Google Drive上に配置された通常ファイル

Codex / 生成AIエージェントがローカル作業時に参照する入力は、リポジトリルート直下の `<repo-root>/.raw/` 配下に置く。

`<repo-root>/.raw/` はGit管理しない。

Google Drive上の正本や `<repo-root>/.raw/` 配下のファイルは、公開サイトの直接SSoTではない。

公開サイト側のSSoTは以下とする。

* `src/pages/**/*.mdx`
* `src/pages/**/*.astro`
* `data/generated/**/*.json`
* `docs/**/*.md`
* サイト実装コード

Google Driveからローカルへ同期する際、Google Workspace形式のファイルは以下の形式へ変換する。

| Google Drive上の形式 | ローカル同期形式       |
| ---------------- | -------------- |
| Google Docs      | Markdown `.md` |
| Google Sheets    | Excel `.xlsx`  |

Google Drive同期対象フォルダのURLは、リポジトリルート直下のローカルファイルで管理する。

```txt
<repo-root>/raw-google-drive.url
```

`raw-google-drive.url` は、ユーザーのローカル開発環境ごとの設定ファイルとして扱う。

`raw-google-drive.url` はGit管理しない。

`raw-google-drive.url` は `.gitignore` に追加する。

`README.md` には、開発開始時に `raw-google-drive.url` をリポジトリルート直下へ追加し、Google Drive同期対象フォルダのURLを書いておくことを追記する。

### `.raw/` のpath解釈

このissueおよび関連SKILLで `.raw/` と書く場合、常にリポジトリルート直下の `<repo-root>/.raw/` を指す。

以下ではない。

* OSルート直下の `/.raw/`
* 現在の作業ディレクトリからの相対path `./.raw/`
* repo外の任意ディレクトリにある `.raw/`
* Git管理対象の `raw/`

Codex / 生成AIエージェントは、同期前に必ず以下でリポジトリルートを解決する。

```sh
git rev-parse --show-toplevel
```

同期先は必ず以下の形に正規化する。

```txt
<repo-root>/.raw/
```

`<repo-root>/.raw/` 以外へGoogle Drive由来ファイルを書き出してはならない。

### `.raw/` 配下の構造

`<repo-root>/.raw/` 配下の構造は以下に固定する。

```txt
<repo-root>/.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

この構造における相対pathは、常に `<repo-root>/.raw/` を基準とする。

```txt
./release-notes.xlsx
./data/*.xlsx
./contents/*.md
```

上記の `./` は、現在の作業ディレクトリではなく、`<repo-root>/.raw/` からの相対pathを意味する。

### Google Drive側の構造

Google Drive側も、同期対象フォルダの直下をルートとして、`<repo-root>/.raw/` 配下と同じ構造にする。

```txt
<drive-sync-root>/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

`<drive-sync-root>` は、ユーザーが指定したGoogle Drive上の同期対象フォルダを指す。

Google Drive側の相対pathと、ローカル側の相対pathは対応させる。

| Google Drive側                          | ローカル側                                 |
| -------------------------------------- | ------------------------------------- |
| `<drive-sync-root>/release-notes.xlsx` | `<repo-root>/.raw/release-notes.xlsx` |
| `<drive-sync-root>/data/*.xlsx`        | `<repo-root>/.raw/data/*.xlsx`        |
| `<drive-sync-root>/contents/*.md`      | `<repo-root>/.raw/contents/*.md`      |

Google Drive側のファイルがGoogle Workspace形式の場合も、同期時の出力先は上記のローカル構造に従う。

| Google Drive側の形式 | ローカル同期形式       | 同期先                                                                      |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| Google Sheets    | Excel `.xlsx`  | `<repo-root>/.raw/release-notes.xlsx` または `<repo-root>/.raw/data/*.xlsx` |
| Google Docs      | Markdown `.md` | `<repo-root>/.raw/contents/*.md`                                         |

Google Drive側のファイル名またはタイトルは、原則としてローカル出力名と対応させる。

例。

```txt
<drive-sync-root>/contents/home.md
  -> <repo-root>/.raw/contents/home.md

<drive-sync-root>/data/skills.xlsx
  -> <repo-root>/.raw/data/skills.xlsx
```

Google Drive側の構造とローカル側の構造が一致しない場合、Codex / 生成AIエージェントは勝手に推測して配置してはならない。

構造不一致がある場合は同期を停止し、どのファイルの配置が判断できなかったかを報告する。

### Google Drive MCP方針

Google Drive上の正本から `<repo-root>/.raw/` への同期は、原則としてGoogle Drive MCPを用いる。

想定するDrive MCP toolは以下。

* `search_files`
* `get_file_metadata`
* `download_file_content`

Google Drive MCPから取得したcontentは、Codex / 生成AIエージェントがローカルfilesystemへ書き出す。

責務は以下のように分ける。

| 領域                 | 責務                                          |
| ------------------ | ------------------------------------------- |
| Google Drive MCP   | Drive上のファイル検索、メタデータ取得、content download      |
| Codex / 生成AIエージェント | 取得contentのdecode、`<repo-root>/.raw/` 配下への保存 |
| repo               | `.raw/` をGit管理しない設定、同期運用ルール、SKILL           |

Google DocsはMarkdownとして取得する。

```txt
text/markdown
```

Google SheetsはExcel `.xlsx` として取得する。

```txt
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Drive MCPからbase64 contentが返る場合、Codex / 生成AIエージェントはそれをdecodeして、ローカルfilesystem上の `<repo-root>/.raw/` 配下へ保存する。

### 同期先

同期先は以下の3系統に限定する。

#### リリースノート

```txt
<repo-root>/.raw/release-notes.xlsx
```

Google Drive側では以下に対応する。

```txt
<drive-sync-root>/release-notes.xlsx
```

Google Sheetsとして管理されている場合も、ローカルでは `release-notes.xlsx` として取得する。

#### データファイル

```txt
<repo-root>/.raw/data/*.xlsx
```

Google Drive側では以下に対応する。

```txt
<drive-sync-root>/data/*.xlsx
```

Google Sheetsとして管理されている場合も、ローカルでは `.xlsx` として取得する。

#### ページ本文・画面指示

```txt
<repo-root>/.raw/contents/*.md
```

Google Drive側では以下に対応する。

```txt
<drive-sync-root>/contents/*.md
```

Google Docsとして管理されている場合も、ローカルでは `.md` として取得する。

`contents/*.md` には、ページ本文、画面構成指示、コメント形式のデザイン指示を含めてよい。

### 同期対象の決定

同期対象は、ユーザーが指定したGoogle Driveフォルダ以下のファイルとする。

Codex / 生成AIエージェントは、対象フォルダが一意に特定できない場合、同期を開始してはならない。

同期対象の解決は以下のいずれかで行う。

* リポジトリルート直下の `raw-google-drive.url` にGoogle DriveフォルダURLが記載されている
* ユーザーがGoogle DriveフォルダURLを指定する
* ユーザーがGoogle DriveフォルダIDを指定する
* `AGENTS.md` またはSKILLに対象フォルダが明記されている
* ユーザーが同期対象のファイルURLを個別に指定する

`raw-google-drive.url` を使う場合、Codex / 生成AIエージェントは同期前に以下を確認する。

* `raw-google-drive.url` が `<repo-root>/raw-google-drive.url` に存在する
* `raw-google-drive.url` がGit管理対象外である
* `raw-google-drive.url` の内容からGoogle DriveフォルダURLを一意に取得できる

`raw-google-drive.url` が存在しない、空である、複数URLを含む、またはフォルダURLとして解釈できない場合は、同期を開始せずユーザーに確認する。

同期対象は、原則として以下の相対pathに一致するファイルのみとする。

```txt
./release-notes.xlsx
./data/*.xlsx
./contents/*.md
```

Google Drive側で上記以外のpathにあるファイルは、勝手に同期対象へ含めない。

対象フォルダ以下に同名ファイルが存在し、ローカル出力先が衝突する場合は、黙って上書きしてはならない。

### 出力先path決定ルール

Codex / 生成AIエージェントは、Google Drive側の相対pathを維持して `<repo-root>/.raw/` 配下へ同期する。

例。

```txt
<drive-sync-root>/release-notes.xlsx
  -> <repo-root>/.raw/release-notes.xlsx

<drive-sync-root>/data/skills.xlsx
  -> <repo-root>/.raw/data/skills.xlsx

<drive-sync-root>/data/items.xlsx
  -> <repo-root>/.raw/data/items.xlsx

<drive-sync-root>/contents/home.md
  -> <repo-root>/.raw/contents/home.md

<drive-sync-root>/contents/world.md
  -> <repo-root>/.raw/contents/world.md
```

Google Drive側がGoogle Docs / Google Sheetsの場合も、ローカル出力先は上記の構造に従う。

Drive側の構造とローカル側の構造が一致しない場合、Codex / 生成AIエージェントは勝手に推測して配置してはならない。

構造不一致がある場合は同期を停止し、どのファイルの配置が判断できなかったかを報告する。

### 同期手順

Codex / 生成AIエージェントは、Google Driveから `<repo-root>/.raw/` へ同期する指示を受けた場合、以下の順で作業する。

#### 1. リポジトリルート確認

```sh
REPO_ROOT="$(git rev-parse --show-toplevel)"
```

`REPO_ROOT` が取得できない場合は停止する。

#### 2. `.raw` のGit管理除外確認

以下を確認する。

```sh
git check-ignore "$REPO_ROOT/.raw"
```

または同等の方法で、`<repo-root>/.raw/` がGit管理対象外であることを確認する。

`.raw/` がGit管理対象になっている、または判断できない場合は停止する。

同時に、リポジトリルート直下の `raw-google-drive.url` が `.gitignore` によってGit管理対象外であることも確認する。

`raw-google-drive.url` がGit管理対象になっている、または判断できない場合は停止する。

#### 3. Drive MCP利用可否確認

以下を確認する。

* Google Drive MCPが利用可能である
* Google Drive MCPが認証済みである
* `search_files` が使える
* `get_file_metadata` が使える
* `download_file_content` が使える
* Google DocsをMarkdown exportできる
* Google Sheetsを `.xlsx` exportできる

利用できない場合は、代替同期手段を勝手に実装せず停止する。

#### 4. 対象フォルダ確認

`raw-google-drive.url` またはユーザー指定のGoogle Driveフォルダを確認する。

対象フォルダが一意に特定できない場合は停止する。

#### 5. 同期対象ファイル列挙

対象フォルダ以下から、以下の構造に一致するGoogle Docs / Google Sheets / 通常ファイルを列挙する。

```txt
./release-notes.xlsx
./data/*.xlsx
./contents/*.md
```

上記の構造に一致しないファイルを勝手に同期対象へ含めない。

#### 6. 出力先path決定

各Driveファイルに対して、Drive側の相対pathを維持して出力先pathを決定する。

出力先は必ず `<repo-root>/.raw/` 配下にする。

例。

```txt
Google Drive: ./release-notes.xlsx
Local:        <repo-root>/.raw/release-notes.xlsx

Google Drive: ./data/skills.xlsx
Local:        <repo-root>/.raw/data/skills.xlsx

Google Drive: ./contents/home.md
Local:        <repo-root>/.raw/contents/home.md
```

出力先が `<repo-root>/.raw/` 外になる場合は停止する。

#### 7. 上書き確認

出力先に既存ファイルがある場合は、上書きしてよいか判断する。

判断できない場合は停止する。

空ファイル、変換失敗ファイル、不完全な取得結果で既存ファイルを上書きしてはならない。

#### 8. export / download

Google DocsはMarkdownとして取得する。

Google SheetsはExcel `.xlsx` として取得する。

通常ファイルがすでに `.md` または `.xlsx` の場合は、必要に応じてそのままdownloadする。

#### 9. ローカル保存

取得したcontentをdecodeし、決定済みの出力先へ保存する。

保存先は必ず `<repo-root>/.raw/` 配下に限定する。

#### 10. 同期結果報告

同期後、以下を報告する。

* 取得元Driveフォルダ
* 同期したファイル数
* Google DocsからMarkdown化したファイル一覧
* Google Sheetsから `.xlsx` 化したファイル一覧
* 通常ファイルとしてdownloadしたファイル一覧
* スキップしたファイル一覧
* 失敗したファイル一覧
* 上書きしたファイル一覧
* 同期先が `<repo-root>/.raw/` 配下であること
* `.raw/` をGit管理していないこと

### AGENTS更新方針

`AGENTS.md` に以下を追加する。

* Google Drive上のユーザー編集正本を第一ソースとして扱うこと
* ローカル作業時は `<repo-root>/.raw/` 配下へ同期して参照すること
* `.raw/` は常に `<repo-root>/.raw/` を指すこと
* `<repo-root>/.raw/` 配下の構造を `release-notes.xlsx` / `data/*.xlsx` / `contents/*.md` に固定すること
* Google Drive同期対象フォルダのURLは `<repo-root>/raw-google-drive.url` で管理すること
* `raw-google-drive.url` はGit管理しないこと
* Google Drive側も同期対象フォルダ直下で同じ構造を取ること
* Google Drive MCPを第一候補として同期すること
* Google DocsはMarkdownとして同期すること
* Google SheetsはExcel `.xlsx` として同期すること
* Drive上の正本を書き換えないこと
* `.raw/` をGit管理しないこと
* CI/CDでDrive同期しないこと

### SKILL追加方針

以下のSKILLを追加する。

```txt
.agents/skills/drive-to-raw-sync/SKILL.md
```

このSKILLは、ユーザーから以下のような指示が出た場合に参照する。

* Google Driveから `.raw` に同期して
* Drive正本を `.raw` に同期して
* `.raw/contents` を更新して
* ページ作成前にDrive入力を同期して
* Google Docsの内容をローカル入力に反映して
* Spreadsheetを `.raw` に取得して
* Drive MCPで作業入力を取得して

SKILLには以下を含める。

* `.raw/` は `<repo-root>/.raw/` を指すというpath解釈
* `.raw/` 配下の固定構造
* Google Drive側の同型構造
* `raw-google-drive.url` のpath解釈、読み取り、Git管理除外確認
* 同期前確認
* Google Drive MCP利用可否確認
* 対象Driveフォルダ確認
* export形式
* 同期先path
* 上書き時の注意
* 停止条件
* 使用禁止操作
* 作業報告フォーマット

## 初期スコープ外

このタスクでは以下を行わない。

### repository / plan

* `docs/plan.md` へのタスク追加をしない
* `docs/plan.md` の完了チェック状態を変更しない
* `.raw/**` をGit管理しない
* `raw-google-drive.url` をGit管理しない
* `data/generated/**` への直接出力をしない
* `src/pages/**` への直接出力をしない
* `.github/workflows/**` を変更しない
* `package.json` を変更しない
* `package-lock.json` を変更しない

### 同期実装

* Google Drive API用の独自同期スクリプトを実装しない
* `rclone` 等のCLI同期スクリプトを実装しない
* 常駐同期デーモンを実装しない
* ファイル監視による自動同期を実装しない
* 双方向同期を実装しない
* 削除同期を実装しない
* ファイル衝突の自動解決を実装しない
* Google Drive上の正本とローカル `.raw` の差分管理UIを実装しない

### Google Drive書き込み

このSKILLでは、Google Drive上の正本を書き換える操作を行わない。

使用禁止の操作例。

* Drive上のファイル作成
* Drive上のファイル更新
* Drive上のファイル削除
* Drive上のファイル移動
* Drive上のファイルコピー
* Drive上のフォルダ作成
* Drive上のフォルダ削除
* Drive上の権限変更
* ローカル変更のGoogle Driveへの書き戻し

Drive MCPに書き込み系toolが存在していても、このissueおよび関連SKILLでは使用しない。

### 禁止する同期先

以下には同期しない。

```txt
<repo-root>/.raw/sheets/
<repo-root>/raw/
<repo-root>/data/
<repo-root>/contents/
<repo-root>/src/pages/
<repo-root>/data/generated/
```

`<repo-root>/.raw/sheets/` は使用しない。

スプレッドシート由来の入力は、用途に応じて以下のいずれかへ置く。

```txt
<repo-root>/.raw/release-notes.xlsx
<repo-root>/.raw/data/*.xlsx
```

### Google Docs / Google Sheetsの完全同期

* Google Docsコメントの完全同期をしない
* Google Docs提案モードの完全同期をしない
* Google Docsの編集履歴のローカル再現をしない
* Google SheetsからJSONへの変換パイプライン更新をしない

### CI/CD / 認証

* CI/CD上でGoogle Drive同期をしない
* GitHub ActionsからGoogle Driveを参照しない
* 認証情報をrepoに保存しない
* tokenをrepoに保存しない
* credentialをrepoに保存しない

### 初期スコープ外機能

* CMS化しない
* DBを利用しない
* 管理画面を実装しない
* APIサーバーを実装しない
* Phase 2のページ本文実装そのものを行わない
* UI、CSS、layout、page、Componentの見た目変更を主目的にしない
* design画像を作成または更新しない
* Visual Review screenshotを取得しない
* 不要な依存関係を追加しない
* ユーザーの未コミット変更を破壊しない

## 完了条件

* [x] このissueが、目的、背景、対象範囲、初期スコープ外、完了条件、チェックポイント、想定変更ファイル、レビュー観点、備考を含む形で確定している
* [x] `docs/issue/phase-2-prep-google-drive-mcp-raw-sync-policy.md` が作成されている
* [x] `docs/plan.md` へタスク追加していない
* [x] `AGENTS.md` にGoogle Drive正本と `<repo-root>/.raw/` 同期方針が追加されている
* [x] `.agents/skills/drive-to-raw-sync/SKILL.md` が追加されている
* [x] 必要に応じて `.agents/skills/README.md` に `drive-to-raw-sync` の使用条件が追加されている
* [x] 必要に応じて `.agents/rules/data-management.md` にGoogle Drive正本と `.raw` 同期方針が追加されている
* [x] 必要に応じて `.agents/rules/mcp.md` にDrive MCP利用時の制約が追加されている
* [x] 必要に応じて `.agents/rules/file-structure.md` に `<repo-root>/.raw/` の固定構造が追加されている
* [x] `.gitignore` に `raw-google-drive.url` が追加されている
* [x] `README.md` に、開発時はリポジトリルート直下へ `raw-google-drive.url` を追加することが追記されている
* [x] Google Drive同期対象フォルダのURLを `<repo-root>/raw-google-drive.url` で管理する方針が明記されている
* [x] `raw-google-drive.url` をGit管理しない方針が明記されている
* [x] `.raw/` が常に `<repo-root>/.raw/` を指すことが明記されている
* [x] OSルート直下の `/.raw/` ではないことが明記されている
* [x] カレントディレクトリ基準の `./.raw/` ではないことが明記されている
* [x] 同期前に `git rev-parse --show-toplevel` でrepo rootを確認することが明記されている
* [x] `<repo-root>/.raw/` 配下の構造が `release-notes.xlsx` / `data/*.xlsx` / `contents/*.md` に固定されている
* [x] Google Drive側も同期対象フォルダ直下で同じ構造を取ることが明記されている
* [x] `<repo-root>/.raw/sheets/` を使わないことが明記されている
* [x] Drive側とローカル側の相対pathを対応させることが明記されている
* [x] Google Drive MCPを第一候補として使う方針が明記されている
* [x] Google DocsはMarkdown `.md` として取得する方針が明記されている
* [x] Google SheetsはExcel `.xlsx` として取得する方針が明記されている
* [x] Drive MCPから取得したcontentをCodex / 生成AIエージェントがローカルfilesystemへ保存する責務分離が明記されている
* [x] `<repo-root>/.raw/` をGit管理しない既存方針が維持されている
* [x] Drive上の正本を書き換えないことが明記されている
* [x] Drive書き込み系toolを使用しないことが明記されている
* [x] Drive MCPが使えない場合は停止し、代替同期スクリプトを勝手に作らないことが明記されている
* [x] CI/CDにGoogle Drive同期を含めないことが明記されている
* [x] 認証情報をrepoに置かないことが明記されている
* [x] `<repo-root>/.raw/` は作業入力であり、公開サイトの直接SSoTではないことが明記されている
* [x] `src/pages/**/*.mdx` / `.astro` が最終的なページ本文・UI構造のSSoTであることと矛盾していない
* [x] `data/generated/**/*.json` が生成物であり、手編集しない方針と矛盾していない
* [x] 必要に応じて `docs/content-writing-guide.md` が更新されている
* [x] `raw-google-drive.url` に記載されたDrive同期対象フォルダから、`drive-to-raw-sync` の手順で `.raw/` へ同期できることを確認している
* [x] 動作確認で、Google Sheetsを `.raw/release-notes.xlsx` と `.raw/data/dummy.xlsx` として取得できることを確認している
* [x] 動作確認で、Google Docsを `.raw/contents/home.md` として取得できることを確認している
* [x] 動作確認で、取得した `.xlsx` がExcelファイルとして検査できることを確認している
* [x] `npm run build` が通る
* [x] 必要に応じて `npm run check` が通る

## チェックポイント

* [x] 既存の `.raw/` Git管理除外方針を壊していない
* [x] `raw-google-drive.url` をGit管理対象にしていない
* [x] `raw-google-drive.url` の場所が `<repo-root>/raw-google-drive.url` に固定されている
* [x] `<repo-root>/.raw/` 以外への書き出し余地がない
* [x] `.raw/contents/*.md` を作業入力にする既存方針と矛盾していない
* [x] Google Driveを公開サイトの直接SSoTとして扱っていない
* [x] Codex / 生成AIエージェントがページ作成前に迷わず同期できる粒度になっている
* [x] 同期手順が曖昧すぎない
* [x] 同期手順が実装詳細に踏み込みすぎていない
* [x] 独自Google Drive APIスクリプト実装へ膨らんでいない
* [x] `rclone` 等の特定CLIを必須前提にしていない
* [x] Drive MCPがない場合の停止条件が明確である
* [x] Drive書き込み操作を禁止している
* [x] Drive上の正本を変更・削除・移動しない
* [x] ローカル `.raw/` からDriveへ書き戻さない
* [x] 双方向同期を導入していない
* [x] 削除同期を導入していない
* [x] 同名ファイル衝突を黙って解決しない
* [x] Drive側の想定外pathを勝手に推測配置しない
* [x] `<repo-root>/.raw/sheets/` を作成しない
* [x] 変換失敗時に既存ファイルを破壊しない
* [x] 空ファイルで上書きしない
* [x] 取得失敗した古い `.raw` 入力を最新として扱わない
* [x] 認証情報、token、credentialをrepoに置かない
* [x] CI/CDでDrive MCPやGoogle Driveを参照しない
* [x] CMS、DB、管理画面、APIサーバーへ膨らんでいない
* [x] Phase 2前準備として妥当な粒度に収まっている
* [x] 既存ルートが壊れていない
* [x] GitHub Pagesのサブパス公開に影響しない
* [x] 不要な依存関係を追加していない
* [x] 初期スコープ外の機能を実装していない
* [x] 関連する `docs/TODO.md` 項目と矛盾していない
* [x] 関連する `docs/design/` と矛盾していない
* [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `docs/issue/phase-2-prep-google-drive-mcp-raw-sync-policy.md`
* `.gitignore`
* `README.md`
* `AGENTS.md`
* `.agents/skills/drive-to-raw-sync/SKILL.md`
* 必要に応じて `.agents/skills/README.md`
* 必要に応じて `.agents/rules/data-management.md`
* 必要に応じて `.agents/rules/mcp.md`
* 必要に応じて `.agents/rules/file-structure.md`
* 必要に応じて `docs/requirements/architecture.md`
* 必要に応じて `docs/content-writing-guide.md`
* 必要に応じて `docs/development-structure.md`

原則として変更しない。

* `docs/plan.md`
* `.raw/**`
* `raw-google-drive.url`
* `src/pages/**`
* `data/generated/**`
* `.github/workflows/**`
* `package.json`
* `package-lock.json`

## レビュー観点

### 実現可能性

* Google Drive MCPで対象Driveフォルダ以下のファイルを取得できるか
* Google DocsをMarkdownとしてexportできるか
* Google SheetsをExcel `.xlsx` としてexportできるか
* Codex / 生成AIエージェントがDrive MCP取得結果を `<repo-root>/.raw/` へ保存できるか
* Drive MCPが使えない場合の停止条件が妥当か
* Drive側の相対pathをローカル側の相対pathへ一意に対応できるか
* `raw-google-drive.url` から同期対象DriveフォルダURLを一意に取得できるか

### 有用性

* Google Driveをユーザー編集正本にすることで、バックアップと編集容易性が改善するか
* `raw-google-drive.url` により、ローカル開発時の同期対象フォルダ指定が明確になるか
* `<repo-root>/.raw/` をローカル作業入力に限定することで、既存のローカル作業方針を維持できるか
* `.raw` 配下の構造を固定することで、Codex / 生成AIエージェントの迷いが減るか
* ページ作成前の入力同期として十分に使えるか
* Codex / 生成AIエージェントが迷わず運用できるか

### オーバーエンジニアリング防止

* このissueで独自同期スクリプトまで作ろうとしていないか
* Drive API認証実装まで踏み込んでいないか
* 差分同期、削除同期、双方向同期、常駐同期へ膨らんでいないか
* CI/CD同期やCMS化へ膨らんでいないか
* SKILLと運用ルール整備に留まっているか

### 安全性

* Drive上の正本を書き換えない方針になっているか
* Drive書き込み系toolを使用禁止にしているか
* 認証情報をrepoに保存しない方針になっているか
* `raw-google-drive.url` がGit管理対象外であり、Drive URLを不用意に公開しない方針になっているか
* `<repo-root>/.raw/` 以外へ保存しない方針になっているか
* 変換失敗時に既存ローカル入力を破壊しない方針になっているか
* 想定外のDrive側構造を勝手に推測して配置しない方針になっているか

### template準拠

* issueのトップレベル見出しが `.github/ISSUE_TEMPLATE/issue-first-development.md` の構造に準拠しているか
* `NN-M` プレフィクスを使わない例外が、Phase 2前準備issueとして妥当か
* 独自の詳細項目がトップレベル見出しを増やすのではなく、対象範囲 / 初期スコープ外 / チェックポイント / 備考の配下に収まっているか

## 備考

このissueの目的は、同期ツールを作ることではない。

目的は、Google Drive MCPを使って、ユーザー編集正本を `<repo-root>/.raw/` 配下へ取得するための運用契約を作ることである。

初期段階では、以下を満たせばよい。

* AGENTSに運用方針がある
* SKILLに具体的な同期手順がある
* `.raw/` のpath解釈が `<repo-root>/.raw/` に固定されている
* `<repo-root>/.raw/` 配下の構造が固定されている
* Google Drive同期対象フォルダのURLを `raw-google-drive.url` で指定できる
* `raw-google-drive.url` はGit管理しない
* READMEに `raw-google-drive.url` の開発時追加手順がある
* Google Drive側も同じ構造であることが明記されている
* Drive MCPが使えない場合の停止条件がある
* Drive書き込み操作が禁止されている
* `docs/plan.md` には入れない

同期スクリプトが必要になった場合は、後続issueで扱う。

Google Drive上の正本は、ユーザーが編集するための正本である。

`<repo-root>/.raw/` は、Codex / 生成AIエージェントが作業するためのローカル入力コピーである。

公開サイトの最終成果物は、Git管理される `src/pages`、`data/generated`、`docs`、サイトコードである。

この分離を崩さないこと。

## レビュー指摘 1

### 指摘事項

* READMEの `raw-google-drive.url` 説明が、「リンクを知っている全員が閲覧者」のDriveフォルダURLを標準手順または必須条件のように読める。
* `.agents/rules/mcp.md` の一般MCP禁止ルールが、Drive同期用途と衝突して読める。Drive同期だけを承認済みGoogle Drive Connector / Google Drive MCP経由の例外として明記し、他MCPへ未公開本文を送ってよいわけではないことを明確にする必要がある。
* `.agents/skills/drive-to-raw-sync/SKILL.md` の `git check-ignore <repo-root>/.raw` と `git check-ignore <repo-root>/raw-google-drive.url` は、shell blockをそのまま実行すると `<repo-root>` がリダイレクト記号として解釈される可能性がある。

### 判定

* source: pr-review-draft
* classification: valid
* local validation: `.tmp/phase-2-prep-google-drive-mcp-raw-sync-policy-review.md` はPR #24のremote snapshot draftであり、local validation required と明記されている。ローカルの `README.md`、`.agents/rules/mcp.md`、`.agents/skills/drive-to-raw-sync/SKILL.md`、このissueの対象範囲を確認し、3件ともcurrent issue内で対応すべき指摘として妥当であることを確認した。
* TODO routing: なし。いずれもこのissueの範囲内で修正可能であり、`docs/TODO.md` や `docs/plan.md` へ送らない。
* failure-log routing: なし。通常のレビュー指摘であり、agent failureとして記録するほどの手順逸脱や未検証作業の虚偽記録ではない。

### 対応方針

* `README.md` のDrive接続条件を、「接続済みGoogleアカウントが同期対象フォルダを閲覧できること」を主条件に修正する。公開リンク化は必須ではなく、ユーザーが明示的に判断する選択肢として扱う。
* `.agents/rules/mcp.md` の一般MCP禁止ルールを、未公開本文やprivate rule textを無関係なMCPへ送らないルールとして維持しつつ、Google Drive Connector / Google Drive MCPによる承認済みDrive sync rootへの読み取り・download・exportだけを例外として明記する。
* `.agents/skills/drive-to-raw-sync/SKILL.md` の `git check-ignore` 例を、`REPO_ROOT="$(git rev-parse --show-toplevel)"` と `cd "$REPO_ROOT"` を使う実行可能なshell例へ修正する。

### 対応完了チェックリスト

* [x] READMEのDrive接続条件から、公開リンク化が標準手順または必須条件に見える表現を外している
* [x] `.agents/rules/mcp.md` に、Drive同期だけを承認済み例外とし、他MCPへの未公開本文転送を禁止する境界を明記している
* [x] `.agents/skills/drive-to-raw-sync/SKILL.md` の `git check-ignore` 例を実行可能なshell例へ修正している
* [x] `git diff --check` が通る
* [x] `npm run check` が通る
* [x] `npm run build` が通る
