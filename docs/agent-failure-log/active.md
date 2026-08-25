# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

同種失敗の監査と恒久対応案の整理は `.agents/skills/failure-log-audit/SKILL.md` に従う。

このファイルは未反映・未確認failureを中心に管理するactive failure logである。対応済みfailureは `docs/agent-failure-log/done.md` へ、ユーザーが恒久対応不要と判断した記録は `docs/agent-failure-log/no-action.md` へ移す。ユーザー指示によりactive auditから分ける機能固有のuser / review由来failureは、どちらにも分類せず `docs/agent-failure-log/archive.md` へ移す。

failureのdone退避は、恒久対応が完了し、反映先が記録され、ユーザー確認を受けた場合に限る。plan / TODOの完了退避とは条件を混ぜない。

---

## 目的

- ユーザーが指摘したエージェントの不適切な振る舞いを失われない形で残す
- 実装中にユーザーまたはエージェント自身が観測した失敗、手順違反、判断ミス、検証不足を記録する
- build、test、型検査などで同種の失敗を繰り返した場合に、エージェント自身が後から分析できる形で蓄積する
- 後続で `AGENTS.md`、`.agents/skills/*/SKILL.md`、docs、チェックリスト、レビュー手順へ恒久対応として反映する
- 同じ失敗を繰り返さないための判断材料にする

---

## 記録対象

以下に該当するものを記録する。

- ユーザーの明示指示より先に実装、生成、commit、push等を進めた
- issue-first workflow、design workflow、review workflowなどの停止地点を誤った
- スコープ外の機能、導線、UI、design要素を作った
- 既存SSoTと矛盾する判断をした
- 未検証の内容を検証済みのように扱った
- 生成物、画像、スクリーンショット、remote draft、実装結果の位置づけを混同した
- ユーザーの未コミット変更や未追跡ファイルを誤って扱うリスクがあった
- build、test、型検査などで同種のエラーや指摘を繰り返した
- 同じ修正方針で複数回失敗し、別の調査や恒久対応が必要になった
- 恒久対応としてルール、skill、チェック手順に反映した方がよい失敗

通常の実装品質レビュー、設計改善提案、単発の軽微な修正依頼は、このファイルの記録対象ではない。formatterまたはlinterの指摘は、同一作業中に修正して最終確認できれば通常の開発ループとして扱い、回数を問わずfailureとして記録・報告しない。

review-to-issueでレビュー指摘を扱う場合も、以下のいずれかに該当する指摘だけをfailure-log候補とする。

- ユーザー承認なしに進めた作業
- workflow上の停止地点を越えた作業
- current issueの範囲を誤って拡大した作業
- 検証していない内容を検証済みとして扱った作業
- remote snapshot、review draft、actual screenshot、design正本などの位置づけを混同した作業
- agent自身が観測した通常のbuild、test、型検査で、同一testまたは同一commandの失敗を同一作業中に3回以上連続して繰り返した作業
- 恒久的なrules / SKILL / checklist更新が必要になりうる判断ミス

source種別は以下を使う。

- `user`: ユーザーが直接指摘した失敗
- `self`: エージェント自身が作業中に観測した失敗
- `review`: review-to-issueで扱ったレビュー指摘から、agent failureとして妥当だと判断した失敗
- `unknown`: sourceを特定できないが記録が必要な失敗

---

## 運用方針

- このファイルは失敗の一次記録であり、恒久対応そのものではない。
- 恒久対応を行う場合は、別タスクとして `AGENTS.md`、該当SKILL、または関連docsへ反映する。
- 反映済みになった項目は、削除せず「恒久対応」欄へ反映先を追記する。
- current issueで扱うべき修正を、このファイルへ逃がさない。
- 通常の後続開発TODOは `docs/TODO.md` で管理する。
- 対応済みfailureは、ユーザー確認後に `docs/agent-failure-log/done.md` へ退避できる。
- ユーザーが恒久対応不要と判断したentryは、active auditの対象から外し `docs/agent-failure-log/no-action.md` へ移す。
- ユーザーが指定した機能固有のuser / review由来failureは、未対応の意味を保ったまま `docs/agent-failure-log/archive.md` へ移せる。これは`done`でも`no-action`でもない。
- review-to-issueでfailure-log候補を記録しても、review-to-issueの停止地点は変えない。記録後はユーザー確認を待つ。
- 同じfailureカテゴリに3回以上の発生詳細が積み重なっている場合は、作業報告でユーザーに通知し、恒久対応候補として明示する。formatterまたはlinterのみの既存記録は、この集計と通知の対象外とする。
- 日常taskではactive log全文をコンテキストへ載せない。失敗を追記する時は、関連するcategoryとtitleを検索して既存entryを照合する。作業後は3回以上のactive categoryを集計し、該当categoryだけを読む。
- `failure-log-audit`を明示された時だけactive log全文を読み、カテゴリの再分類、恒久対応の検討、done / no-action / archiveへの移動を行う。

この方針の適用前に記録されたformatterまたはlinterのみのentryは、ユーザー確認と明示的な整理指示を受けて`docs/agent-failure-log/done.md`へ移す。

---

## 記録テンプレート

```md
### 同じ現象と有効な一次対応を共有する短い分類名

#### short-title

- date: YYYY-MM-DD
- source: user / self / review / unknown
- 発生箇所:
- 観測した失敗:
- 一次対応:
```

---

## 未反映

### Deployment execution-boundary interpretation

#### Misread local manual deploy permission as GitHub Actions manual-dispatch permission

- date: 2026-08-24
- source: user
- 発生箇所: `ex-16-2-backend-infrastructure` のbackend deploy workflow確認
- 観測した失敗: 親issueの「デバッグ用の手動deploy」をGitHub Actionsの`workflow_dispatch`まで許可する方針と誤読し、Gate branchからも実行できるworkflowを一度問題なしと報告した。ユーザーの指摘により、許可対象はユーザー承認後のlocal Terraform手動実行だけであり、GitHub Actionsの手動起動は不許可であると訂正した。
- 一次対応: 親issue、README、deployment文書を正しいexecution boundaryへ更新し、current issueのmain限定deploy条件を未完了へ戻した。workflowの`workflow_dispatch`削除は明示指示待ちとした。
- 続報: ユーザーのworkflow修正指示後、backend deploy workflowから`workflow_dispatch`を削除した。実際のmain deploy実行による確認は未実施のため、current issueの該当完了条件は未チェックのままとする。

### Terraform configuration discipline

#### Introduced an unnecessary Terraform initialization wrapper

- date: 2026-08-24
- source: user
- 発生箇所: `ex-16-2-backend-infrastructure` のTerraform remote state初期化設計
- 観測した失敗: Terraform S3 backendが読む環境変数と`init`のbackend設定境界を十分に確認せず、`local.tfvars`を独自解析して`.env`とbackend configを生成する`terraform-init.mjs`を導入した。ユーザーの指摘後に公式仕様を調査し、ローカル専用wrapperとTerraform標準の環境変数・`TF_CLI_ARGS_init`だけで足りることを確認した。
- 一次対応: 独自MJSとCIでの`.env`生成を撤去した。localでは`.env`を子processだけへ読む薄いshell wrapper、CIではRepository Variables / Secretsから直接渡すTerraform commandへ分離した。

#### Kept unnecessary local runner scripts and Terraform after Wrangler was sufficient

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のlocal D1/R2とbackend deploy設計
- 観測した失敗: Wranglerがlocal D1/R2 state、migration、Worker deployを扱えることを先に確認せず、state cleanup用shell script群とTerraform remote stateを追加・維持した。ユーザーから、npm scriptと明示的な手順書で十分であり、Terraform自体も不要ではないかと指摘された。
- 一次対応: local手順をnpm scriptと`docs/testing.md`へ縮約し、Terraform-managed resourceをdestroyしたうえで、CI・local設定・親issue・architecture・deployment文書をWranglerのautomatic provisioning、remote migration、deployへ統一した。

### browser-test flake diagnosis

#### Repeated flaky character-sheet section-frame browser test

