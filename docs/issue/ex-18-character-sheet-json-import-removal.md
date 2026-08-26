# ex-18-character-sheet-json-import-removal

## 最優先のユーザー確定仕様

本Issueでは、以下を確定仕様として扱う。

1. **このIssueのPRは2026-09-01になるまでmergeしない。**
   - 実装、レビュー、CI、Visual Reviewがそれ以前に完了しても、PRのまま維持する。
   - 2026-09-01以降に最終状態を確認してからmerge可能とする。

2. **キャラクターシートのJSONインポートbuttonと、その機能のためだけに存在する関連codeを削除する。**

3. **JSONインポートに関するユーザー向け文言、削除予告、Help本文を削除する。**

4. **ユーザーが、現行のbutton文言・操作文言・Helpを含むキャラクターシートのユーザー向け操作文言を一通り修正し直す。**
   - エージェントは、その修正文言を現行仕様・実装挙動と照合してレビューする。
   - ユーザーの文言修正前に、エージェント側で全操作文言を独自に書き換えない。

5. **ユーザー修正文言のレビューと確定後、全ページのcanonical VRT baselineを最新化する。**

6. **キャラクターシートが最終形になった状態で、`docs/design/character-sheet/notes.md`を更新する。**

7. **外部データまたはログイン状態に依存するVRTは取得しない。**
   - Firebase Authenticationへの実login
   - Cloudflare backend / production API
   - production D1 / R2
   - live character / sample character
   - その他の外部network data

   をVRT fixtureまたはbaseline取得条件にしてはならない。

「全ページbaseline更新」は、**各ページについてローカルで決定的に再現できるcanonical stateを更新する**ことを意味する。
外部データまたはログイン状態を必要とするstateまでbaseline化することは意味しない。

---

## 目的

JSONインポートによる旧データ移行期間を終了し、WebキャラクターシートをDB保存を前提とした最終UIへ整理する。

同時に、

- Action Pane / Helpの操作体系
- ユーザー向け文言
- character-sheet design note
- canonical VRT baseline

を最終状態へ揃え、移行期間中のUI・文言・設計記録をactive implementationから除去する。

ex-17で意図的に保留したcharacter-sheetのdesign note、Visual Review、canonical baseline整理も本Issueで完了する。

---

## 背景

現行キャラクターシートでは、旧データ移行のためJSONインポートだけを一時的に残している。

現在のcontractでは、JSONインポート成功後のデータはidなしlocal draftとして扱われ、remote character表示中に実行した場合もremote DB record自体は変更せず、query parameterを外してlocal draftへ遷移する。

一方、JSONエクスポートのユーザー向け導線は既に削除済みであり、JSONインポートbuttonには、

```txt
DB保存に移行するため9/1に削除されます。
```

という移行期間用表示が残っている。

ex-17では、以下を意図的にex-18へ移管している。

- JSONインポートbuttonと導線の削除
- import専用のlocal draft / URL identity処理の整理
- character-sheet design noteの最終更新
- ex-17で追加したfatal error dialogを含む最終Visual Review
- canonical VRT baselineの更新

---

## 依存関係

### ex-17

本Issueの実装は、`ex-17-cloud-persistence-followups`の変更を前提とする。

実装branchは、ex-17のPRがmergeされた後の最新`main`から開始する。

想定branch:

```txt
ex-18-character-sheet-json-import-removal
```

remote draft作成時点ではPR #225はまだopenであるため、branch作成時に最新`main`へex-17が取り込まれていることをローカルで確認する。

---

## Merge Date Gate

このIssueには通常の実装完了条件とは独立した日付Gateを設ける。

```txt
merge可能日: 2026-09-01以降
```

### Contract

- 2026-08-31以前はmergeしない。
- 実装完了後はPRをopen状態で維持する。
- review approved、CI success、VRT successであっても日付Gateを越えない。
- 2026-09-01以降、merge直前にHEADとCI、未解決レビュー、日付Gateを再確認する。
- 日付を理由にcodeやbaselineへ時間依存処理を追加しない。
- JSONインポートbuttonを日付判定で自動的に消す実装にはしない。本Issueのcode changeで明示的に削除する。

---

## JSONインポート機能の削除

### UI

Action Pane / control paneからJSONインポートbuttonを削除する。

同時に、import専用の以下を削除する。

- file input
- file選択処理
- import確認dialog
- import専用loading / operation state
- import専用callback
- import結果通知
- import専用focus復帰処理
- import専用のAction Pane wiring

desktop、tablet、mobileのすべてで導線を残さない。

### State / routing

JSONインポートのためだけに存在する、

