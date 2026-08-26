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
- HTTP request全体の上限を10MiB、`imageBase64String`の上限を4MiBに統一する。
- shared packageの上限定数をfrontend送信直前のUTF-8 byte長検査、shared schema、backend body limitで共用する。
- Content-Lengthありとchunked requestの413を検証し、skip中のchunked integration testをtest専用の小さいbody limitで安定化する。

### Group 3: Public E2EのPagefind世代検知

- build artifactの`pagefind/deployment.json`へGit commit SHAを出力する。
- 検索用JavaScriptの`pagefind.js` dynamic importへ同じSHAをquery parameterとして渡す。
- Public E2Eはdeploy先のmarkerが今回のSHAへ更新されるまで有限回pollしてから実行し、timeout時は期待SHAと取得markerだけをlogへ出す。

### Group 4: production運用とリポジトリ全体の文書整合

- 既存の手動sample投入運用を`docs/deployment.md`へ記録する。管理者アカウントで10件をDB保存し、対象IDを記録してから、承認済みproduction D1操作で各recordを`type='sample'`かつ`isPublic=true`へ更新する。未ログイン一覧で10件のcreatedAt順、公開状態、個別復元を確認する。seed script、管理機能、test accountは追加しない。
- production deploy後の手動smoke手順を`docs/deployment.md`へ記録する。Firebase login、新規一時characterのDB保存、一覧、個別復元、owner上書き、visibility、削除、CORS、D1/R2 bindingを確認し、一時データを削除する。
- Git管理されたリポジトリ全体の現行仕様・運用・design文書から、中間Gate、Google Identity Services、旧設定名、旧deploy、旧sample、旧一覧仕様を除去し、Firebase Authenticationと現行実装へ統一する。
- agent failure logなどの監査記録は改変しない。

### Group 5: ex-16 archive準備と実施（merge後）

- すべての実装、production deploy、手動smoke、文書整合が完了した後、G6とparent ex-16の完了条件をcurrent local evidenceで監査する。
- ユーザー承認後に、G6とparent ex-16のGitHub Issueを作成または照合し、最終契約・完了記録を残してcloseする。
- Gate planのG6を`done`とGitHub Issue番号だけへ縮約し、local child / parent issueを削除する。完了したGate planは`docs/issue/milestone-02/plans/`へ移す。
- Group 5はGroups 1〜4をmainへmergeしproduction deployと手動smokeが終わった後、`post-merge-plan-update`に従ってmainで行うtracking作業とする。このissueのwork branchでは実施しない。GitHub Issueの作成・close、local issue削除、mainでのcommit / pushは、その時点のユーザー明示指示がある場合だけに行う。

## 作業分割とcommit

各Groupは独立して検証可能なcommit単位とする。Groups 1〜3は、コード・testと、その変更を直接規定するSSoT更新を同じGroupに含める。Group 4はsample・production運用と残るリポジトリ全体の旧記述を対象とする。

1. Group 1: 認証・想定外エラーの回復、関連test、認証・error contractのrequirements / architecture。
2. Group 2: 一覧page clamp、payload contract、backend / shared / frontendの関連test、payload / 一覧仕様のrequirements / architecture。
3. Group 3: Pagefind deployment marker、検索runtime、Public E2E workflow、Pagefind世代検知のtesting / deployment / architecture。
4. Group 4: production運用とリポジトリ全体の現行文書整合。
5. Group 5: production smokeの人間確認後に、mainで`post-merge-plan-update`として行うex-16 archive。

各Groupの完了条件をローカルで検証した時点で作業を止め、対象差分を提示してユーザーへ`git add`と`git commit`の指示を求める。ユーザーの明示指示なしにcommitしない。Groupをまたぐ差分を同一commitへ混在させない。

## 初期スコープ外

- JSONインポートbuttonの削除、import機能の削除後のremote binding整合、character-sheetのdesign noteとcanonical VRT baseline更新（`docs/TODO.md`のex-18で扱う）。
- seed script、管理画面、管理用API、production用test account、実Firebase認証を使うautomated smoke。
- 新しい認証provider、Firebase Admin SDK、service account credential、独自token persistence。
- 未承認のproduction Cloudflare / D1 / R2操作、remote migration、remote delete。
- 既存のゲームルール、character-sheet入力項目、JSON schema version互換の変更。

## 完了条件

- [ ] Group 1の認証状態変更、想定外エラーdialog、Firebase verifier status分類を実装し、unit / component / backend testで確認している。fatal error dialogは`/character-sheet/`の対象stateをdesktop、tablet、mobileのactual screenshotで確認し、既存target限定VRTをPR review直前に実施している。
- [ ] Group 2の一覧page clampと10MiB / 4MiB payload contractを実装し、正常境界、1 byte超過、chunked 413をtestで確認している。skip中のchunked testを残していない。
- [ ] Group 3で今回のPagefind deployment markerを検知してからPublic E2Eを実行する。
- [ ] Group 4でsample 10件の投入・対象ID記録・未ログイン一覧での順序／公開状態／個別復元確認、手動production smoke、Public E2Eの責務を文書化し、リポジトリ全体の現行文書をFirebase Authenticationと現行実装に整合させている。
- [ ] UI変更について、既存design targetとの整合、対象route・state・viewportのactual screenshot確認、変更targetに限定したVRTをPR review直前に実施している。canonical VRT baselineを更新していない。
- [ ] production deploy後、管理者アカウントで手動smokeを実施し、一時データを削除して記録している。
- [ ] Group 5のarchiveをGitHub Issue記録とcurrent local evidenceに基づき完了している。
- [ ] 関連TODOを完了・移管・保持のいずれかとして記録している。
- [ ] `npm run check`、frontend / shared / backendの必要なtestとbuildが通っている。

## チェックポイント

- [ ] frontend、backend、shared package間でpayloadとAPI error contractが矛盾していない。
- [ ] 401 / 403 / 404などの既知エラーで未保存編集を不必要に破棄しない。
- [ ] `userId`をclient入力または公開responseへ追加しない。
- [ ] GitHub Pagesのsubpath公開とCloudflare backend CORSを壊さない。
- [ ] production操作はユーザー承認後だけに実行する。
- [ ] 新しいnpm dependencyを追加していない。必要になった場合は理由・代替案・初期スコープ上の必要性を記録してユーザー判断を求める。
- [ ] `docs/TODO.md`のex-17、ex-18と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `frontend/src/character-sheet/auth/useFirebaseAuthentication.ts`
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
- `docs/`
- `docs/TODO.md`

## レビュー観点

- 認証状態変更と想定外エラーの回復が、既知エラーやserver authorizationを弱めていないか。
- payload上限と413 contractがfrontend、shared、backendで同一か。
- Pagefind markerが今回のartifact世代を確認し、不要な公開外部requestや秘密情報を増やしていないか。
- active documentationからex-16の途中経過を除去しつつ、archive規約と監査記録を守れているか。
- Groupごとのcommitが独立してreview・revert可能か。

## 備考

- このissueはGate分割を使わない通常issueである。
- production smokeとarchiveは、deployと人間確認が揃うまで未完了のまま維持する。