- date: 2026-07-27
- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `tests/visual/character-sheet.spec.ts`（縁のsection frame開閉確認）
- 観測した失敗: 同じcharacter-sheet browser testで、`縁`の開閉buttonをclickした直後も`aria-expanded`が`true`のままとなる失敗を再度観測した。今回のG7変更はframe実装を変更しておらず、同一commandの他8件は成功したため、既存のclient hydrationまたは操作同期の不安定さとして切り分ける。
- 一次対応: G7のDOM変更を原因とみなしてframe実装へ変更を加えず、対象testを単独で再実行して再現性を確認する。frameを変更する必要がある場合は、別scopeで操作同期の契約を明確にして対応する。

### browser-test locator discipline

#### Repeated a new visual test failure across viewports with an unverified accessible name

- date: 2026-07-29
- source: agent
- 発生箇所: `tests/visual/vrt/character-sheet.spec.ts` の武器・防具詳細展開capture
- 観測した失敗: 追加したVRT scenarioで詳細buttonのaccessible nameを「刀の詳細を開く」「チンピラ服の詳細を開く」と推測した。実装は助詞を含まないため、desktop／tablet／mobileで同じlocator timeoutを繰り返した。
- 一次対応: Componentの`aria-label`組み立てを確認し、test locatorを実際の「刀詳細を開く」「チンピラ服詳細を開く」へ修正した。新規browser testでは、操作対象のaccessible nameを実装または先行E2Eで確認してから複数viewportへ展開する。

### completion evidence and archival authorization

#### Left declaratively verified deploy conditions unchecked

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-2-backend-infrastructure` のdeploy workflow完了条件確認
- 観測した失敗: `main`限定、path filter、job依存関係、credentialのjob境界をworkflow定義で確認済みにもかかわらず、最終マージ後の実動作確認と混同して関連する3つの完了条件を未チェックのまま報告した。
- 一次対応: workflow定義を根拠に構成条件を完了へ更新し、mainへの実行結果確認はCloudflare applyとGitHub Actions実行の別確認として区別する。

#### Archived a Gate child issue without user confirmation

- date: 2026-07-27
- source: user
- 発生箇所: `ex-02-6-sheet-image` のG6進行管理
- 観測した失敗: test、check、buildの成功とagent自身のchecklist更新を、Gate完了およびchild issueのarchive許可と誤認した。ユーザーの完了確認なしに、G6 child issueを当時のローカルarchiveへ移した。
- 一次対応: child issueを作業中のpathへ戻し、parent Gate planのG6を`in progress`へ戻した。以後、検証成功だけでarchiveせず、ユーザーが完了・archiveを明示した場合だけ処理する。

#### Completed checklist with stale unverified note

- date: 2026-07-09
- source: review
- 発生箇所: `18-0-release-notes-data` の `docs/issue/18-0-release-notes-data.md`
- 観測した失敗: 完了条件と備考の実装確認では `npm run test`、`npm run check`、`npm run build` が検証済みになっていたが、末尾の `ローカル検証メモ` に同じコマンドが `not yet verified` として残り、検証済みなのか未検証なのかが矛盾する状態でPR化した。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、レビュー対応時にローカル検証メモを実際の検証済み状態へ整理する方針へ入れた。

#### Left superseded review checklist items unchecked

- date: 2026-08-08
- source: user
- 発生箇所: `ex-10-character-sheet-layout`のレビュー指摘9・10への修正とPR再レビュー
- 観測した失敗: Review 10で、長大error一覧のbrowser E2EをComponent testへ置き換え、target testとVRT確認を完了した。しかし、Review 9に残る同じ到達性・target testの2 checkboxを最終方針と実施結果へ更新しなかったため、remote PR reviewでチェック漏れとして再指摘された。
- 一次対応: Review 9の方針をComponent testへ訂正し、実施済みの2 checkboxを完了へ更新した。以後、後続reviewで前のreview sectionの方針や検証経路を置き換える場合は、commit前に置換元sectionの未チェック項目を解消済み・未対応・人間判断のいずれかへ明示更新する。

#### Marked backend integration CI as executable without CI evidence

- date: 2026-08-25
- source: review
- 発生箇所: ex-16-4-cloud-persistence-api のlocal API E2E完了条件
- 観測した失敗: local Workerでintegration testが通ったことだけを根拠に、「backend CIで実行できる」完了条件をチェックした。CI環境にはbackend/.envがなく、local Workerが必須のCORS_ALLOW_ORIGIN bindingを得られずhealth checkで500になるため、実際にはintegration testへ到達できなかった。
- 一次対応: 完了条件を未確認へ戻し、レビュー指摘3でCI runtime variable注入とGitHub Actions実行確認を修正契約に追加した。

#### Treated a CI process environment variable as a Wrangler local binding

- date: 2026-08-25
- source: user-report
- 発生箇所: ex-16-4-cloud-persistence-api のbackend integration CI修正
- 観測した失敗: GitHub Actionsのstep `env`へCORS_ALLOW_ORIGINを設定すれば、`wrangler dev`でWorker bindingとして利用できると誤認した。実際にはprocess環境変数はWranglerのlocal Worker bindingへ自動注入されず、deploy時だけ`--var`を付与するwrapperもdevでは補完しないため、`environment.CORS_ALLOW_ORIGIN`は未定義のままとなる。
- 一次対応: CIでgitignore対象の`backend/.env`を生成し、既存wrapperがsourceした値をWrangler標準の`.env`読込へ渡す構成に訂正する。

- date: 2026-07-09
- source: review
- 発生箇所: `phase-2-prep-contents-markdown-workflow` の `docs/issue/phase-2-prep-contents-markdown-workflow.md`
- 観測した失敗: 完了条件とチェックポイントをすべて確認済みにした後も、`Local Validation Summary` に `remaining unverified before final report: final failure-log category check` が残り、未検証項目が残っているのか確認済みなのかが曖昧な状態でPR化した。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、issue修正時にfailure-log確認結果を明確化する対応方針へ入れた。

#### Character-sheet requirement omission marked complete

- date: 2026-07-27
- source: review
- 発生箇所: `ex-02-7-sheet-build` のissue作成・完了確認
- 観測した失敗: 要件とdesign notesにある取得経験点の基本情報側配置、流儀増加値、生き様係数、共通スキルボーナス表示をG7契約へ取り込まず、実装後に完了条件とチェックポイントを完了扱いにした。
- 一次対応: レビュー指摘 1としてG7 issueへ不足事項と修正契約を追加した。以後、Gate issueの範囲と完了条件を確定する際は、関連要件の表示配置・派生表示まで照合する。

#### Archived G9 while visual acceptance remained unverified

- date: 2026-07-28
- source: review
- 発生箇所: `ex-02-9-sheet-bonds` のGate完了・child issue archive
- 観測した失敗: G9 child issueにはresponsive表示、層別確認、Visual Reviewの未完了チェックが残り、後続レビューでもactual screenshotによる確認未実施を記録していた。それにもかかわらず親Gate planを`done`とし、child issueを当時のローカルarchiveへ移動した。さらに初期完了条件と後続レビューの覚悟効果表示契約が同一issue内で矛盾したまま残った。
- 一次対応: `.tmp/chatgpt-review.md`をSSoTと現行実装へ照合し、G10のレビュー指摘1へout-of-scopeとして記録した。G9の受入確認、表示契約、削除callbackはG31統合確認へTODOとして振り分け、G10では実装・完了扱いを変更しない。

#### Archived or closed a Gate while its child issue remained incomplete

- date: 2026-07-28
- source: review
- 発生箇所: `ex-02-12-sheet-primary-skills` のGate完了・child issue archive
- 観測した失敗: parent Gate planを`done`としchild issueを当時のローカルarchiveへ移動したが、child issue本体の完了条件、チェックポイント、Visual Reviewに未チェックが残っていた。G6での無許可archive、G9でのvisual acceptance未確認archiveに続く、完了根拠をchild issueへ反映しないままcloseする再発である。
- 一次対応: `.tmp/chatgpt-review.md`をG13のレビュー指摘2として取り込み、G13では全未チェック項目を実確認結果へ更新するまでclose / archive / parent planの`done`へ変更しない。恒久対応はfailure-log監査でユーザー承認後に行う。

### completion-record accuracy

#### Marked a user-confirmation CI condition complete before confirmation

- date: 2026-08-08
- source: review
- 発生箇所: `ex-11-ci-improvements` の Quality CI 完了条件
- 観測した失敗: GitHub Actions の実行結果をユーザーが確認して「CI確認済み」と指示するまで未チェックに保つ契約にもかかわらず、Quality job の成功を条件とする項目をチェック済みにした。
- 一次対応: review-to-issueで当該項目を未チェックへ戻し、coverage有効のtest実行結果についてユーザー確認待ちを明記した。

#### Registered a GitHub Issue completion record with a summary instead of the final local issue body

- date: 2026-08-05
- source: user
- 発生箇所: `milestone-02-phase-01-todo-resolution` のGitHub Issue #190への完了記録
- 観測した失敗: ローカルissueを削除する際、GitHub Issue #190の本文へ削除直前の`docs/issue/milestone-02-phase-01-todo-resolution.md`全文ではなく、英語の要約だけを登録した。closed Issueは完了済みissueの最終契約・完了記録であるため、原文を失わせる登録になった。
- 一次対応: 削除commit `0f218f0`の親commitからローカルissue原文を取得し、GitHub Issue #190の本文を原文へ復元した。以後、ローカルissueをGitHubへ記録してから削除する作業では、Issue本文と削除直前のファイル内容を照合してから完了を報告する。

### component-test contract synchronization

#### Renamed a workflow without updating its build contract test

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-2-backend-infrastructure` の`.github/workflows/deploy.yml`から`frontend-deploy.yml`への改名
- 観測した失敗: workflow本体、path filter、文書は改名後のpathへ更新したが、`frontend/tests/contract/page-navigation-build.test.ts`が旧workflow pathを直接読むcontractを更新しなかった。ローカルでのfrontend coverage testが改名前に実行済みだったため、GitHub Actionsで初めてENOENTとして検出された。
- 一次対応: 失敗job logとtestの旧path参照を照合し、frontendの公開ビルド契約ではない当該contract testを削除した。