```text
JSON file
→ deserialize / validate
→ idなしlocal draftへ反映
→ remote routeならquery parameterを除去
```

という遷移を削除する。

削除後に、

- import専用のlocal draft書込み
- import後だけ使う画像復元処理
- import成功時だけ使うURL navigation
- import専用state / ref / callback
- import専用dialog state

がdead codeとして残っていないことを確認する。

### 共用logicの扱い

JSON import/export由来のmoduleであっても、現在の別機能が利用しているlogicを名前だけを理由に削除してはならない。

特に、

- DB保存
- コピー保存
- CCFOLIAコピー
- remote snapshot restore
- local draft restore
- test fixture / schema validation

から現在利用されているserialize、schema、normalization等は、その利用関係を確認して維持する。

削除対象は**JSONインポート機能だけに必要なcode**とする。

---

## JSONインポート関連文言の削除

active UIから、JSONインポートを現在利用可能な機能として扱う文言を削除する。

対象には少なくとも以下を含む。

- `JSONインポート`
- import button label
- import確認文
- import成功 / 失敗文
- import loading文
- import migration説明
- `9/1に削除`の予告表示
- Help内のインポート節
- Help内からimportへ言及する補足
- import後のlocal draft / DB characterの扱いを説明するユーザー向け文言

JSONインポート削除後に不要となるdictionary entryも削除する。

### 文書

active documentationからも、JSONインポートを現在機能として扱う記述を削除または最終状態へ更新する。

主な対象:

```txt
docs/requirements/character-sheet.md
docs/architectures/character-sheet.md
docs/testing.md
docs/design/character-sheet/notes.md
docs/TODO.md
```

実際の対象はrepository-wide searchで確認する。

ただし、

- closed / archive済みIssue
- review履歴
- agent failure log
- 過去のmigration経緯を示す監査記録

は履歴としてJSONインポートへ言及していてもよい。
active contractから消すためだけに過去記録を書き換えない。

---

## ユーザーによる操作文言の全面見直し

JSONインポート削除後、ユーザーがキャラクターシートに残る現在の操作文言を修正する。

対象はJSONインポート周辺だけに限定しない。

少なくとも以下をレビュー対象とする。

- Action Pane button
- mobile / tablet control
- DB保存
- コピー保存
- DB削除
- キャラクター一覧
- 初期化
- CCFOLIAコピー
- login / logout
- Help
- 各確認dialog
- loading文
- Toast
- fatal error dialog
- 操作に付随する補足文

### レビュー方針

ユーザーが修正文言を提示するまでは、エージェントが全体文言を独自判断で全面改稿しない。

ユーザー修正後、次の観点でレビューする。

- 実際の操作結果と文言が一致するか
- idなしlocal draftとremote characterを混同していないか
- remote characterをbrowserへ自動保存すると誤解させないか
- DB保存 / コピー保存 / DB削除の対象が明確か
- destructive operationの結果が明確か
- 初期化がidなしlocal draft専用であることと矛盾しないか
- character一覧からの切替でremoteの未保存差分が破棄されるcontractと矛盾しないか
- login / logoutとownershipの扱いを誤認させないか
- import / remote binding等の廃止済み概念が残っていないか
- 同じ操作についてHelp、button、dialog、Toastで説明が矛盾していないか
- desktop / tablet / mobileで意味が変わっていないか

### Copy Freeze

以下が完了するまでdesign noteとcanonical baselineを最終確定しない。

1. ユーザーが操作文言を修正
2. エージェントが仕様・実装との整合性をレビュー
3. 必要な修正を反映
4. ユーザーが最終文言を確定

これを本IssueのCopy Freezeとする。

---

## Character Sheet Design Note

Copy Freezeと最終UI確定後、

```txt
docs/design/character-sheet/notes.md
```

を更新する。

### 更新内容

少なくとも以下を最終状態へ揃える。

- Action Paneの操作一覧
- JSONインポート導線の削除
- Helpの最終構成
- button / operation copyの最終状態
- fatal error dialog
- desktop / tablet / mobileの操作体系
- idなしlocal draft / remote characterで利用可能な操作差
- canonical VRTで扱うroute / state / viewport
- VRTで扱わない外部依存state
- ex-17 / ex-18以前の移行期間用記述の除去

design noteは、実装途中ではなく**本Issueの最終形**を正本化する。

---

## 全ページCanonical Baseline更新

本Issueでは、通常の「変更targetだけbaseline更新」という運用に対する明示的な例外として、**全ページのcanonical VRT baselineを更新する**。

ユーザーの本Issue要件を、全baseline更新に対する明示承認として扱う。

### 対象

