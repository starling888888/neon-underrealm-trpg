# ex-06 Google Drive Spreadsheet XLSX同期

## 目的

指定Google Driveフォルダ配下を再帰的に走査し、Google Spreadsheetを同じフォルダ構造のままローカルの`.raw/`へXLSX形式で取得できる開発用スクリプトを追加する。既存のGoogle Drive MCP同期workflowは削除し、contentsは手動同期へ移行する。

## 背景

Google Drive MCP経由のSpreadsheet取得は、今後のデータ調整に必要な速度と操作性を満たさない。Google Docsを含む既存のMCP同期workflowも廃止し、初期スコープ外のGoogle APIを使うローカル専用のSpreadsheet同期だけを、Google公式Node.jsライブラリで提供する。contentsはGoogle Driveから自動同期せず、ローカル作業入力を手動で用意する。

- `docs/plan.md` の特別task命名規約に従う。
- `AGENTS.md`、`.agents/skills/README.md`、contents関連skill / rule、`.agents/rules/mcp.md`、`.agents/rules/data-management.md`、`.agents/rules/file-structure.md`、`docs/plan.md`、`docs/requirements/architecture.md`、`docs/content-writing-guide.md`、`docs/development-structure.md`、`README.md`は、現行で削除対象workflowまたは`.raw/contents/`の優先正本を参照している。実装時に、手動contents運用とSpreadsheet専用同期へ整合させる。
- `docs/TODO.md` に関連項目はない。

## 対象範囲

- Google公式のNode.jsライブラリを依存関係に追加する。
- 指定DriveフォルダIDを起点にフォルダを再帰的に列挙し、Google SpreadsheetだけをXLSXとしてexportするNode/TypeScriptスクリプトを追加する。
- Drive上のフォルダ階層を、リポジトリルートの`.raw/`配下へ保持して出力する。
- 認証情報と同期起点フォルダIDをローカルの`.env`から読み込む。Git管理する雛形には値を含めない。
- 個別の列挙、export、書込み失敗を捕捉して対象とエラー内容をログへ出し、残りのSpreadsheetの処理を継続する。
- 出力パスを`.raw/`内に固定する。Drive名は1階層ごとの安全なファイル名へ変換し、変換後に同一出力パスとなる対象または`.raw/`外へ解決される対象は、書き込まずエラーとしてログに残して処理を継続する。
- 同じ出力パスの既存XLSXは最新のexportで上書きする。1回の同期中に異なるDriveファイルが同じ出力パスへ解決された場合は、最初の対象だけを処理し、後続対象をエラーとしてログに残す。
- 開発者が実行するためのnpm scriptとREADME上の最小限の利用手順を追加する。
- `.agents/skills/drive-to-raw-sync/`と`.agents/skills/raw-to-drive-sync/`を削除する。
- 削除したskillへの参照、およびGoogle Docsの自動同期・Driveへの書戻し・`raw-google-drive.url`の運用説明をGit管理文書から削除またはSpreadsheet専用同期・手動contents運用へ更新する。
- `.raw/contents/`は手動で配置できるローカル作業入力に留め、ページ本文・可視構成のGit管理上の正本をMDX / Astroとする。`.raw/contents/`はMDX / Astro、要件、issue、designより優先しない。
- 同期起点を`.env`の`GOOGLE_DRIVE_ROOT_FOLDER_ID`へ一本化する。`.env`をignoreし、`.env.example`に`GOOGLE_DRIVE_ROOT_FOLDER_ID`、`GOOGLE_SERVICE_ACCOUNT_EMAIL`、`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`のキー名だけを記載する。
- Drive clientをstub化したNode testを追加し、pagination、再帰、Spreadsheet MIME type限定、相対出力パス、パス安全性、個別失敗後の継続、終了状態を確認する。
- 同期先、Google Drive入力、認証情報のGit非管理を維持する。

## 初期スコープ外

- Google Docs、PDF、画像、任意のバイナリファイルは同期しない。contentsの手動同期を自動化しない。
- Google Driveへの書込み、ファイル作成、移動、削除、共有は行わない。
- サイトのruntime、build、CI/CD、公開処理からGoogle APIを呼び出さない。
- Driveフォルダ構造やローカル出力構造のvalidation、想定外ファイル検出による停止、差分同期、削除同期、retry/backoff機構は実装しない。
- Spreadsheet以外を`.raw/`へ書き出さない。
- Google Drive MCPの一般的な利用可否や、Spreadsheet同期と無関係なMCP設定は変更しない。
- `.raw/contents/`をGit管理する公開本文や新しい正本へ移行しない。