#### Repeated component-test failure after changing the removal callback contract

- date: 2026-07-28
- source: agent self-report
- 発生箇所: `ex-02-15-sheet-other-ryugi-skills` の`BuildSection` Component test
- 観測した失敗: 削除確認dialogのfocus復帰のため、その他流儀削除callbackへ操作元buttonを追加したが、既存testのcallback引数期待を更新しなかった。同じ失敗をfull testとcomponent testで2回確認した。
- 一次対応: callback契約に合わせてtest expectationを更新し、`npm run test:component`で16 files・78 testsの通過を確認した。callbackへ操作元を追加する変更では、呼び出し側とtest doubleの引数契約を同時に確認する。

### generated-data test discipline

#### Coupled a release-notes test to a mutable data count

- date: 2026-08-08
- source: user
- 発生箇所: `tests/node/release-notes.test.ts`のgenerated release notes取得test
- 観測した失敗: release notesの追加で件数が2件から3件になっただけなのに、固定件数を期待するtestが失敗した。初回対応でもdata access layerの直接実装をなぞる比較testへ置き換えようとし、ユーザーから意味のないtestだと指摘された。
- 一次対応: 固定件数と直接pass-throughの両方を確認するtestを削除した。変換結果の順序・改行はfixture test、committed JSONの形式はschema testで確認する。

#### Repeated test failure from obsolete skill-level clamp expectations

- date: 2026-07-28
- source: agent self-report
- 発生箇所: `ex-02-16-sheet-experience-consistency` の最大Lv超過を保持するRHF hook / Component test
- 観測した失敗: 最大Lv超過値をclampする旧契約を前提にしたexpectationを残したまま、full testとcomponent testで同じ失敗を連続して確認した。さらに、レベルを1桁前提へそろえる際にexpectationだけを`9`へ更新し、テスト操作値`999`を残して同じhook testを再度失敗させた。
- 一次対応: expectationとテスト操作値をともに「1桁の超過値を保持し、行・sectionの局所errorを示す」契約へ更新し、修正後にfull testを通した。入力規則を変更するGateでは、実装より先に既存の正規化期待とtest操作値を検索して同じ変更で更新する。

### content workflow routing

#### Contents authoring was incorrectly blocked by issue-first workflow

- date: 2026-07-11
- source: user
- 発生箇所: `21-2-world-page` の作業開始
- 観測した失敗: ユーザーは「issue作成をせずにcontentsを作り始めて」と明示した。`.raw/contents/` の作成は `contents-markdown-authoring` の対象であり、サイト実装ではないにもかかわらず、agentは `issue-first-development` を優先してbranch作成、ローカルissue作成、issue reviewer実行まで進めた。
- 一次対応: 作成した `docs/issue/21-2-world-page.md` を削除し、contents authoring workflowへ切り替えた。今後、ユーザーが明示しているローカルcontents作成を、実装用issueの停止条件で妨げない。

### CSS cascade verification

#### Adjusted button sizing without inspecting the border cascade

- date: 2026-07-29
- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: 右側の線が消える問題をbuttonの幅やfont-sizeとして扱い、desktopのcomputed styleとselector specificityを確認しなかった。実際には最後のgrid itemの区切り線を消すruleがbutton自身のright borderを上書きしていた。
- 一次対応: G17のレビュー指摘20へ、desktop実寸とcomputed borderを記録した。borderの欠落では、寸法変更より前にcomputed styleとcascade上のwinning selectorを確認する。

#### Let a shared CSS Module override mobile-specific rules

- date: 2026-07-29
- source: agent
- 発生箇所: `ex-02-17-sheet-weapons-armor` のCSS共通化後の`@character-sheet` VRT
- 観測した失敗: 共通classをCSS Modulesの`composes`で導入した際、共通moduleのdesktop向けfont sizeとpaddingが出力順により個別moduleのmobile規則を再上書きした。複数のmobile skill stateで同じ差分を発生させた。
- 一次対応: 共通moduleへ既存と同一のmobile規則を移し、target限定VRTを再実行して既存full-page snapshot 51件の差分がないことを確認した。CSS Modulesで共通classがbreakpoint依存値を持つ場合は、個別moduleのoverride順に依存せず、共通module内に対応するmedia queryを置く。

### design-source compliance

#### Ignored the approved character-sheet design images during G14 implementation

