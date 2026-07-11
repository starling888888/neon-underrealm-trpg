# local-content-authoring

## 目的

CodexがローカルまたはChatGPTからコンテンツ指示書を作成するとき、実行環境で参照可能な情報源を明示し、既存サイトとの齟齬を残さないようにする。

あわせて、Google Driveを正本とする `.raw/release-notes.xlsx` と `.raw/contents/` を、ユーザーが明示した場合だけ安全にDriveへ手動同期できるローカルSKILLを整備する。

## 背景

GPT-5.6-terraによる作業効率の改善とPro planの利用により、credit節約を目的にChatGPTへコンテンツ作成を分業・転記する必要性が下がった。

Codex内でコンテンツ指示書を作成できるようにしつつ、実装済みページ、既存の作業入力、v1.0の旧資料を照合して、意図しない本文差分やAIらしい均質な文体を避ける。

`docs/plan.md` の未完了ページ作成タスクは `.raw/contents/*.md` を前提としている。本issueはそれらのページを実装しない。コンテンツ作成・同期の運用を整備するplan外タスクとして扱う。

関連する正本・運用ルールは以下とする。

- `AGENTS.md`
- `.agents/skills/contents-markdown-authoring/SKILL.md`
- `.agents/skills/remote-contents-markdown-authoring/SKILL.md`
- `.agents/skills/drive-to-raw-sync/SKILL.md`
- `.agents/rules/contents-markdown.md`
- `.agents/rules/data-management.md`
- `.agents/rules/mcp.md`
- `docs/requirements/architecture.md` の AC-07
- `docs/plan.md` の `.raw/contents/*.md` を前提とするページ作成方針

関連TODOとして、`20-2-introduction-page` でローカルコンテンツ作成SKILLを実作業で確認する項目を `docs/TODO.md` に記録する。このissueでは動作確認を実施しない。

## 対象範囲

- 既存 `.agents/skills/contents-markdown-authoring/SKILL.md` を拡張する。
  - 新規コンテンツ指示書の成果物は `.raw/contents/<slug>.md` とし、既存のfrontmatter、Markdown本文、HTMLコメントの形式を使う。比較結果・未解決差異は成果物へ混在させず、チャットで報告する。
  - 新規コンテンツ指示書の情報源を、ユーザー指示、ローカル`src/pages/`の実装済み記載、ローカル`.raw/contents/`の既存記載、ローカル`.raw/v1.0/`の記載の順で照合する。
  - ユーザー指示が既存実装または `.raw/contents/` と異なる場合、対象ページ・関連リンク・共通Component・データ表示を含む影響範囲を特定し、実装変更前にユーザー判断を求めて停止する。
  - 承認済みの実装変更で本文を変える場合は、対応する `.raw/contents/` の指示書もローカルで同期する。Git管理外であることと、Driveへの反映は別の明示操作であることを明記する。
  - `.raw/v1.0/` の旧資料を文体・言い回しの参照として扱い、定型的で過度に均質なAI風表現を避ける。参照資料が不足する場合は、文体を推測で固定しない。
- `.agents/skills/remote-contents-markdown-authoring/SKILL.md` を新設する。
  - ChatGPTからコンテンツ指示書の草案を作成・確認するときだけ使う。
  - ユーザー指示と、ChatGPTから取得できるGit管理下の`src/pages/`を照合する。
  - ローカル専用の`.raw/contents/`と`.raw/v1.0/`は参照せず、未確認として報告する。Google Driveの同期・読取り・書込み、ローカル`.raw/`への書込みは行わない。
  - 成果物はチャット上のMarkdown草案とし、ローカル`.raw/contents/<slug>.md`を作成・更新したとは扱わない。使用したリモートsource snapshotと未確認のローカル情報源を報告する。
  - ローカルSKILLとリモートSKILLを分ける目的は、人間向けの読みやすさではなく、agentが不要なモードの手順・参照先・停止条件をコンテキストへ持ち込まず、モード誤認とコンテキスト肥大を防ぐこととする。