## 完了条件

- [x] Google公式Node.jsライブラリだけでGoogle Drive API認証とSpreadsheet XLSX exportを行う。
- [x] `.env`の認証情報と起点フォルダIDを使い、秘密情報をGit管理しない。
- [x] 指定フォルダ配下の子フォルダを再帰的にたどり、Google SpreadsheetをXLSXとして同じ相対パスの`.raw/`配下へ保存する。
- [x] Google Docsを含むSpreadsheet以外は保存しない。
- [x] 個別失敗をログ出力しても、後続Spreadsheetの処理を継続する。
- [x] 同期中の個別失敗は対象別のエラー一覧をログに集約し、全対象の処理後に終了コード`1`で終了する。個別失敗がない同期は終了コード`0`で終了する。
- [x] `.env`不備、認証失敗、または起点フォルダの列挙失敗は、対象処理を開始せず終了コード`1`で終了する。
- [x] 出力先は常に`<repo-root>/.raw/`配下であり、危険な名前・同一同期中の出力パス衝突は書き込まずログ出力して後続処理を継続する。既存XLSXの同一パス上書きは許可する。
- [x] 実行方法と必要なローカル設定をREADMEに記載する。
- [x] `drive-to-raw-sync`と`raw-to-drive-sync`のskill本体を削除し、参照元の`AGENTS.md`、`.agents/rules/mcp.md`、`.agents/rules/data-management.md`、`docs/plan.md`、`README.md`を、手動contents運用とSpreadsheet専用同期へ整合させる。
- [x] `.agents/skills/README.md`、`.agents/skills/contents-markdown-authoring/SKILL.md`、`.agents/rules/contents-markdown.md`、`.agents/rules/file-structure.md`、`docs/requirements/architecture.md`、`docs/content-writing-guide.md`、`docs/development-structure.md`から、削除したworkflow、Connector自動同期、Drive書戻し、`raw-google-drive.url`運用の現行参照を削除または更新する。完了済みissueおよびfailure logの履歴記録は変更しない。
- [x] `.raw/contents/`を手動の非正本入力とし、MDX / Astroをページ本文・可視構成のGit管理正本とする優先順位を、`AGENTS.md`、contents関連skill / rule、requirements、READMEへ反映する。
- [x] `raw-google-drive.url`の参照とignore規則を削除し、`.env`をignoreする。`.env.example`は値を含めず、必要な3つの環境変数名だけを示す。
- [x] Drive clientをstub化したtestでpagination、再帰、Spreadsheet限定、出力相対パス、パス安全性、個別失敗後の継続、終了コードを確認する。
- [x] `docs/out-of-scope.md`を、このローカル開発専用のSpreadsheet同期例外と整合させる。
- [x] `npm run build` が通る。
- [x] `npm run check` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 追加依存はGoogle公式Node.jsライブラリに限定し、追加理由と代替案を記録する。
- [x] Google API呼出しは手動同期scriptだけに閉じ、サイトruntime、build、CI/CDで実行されない。
- [x] `.env`、`.raw/`、XLSX、認証情報をGit管理しない。
- [x] `raw-google-drive.url`を同期設定として併存させない。
- [x] 構造validationや同期対象外ファイルを理由に同期全体を停止しない。
- [x] Google Docs同期・Driveへの書戻しを行うskill、script、運用参照を残さない。
- [x] Google APIを使わないstub testで、致命的失敗と個別失敗の終了コード・集約ログを確認する。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `package.json`
- `package-lock.json`
- `scripts/sync-google-sheets/main.ts`
- `scripts/sync-google-sheets/lib.ts`
- `scripts/sync-google-sheets/runtime.ts`
- `tests/scripts/sync-google-sheets.test.ts`
- `.env.example`
- `.gitignore`
- `README.md`
- `AGENTS.md`
- `.agents/skills/drive-to-raw-sync/`（削除）
- `.agents/skills/raw-to-drive-sync/`（削除）
- `.agents/skills/README.md`
- `.agents/skills/contents-markdown-authoring/SKILL.md`
- `.agents/rules/mcp.md`
- `.agents/rules/data-management.md`
- `.agents/rules/file-structure.md`
- `.agents/rules/contents-markdown.md`
- `docs/plan.md`
- `docs/out-of-scope.md`
- `docs/requirements/architecture.md`
- `docs/content-writing-guide.md`
- `docs/development-structure.md`