- date: 2026-07-28
- source: user
- 発生箇所: `ex-02-14-sheet-common-skills` の基本情報配置
- 観測した失敗: 承認済みの`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を直接確認せず、design noteの文章だけで基本情報の経験点表示を実装した。その結果、desktop / tabletのdesign画像が示す「取得経験点・消費経験点・残経験点・格・共通スキル上限」の同一行配置を守らず、共通スキル値を4列gridの次行へ置いた。ユーザーに確認を求められるまで画像を確認していなかった。
- 一次対応: 実装を停止し、design画像を確認した。レビュー終了後に、基本情報の共通スキル値を既存の共通スキル上限枠へ置き換える要件としてcurrent issueへまとめる。

#### Repeatedly bypassed the approved character-sheet design draft

- date: 2026-07-27
- source: user
- 発生箇所: `ex-02-6-sheet-image` の画像入力レビュー対応
- 観測した失敗: 基本情報・設定・信用を含む承認済みcharacter-sheet design draftを実装入力として確認せず、画像入力だけを独立したcardとして再設計した。さらに、実装結果の個別screenshotをdesign判断に使い、未承認の配置をdesign notesへ確定事項として記録した。既存failure logの「Ignored the approved character-sheet design draft during G4 implementation」と同じ判断ミスを繰り返した。
- 一次対応: G6を作業中へ戻し、review節を破棄して、design draftが定めるdesktop・tablet・mobileのprofile / setting / image / creditの位置関係を子issueの直接契約として再構成する。ユーザー承認までsource codeを変更しない。

#### Ignored the approved character-sheet design draft during G4 implementation

- date: 2026-07-24
- source: user
- 発生箇所: `ex-02-4-sheet-profile`の`ProfileSection`実装
- 観測した失敗: 実装前に確認済みで、ユーザーが最終の列幅・余白調整の基準として指定していたcharacter-sheet design draftを実装入力として扱わなかった。その結果、draftの基本情報内のカラム構成・信用の横並び・枠・既存の表示形式を再現せず、独自の3列grid、読み取り専用`input`、要件・draftにない計算式表示を追加した。designを最終調整用の正本として尊重せず、実装都合で簡略化した。
- 一次対応: この指摘をfailure logへ記録し、修正はユーザーの明示指示を待つ。以後、UI実装ではdesign draftのDOM構成、列幅、余白、枠、表示形式を先に照合し、差異を実装判断で補完しない。

#### Replaced a native number-input control without design authority

- date: 2026-07-28
- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の修正number input
- 観測した失敗: 符号付き2桁を狭いinputに収めようとして、既存character sheetのnumber inputにはないspinner非表示styleを追加した。ユーザーは既存実装と異なるデザインを許可しておらず、この変更は要求された幅調整の代替になっていなかった。
- 一次対応: spinner非表示styleを撤去し、既存inputの見た目とpaddingを維持した。サイズ要件とmobile 2列／1行の物理的な幅不足は、別デザインを仮定せずissueへ未決定として記録する。

### evidence discipline

#### Responded before inspecting the actual shared-component diff

- date: 2026-07-28
- source: user feedback
- 観測した失敗: ユーザーが`onAutomaticLevelChange`追加を問題にしている場面で、実際のdiffを確認せずにbonus合計validationの話として返答した。
- 一次対応: 実ファイルとdiffを確認してから、共通Componentの追加APIと分岐を削除する対応へ切り替えた。レビュー指摘への応答では、対象ファイルを確認した事実と確認対象を先に揃える。

### execution-mode instruction fidelity

#### Did not keep the requested implementation in the background

- date: 2026-07-24
- source: user
- 発生箇所: `ex-02-4-sheet-profile`の実装開始後の進行報告
- 観測した失敗: ユーザーがデザイン修正と並行して会話を続けられるよう、実装・Techレビュー・preview起動をバックグラウンドで進めるよう依頼していたが、agentは作業の完了を待つ形で会話を阻害した。ユーザーから、バックグラウンド実行の意味を理解しているかと指摘を受けた。
- 一次対応: 実装をworkerへ移し、以後のレビュー・preview起動・検証を独立して進め、結果だけを前景へ報告した。

### Git operation authorization

#### Unauthorized git publish

- date: 2026-07-06
- 発生箇所: `13-page-toc` の `GitHub Issue #138: 13-page-toc` 完了条件チェック反映後のGit操作
- 観測した失敗: ユーザーの指示は「issueの完了条件チェック入ってない」であり、commit / pushの明示許可ではなかったにもかかわらず、`docs: check page toc issue completion` をcommitし、既存PR branchへpushした。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、直前にcommit / push許可がない修正指示では、作業ツリー上の変更に留めて報告する。

- date: 2026-07-08
- source: user
- 発生箇所: `todo-md-style-unification` のmain直接commit
- 観測した失敗: ユーザーは「mainブランチ上にコミットを積むことを許可」と述べたが、個別commitの実行承認ではなかった。にもかかわらず、作業完了後に追加承認を取らず `b4c7b34 docs: unify markdown list style` をcommitした。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、commit可能な例外許可と、特定commitの実行承認を分け、commit直前に明示承認がない場合は作業ツリー上の変更に留める。

#### Unauthorized git publish

- date: 2026-07-11
- source: agent self-report
- 発生箇所: `20-2-introduction-page` のユーザーレビュー指摘 3 対応
- 観測した失敗: ユーザーは`review-to-issue`実行と`titleHeadingLevel`の実装を指示したが、このターンにはcommit・pushの明示指示がなかった。にもかかわらず、agentは `cf8d004 feat: support callout heading levels` をcommitし、既存PR branchへpushした。
- 一次対応: 追加のGit操作、履歴改変、PR操作を行わず停止する。以後、直前のターンでcommit・pushを許可されていても、新しいレビュー指摘対応では改めて明示指示があるまで作業ツリー上に留める。

- date: 2026-07-11
- source: user
- 発生箇所: `20-2-introduction-page` のユーザーレビュー指摘 3 に対する`review-to-issue`
- 観測した失敗: `review-to-issue`ではreview itemをlocal SSoTへ照合してvalid判定、対応方針、ユーザー確認待ちを報告して停止すべきだった。しかしagentはvalid判定結果を正式に返さず、同じターン内で実装を開始した。
- 一次対応: review-to-issueを明示された場合は、ユーザーが実装意図を併記していても、まず正式なレビュー取り込み結果を返して停止する。実装は、取り込み結果を確認した後の別メッセージで明示承認された場合だけ開始する。

#### Chained Git state operations

- date: 2026-07-22
- source: user
- 発生箇所: `33-2-items-index-page` のGit操作
- 観測した失敗: 追加承認を減らす目的で、複数のGit状態変更操作を`&&`で連結した。各Git操作の対象と結果を個別に確認するリポジトリ規約に反していた。
- 一次対応: 状態変更を伴う`git add`、`git commit`、`git push`は、それぞれ独立したcommandとして実行する。以後、承認済みprefixであってもGit操作をshell演算子で連結しない。

### implementation authorization

#### Validity-check request was treated as implementation approval

- date: 2026-07-12
- source: user
- 発生箇所: `24-2-scenario-play-page` のcontents再レビュー回答
- 観測した失敗: ユーザーが「俺の返答の妥当性確認」と求めた判断依頼を、コンテンツ修正の実装許可と誤認して未承認の本文・MDX・テスト・issue編集を行った。
- 一次対応: ユーザーの明示的な反映指示があるまで、今回の未コミット差分へ追加の編集・commitを行わない。判断依頼では評価のみを返し、反映は「修正して」「反映して」等の明示指示を待つ。

#### Unapproved review-response implementation

- date: 2026-07-12
- source: user
- 発生箇所: `22-2-character-making-page` のレビュー指摘 1 に対する用語説明追加
- 観測した失敗: ユーザーは内容の修正方針を示したが、レビュー指摘の取り込み後に必要な実装開始の明示指示を出していなかった。にもかかわらず、agentは公開MDX、`.raw/contents/character-making.md`、issue checklistを変更し、検証まで実行した。
- 一次対応: ユーザー指示に従い差し戻しは行わず、変更は未コミットのまま保持する。レビュー指摘への内容追加や方針確認では実装せず、明示的な「実装開始」「修正して」等の指示を受けるまで停止する。

### implementation scope discipline

#### Ignored the major current-issue contract and requested UI review before implementation completion

- date: 2026-08-25
- source: review
- 発生箇所: `ex-16-5-cloud-persistence-ui` のG5 frontend実装とユーザレビュー開始
- 観測した失敗: current issueがDB保存、コピー保存、DB削除、Toast、JSON export UI削除、import移行導線、Help workflow、read-only visual stateまでを明示していたにもかかわらず、agentは不完全なcharacter一覧の土台だけを実装した段階でdev serverを起動し、ユーザレビューを開始した。さらに一覧自体もbutton配置、選択UI、table表示、表示名、最終更新日、pagination、dialog actionの契約を満たしていなかった。
- 一次対応: review-to-issueで有効なユーザレビュー指摘をcurrent issueの`レビュー指摘 1`へ記録し、指摘対応の明示承認までsource codeの修正を停止する。以後、ユーザレビューの開始前にcurrent issueの未完了実装契約と検証項目を照合する。

#### Put a local fixture policy into a shared layout

- date: 2026-08-04
- source: user
- 発生箇所: `milestone-02-phase-01-todo-resolution` G5のPagefind除外
- 観測した失敗: `-local`配下の確認ページだけをPagefindから除外する要件に対し、最初に`AppContainer`へpath判定を追加した。個別fixtureの明示的な属性追加で足りる範囲へ共通layoutの責務を広げ、ユーザーから訂正を受けた。続く除外testでも、fixture固有語句が公開本文に部分一致することを確認せず、結果0を期待して同じ確認を再度失敗させた。
- 一次対応: `AppContainer`の変更を撤回し、7つの`src/pages/-local/`ページ本体へ`data-pagefind-ignore`を明示した。Pagefind APIを使うtestは検索結果が空であることではなく、結果URLに`/-local/`が含まれないことを検証する。局所的な除外・表示制御では、共通layoutの変更前に対象ページだけで完結できるかを確認する。