- `drive-to-raw-sync` と `.raw/` の運用を更新する。
  - Drive同期対象に `v1.0/` を追加し、直下のGoogle Docsを `text/markdown` でMarkdownとして `.raw/v1.0/` に保持する。export結果に含まれるinline base64画像定義はローカル保存前に除去する。サブディレクトリを再帰的に扱わない。`contents/` のGoogle Docsは引き続き `text/plain` exportとする。
  - `v1.0/` は旧版の公開内容・テストプレイ・v1.5向け検討の参照資料として扱う。現行サイト本文の正本ではなく、ローカル→Drive同期の対象にも含めない。
  - `v1.0/` にGoogle Docs以外のファイルまたはサブディレクトリがある場合は、静かに破棄・別形式変換せず、同期結果で明示して停止する。
- `.agents/skills/raw-to-drive-sync/SKILL.md` を新設する。
  - 実行開始は、ユーザーが `$raw-to-drive-sync` または `raw-to-drive-sync を実行して` と明示した場合だけに限定する。一般的な「同期して」「反映して」や、ほかの作業に付随した指示では実行しない。
  - `.raw/release-notes.xlsx` は、Drive同期ルート直下に必ず存在する既存のGoogle Sheet `release-notes` と対応付ける。Excelの内容を同じGoogle Sheetへ反映し直し、新規Google SheetやExcelファイルを作成しない。
  - `.raw/contents/<slug>.md` は、Drive同期ルートの`contents/`内にある同名のGoogle Doc `<slug>.md` と対応付ける。既存Google Docがある場合はその本文を更新し、ない場合はファイル名も`<slug>.md`の新規Google Docを作成する。どちらもMarkdownの解釈・リッチテキスト化・Markdown貼り付けを行わず、Markdownソースをプレーンテキストとして書き込む。
  - `.raw/data/` はユーザーが明示指示しても同期を拒否する。`data/` はブラウザ上でユーザーが管理する。
  - `.raw/v1.0/` は同期しない。旧資料として保持し、更新しない。
  - 同一セッションでユーザーと更新した記憶がない対象ファイルは、同期元・同期先・上書きの意図をユーザーに確認して停止する。
  - `.raw/contents/` と `release-notes.xlsx` の正本はGoogle Driveのままとし、このSKILLをユーザーの手動同期を補助するものとして明記する。
- 上記の運用を矛盾なく参照できるよう、必要な範囲で `AGENTS.md`、`.agents/skills/README.md`、`.agents/rules/data-management.md`、`.agents/rules/mcp.md`、`.agents/rules/contents-markdown.md`、`docs/requirements/architecture.md` を更新する。

## 初期スコープ外

- `src/pages/`、Astro Component、スタイル、ルート、データ変換スクリプト、生成JSONを変更しない。
- ページ本文・リリースノート・Excelデータの実内容を作成、変更、公開しない。
- `.raw/data/` のGoogle Drive書き込み、双方向同期、常時監視、自動同期、CI/CD同期を実装しない。
- `v1.0/` を現行サイト本文の正本に戻さない。v1.0資料の書き換え、ローカル→Driveへの更新、サイトへの自動反映を行わない。
- Drive以外の外部サービス、独自Google Drive API、`rclone`、runtime/build/CI依存、npm packageを追加しない。
- CMS、認証、DB、サーバーサイド処理、投稿機能など `docs/out-of-scope.md` の初期スコープ外機能を導入しない。

## 完了条件