## レビュー観点

- local-onlyの手動scriptに限定され、静的サイトのruntime、build、CI/CDへGoogle API依存を持ち込まないこと。
- service accountの認証情報と起点フォルダIDを`.env`で管理する前提が、運用上問題ないこと。同期対象Driveフォルダをservice accountへ閲覧共有する必要がある。
- 「可能な限り取得する」ため、個別ファイル・フォルダ処理の失敗を集約してログ出力し、処理継続する範囲が適切であること。
- `drive-to-raw-sync` / `raw-to-drive-sync`とその参照を削除し、contentsの手動同期とSpreadsheet専用の新しいscriptだけが残ること。
- `.raw/contents/`を非正本の手動入力に変更し、MDX / AstroをGit管理上のページ正本とする判断が適切であること。
- 最小のパス閉じ込め・衝突処理を、ディレクトリ構造validationと混同せずに実装範囲へ含めること。
- stub testが再帰・pagination・MIME filter・部分失敗の継続と終了コードを検証できること。

## 備考

- branch / issue名は、ユーザーが指定した初期スコープ外の特別taskとして`ex-06-google-drive-xlsx-sync`を採用する。
- 認証方式は、対話的なブラウザ認可を不要にするためservice accountを採用する。同期対象Driveフォルダはservice accountのメールアドレスへ閲覧共有する。
- 依存追加理由: Google Drive APIによるフォルダ列挙とSpreadsheet XLSX exportを公式SDKで扱うため。代替のMCPは性能上の理由で採用しない。`rclone`や独自HTTP実装は、追加の運用負荷またはAPI実装保守を増やすため採用しない。
- user-directed scope change: 既存のDrive-to-raw / raw-to-Drive workflowを削除し、contentsは手動同期とする。MDXとAstroが最終的なGit管理の正本であり、`.raw/contents/`の厳密な自動同期は不要とする。
- ここでいうパス安全性は、書込み先を`.raw/`内に閉じ込める最低限の安全条件であり、Drive構造や同期対象の妥当性を検査するディレクトリ構造validationは実装しない。
- `.env`を設定し、共有済みの実Driveフォルダから実行する同期はユーザー環境で成功を確認した。`.env`未配置時に終了コード`1`となること、およびDrive clientをstub化したtestはローカルで確認した。

## レビュー指摘 1

### 指摘事項

- 同期testをVitestへ移し、`vi.mock`で`googleapis`を差し替えてGoogle API adapterとCLI境界を確認する。
- `main.ts`に集まっている設定読込み、service account認証、Drive client adapter、実行結果reportingを分割し、CLI入口を薄くする。

### 判定

- source: human
- classification: valid
- local validation: 現行testは`tests/node/`の`node:test`で純粋な同期logicを確認しているが、`googleapis` adapterおよび`.env`読込みを含むCLI境界を直接確認していない。既存のVitest設定と`vi.mock`の利用実績があり、Vitestへ移すことでSDK module mockを同じtest runner内へ閉じ込められる。現行`main.ts`は設定、認証、adapter生成、実行、reporting、終了状態を一つに持ち、既存の`main.ts`より責務が多い。

### 対応方針

- `sync-google-sheets`専用のVitest testを追加し、`googleapis`、`.env`読込み、出力先をmockして成功・個別失敗・設定失敗のCLI結果を確認する。既存の自前`FakeDrive` classと`node:test` testは削除する。
- 同期実行の設定読込み、Google Drive client生成、結果reportingをtest可能なmoduleへ分割し、`main.ts`は実行と終了状態だけを担当する。
- 依存は既存の`vitest`と追加済み`googleapis`だけを使い、新しいpackageは追加しない。

### 対応完了チェックリスト

- [x] VitestでGoogle API adapterとCLI境界をmodule mockして確認する。
- [x] 自前`FakeDrive` classを含むNode testを削除し、`npm run test`が新しいVitest testを実行する。
- [x] `main.ts`を薄いCLI入口へ分割する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- READMEに、service accountの作成・鍵取得とGoogle Drive API有効化の公式ドキュメントへの最小限の導線を追加する。
- READMEに、`GOOGLE_DRIVE_ROOT_FOLDER_ID`がDriveフォルダURLの`/folders/`以降の文字列であることを記載する。

### 判定