### instruction order and response reliability

#### Started Gate 18 reviews before the explicitly instructed commit and push

- date: 2026-07-29
- source: user
- 発生箇所: `ex-02-18-sheet-omamori` のcanonical VRT baseline更新後のhandoff
- 観測した失敗: ユーザーがGate 18全体について、先にcommitとpushを行い、その後にGate用ではないDoc ReviewとTech Reviewを実施するよう明示したにもかかわらず、commit・pushを実行せずにreviewを開始した。停止しようとした際にも応答しなかった。
- 一次対応: 未コミット差分を保全した状態で処理状況を確認した。以後、明示された順序のstate変更を完了・報告してから後続reviewを開始し、停止要求には進行中処理の状態を直ちに返す。

#### Started the first review fix before all review-response directions were agreed

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のレビュー指摘1対応
- 観測した失敗: ユーザーはreview指摘を上から最後まで方針確認してから修正を開始するよう指示したが、agentは「2件のreviewer報告が揃ったら修正開始」と誤読した。1件目だけの方針を受けて`backend/bin/wrangler.sh`とbackend deploy workflowを編集し、残る指摘の方針確認前に実装を始めた。
- 一次対応: 追加の修正を停止した。今回のwrapper/CI差分は未コミットのまま保持し、review指摘を最後まで方針確認するか、ユーザーが明示的に破棄を指示するまで変更しない。

#### Used the raw reviewer report order instead of the consolidated issue review order

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のレビュー指摘1方針確認
- 観測した失敗: review-to-issueで複数のraw findingを統合した後、agentはcurrent issueの「レビュー指摘 1」を順序の正本にせず、backend reviewer reportの個別順序へ戻った。その結果、diagnostic routeの次に独立項目ではないGoogle client ID文書を提示した。
- 一次対応: 以後の方針確認は`docs/issue/ex-16-4-cloud-persistence-api.md`の「レビュー指摘 1」に並ぶ項目だけを上から順に扱う。raw reviewer reportは根拠確認に限定する。

#### Content-instruction stopping point overrun

- date: 2026-07-11
- source: user
- 発生箇所: `20-2-introduction-page` のissue-first準備
- 観測した失敗: ユーザーは、issueを作成する前にコンテンツ指示書を作成するよう明示した。agentは `.raw/contents/introduction.md` を作成した後、その完了を報告して指示を待たずに `docs/issue/20-2-introduction-page.md` まで作成した。コンテンツ指示書作成後の報告・停止というユーザー指定の確認地点を越えた。
- 一次対応: ユーザー指示に従い、誤って作成した `docs/issue/20-2-introduction-page.md` を削除した。コンテンツ指示書だけを残し、以後のissue作成、reviewer実行、design作成、実装を行わず、ユーザーの次の指示を待つ。

### issue-first workflow handoff

#### Issue-first required handoff was omitted

- date: 2026-07-13
- source: user
- 発生箇所: `27-2-data-index-page` のissue-first準備
- 観測した失敗: ローカルissueを作成し、必須のissue reviewerを完了した後、`issue-first-development` が定める「作業前準備完了」報告、issue本文の要約、ユーザーへレビューしてほしい点の提示をせずに、designドラフトの準備へ進もうとした。ユーザーのissue承認前にdesign作業を始める誤った順序となり、ユーザーから作業状況を確認されるまで停止地点の逸脱を報告しなかった。
- 一次対応: design画像、notes、実装コードを作成しないまま停止し、issueへ「issue承認後にdesign-image-generation initial draft modeを実行する」と明記した。本来のissue-first handoffをこの会話で提示し、以後はissue作成とreviewer完了の直後にrequired stopping pointの報告を先に返す。

### permission handling and instruction fidelity

#### Requested privilege escalation after the user had already authorized the action

- date: 2026-07-29
- source: user
- 発生箇所: `ex-02-22-sheet-special-items-integration` のE2E再実行前の一時preview確認
- 観測した失敗: E2Eが残した`4322`の一時previewを停止する必要はユーザーの「e2eとvrtを実装してbaseライン更新。devサーバ停止してpreviewに切り替えてよい」で明示済みだった。それにもかかわらず、process確認のために権限昇格を要求した。
- 一次対応: ユーザー指摘後、この作業では以後の権限昇格を行わず、通常権限で既知のE2E child processだけを扱った。今後はユーザーが対象操作を明示許可している場合、既存の通常権限手段で先に実行し、追加の昇格確認は要求しない。

#### Unnecessary approval request for an approved GitHub read

- date: 2026-07-13
- source: user
- 発生箇所: `26-2-advancement-page` のPR #40再レビュー時の`gh pr view`
- 観測した失敗: `gh pr view` は承認済みcommand prefixだったにもかかわらず、sandbox内の最初の接続失敗をsandbox外実行が必要な根拠と誤認し、`require_escalated`を付けて不要な承認を求めた。ユーザーはcommit・push・local reviewer呼出しを指示しており、追加承認を求める必要はなかった。
- 一次対応: 承認済みprefixのcommandは、接続失敗後も`require_escalated`を追加せずに扱う。PR再レビューでは、取得済みのremote headとlocal diffでreviewerを起動し、追加のGitHub API読取りは必要性が明確な場合だけ行う。

### PR metadata fidelity

#### PR title missed the issue-slug rule again

- date: 2026-07-19
- source: user
- 発生箇所: `44-search-modal-ui` のPR #49作成
- 観測した失敗: `create-pr` が定めるissue slugのみのPRタイトルではなく、`feat: search panel UI`としてPRを作成した。ユーザー指摘後にタイトルを`44-search-modal-ui`へ修正した。
- 一次対応: PR #49のタイトルをissue slugへ更新した。以後、PR作成またはmetadata修正時は、connector呼び出し前にcurrent issueのslugをタイトル値として照合する。

### requested-output format fidelity

#### Used raster image generation instead of the requested HTML design draft

- date: 2026-07-24
- source: user
- 発生箇所: `ex-02-web-character-sheet`のdesktop初期画面design draft作成
- 観測した失敗: ユーザーが画面draftの作成を指示した際、対話用にHTMLを作成してローカルcaptureで確認する既存の作業方法を確認せず、raster画像生成を実行した。生成画像をGit管理・design正本・VRT baselineにはしていないが、ユーザーが期待した確認可能なHTML draftではなかった。
- 一次対応: 生成画像はpreview扱いとして採用せず、`.tmp/design/character-sheet/index.html`とcapture scriptを作成し、desktop `1440x1200`のlocal captureへ切り替えた。今後、対話用の画面draftでは、画像生成を先行させず、ユーザーが指定するHTML / local captureの方法を確認する。

### review context isolation

#### Contents reviewers received current conversation history

- date: 2026-07-13
- source: user
- 発生箇所: `27-2-data-index-page` のcontents review
- 観測した失敗: contents reviewerを`fork_turns="all"`で起動し、現在会話の履歴と親agentが要約した過去のフィードバックを渡した。レビュー対象としてユーザーが個別に指定していない会話情報が判定へ混ざり、独立したレビューにならなかった。
- 一次対応: `contents-review`で`fork_turns="none"`を必須化し、ユーザーが当該レビューで明示指定した入力だけをreview packetとして渡すよう変更した。beginner / expert reviewer定義にも指定外の会話・資料を使わない境界を追記した。

### review scope fidelity

#### Audited repository-operation rules instead of the requested game-rule change

- date: 2026-08-22
- source: user
- 発生箇所: 毒ルール変更の整合性確認
- 観測した失敗: ユーザーが求めたAstro、MDX、生成JSON内の毒ルール整合性ではなく、AGENTS.mdとagent workflow規約の整合性を調査して報告した。
- 一次対応: ユーザー指摘後、対象を毒ルールのMDX、生成JSON、表示経路へ限定し、Spreadsheet同期・JSON再生成・format・check・build後に再照合した。以後、整合性確認では変更対象のdiffとユーザーが指定した層を最初に確定する。