- [x] `contents-markdown-authoring` に、`.raw/contents/<slug>.md` を成果物とするローカル実行用の情報源優先順位、差異検出とユーザー確認、`.raw/contents/` 同期、v1.0文体参照のルールが記載されている。
- [x] `remote-contents-markdown-authoring` に、チャット上のMarkdown草案を成果物とするリモート実行用の情報源優先順位とsource snapshot報告のルールが記載されている。
- [x] `remote-contents-markdown-authoring` が、ユーザー指示と取得可能なGit管理下の`src/pages/`だけを照合し、`.raw/contents/`・`.raw/v1.0/`を未確認として報告する。
- [x] `remote-contents-markdown-authoring` が、Google Driveへの同期・読取り・書込み、ローカル`.raw/`への書込みを行わない。
- [x] Drive→`.raw/` 同期で、`v1.0/` 直下のGoogle Docsを `text/markdown` のMarkdownとして扱い、inline base64画像定義をローカル保存前に除去し、`contents/` のGoogle Docsは `text/plain` とする。非Google Docsまたはサブディレクトリでは停止・報告するルールが記載されている。
- [x] `raw-to-drive-sync` が新設され、`$raw-to-drive-sync` または `raw-to-drive-sync を実行して` の明示呼び出しだけで実行される。
- [x] `raw-to-drive-sync` は、`.raw/release-notes.xlsx` の内容を既存Google Sheet `release-notes` へ反映し、`.raw/contents/<slug>.md` を同名のGoogle Doc `<slug>.md` として同期する。`.raw/data/` と `.raw/v1.0/` は同期対象外として明示的に拒否する。
- [x] 同一セッションで更新した記憶がないファイルを同期する前に、ユーザー確認で停止する条件が記載されている。
- [x] 同期先がないcontentsファイルは、対応する`<slug>.md`というファイル名の新規Google Docを`contents/`に作成し、Markdownソースをプレーンテキストとして同期する。`release-notes`の同期先は必ず既存Google Sheetとする。
- [x] Google Driveを `contents` と `release-notes.xlsx` の正本として維持する条件と、ローカル→Drive同期の書き込み権限が矛盾なく記載されている。
- [x] `.raw/` 構造、MCP利用、Google Drive書き込み制限に関する参照先が矛盾なく更新されている。
- [x] 関連TODOを後続の `20-2-introduction-page` へ記録し、このissueでは実作業の動作確認を行わない理由が記録されている。
- [x] 新しいnpm packageを追加していない。
- [x] `git diff --check` が通る。
- [x] `npm run check:md` が通る。

## チェックポイント

