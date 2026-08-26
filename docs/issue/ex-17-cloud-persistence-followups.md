# ex-17-cloud-persistence-followups

## 目的

ex-16のCloud Persistence実装をproduction deploy可能な状態でcloseできるよう、残る耐障害性、API payload contract、Public E2E、運用文書を整備し、最終的なarchive条件を満たす。

## 背景

`docs/TODO.md`のex-17は、ex-16で実装済みのFirebase Authentication、Cloudflare Worker/D1/R2、character一覧を前提に、実装不備と運用・文書の残課題を回収する。

関連する正本:

- `docs/TODO.md`の`ex-17: ex-16 Cloud Persistence残課題回収`
- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/design/character-sheet/notes.md`
- `docs/issue/milestone-02/plan.md`

UI変更は既存の`docs/design/character-sheet/notes.md`と既存dialog設計を参照する。ユーザー指定により、このissueではcharacter-sheetのdesign noteとcanonical VRT baselineを更新しない。Group 1のfatal error dialogだけは、このissueで定める明示的な例外として既存のToast・dismiss規則を上書きする。これ以外で既存設計だけでは判断できない新しい視覚仕様が必要になった場合は、実装を停止してユーザー判断を求める。

## 対象範囲

### Group 1: 認証・予期しないエラーの回復

- Firebase auth stateの初回確定後、uidの変更（login、logout、user切替）でページ全体を再読み込みし、remote ownershipを初期ロード経路で再評価する。
- API通信不能・5xx・想定外例外・React未捕捉例外を、閉じられない再読み込みdialogで扱う。dialogのaccessible nameと見出しは`予期しないエラーが発生しました`、本文は`ページを再読み込みしてください。未保存の変更は失われます。`、唯一の操作は`再読み込み`buttonとする。初期focusは同buttonへ置き、Escape、dialog外click、閉じるbuttonではdismissできない。
- 入力検証、画像形式不正、401 / 403 / 404、419、ユーザー操作のキャンセルなどの既知エラーは、既存の個別通知またはdialogのままとする。419は現在のtoken強制refreshを1回試行し、再度419ならlogoutとsession-expired通知へ進み、共通再読み込みdialogの対象にしない。
- Firebase公開鍵取得不能、response不正、証明書import失敗を`authentication_unavailable`の503として扱う。不正tokenは401、期限切れtokenは419、その他の予期しないverifier例外は500とする。

### Group 2: 一覧・payload contract

- character一覧がcache縮小後に無効なpageを指さないよう、`page <= pageCount - 1`を保証する。
- HTTP request全体の上限は既存どおり8MiB、`imageBase64String`の上限を4MiBに統一する。
- shared packageの上限定数をfrontend送信直前のUTF-8 byte長検査、shared schema、backend body limitで共用する。
- Content-Lengthありとchunked requestの413を検証し、skip中のchunked integration testをtest専用の小さいbody limitで安定化する。

### Group 3: Public E2EのPagefind世代検知

- build artifactの`pagefind/deployment.json`へGit commit SHAを出力する。
- 検索用JavaScriptの`pagefind.js` dynamic importへ同じSHAをquery parameterとして渡す。
- Public E2Eはdeploy先のmarkerが今回のSHAへ更新されるまで有限回pollしてから実行し、timeout時は期待SHAと取得markerだけをlogへ出す。

### Group 4: production運用とリポジトリ全体の文書整合

- 既存の手動sample投入運用を`docs/deployment.md`へ記録する。管理者アカウントで10件をDB保存し、対象IDを記録してから、承認済みproduction D1操作で各recordを`type='sample'`かつ`isPublic=true`へ更新する。未ログイン一覧で10件のcreatedAt順、公開状態、個別復元を確認する。seed script、管理機能、test accountは追加しない。
- production deploy後の手動smoke手順を`docs/deployment.md`へ記録する。Firebase login、新規一時characterのDB保存、一覧、個別復元、owner上書き、visibility、削除、CORS、D1/R2 bindingを確認し、一時データを削除する。
- Git管理されたリポジトリ全体の現行仕様・運用文書から、中間Gate、Google Identity Services、旧設定名、旧deploy、旧sample、旧一覧仕様を除去し、Firebase Authenticationと現行実装へ統一する。character-sheetのdesign noteとcanonical VRT baselineだけは、JSONインポートbuttonを削除するex-18で最終整理する。
- root `README.md`を共通の概要、root command、リポジトリ共通の作業規約・文書入口だけへ縮約し、workspace固有のセットアップと運用手順を分離する。
  - `frontend/README.md`に、frontend command、Google Spreadsheetのローカル入力、contents指示書、Firebase / Google Cloudのpublic設定とGitHub Pages公開時の設定を置く。設定手順は現行の完了済みcheckboxを移さず、必要な値・配置先・責務を同じ粒度で簡潔に示す。
  - `backend/README.md`に、backend command、Cloudflare Worker / D1 / R2のlocal・development・production運用とbackendが必要とするFirebase project IDを置く。
  - 複数workspaceに共通するセットアップ、root command、repository構造、agent運用、データ・一時ファイル・TODO・design / out-of-scopeの入口はroot `README.md`に残す。
- `frontend/README.md`だけの変更でGitHub Pages production deployを、`backend/README.md`だけの変更でCloudflare production deployを起動しないよう、各deploy workflowのpath filterを更新する。root `README.md`は従来どおり両deployの対象外とする。
- agent failure logなどの監査記録は改変しない。

### Group 5: ex-16 / ex-16-6 archive準備と実施（merge後）

- ex-17をmainへmerge後、post-merge-plan-updateでG6、`ex-16-6-firebase-authentication`、parent ex-16の完了条件をcurrent local evidenceで一緒に監査する。ex-16-6はparent ex-16の認証Gateであり、別taskへ分けず同じarchive単位にする。
- ユーザー承認後に、ex-16-6とparent ex-16のGitHub Issueを作成または照合し、最終契約・完了記録を残してcloseする。
- Gate planのG6を`done`とGitHub Issue番号だけへ縮約し、local child / parent issueを削除する。完了したGate planは`docs/issue/milestone-02/plans/`へ移す。
- Group 5はGroups 1〜4をmainへmerge後、`post-merge-plan-update`に従ってmainで行うtracking作業とする。productionの手動smokeはユーザーが実施するため、このissueの完了チェックやarchive前提には置かない。このissueのwork branchでは実施しない。GitHub Issueの作成・close、local issue削除、mainでのcommit / pushは、その時点のユーザー明示指示がある場合だけに行う。

## 作業分割とcommit

各Groupは独立して検証可能なcommit単位とする。Groups 1〜3は、コード・testと、その変更を直接規定するSSoT更新を同じGroupに含める。Group 4はsample・production運用と残るリポジトリ全体の旧記述を対象とする。

1. Group 1: 認証・想定外エラーの回復、関連test、認証・error contractのrequirements / architecture。
2. Group 2: 一覧page clamp、payload contract、backend / shared / frontendの関連test、payload / 一覧仕様のrequirements / architecture。
3. Group 3: Pagefind deployment marker、検索runtime、Public E2E workflow、Pagefind世代検知のtesting / deployment / architecture。
4. Group 4: production運用、workspace READMEへの責務分割、deploy除外設定とリポジトリ全体の現行文書整合。
5. Group 5: mainで`post-merge-plan-update`として行うex-16 / ex-16-6 archive。productionの手動smokeはユーザーが実施し、このarchiveの前提にはしない。

各Groupの完了条件をローカルで検証した時点で作業を止め、対象差分を提示してユーザーへ`git add`と`git commit`の指示を求める。ユーザーの明示指示なしにcommitしない。Groupをまたぐ差分を同一commitへ混在させない。

## 初期スコープ外

- JSONインポートbuttonの削除、import機能の削除後のremote binding整合、character-sheetのdesign noteとcanonical VRT baseline更新（`docs/TODO.md`のex-18で扱う）。
- seed script、管理画面、管理用API、production用test account、実Firebase認証を使うautomated smoke。
- 新しい認証provider、Firebase Admin SDK、service account credential、独自token persistence。
- 未承認のproduction Cloudflare / D1 / R2操作、remote migration、remote delete。
- 既存のゲームルール、character-sheet入力項目、JSON schema version互換の変更。

## 完了条件

- [x] Group 1の認証状態変更、想定外エラーdialog、Firebase verifier status分類を実装し、unit / component / backend testで確認している。fatal error dialogのVisual Reviewとtarget限定VRTは、JSONインポートbutton削除後にdesign note / baselineと一緒にex-18で実施する。
- [x] Group 2の一覧page clampと8MiB / 4MiB payload contractを実装し、正常境界、1 byte超過、chunked 413をtestで確認している。skip中のchunked testを残していない。
- [x] Group 3で今回のPagefind deployment markerを検知してからPublic E2Eを実行するworkflowを実装している。実deploy先でのPublic E2E実行は、merge後のpost-merge-plan-updateで確認する。
- [x] Group 4でsample 10件の投入・対象ID記録・未ログイン一覧での順序／公開状態／個別復元確認とPublic E2Eの責務を文書化し、リポジトリ全体の現行文書をFirebase Authenticationと現行実装に整合させている。sample 10件の投入はユーザー確認済みであり、手動smokeはユーザーが実施するためこのissueのチェック対象外とする。
- [x] Group 4でroot / frontend / backendのREADME責務を分離し、frontend / backend README単独変更では対応するproduction deployを起動しない。
- [x] Group 4でcharacter-sheetのdesign note以外の現行文書を横断し、旧Google OAuth / Identity、ex-16の中間Gate、旧payload上限、旧deploy・一覧・sample記述を現在のFirebase AuthenticationとCloud persistence contractへ統一している。
- [x] UI変更について、既存design targetとの整合、対象route・state・viewportのactual screenshot確認、変更targetに限定したVRTをex-18へ移管している。canonical VRT baselineは更新していない。
- [ ] Group 5のarchiveをGitHub Issue記録とcurrent local evidenceに基づき完了している。merge後のpost-merge-plan-updateでex-16-6とparent ex-16を一緒に扱う。
- [x] 関連TODOを完了・移管・保持のいずれかとして記録している。
- [x] `npm run check`、frontend / shared / backendの必要なtestとbuildが通っている。

## チェックポイント

- [x] frontend、backend、shared package間でpayloadとAPI error contractが矛盾していない。
- [x] 401 / 403 / 404などの既知エラーで未保存編集を不必要に破棄しない。
- [x] `userId`をclient入力または公開responseへ追加しない。
- [x] GitHub Pagesのsubpath公開とCloudflare backend CORSを壊さない。production CORS障害が発生していないことはユーザー確認済みである。
- [x] production操作はユーザー承認後だけに実行する。
- [x] 新しいnpm dependencyを追加していない。必要になった場合は理由・代替案・初期スコープ上の必要性を記録してユーザー判断を求める。
- [x] `docs/TODO.md`のex-17、ex-18と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `frontend/src/character-sheet/auth/useFirebaseAuthentication.ts`
- `frontend/src/character-sheet/browser/character-image.ts`
- `frontend/src/character-sheet/hooks/useRemoteCharacterPersistence.ts`
- `frontend/src/character-sheet/components/`
- `frontend/src/character-sheet/api/`
- `frontend/src/scripts/search-modal.ts`
- `frontend/tests/`
- `backend/src/auth/`
- `backend/src/app.ts`
- `backend/tests/`
- `packages/shared/src/index.ts`
- `.github/workflows/frontend-deploy.yml`
- `.github/workflows/backend-deploy.yml`
- `README.md`
- `frontend/README.md`
- `backend/README.md`
- `docs/`
- `docs/TODO.md`

## レビュー観点

- 認証状態変更と想定外エラーの回復が、既知エラーやserver authorizationを弱めていないか。
- payload上限と413 contractがfrontend、shared、backendで同一か。
- Pagefind markerが今回のartifact世代を確認し、不要な公開外部requestや秘密情報を増やしていないか。
- active documentationからex-16の途中経過を除去しつつ、archive規約と監査記録を守れているか。
- Groupごとのcommitが独立してreview・revert可能か。

## レビュー指摘 1

### 指摘事項

- Public E2EのPagefind marker pollingは全attemptで同じ`pagefind/deployment.json` URLを取得している。このURLに旧artifactのcacheが残ると、新deployが正常でも最大60秒間同じ旧markerを取得し続けてworkflowが失敗する。

### 判定

- source: human remote review
- classification: valid
- local validation: `.github/workflows/frontend-deploy.yml`はmarker URLをloop外で一度だけ組み立て、query parameterなしで12回取得している。markerはstatic GitHub Pages artifactであり、workflow側でcache headerを制御していないため、旧世代のcache経路を避けられない。

### 対応方針

- 各pollで`pagefind/deployment.json?commit=<expected SHA>&attempt=<attempt>`を組み立て、marker request自体をattemptごとに異なるcache keyにする。
- markerのJSON比較とtimeout時に期待SHA・取得markerだけを出す既存contractは維持する。
- CI workflow自体をfrontend testから検証しない。workflow設定の直接確認を実装レビュー時の根拠とする。

### 対応完了チェックリスト

- [x] marker polling URLをexpected SHAとattemptでcache-bustする。
- [x] frontend testへCI workflow contractを追加していない。
- [x] `npm run check` が通る。
- [x] frontend public buildとPagefind index buildが通る。

## レビュー指摘 2

### 指摘事項

- [I1] `docs/requirements/character-sheet.md`が、query parameterで識別するremote characterとidなしlocal draftの保存・復元境界を区別していない。remote characterに対してreset / importで「bindingを外す」、delete後に同じ編集stateをlocal draftとして保持するという旧contractも残っている。
- [I2] `docs/architectures/character-sheet.md`の状態表と自動保存・復元節が、全characterのフォームをlocalStorage、画像をIndexedDBへ保存すると読める。remote characterがmemoryだけで扱われる現在実装と一致しない。
- [I3] `docs/testing.md`が`remote binding`と`import binding解除`をcloud persistenceのtest対象としている。query parameterをidentityとするcurrent contract、local / remote persistence境界、auth後GET、stale request、save / copy / delete / importのURL遷移を網羅していない。
- [I4] `docs/development-structure.md`がfrontend `.env`をGoogle Spreadsheet専用、`packages/shared`を将来backend用、backend testをdummy boundary test、scriptsを未導入として説明しており、現在のworkspace構成とscriptsに一致しない。
- [I5] Group 5の作業分割と備考が、production手動smokeの人間確認をarchiveの前提と読める。Group 5の本文と完了条件にある「ユーザーが行うため前提に置かない」という決定と矛盾する。
- [I6] `docs/requirements/overview.md`の初期scope外記述、`docs/architectures/backend.md`のlocal / integration verifier構成、`docs/requirements.md`とcharacter-sheet要件のworkspace path表記にも、現行実装と不整合な記述が残る。

### 判定

- source: browser-draft
- I1: valid。`useCharacterSheetRoute.ts`は`?character=<id>`をremote identityとして扱い、`useCharacterSheetRootState.ts`はidなしlocal draftだけをlocalStorage / IndexedDBへ復元・保存する。`CharacterSheetContainer.tsx`はremote characterのresetを無効化し、`useRemoteCharacterPersistence.ts`のdelete成功時はqueryを外してidなしrouteへ遷移する。
- I2: valid。I1と同じroot-stateのlocal-only persistence条件に対し、architectureの状態表と自動保存節は保存対象を区別していない。
- I3: valid。現行testの責務はremote bindingではなくquery parameterを起点としたlocal / remote状態遷移であり、旧import binding解除を記録したままである。
- I4: valid。frontendはFirebase / public API設定も使用し、`packages/shared`はfrontendとbackendの双方で使用される。backendはVitestを実行し、変換・検索index・data validation scriptsも存在する。
- I5: valid。Group 5本文・完了条件と作業分割・備考の間でarchive前提が矛盾している。
- I6: valid。cloud persistenceを除外しない初期scope外の明記、production / local Firebase verifierとintegration TestTokenVerifierの分離、`frontend/`を起点とするpath表記が必要である。

### 対応方針

- character-sheet requirement / architecture / testingを、idなしlocal draftと`?character=<id>` remote characterの状態・保存・復元・操作遷移の現行contractへ統一する。default local draftはフォームを保存せず、画像のみ独立して扱う条件も明記する。
- overview、backend architecture、development structure、requirementsのpath表記を現行workspace・認証・test・script構成へ揃える。
- Group 5のarchive前提を「mainでのpost-merge-plan-update」とし、production手動smokeはユーザー実施でarchive前提にしない記述へ統一する。
- design noteとcanonical VRT baselineは、既存どおりex-18の範囲に残す。

### 対応完了チェックリスト

- [x] character-sheet requirement / architecture / testingがlocal draftとremote characterの現行persistence・URL遷移contractを説明している。
- [x] overview、backend architecture、development structure、requirements pathが現行workspace構成と一致している。
- [x] Group 5のmanual smoke / archive記述に矛盾がない。
- [x] Group 4の未完了documentation整合チェックを、更新後の対象文書との照合で完了に戻す。
- [x] `npm run check:md` が通る。

## 備考

- このissueはGate分割を使わない通常issueである。
- archiveはmerge後のpost-merge-plan-updateまで未完了のまま維持する。production手動smokeはユーザー実施であり、archive前提にはしない。