既存canonical VRT suiteに登録されている各ページについて、最終実装からbaselineを再生成する。

「全ページ」は、

> repositoryでcanonical VRT対象として管理している各pageの、ローカルで決定的に再現可能なcanonical state

を意味する。

### 更新順序

1. JSONインポートUI・関連codeを削除する。
2. import関連文言を削除する。
3. ユーザーが操作文言を修正する。
4. 文言レビューを完了しCopy Freezeする。
5. 最終UIとdesign intentを確認する。
6. character-sheet design noteを最終状態へ更新する。
7. 全ページcanonical baselineを再生成する。
8. 全diffを確認する。
9. 意図しないvisual regressionがあれば実装を修正する。
10. 必要に応じてbaselineを再生成する。
11. full VRTを再実行して一致を確認する。

baselineを更新してtest failureを隠す運用にはしない。

---

## VRTの外部依存禁止

canonical VRTはlocalで再現可能かつdeterministicでなければならない。

### VRT取得で使用してはならないもの

- Firebaseへの実login
- Firebaseの永続login state
- Google Account
- production / development Cloudflare Worker
- external HTTP API
- production D1
- production R2
- DBへ保存されたlive user character
- DBへ保存されたlive sample character
- 外部サービスから取得する可変data
- production environmentの状態

### Character Sheet VRT

character-sheetのVRTも同じ原則に従う。

VRTのために、

```text
login
→ backend API
→ remote character取得
→ screenshot
```

という経路を使用してはならない。

必要な画面stateがある場合は、既存のlocal fixture機構または同等のdeterministicなlocal stateだけを使う。

ただし、VRTのためだけにproduction codeへtest-only stateや外部依存のmock分岐を追加してはならない。

### 外部依存targetが既存suiteに存在した場合

既存canonical VRT targetが外部dataまたはlogin stateなしでは再現できない場合は、

1. deterministic local fixtureへ置換できるか確認する。
2. 置換が設計上不適切なら、その外部依存stateをcanonical VRT対象から除外する。
3. 除外理由をVRT READMEまたはdesign noteへ記録する。

外部環境へ接続してbaselineを取得することで解決してはならない。

---

## 対象範囲

- JSONインポートbutton削除
- JSONインポート確認UI削除
- JSON file input削除
- import専用state / callback / routing削除
- import専用local draft / image処理の整理
- import専用testの削除または更新
- JSONインポート関連ユーザー文言の削除
- HelpからJSONインポート説明を削除
- `9/1`移行予告文の削除
- import関連dictionary cleanup
- active requirements / architecture / testing / TODOの最終整理
- ユーザーによる全操作文言見直し
- 修正文言の仕様レビュー
- character-sheet design noteの最終更新
- 全ページcanonical baseline更新
- 全ページVRT diff review
- full VRT実行
- 外部data / login非依存のVRT contract整理
- ex-17から移管されたfatal error dialogの最終Visual Review

---

## 対象外

- 新しいimport形式
- JSON importの代替機能
- JSON schema version migrationの新規実装
- cloud persistence APIの機能追加
- Firebase Authentication方式の変更
- D1 / R2 schema変更
- 新しいcharacter共有方式
- optimistic locking / concurrent edit制御
- キャラクターシートのゲームルール変更
- 新しい入力項目
- production sample dataの変更
- VRTのための実loginやlive backend環境構築
- VRTのためだけのproduction test hook
- ユーザーの文言修正より先に行うエージェント主導の全面copy rewrite

---

## 想定変更箇所

remote snapshot上で少なくとも以下が候補となる。

```txt
frontend/src/character-sheet/CharacterSheetContainer.tsx
frontend/src/character-sheet/components/CharacterSheetActionPane.tsx
frontend/src/character-sheet/components/dialogs/action-pane/
frontend/src/character-sheet/components/dialogs/action-pane/CharacterSheetJsonImportConfirmDialog.tsx
frontend/src/character-sheet/components/dialogs/action-pane/CharacterSheetHelpDialog.tsx
frontend/src/character-sheet/hooks/useCharacterSheetRootState.ts
frontend/src/character-sheet/dictionary.ts

frontend/tests/components/character-sheet/
frontend/tests/hooks/character-sheet/
frontend/tests/node/character-sheet/
frontend/tests/e2e/
frontend/tests/vrt/

frontend/canonical-snapshots/visual/

docs/requirements/character-sheet.md
docs/architectures/character-sheet.md
docs/testing.md
docs/design/character-sheet/notes.md
docs/TODO.md
```

具体的な変更対象はlocal repositoryでusage searchして確定する。

既存moduleをファイル名だけで削除せず、現在の参照関係を確認する。