- source: human
- classification: valid
- local validation: READMEはservice account、Drive API有効化、`.env`のキー名を記載しているが、認証情報を取得する公式導線とフォルダIDの具体的な取得元を記載していない。現行issueの「README上の最小限の利用手順」に属し、Google Cloud公式のservice account key作成手順とDrive API有効化手順を案内できる。

### 対応方針

- READMEのGoogle Spreadsheet同期手順へ、service account作成・JSON鍵取得、Google Drive API有効化の公式ドキュメントへのリンクを追記する。Google Cloud Consoleの画面操作を詳細化しない。
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`には、対象フォルダをブラウザで開いたURLの`https://drive.google.com/drive/folders/<folder-id>`における`<folder-id>`だけを設定することを明記する。

### 対応完了チェックリスト

- [x] service account認証情報とGoogle Drive API有効化の公式導線をREADMEに追加する。
- [x] DriveフォルダURLから`GOOGLE_DRIVE_ROOT_FOLDER_ID`を取得する方法をREADMEに追加する。
- [x] `npm run check:md` が通る。

## レビュー指摘 3

### 指摘事項

- `.raw/contents/`を手動の非正本入力へ変更した方針と矛盾し、contentsをページ本文・可視構成の正本または最優先としている現行requirements、out-of-scope、content writing guide、design notesが残っている。
- READMEと`.agents/rules/README.md`に、廃止済みのGoogle Docsからcontentsを自動同期する運用説明が残っている。
- Vitest testが、issueで完了扱いにしたpagination、再帰、Spreadsheet MIME限定、出力パス安全性、列挙・書込み失敗後の継続を実際には検証していない。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `docs/requirements.md`、`docs/requirements/pages.md`、`docs/out-of-scope.md`、`docs/content-writing-guide.md`、`docs/design/ryugi-index/notes.md`、`docs/design/ikizama-index/notes.md`に旧contents正本の記述が残る。`README.md:243`と`.agents/rules/README.md`にもGoogle Docs同期の現行説明が残る。`tests/scripts/sync-google-sheets.test.ts`は出力結果と`listMock`呼出し回数を確認するが、Drive query、page token、MIME除外、危険な名前・衝突、列挙・書込み失敗をassertしていない。

### 対応方針

- 現行issueのcontents手動・非正本方針に従い、残るGit管理SSoTの優先順位と運用説明を更新する。過去issueとfailure logの履歴は変更しない。
- READMEとrule indexからGoogle Docs自動同期の現行説明を削除し、必要なcontentsは手動配置する補助入力であることを明記する。
- Google API adapterとCLI境界をVitestで維持したまま、Drive list引数、対象外MIME、パス安全性・衝突、個別列挙・書込み失敗後の継続をfixtureとassertionで確認する。

### 対応完了チェックリスト

- [x] 残るrequirements、out-of-scope、content writing guide、関連design notesをcontents手動・非正本方針へ整合させる。
- [x] READMEとrule indexからGoogle Docs自動同期の現行説明を除去する。
- [x] Vitestでpagination、再帰、Spreadsheet MIME限定、出力パス安全性、個別列挙・書込み失敗後の継続を確認する。
- [x] `npm run test:script` が通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 4

### 指摘事項

- DriveフォルダとSpreadsheetが、変換後に同じ`.raw/`出力パスへ解決される場合の衝突を検出できない。

### 判定

- source: chatgpt-review
- classification: valid
- local validation: `scripts/sync-google-sheets/lib.ts`はフォルダを`reservedDirectories`、Spreadsheetを`reservedFiles`へ別々に予約する。たとえばDriveフォルダ`data.xlsx`とSpreadsheet`data`はどちらも`.raw/data.xlsx`へ解決されるが、相互の予約を確認しない。列挙順により`EISDIR`、`ENOTDIR`、または空フォルダでは衝突を記録しないまま処理が終わり、issueの「変換後に同一出力パスとなる対象は書き込まずエラー」の契約を満たさない。

### 対応方針

- フォルダとSpreadsheetで共通の出力パス予約を使い、種類を問わず同じ出力先へ解決される後続対象を、書込み前にエラーとして記録する。
- フォルダ同士、Spreadsheet同士、フォルダとSpreadsheetの相互衝突、および衝突後も別Spreadsheetを同期することをVitestで確認する。

### 対応完了チェックリスト

- [x] フォルダとSpreadsheetで共通の出力パス衝突検出を実装する。
- [x] 種類をまたぐ出力パス衝突と処理継続をVitestで確認する。
- [x] `npm run test:script` が通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