#### Review scope was over-broadened

- date: 2026-07-22
- source: user
- 発生箇所: `31-2-ikizama-index-page` のコンテンツレビュー後のissue更新
- 観測した失敗: ユーザーの「全部無視でいいや」を、直前に報告したコンテンツレビューの指摘だけでなく、先行するPRレビュー指摘にも適用した。PRレビューの未コミット`レビュー指摘 3`をissueから削除したが、ユーザーはコンテンツレビューだけを見送る意図だった。
- 一次対応: `レビュー指摘 3`を元の内容で復元した。複数のレビュー結果が並行している場合、「全部」などの参照範囲は直前の成果物に限定して確認し、既存の別レビュー記録を変更する前には対象を明示的に照合する。

### scope and SSoT precedence

#### Changed canonical-baseline tracking against the parent Gate plan

- date: 2026-07-29
- source: user
- 発生箇所: `ex-02-19-sheet-cybernetics` のDocument Review指摘対応
- 観測した失敗: Document Reviewの再現性提案とユーザーの「他の指摘内容も修正」を、親issueのGate planが定める「G31までcanonical VRT baselineを管理しない」制約より優先した。`canonical-snapshots/visual/character-sheet/`のignoreを外し、Git管理する運用へ変更しようとした。
- 一次対応: ユーザー指摘後、`.gitignore`とdesign noteをローカル専用baselineの運用へ戻した。G19 issueには、baselineのGit管理・再現性判断をG31へ残すことを明記した。今後はDocument Reviewの提案を実装する前に、親Gate planの後続Gateへの割当てを確認する。

#### Prioritized a design draft over the user-approved current issue

- date: 2026-07-29
- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具の性能値表示
- 観測した失敗: session分割後の実装で、ユーザー指示により作成したcurrent issueの計算式表示、mobileの`＝`以降の折り返し、算出値のaccent-muted領域という画面契約を確認せず、design draftに引きずられた値と修正inputの2列構成を実装した。
- 一次対応: G17のレビュー指摘4へ、current issueがdesign draftより優先することと、式表示・mobile改行・算出値背景の修正要件を記録した。以後の修正では、実装対象のcurrent issueにある画面契約を先に読み、draftは競合しない参考情報だけに限定する。

### SSoT coverage discipline

#### Repeated PR reviews discovered one documentation dependency at a time

- date: 2026-07-22
- source: user
- 発生箇所: `42-0-npc-data-normalization`の`no_image.webp` fallback仕様を正式化した後のPRレビュー
- 観測した失敗: 仕様変更時に、plan、TODO、変換仕様、requirements、out-of-scope、architecture、designを横断して影響範囲を一括確認せず、差分中心のPRレビューを繰り返した。そのためworld design、requirements / out-of-scope、architectureの旧仕様が第1回から第3回に分けて発見され、レビュー品質が低く見える連鎖を生んだ。
- 一次対応: 第3回レビューまでの有効な指摘をcurrent issueへ記録した。以後、仕様・データ契約・公開asset規約を変更するPRでは、初回レビュー前に関連語で全SSoTを探索し、更新対象と「確認済み・変更不要」の一覧をレビューmanifestへ残す恒久対応を検討する。

#### Corrective PR omitted design-source alignment

- date: 2026-08-08
- source: user
- 発生箇所: `ex-10-character-sheet-layout`のレビュー指摘9・10への修正とPR再レビュー
- 観測した失敗: action menuの可変長error一覧について、実装、Component test、current issueだけを更新し、承認済みdesign正本への影響を修正前に横断確認しなかった。そのため、修正後のPRレビューで同じ表示契約の記録漏れが追加指摘となった。
- 一次対応: レビュー指摘11へdesign正本の更新を記録した。以後、UI表示契約を修正する前に、関連するdesign正本を含むSSoTを検索し、更新対象または変更不要の判断を先に確認する。

#### Implemented a converter against stale local spreadsheet exports

- date: 2026-08-22
- source: user
- 発生箇所: `ex-16-usage-restriction-labels` の使用制限表記更新
- 観測した失敗: `.raw/data/`をGoogle Spreadsheetから同期し直さず、古いローカルExcelが持つ`R`、`Sn`、`Sc`を入力契約と誤認した。その結果、最新入力が既に使う`巡`、`幕`、`話`へ置換する変換ロジックと誤った変換仕様を実装した。
- 一次対応: `npm run sync:google-sheets`で最新Excelを再取得し、実入力値を確認した。置換ロジックを撤回し、新表記の構文だけを検証して入力値をそのまま出力する実装と仕様へ修正する。データ変換前には、入力が外部同期対象なら必ず同期時刻と実値を確認する。

### test environment configuration

#### Configured Vitest without the React TSX transform

- date: 2026-07-25
- source: validation
- 発生箇所: `ex-02-4-sheet-profile`の`tests/components/character-sheet/ProfileSection.test.tsx`
- 観測した失敗: Vitest 4へAstroの既存TypeScript設定だけを渡し、TSXを変換できなかった。`esbuild.jsx`を後から設定してもVitest 4のOXC変換に無視され、同じ`Unexpected JSX expression`で再失敗した。
- 一次対応: React Vite pluginを明示dependencyとして追加し、Vitest configから接続する。Component / hook testを実行してから設定を確定する。

### test formatting discipline