---

## 完了条件

### JSONインポート削除

- [ ] desktopのAction PaneにJSONインポートbuttonが存在しない。
- [ ] tablet / mobileの操作UIにJSONインポートbuttonが存在しない。
- [ ] JSON file inputが存在しない。
- [ ] import確認dialogが存在しない。
- [ ] import専用callback / state / ref / operationが残っていない。
- [ ] import成功時のidなしlocal draft遷移codeが、他用途がなければ削除されている。
- [ ] import専用画像処理が、他用途がなければ削除されている。
- [ ] importだけを検証するtestが削除または現行contractへ整理されている。
- [ ] DB保存、コピー保存、CCFOLIA等が使用する共用serialize / schema logicを誤って削除していない。

### 文言

- [ ] active UIに`JSONインポート`操作が残っていない。
- [ ] `9/1に削除`等の移行予告が残っていない。
- [ ] import confirmation / success / failure / loading文言が残っていない。
- [ ] HelpからJSONインポート節を削除している。
- [ ] active documentationがJSONインポートを現在機能として説明していない。
- [ ] historical / audit recordをactive仕様化するために改変していない。

### User Copy Review

- [ ] ユーザーが現行button / 操作 / Help文言を修正している。
- [ ] エージェントが最終文言を現行挙動と照合してレビューしている。
- [ ] local draft / remote / DB save / copy / delete / reset / authの意味に矛盾がない。
- [ ] Help、button、dialog、Toast間で同じ操作の説明が矛盾していない。
- [ ] ユーザーによる最終文言確定をもってCopy Freezeしている。

### Design

- [ ] JSONインポート削除後の最終UIを基準に`docs/design/character-sheet/notes.md`を更新している。
- [ ] final Action Pane / Help / fatal error dialogをdesign noteへ反映している。
- [ ] local draft / remoteの操作差を現行contractに合わせている。
- [ ] VRT対象stateと外部依存による対象外stateをdesign note上でも区別している。

### VRT / Baseline

- [ ] 全canonical pageについてdeterministicなbaselineを更新している。
- [ ] 全baseline diffを確認している。
- [ ] baseline更新でvisual regressionを隠していない。
- [ ] full VRTが成功している。
- [ ] Firebase loginをVRT取得に使用していない。
- [ ] live backend APIをVRT取得に使用していない。
- [ ] live D1 / R2 dataをVRT取得に使用していない。
- [ ] live user / sample characterをVRT取得に使用していない。
- [ ] 外部data依存targetがある場合はdeterministic fixture化または対象外化して理由を記録している。
- [ ] ex-17で保留したfatal error dialogを最終character-sheet stateでVisual Reviewしている。

### Quality

- [ ] import関連のdead import / dead codeが残っていない。
- [ ] repository-wide searchでactive import UI/copyの残存を確認している。
- [ ] `npm run check`が成功している。
- [ ] frontendの必要なunit / component / hook / E2E testが成功している。
- [ ] public buildが成功している。
- [ ] full VRTが成功している。

### Date Gate

- [ ] PRを2026-09-01になるまでopen状態で維持している。
- [ ] 2026-08-31以前にmergeしていない。
- [ ] 2026-09-01以降、merge直前の最新HEADでCI / review / VRT / unresolved commentを再確認している。

---

## チェックポイント

### Import code removal

repository-wideで少なくとも次を検索する。

```sh
rg -n \
  'JSONインポート|jsonImport|JsonImport|9/1に削除|9/1' \
  frontend docs
```

検索結果は機械的に全削除せず、

- active implementation
- active requirement / design
- historical issue
- audit / failure log

へ分類する。

### State ownership

import削除後も次を維持する。

```text
/character-sheet
→ idなしlocal draft
→ non-default formだけlocalStorage
→ local imageだけIndexedDB

/character-sheet?character=<id>
→ remote character
→ form / imageはmemory-only
```

import code削除がlocal draft autosave、remote restore、save/copy/delete route transitionへ影響していないことを確認する。

### Copy review

最終copyについて、操作単位で、

```text
button
→ confirmation / input dialog
→ actual operation
→ success / failure feedback
→ Help description
```

を横断して意味が一致することを確認する。

### VRT determinism

baseline update前に各targetについて、

- localだけで再現可能か
- current timeに依存しないか
- network responseに依存しないか
- login stateに依存しないか
- production dataに依存しないか

を確認する。

外部依存を見つけた場合、外部接続して取得してはならない。

### Full baseline review

全baselineを更新すること自体を完了条件にせず、旧baselineとの差分を確認する。

特に、