- [x] ユーザー指示と下位情報源の差異を、SKILLが勝手に解決・実装しない。
- [x] リモートSKILLがローカル専用の情報源を、参照済みまたは差異なしと扱わない。
- [x] 比較結果と未解決差異を `.raw/contents/<slug>.md` の公開用候補本文へ混在させない。
- [x] `.raw/contents/<slug>.md` のDrive書込みで、Markdownをリッチテキストとして解釈・貼り付けず、ソースをプレーンテキストとして書き込む。
- [x] `src/pages/` が現行ページ本文・UI構造の正本であることと、Google Driveが `.raw/contents/`・`release-notes.xlsx` のユーザー編集正本であることを混同しない。
- [x] v1.0を現行仕様として取り込まず、文体・旧ルール・検討資料の参照に限定する。
- [x] `v1.0/` の直下Google Docsだけを同期し、inline base64画像定義を除き、想定外の階層または形式を独自変換しない。
- [x] Drive→`.raw/` と `.raw/`→Drive の対象方向、許可パス、停止条件が対称でなくても明確に分離されている。
- [x] `data/` 同期拒否は、ユーザーの明示指示より優先する固定安全条件として記載されている。
- [x] Drive書き込みは、`$raw-to-drive-sync` または `raw-to-drive-sync を実行して` の明示呼び出し、対象ファイル確認、上書き確認の条件を満たす場合だけ可能である。
- [x] `release-notes`は既存Google Sheetへの反映だけを許可し、新規Google SheetまたはExcelファイルを作成しない。
- [x] Google Drive MCPをruntime、build、CI/CD、公開処理に利用しない。
- [x] 不要なSKILL分割、補助スクリプト、依存関係、Git管理対象の生データを追加していない。
- [x] `docs/plan.md` の既存タスク・チェックボックスを変更していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/local-content-authoring.md`
- `.agents/skills/contents-markdown-authoring/SKILL.md`
- `.agents/skills/remote-contents-markdown-authoring/SKILL.md`
- `.agents/skills/drive-to-raw-sync/SKILL.md`
- `.agents/skills/raw-to-drive-sync/SKILL.md`
- `.agents/skills/README.md`
- `AGENTS.md`
- `.agents/rules/data-management.md`
- `.agents/rules/mcp.md`
- `.agents/rules/contents-markdown.md`
- `docs/requirements/architecture.md`

## レビュー観点

- `contents-markdown-authoring`、`remote-contents-markdown-authoring`、`raw-to-drive-sync` の分割が、agentのコンテキストから不要な手順・参照先・停止条件を除外し、モード誤認とコンテキスト肥大を防げるか。
- `remote-contents-markdown-authoring` で、`.raw/contents/`と`.raw/v1.0/`を利用できないこと、Google Driveを操作しないこと、ローカル成果物を作成しないことが明確か。
- `docs/plan.md` の現在のページ作成フェーズに対し、今回のSKILL整備は必要最小限か。補助スクリプト、CI/CD統合、双方向自動同期などのオーバーエンジニアリングを含んでいないか。
- `.raw/v1.0/` のローカル保存先、直下Google Docsだけを対象とするDrive→`.raw/` の取込条件、現行サイトの正本との関係が明確か。
- 新規コンテンツを初めてDriveへ同期するとき、`contents/`に`<slug>.md`というファイル名のGoogle Docを作成し、Markdownをプレーンテキストとして書き込む方針が、Google Driveを正本とする運用と整合するか。
- `.raw/release-notes.xlsx` の内容を既存Google Sheet `release-notes` へ反映し直す範囲と、新規SheetやExcelファイルを作成しない制約が明確か。
- `.raw/contents/` と `release-notes.xlsx` の「Driveがユーザー編集正本」と、承認済みローカル変更を手動同期する運用が矛盾なく説明されているか。
- 同一セッションで更新した記憶がないファイルの判断を、git diffだけに依存せずユーザー確認で停止する条件として十分に定義できているか。
- v1.0資料の文体参照が、現行ルールの内容を古い仕様へ戻すことにつながらないか。

## 備考

- branch名は、ユーザー指示により番号プレフィクスを付けない `local-content-authoring` とする。
- UI、CSS、layout、page、Componentの実装を含まないため、design targetおよび `design-image-generation` の前提条件はない。
- Google Drive MCPで実際に読み書きすること、Driveファイルを作成すること、既存Driveファイルを上書きすることは、このissue承認後も対象SKILLの明示呼び出し時だけに行う。
- 2026-07-11にGoogle Drive同期ルートを確認した。`v1.0/` はルート直下にあり、直下にはGoogle Docs 4件だけが存在する。`release-notes` はルート直下の既存Google Sheetである。Drive URLおよびファイルIDはGit管理文書へ記録しない。
- `remote-contents-markdown-authoring` は、ChatGPTから呼び出す場合を想定する。ローカル作業ツリーや`.raw/`が存在するとは仮定しない。
- 2026-07-11に、ユーザーが `$raw-to-drive-sync` で `.raw/contents/home.md` の同期を動作確認した。セッション内更新記憶がないため書込み前確認で停止し、ユーザーの上書き許可後に既存 `contents/home.md` を更新した。Markdownをプレーンテキストとして書込み、frontmatter・HTMLコメント・Markdown記号をconnector readbackで確認した。Google Sheet、Excel、`data/`、`v1.0/` は変更していない。後のPR作成時は、この動作確認結果を本文に含める。
- 2026-07-11に、`v1.0/`のGoogle Docsを誤って `text/plain` exportする実装バグをユーザーが指摘した。`contents/` は `text/plain`、スタイル付きの`v1.0/`は `text/markdown` としてexportするよう修正した。誤った形式で作成済みのローカルv1.0ファイルは、正しいexportによる再同期が必要である。
- 2026-07-11に、`text/markdown` exportが画像をinline base64データURIとして出力し、ローカル作業入力とagentコンテキストを肥大化させることを確認した。v1.0同期では画像定義だけをローカル保存前に除去し、通常の本文と画像リンクは保持する。