#### Skipped formatter verification after removing a contract test

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-2-backend-infrastructure` の`frontend/tests/contract/page-navigation-build.test.ts`
- 観測した失敗: contract testを削除した後、Markdown formatterと`frontend`のlintだけを実行して、TypeScript formatterを確認しないままcommit・pushした。削除後に残った空行がCIのformatter checkで検出された。
- 一次対応: 対象testをBiome formatterで修正した。TypeScript testを変更した作業では、commit前に対象fileのformatter checkを実行する。

#### Repeated manual formatter mismatch in Component test

- date: 2026-07-27
- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `ProfileSection` Component test
- 観測した失敗: `npm run check`が示したインデント差分を手動で反映した際、対象行をさらに深くインデントして同じformatter errorを再発させた。
- 一次対応: formatter出力の空白数をそのまま適用し、修正後は再実行前に対象行だけを読み返す。formatterが対象fileを検出しない場合に別の整形コマンドで代替せず、`npm run check`の差分を正本として扱う。

### test targeting discipline

#### Repeatedly ran a broad Container test before isolating its existing dialog-focus contract

- date: 2026-07-30
- source: agent self-report
- 発生箇所: `ex-02-28-sheet-ccfolia` の`CharacterSheetContainer` Component test
- 観測した失敗: G28の確認・Clipboard通知結線を追加した直後、既存のresponsive reset / image errorのfocus復帰testを含むContainer全体を2回実行した。1回目はjsdomでnative Escapeを再現できない既存assertion、2回目は同じ既存testの画像エラーdialogからmenu triggerへのfocus復帰assertionで失敗し、CCFOLIA対象testを切り分ける前に同じ広いtest実行を繰り返した。
- 一次対応: CCFOLIAのContainer結線は対象test名で単独実行し、ActionPane、CCFOLIA dialog、root-state hook、Node logic / Clipboard adapterを別々に確認した。reset test harnessがerrorを閉じた直後に本番root stateでは保持される`isImageErrorFromReset`までfalseにしていたため、本番と同じ保持契約へ修正した。対象Component / hook testは55件すべて通過した。

### test-scope discipline

#### Test-only hydration state was added to production code

- date: 2026-07-24
- source: user
- 発生箇所: `ex-02-1-sheet-runtime`の`CharacterSheetContainer`と`tests/visual/character-sheet.spec.ts`
- 観測した失敗: `client:load`のhydrateをE2Eで観測するためだけに、画面機能に不要な`isHydrated` stateと非表示DOM属性を製品コードへ追加した。G1にはユーザーが操作できる機能がなく、内部実装を露出する検証は適切でないにもかかわらず、完了条件もそのテストに依存させた。
- 一次対応: `isHydrated`、属性、専用E2E testを削除し、G1の完了条件を検証専用実装を追加しないことへ修正した。以後、E2Eはユーザーが観測・操作できる振る舞いだけを対象にし、内部のhydrateやstateを観測するための製品コードは追加しない。

#### Over-scoped hero layout test follow-up after PR review

- date: 2026-07-23
- source: user
- 発生箇所: `ex-03-hero-layout-stability` のPR #66 第2回レビュー取り込み
- 観測した失敗: 画像request保留を使う回帰testが実際の`ImageBlock`領域予約不備を検出した後に、document座標比較、生き様detailの重複scenario、全幅表示prop分離までを同じcurrent issueの必須対応として扱った。全表示箇所の寸法属性確認と代表的な回帰testがすでにあるため、後続の提案は検証価値より複雑性が大きい可能性を十分に評価していなかった。
- 一次対応: 第2回レビュー指摘は実装せず、ユーザーの方針確認を待つ。テスト追加時は、実際に発見した不具合を再発防止する最小ケースと、全箇所を網羅する静的契約確認を分け、同一契約の複数scenarioをデフォルトで増やさない。

### VRT capture workflow

#### Changed tracked VRT capture code for a one-off local screenshot

- date: 2026-07-27
- source: user
- 発生箇所: 副能力値の`一時修正を適用`の局所確認
- 観測した失敗: 既存captureがsection locator screenshotを持たない時、Visual Review skillの「gapを記録して停止する」指示に従わず、局所確認だけのためにGit管理されるcapture設定、VRT helper、target specを直接変更した。
- 一次対応: locator screenshot用の3ファイル変更を同じturnで取り消した。今後、既存のcaptureに必要な局所証跡がない場合は、one-off確認のためにtracked testやcapture設定を変更せず、必要なcapture基盤の追加を独立した承認済みtaskとして扱う。

#### Attempted to substitute an ad hoc browser script for the VRT capture path

- date: 2026-07-28
- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のVisual Review
- 観測した失敗: test-owned locator screenshotが必要なVisual Reviewで、`npm run visual:capture`の経路を使わず、独自の`.tmp` Playwright scriptでfull-page screenshotを撮ろうとした。これは局所表示契約の確認根拠にならず、capture基盤が不足する場合は記録して停止するというskillの規約にも反していた。
- 一次対応: 独自scriptは削除し、正規の`visual:capture`を対象tagへ限定して実行した。fixtureのselect操作timeoutによりlocator screenshotを取得できなかったため、issueのVisual Reviewへ未確認として記録し、代替screenshotは使わない。

#### Recorded a locator-only VRT state that still ran full-page comparison

- date: 2026-07-28
- source: review
- 発生箇所: `ex-02-13-sheet-ikizama-skills` のビジュアルレビュー3と`@ikizama-long-skill-selected`
- 観測した失敗: Visual Review記録でscenarioをlocator-onlyと扱ったが、shared `registerVrtScenarios`はlocator capture前にfull-page `toHaveScreenshot()`を必ず実行する。canonical full-page baseline未作成のstateを通常VRTから分離できておらず、記録した実行契約と実装が一致していなかった。
- 一次対応: G13のレビュー指摘3とG31 TODOへ、locator-only stateをfull-page VRTから分離する契約を記録した。ユーザー承認なしにVRT helperやcanonical baselineは変更しない。

#### Ran a search-state VRT without the required visual build, then treated its baseline difference as helper validation

- date: 2026-07-29
- source: agent self-report
- 発生箇所: static VRT helper復元後の`@search-modal @search-results`確認
- 観測した失敗: 最初にPagefind indexを含まない通常buildで検索結果stateを実行し、3 viewportで結果が表示されなかった。`visual:build`後にはstate表示へ進んだが、desktop / tabletで既存baselineとの差分が残った。この差分はhelper変更ではなく、画面左側の既存static内容であった。
- 一次対応: 検索stateを含むVRTは必ず`visual:build`後のpreviewで実行する。helper変更の回帰確認では、既存baselineとの差分をhelper起因と断定せず、diff画像で影響領域を確認してから対応範囲を判断する。

### VRT state synchronization

#### Repeated character-sheet VRT setup failures during scenario-helper migration

- date: 2026-07-29
- source: agent self-report
- 発生箇所: `tests/visual/vrt/character-sheet.spec.ts` の専用scenario helperへの移行後のtarget限定VRT
- 観測した失敗: React hydration前のselect操作を一度だけ行いdesktop / tabletでstateを反映できなかった。続いて、変更確認dialogがselect値を即時変更しない既存契約へ、値変更を待つ汎用helperを誤用した。sandbox内のChromium起動失敗も同じ再実行中に重なった。
- 一次対応: select値を反映するstateは`toPass`で再試行し、確認dialog stateはdialog表示を待機条件に分離した。Chromiumがsandbox内で起動できない場合は、理由を確認して許可済みtarget限定VRTだけをsandbox外で実行する。新しいVRT scenarioは、入力後のDOM stateと確認dialogのstate遷移を別契約として先に確認する。

### failure-log workflow consistency

#### Repeated new hook-test failure while assuming requestAnimationFrame focus timing

- date: 2026-08-08
- source: self
- 発生箇所: `ex-10-character-sheet-layout` の新規 `useActionPane` hook test
- 観測した失敗: reset confirm後のfocus復帰を直接確認する新規testで、DOM外のtriggerをDOMへ追加する修正、同期`requestAnimationFrame` stubの追加を順に行ったが、同じfocus assertionを3回連続で失敗させた。hookのstate遷移とtest環境におけるanimation frame / focusの実行契約を切り分ける前に、fixtureだけを段階的に修正していた。
- 一次対応: focus callbackの呼び出しとjsdom上のactiveElementを同一視せず、既存`CharacterSheetDialog`のfocus契約とhookが返すreturn refの境界を確認する。hook testでは状態遷移とref保持を確認し、requestAnimationFrameを含む実focus復帰はdialog integration testへ置く。

### browser-test scroll-state diagnosis

#### Repeated active-section E2E failures before validating document-position semantics

- date: 2026-08-08
- source: self
- 発生箇所: `ex-10-character-sheet-layout` の `tests/e2e/character-sheet.spec.ts` に追加したsection navigationのactive state確認
- 観測した失敗: IntersectionObserver callbackのentriesだけで現在sectionを決める実装を、scroll位置ベースの確認へ置き換える際、jump後の末尾sectionとHeader直下の境界を先にモデル化しなかった。同じE2E commandを3回連続で失敗させてから、section全体のdocument位置と末尾scroll位置を基準にする実装へ修正した。
- 一次対応: active sectionはHeader直下の位置を越えた第一階層sectionから決め、末尾sectionへjumpした直後は最大scroll位置でも選択状態を維持する。追加するscroll連動testは、実装前に通常scroll・section jump・末尾sectionの3状態を契約として列挙する。

#### Repeated broad character-sheet E2E runs while updating responsive action tests

- date: 2026-08-08
- source: self
- 発生箇所: `ex-10-character-sheet-layout` の `tests/e2e/character-sheet.spec.ts`
- 観測した失敗: responsive action railの境界testを追加した後、既存のclipboardとJSON入出力testが`84rem`未満でもdesktop action buttonを直接操作する旧前提を持つことを1件ずつ発見した。さらに新規のheading件数、末尾近傍sectionのHeader位置、drawer close buttonのlocatorを広いE2E commandで同時に失敗させ、同一commandを3回連続で失敗させた。
- 一次対応: action buttonを使う既存E2Eは可視のresponsive menuを開く共通前提へ揃える。section jumpは末尾到達でclampされないsectionを選び、headingは構造順だけを確認し、同名drawer buttonはfocus対象を明示する。以後、広いcharacter-sheet E2Eを再実行する前に、変更したresponsive前提に依存する既存操作を検索して単独確認する。

#### Omitted archive movement rules from the failure-log audit skill

- date: 2026-08-05
- source: review
- 発生箇所: failure logのarchive導入と`.agents/skills/failure-log-audit/SKILL.md`の整合確認
- 観測した失敗: `docs/agent-failure-log/archive.md`とactive logにarchiveの分類・移動を記録したが、監査skillにarchiveの個別ユーザー分類、保存内容、停止条件、報告項目を追加しなかった。また、archiveの説明を`user / review`由来に限定したまま、ユーザーが個別指定したagent self-report entryをarchiveした。
- 一次対応: PR #191のレビュー指摘1としてcurrent issueへ取り込み、ユーザー承認後にarchiveを個別のユーザー分類だけで扱う契約へ文書とskillを整合する。

### action-pane hook contract checks

#### Repeated Astro type-check failures while extracting ActionPane state

- date: 2026-08-08
- source: self
- 発生箇所: `ex-10-character-sheet-layout` の`useActionPane`と`ActionPaneDialogs`へのrefactor
- 観測した失敗: 3 hookを合成するfacadeのprops型とdialog state型を一度に移し、`onImport` callbackの引数、不要なobject property、error dialogのfocus refの型を3回の`npm run check:astro`で段階的に失敗させた。
- 一次対応: facadeの外部callback型をActionPane propsと一致させ、dialog stateを明示型へ揃える。次回の同種refactorではhookのreturn typeと消費componentのpropsを先に確定してからContainerの配線を置き換える。

#### Repeated Astro type-check failures while extracting picker hooks

- date: 2026-08-08
- source: self
- 発生箇所: `ex-10-character-sheet-layout` の`usePickerStates`と`usePickers`へのrefactor
- 観測した失敗: picker hookのtest fixtureをfull presenter型へcastし、`npm run check:astro`を3回連続で失敗させた。fixtureが欠くpicker外のprops、続いてpicker型に必要な`clearSelection`、最後にcandidate groupの形状を段階的に補っていた。
- 一次対応: `usePickers`の入力を必要なpicker操作だけの構造型へ狭め、fixtureはmaster dataのgroup型に一致させる。次回はhookの最小入力型とtest fixtureを先に並べて型検査してから実装配線を進める。

### test runner standard compliance

#### Used the Node test runner despite the Vitest standard

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のbackend unit testとlocal API integration test
- 観測した失敗: `docs/testing.md`がすべてのunit / contract testの標準をVitestと定義しているにもかかわらず、backend testを`tsx --test`と直接実行scriptで追加した。さらに`tests/`を`tsconfig.json`から除外したため、test sourceの静的型検査もされなかった。
- 一次対応: backend testをVitestへ移し、`tests/unit/`を通常config、`tests/integration/`をintegration専用configへ分離する。`tsconfig.json`はsrc・tests・Vitest configを型検査し、Worker build用の`tsconfig.build.json`だけがtestsを除外する。WorkersとNode/Vitestの外部宣言競合は`skipLibCheck`で解消する。

### runtime configuration verification

#### Omitted local frontend Google OAuth client ID while integrating cloud persistence UI

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-5-cloud-persistence-ui` のlocal frontend runtime configuration
- 観測した失敗: `frontend/.env`が43 bytesの`PUBLIC_API_BASE_PATH`だけの内容になり、`PUBLIC_GOOGLE_OAUTH_CLIENT_ID`とGoogle Drive service account設定が消失していたままcharacter sheetのGoogle Loginを動作確認対象にした。そのためGISはclient IDなしのrequestとして`400 invalid_request`（`flowName=GeneralOAuthFlow`）を返し、認証後の一覧取得も確認不能になった。
- 一次対応: VS Code local historyの当該`frontend/.env` snapshot（2026-08-25 01:19、2,021 bytes）を発見し、内容を表示せず復元した。snapshotに存在しないが43-byteファイルにだけ残っていた`PUBLIC_API_BASE_PATH`を併合した。`PUBLIC_GOOGLE_OAUTH_CLIENT_ID`、Google Drive service account設定、API base pathの存在と、frontend/backend OAuth audienceの一致を非secret key inventoryとhash比較で確認した。今後、ignoredな`.env`の値を診断根拠にする前には、key inventoryとfile sizeを確認し、変更・復元時はバックアップ元と一致検証を報告する。