- global Header / Footer
- typography
- responsive layout
- character-sheet Action Pane
- Help
- dialog
- button text wrapping
- mobile control layout

について、文言変更による意図しないlayout regressionを確認する。

---

## レビュー観点

- JSONインポートのユーザー導線が完全に消えているか。
- hidden file inputやcallbackだけが残っていないか。
- import専用route transitionがdead codeになっていないか。
- 共用serialize / schemaまで過剰削除していないか。
- active Help / dictionary / requirementsにimport migration文言が残っていないか。
- ユーザー修正文言をエージェントが独自に意味変更していないか。
- 最終copyと実操作が一致するか。
- local draftとremote characterを文言上混同していないか。
- design noteが途中状態ではなく最終UIを記録しているか。
- full baseline更新がユーザー承認済みの本Issue範囲として行われているか。
- baseline updateで失敗を隠していないか。
- VRTがFirebase、live API、D1/R2、外部dataへ依存していないか。
- 全ページbaseline要件を理由に外部依存stateを無理にsnapshot化していないか。
- 2026-09-01以前にPRをmergeしようとしていないか。

---

## Source Snapshot

以下はremote draft作成時の履歴である。local validationはこのsnapshotではなく、下記のlocal validation記録を実装契約の現在根拠とする。

```txt
repository: starling888888/neon-underrealm-trpg
reference PR: #225 ex-17-cloud-persistence-followups
snapshot ref: 6fd1317881693312e80391d98bb4a9a65e6184c0
snapshot date: 2026-08-26
```

参照した主な正本:

```txt
Google Drive: AGENT

AGENTS.md
.agents/skills/issue-first-development/SKILL.md
.agents/skills/design-image-generation/SKILL.md
.agents/skills/visual-implementation-review/SKILL.md

docs/TODO.md
docs/issue/ex-17-cloud-persistence-followups.md
docs/issue/milestone-02/plan.md
docs/requirements/character-sheet.md
docs/architectures/character-sheet.md
docs/design/character-sheet/notes.md
docs/testing.md

frontend/tests/vrt/README.md
```

remote snapshot上では少なくとも次のimport専用fileが存在する。

```txt
frontend/src/character-sheet/components/dialogs/action-pane/CharacterSheetJsonImportConfirmDialog.tsx
frontend/tests/components/character-sheet/CharacterSheetJsonImportConfirmDialog.test.tsx
```

実際の依存関係と全削除対象は、実装時のusage searchで確定する。

ユーザーの本Issueに対する最新指示は、上記文書と競合する場合に優先する。

---

## Local Validation

2026-08-26にlocal repositoryで次を確認した。

- worktreeにはこのissue fileだけが未追跡であり、既存のGit管理ファイルに未commit変更はない。
- current branchは`ex-18-character-sheet-json-import-removal`であり、issue file名と一致する。
- branchのbaseであるlocal `main`と`origin/main`はいずれも`27050d4`である。ex-17はMerge PR #225および#226により取り込み済みである。
- `docs/TODO.md`の`ex-18`項目、`docs/requirements/character-sheet.md`、`docs/testing.md`、`docs/design/character-sheet/notes.md`は、JSONインポートと9/1削除予告を現行仕様として記録しており、本Issueの削除・最終整理の対象と一致する。
- `docs/design/character-sheet/notes.md`と`frontend/tests/vrt/README.md`が存在する。現行notesには削除対象のAction Pane・Help・responsive操作体系があり、本Issueで最終状態へ更新する対象として十分に特定できる。
- local usage searchで、`CharacterSheetContainer.tsx`、`useCharacterSheetRootState.ts`、Action Pane dialogs、`dictionary.ts`、Help、component / hook / E2E / VRT tests、schema persistenceにJSONインポート関連の参照を確認した。想定変更箇所はlocal sourceと一致する。
- `frontend/canonical-snapshots/visual/`にはcanonical VRT baselineがあり、全baseline更新は本Issueの明示承認済み例外として扱う。

## Unchecked / Not verified

- ユーザーによる最終操作文言とCopy Freeze
- import専用codeと共用serialize / schema logicの最終分類
- 実装後のlocal build、check、unit / component / hook / E2E test結果
- 各VRT targetの外部data / login非依存性、baseline更新後の全diff、full VRT結果
- 2026-09-01以降のmerge直前に行うHEAD、CI、review、unresolved commentの最終確認

これらは実装および完了確認の条件であり、現時点で未完了のまま残す。

VRTについては、baseline更新前に既存target一覧とfixtureを確認し、

- deterministic local state
- external / login dependent state

を分類してから全baseline更新へ進む。

このremote draftは、上記local validationにより正式な実装契約として確定した。