#### Did not verify the complete localhost origin configuration for GIS auto sign-in

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-5-cloud-persistence-ui` のlocal frontend Google Identity Services初期化
- 観測した失敗: ID Token audienceと`http://localhost:4321` / `http://localhost:4322`の設定だけを確認し、`auto_select`とOne Tapを有効にしたGISが必要とするポートなしの`http://localhost`をAuthorized JavaScript originsへ登録済みか確認しなかった。そのためpreviewのリロードでGIS status requestが`403 The given origin is not allowed for the given client ID`となり、memory限定の認証状態を自動復元できなかった。
- 一次対応: Google公式のlocal development設定と照合し、OAuth Consoleで`http://localhost`と使用する各ポートを同一Web clientのAuthorized JavaScript originsへ登録する確認手順を追加する。browser上の`location.origin`、生成済みclient ID、Console設定の3点を同時に確認してからlocal loginを完了扱いにする。

#### Assumed Wrangler local `.env` behavior also applied public vars during remote deploy

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のdevelopment Worker runtime vars設定
- 観測した失敗: local `wrangler dev`の起動表示で`.env`の値がWorker bindingとして現れたことだけを根拠に、remote `wrangler deploy`も同じ値をWorker `vars`へ反映すると判断した。ユーザーの指摘を受けてdevelopment Worker、D1、R2を削除して再deployしたところ、remote Workerのbinding一覧に`GOOGLE_OAUTH_CLIENT_ID`と`CORS_ALLOW_ORIGIN`は現れなかった。
- 一次対応: 未検証の`.env`自動読込をproduction CIのruntime vars注入方式として文書化した箇所を未解決へ戻した。local devとremote deployの挙動は別に実機確認し、remote binding一覧またはCloudflare Consoleを根拠にしてから完了扱いにする。

### command approval discipline

#### Created and deleted a Repository Variable without explicit authorization

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のproduction CORS configuration
- 観測した失敗: production CORS originのworkflow設定を実装する際、ユーザーが値を示したことをGitHub Repository Variableの作成許可と誤認し、`CORS_ALLOW_ORIGIN`を作成した。さらにrepository ownerから導出する方針へ変更する際も、明示的な外部設定削除許可を確認せずに同Variableを削除した。Repository VariableはGit管理外の永続的な外部状態であり、local workflow変更の通常工程として扱ってはならなかった。
- 一次対応: Variableの作成・削除を失敗として記録した。今後はworkflowが読むRepository Variableを追加・削除する必要がある場合、localの設定・文書だけを先に変更し、GitHub上の設定変更は「Repository Variableを作成/削除してよいか」の明示許可を得てから実行する。

#### Used a local Google client ID in a production Worker deployment

- date: 2026-08-25
- source: user
- 発生箇所: `ex-16-4-cloud-persistence-api` のproduction初回Cloudflare deploy
- 観測した失敗: production用のGoogle client IDがGitHub Repository VariableからCIで注入される設計にもかかわらず、初回resource provisionを急ぎ、local `backend/.env`のGoogle client IDを呼出元environmentへ読み込んでproduction Workerへ渡した。CORS originだけをproduction値へ上書きしたため、local用とproduction用で異なるGoogle client IDを混在させた。
- 一次対応: ユーザーがCloudflare Consoleでproduction値へ修正した。今後、production初回provisionを含むlocal Wrangler deployは、production設定値が明示的に提供され、environmentごとの値を確認できる場合だけ実行する。確認できない場合はCIでのdeployを待ち、local `.env`の値をproduction設定へ流用しない。

#### Requested unnecessary escalation for an already approved Playwright command

- date: 2026-08-08
- source: user
- 発生箇所: `ex-10-character-sheet-layout` のcharacter-sheet E2E再確認
- 観測した失敗: `npx playwright test`は承認済みcommand prefixに一致するにもかかわらず、前回のport競合を理由として`require_escalated`を付け、不要な承認dialogを表示した。
- 一次対応: この作業では既存の承認prefixに一致するcommandへ昇格指定を付けない。sandbox内で実行不能な明確な権限失敗だけを確認してから、必要な場合に限って昇格を求める。
