# ex-16-7-character-session-routing

## 最優先のユーザー確定仕様

キャラクターシートの「現在表示・編集中のキャラクター」とbrowser persistenceの責務を分離し、複数タブ利用時にも各remote characterの編集状態が不必要に共有されない構成へ変更する。

以下を確定仕様とする。

- browserへ永続保存するキャラクターは、DBへまだ保存されていない`id`なしの未保存キャラクター1件だけとする
- `id`を持つremote characterは、取得後のフォーム値・画像・未保存変更をReact memory上だけに保持する
- remote characterの未保存変更は、別キャラクターへの遷移、reload、tab close等で破棄されてよい
- 現在表示しているremote characterのidentityはquery parameterをSSoTとする
- remote character間の移動はpage reloadではなくclient-side routingで行う
- 未保存characterをDBへ新規保存した場合、保存成功後に新しいremote IDを持つURLへclient-side遷移する
- remote characterから「コピー保存」した場合も、新規作成されたremote IDのURLへclient-side遷移する
- remote characterをDB削除した場合、削除成功後にremote IDを持たない未保存characterページへclient-side遷移する
- 「初期化」はremote character表示中には利用できない
- 「初期化」は`id`なしの未保存characterを表示している場合だけ利用できる
- 未保存characterのform自動保存は、初期状態との差分が存在する場合だけ行う
- form valuesと初期状態はdeep equalityで比較する
- form valuesが初期状態と一致する場合、localStorageへ保存せず、既存の保存dataも削除する
- キャラクターシートを開いただけのdefault stateをlocalStorageへ保存し続けない
- 同一remote characterを複数tab / deviceで同時編集することは許可する
- remote保存時のoptimistic lock、revision conflict、cross-tab editing lockは導入しない
- 同一remote characterを複数箇所から保存した場合はlast-write-winsを許容する

query parameterは以下を使用する。

```txt
/character-sheet
```

未保存characterを表示する。

```txt
/character-sheet?character=<remote-character-id>
```

指定したremote characterを表示する。

---

# 目的

現在のキャラクターシートでは、

- form
- character image
- current remote character ID

がbrowser persistenceとReact stateの双方へ跨って保持されている。

このため、複数tabでキャラクターシートを開いた場合に、

- 別remote characterを開いたtab同士でcurrent remote IDの永続値を共有する
- remote characterの編集内容までlocalStorageへ書き込む
- remote / local双方のcharacter imageが同じIndexedDB keyを利用する
- tabごとのReact stateとbrowser persistenceの内容が一致しなくなる

という状態が成立する。

また現行の未保存form autosaveは、default valuesと実質的に同じ状態であってもlocalStorageへ値を書き込み続ける構成になり得る。

そのため、ユーザーが何も入力していない状態でもbrowser persistenceにcharacter dataが常時存在する状態になる。

G7では、

- character identityをURLへ移す
- browser persistenceを未保存draft専用へ限定する
- 未保存draftについてもdefault stateとの差分だけを保存する

ことで、character sessionとbrowser persistenceの責務を明確化する。

最終的な責務は以下とする。

| 状態             | Form                           | Character image  | Character identity  |
| ---------------- | ------------------------------ | ---------------- | ------------------- |
| 未保存character  | 差分がある場合のみlocalStorage | IndexedDB        | query parameterなし |
| remote character | React memoryのみ               | React memoryのみ | `?character=<id>`   |
| Authentication   | Firebase SDK persistence       | -                | Firebase auth state |

---

# 背景

現行実装ではformを以下のlocalStorage keyへ保存している。

```txt
neon-underrealm-character-sheet-form
```

character imageはIndexedDBの以下の固定keyへ保存している。

```txt
current-character-image
```

また、current remote character IDも以下のlocalStorage keyへ保存している。

```txt
neon-underrealm-character-sheet-remote-character
```

remote ID・form・imageの保存責務が分離されていないため、remote characterを表示している場合でもbrowser persistenceがcurrent edit sessionの一部として利用されている。

さらに未保存formについても、default state自体をlocalStorageへ保存する必要はない。

G7ではこの構造を変更する。

remote characterはDBを永続化先とし、明示的なDB保存操作を行うまでbrowser persistenceへ編集差分を保存しない。

未保存characterはbrowser persistenceを利用するが、form valuesが初期状態と異なる場合だけ保存する。

---

# Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- 既存Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G7: Character session routing`
- 依存: G1〜G6で実装済みのcloud persistence / Firebase Authentication
- target branch: `ex-16-7-character-session-routing`

## 親branchについて

`ex-16-character-sheet-cloud-persistence`はすでに`main`へmerge済みである。

したがってG7は親branchをbaseにしない。

local implementation開始時は最新`main`から、

```txt
ex-16-7-character-session-routing
```

を作成する。

G7追加に伴う既存Gate planの整合、G6完了状態の整理、親issueのarchive等は本issueでは行わない。

これらは`ex-17`でまとめて処理する。

---

# Character state model

## 1. 未保存character

query parameterにremote character IDが存在しない状態。

```txt
/character-sheet
```

この状態だけbrowser persistenceを利用する。

保存対象:

- form values
- character image

browser内では未保存characterを1件だけ保持する。

formはdefault stateとの差分が存在する場合だけlocalStorageへ保存する。

character imageは既存IndexedDB persistenceを未保存character専用として利用する。

---

## 2. Remote character

以下の状態。

```txt
/character-sheet?character=<id>
```

routeへ入った時点でAPIから指定characterを取得し、form / imageをmemoryへrestoreする。

remote characterの編集後のform / imageは、

- localStorageへ書かない
- IndexedDBへ書かない
- current remote IDをlocalStorageへ書かない

明示的なDB保存が成功するまでReact memoryだけに存在する。

---

## 3. Remote characterの未保存差分

remote characterを編集してもautosaveしない。

以下によって未保存差分が失われることを許容する。

- 別remote characterを開く
- 未保存characterへ移動する
- browser reload
- tab close
- URLを直接変更する

unsaved change確認dialogはG7では導入しない。

---

# Routing contract

## query parameter

current character identityは以下で決定する。

```txt
character
```

### parameterなし

```txt
/character-sheet
```

未保存character。

### parameterあり

```txt
/character-sheet?character=<id>
```

remote character。

React stateやlocalStorageに別のcurrent remote IDを持ち、URLと二重管理しない。

URLをcurrent character identityのSSoTとする。

---

# Client-side routing

character切替時にfull page reloadを行わない。

React Routerまたは同等のclient-side routing機構を使用する。

実装方式は既存Astro / React構成への影響を確認し、必要最小限とする。

不要にsite全体をSPA化しない。

対象はcharacter-sheet内部のcharacter identity transitionとする。

browser historyが自然に機能すること。

例:

```txt
?character=A
↓ 一覧からBを選択
?character=B
↓ browser back
?character=A
```

back / forwardによるquery parameter変更でも、表示characterをURLに従って切り替える。

---

# Browser persistence contract

## Form

現行localStorage persistenceは未保存characterだけに適用する。

remote character表示中はform autosaveを停止する。

remote characterから未保存characterへ戻った場合は、localStorageに未保存draftが存在すればrestoreする。

存在しなければdefault valuesを使用する。

### 未保存characterの自動保存

未保存characterのformはlocalStorageへ自動保存するが、常に保存するのではなく、初期状態との差分が存在する場合だけ保存する。

初期状態は`characterSheetDefaultValues`相当の未保存characterのdefault form valuesとする。

自動保存時は現在のform valuesと初期状態をdeep equalityで比較する。

```txt
current values deepEqual initial values
→ localStorageへ保存しない
→ 既存の未保存form dataがある場合は削除する

current values !deepEqual initial values
→ localStorageへ保存する
```

reference equalityではなく、form全体の値に対するdeep equalityを利用する。

これにより以下を防止する。

- キャラクターシートを開いただけでlocalStorage keyが生成される
- 一度入力した後、すべてdefault valuesへ戻してもlocalStorage dataが残り続ける
- 初期化後にdefault valuesがautosaveによって再保存される

対象key:

```txt
neon-underrealm-character-sheet-form
```

default stateそのものは永続化dataとして扱わない。

---

## Character image

現行IndexedDB persistenceは未保存characterだけに適用する。

remote characterの画像はAPI responseからmemoryへrestoreする。

remote character表示中の画像変更・画像削除はIndexedDBへ反映しない。

未保存characterの画像については既存仕様どおりIndexedDBへ保存する。

初期化時には未保存character imageを削除する。

---

## Remote character ID

以下のlocalStorage persistenceは廃止する。

```txt
neon-underrealm-character-sheet-remote-character
```

current remote IDはURLだけから取得する。

remote IDをbrowser persistenceへ保存しない。

---

# Transition contract

## 未保存 → remote新規保存

開始:

```txt
/character-sheet
```

DB保存時は新規characterとしてPOSTする。

POST成功までは、

- local draftを維持する
- URLを変更しない

成功して新規IDを取得した後、

1. 未保存formのlocalStorage persistenceを削除する
2. 未保存imageのIndexedDB persistenceを削除する
3. 新規remote characterをcurrent memory stateとして扱える状態にする
4. `?character=<new-id>`へclient-side遷移する

保存失敗時はlocal draftとURLを維持する。

---

## Remote → remote上書き保存

開始:

```txt
/character-sheet?character=A
```

通常DB保存ではAを更新する。

保存成功後もURLは、

```txt
?character=A
```

のままとする。

remote editing stateをbrowser persistenceへコピーしない。

---

## Remote → コピー保存

開始:

```txt
/character-sheet?character=A
```

コピー保存ではAのIDをsave requestへ引き継がず、新規recordを作成する。

新規ID Bの作成成功後、

```txt
/character-sheet?character=B
```

へclient-side遷移する。

Aは変更しない。

コピー保存成功時に未保存draft用localStorage / IndexedDBを経由しない。

---

## Remote → 別remote character

開始:

```txt
?character=A
```

一覧からBを選択した場合、

```txt
?character=B
```

へclient-side遷移する。

Aの未保存変更は破棄する。

BをAPIから取得してmemoryへrestoreする。

Aの未保存状態をbrowser persistenceへ保存しない。

---

## Remote → DB削除

開始:

```txt
?character=A
```

AのDB削除成功後、

```txt
/character-sheet
```

へclient-side遷移する。

削除失敗時はAを表示したままとし、URLを変更しない。

遷移後は既存の未保存draftがbrowser persistenceに存在する場合、それをrestoreする。

存在しない場合はdefault未保存characterを表示する。

---

# 初期化

「初期化」は未保存character専用操作とする。

```txt
/character-sheet
```

では利用可能。

```txt
/character-sheet?character=<id>
```

では利用不可。

remote characterに対して初期化を行い、

- remote characterの編集なのか
- 新規未保存characterへの切替なのか

が曖昧になる状態を作らない。

remote characterを元に別characterを作成する操作は「コピー保存」を利用する。

remote character表示中は初期化buttonをdisabledまたは非表示とし、既存UI方針に合わせて実装する。

## 未保存characterの初期化

初期化成功後はformをdefault valuesへ戻す。

default valuesはlocal persistence対象ではないため、

- localStorageの未保存form dataを削除する
- character imageが存在する場合はIndexedDBから削除する
- React stateをdefault未保存characterへ戻す

ものとする。

初期化後にform subscription等が発火しても、default valuesをlocalStorageへ再保存してはならない。

---

# Character list

character一覧からcharacterを選択した場合、直接formを永続状態として切り替えるのではなくURLを変更する。

```txt
select character A
→ navigate("?character=A")
→ route state change
→ GET A
→ memoryへrestore
```

一覧selectionとcharacter restoreのidentity transitionをURL経由へ統一する。

一覧自体のpagination / filtering / responsive designはG7で再設計しない。

---

# Multi-tab policy

## Remote character

各tabのURLとReact memoryを独立したedit sessionとして扱う。

例:

```txt
Tab A: ?character=A
Tab B: ?character=B
```

は完全に独立する。

以下も許可する。

```txt
Tab A: ?character=A
Tab B: ?character=A
```

同一remote characterを同時編集してもよい。

remote saveはlast-write-winsとする。

以下は導入しない。

- optimistic locking
- revision field
- ETag / If-Match
- remote editing lock
- BroadcastChannelによるremote edit同期
- tab間remote edit conflict warning

## 未保存character

browser originあたり未保存draftは1件だけとする。

複数tabでquery parameterなしのcharacter sheetを開いた場合も、永続保存先としては同じ未保存draftを参照する。

G7では未保存draftのリアルタイムcross-tab同期機構やlock機構は導入しない。

---

# Authenticationとの関係

Firebase Authenticationのbrowser persistenceはG6の仕様を維持する。

character editing stateのbrowser persistence制限と、Firebase SDKが管理するauthentication persistenceは別責務とする。

以下は変更しない。

- `browserLocalPersistence`
- auth state restoration
- request-time Firebase ID Token取得
- 419時のtoken refresh / retry
- login / logout behavior

ただしrouting変更に伴い、authenticated user変更時のremote character ownership再取得が破綻しないことを確認する。

既存のownership refreshに関する改善TODOそのものは`ex-17`へ残す。

---

# 対象範囲

- current remote character identityのquery parameter化
- character-sheet内client-side routing
- remote character ID localStorage persistenceの廃止
- local form persistenceを未保存characterだけへ限定
- 未保存form autosaveのdefault state判定
- form valuesとdefault valuesのdeep equality判定
- default state時のlocalStorage data削除
- IndexedDB character image persistenceを未保存characterだけへ限定
- remote form / imageをmemory-onlyへ変更
- list selectionからroute transition
- new save成功後のnew remote URL transition
- copy save成功後のnew remote URL transition
- delete成功後の未保存URL transition
- browser back / forwardへの追従
- 初期化を未保存characterだけへ制限
- 初期化後にdefault valuesがlocalStorageへ再保存されないことの保証
- routing / persistence state transition tests
- existing persistence / authentication testsの必要な更新

---

# 対象外

以下はG7では行わない。

- remote characterのoptimistic concurrency control
- revision管理
- same-character multi-tab conflict warning
- remote edit autosave
- remote edit cross-tab同期
- 未保存draftのcross-tab realtime同期
- unsaved changes離脱確認dialog
- character API / D1 / R2 data modelの再設計
- Firebase Authenticationの再設計
- character一覧UIの再設計
- production sample character投入
- payload上限contract整理
- Firebase public key error classification改善
- authentication refresh retry改善
- ex-16全体のdocument整合
- ex-16 parent / Gate planの最終整理
- G1〜G7 issue archive
- ex-16関連GitHub Issueのarchive整理
- `docs/TODO.md`のex-16残課題全体の回収

上記のdocument整合・archive・ex-16後片付けは`ex-17`で実施する。

---

# ex-17への明示的handoff

G7完了後も、ex-16関連documentationが一時的に実装と完全一致しないことを許容する。

特に以下はG7で完了させない。

- `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`へのG7反映・最終状態整理
- G6のstatus整理
- parent issue本文の最終実装反映
- character-sheet requirementsの永続化仕様更新
- architecture documentのlocal / remote persistence責務更新
- deployment / testing documentの整合
- obsoleteなremote ID persistence説明の除去
- ex-16 child issue archive
- ex-16 parent issue archive
- `docs/TODO.md`の残課題整理

これらは`ex-17`でまとめて回収する。

本issueではdocument cleanupを理由として実装完了をblockしない。

---

# dependency方針

client-side routingに必要なdependencyは、現在のfrontend構成を確認して決定する。

React Router等を追加する場合は、

- character-sheet内部で必要なrouting機能に限定する
- Astro site全体のrouting architectureを変更しない
- dependency追加がnative History API等より妥当であることを確認する

既存dependencyのみで安全かつ単純に実装できる場合は、新規router dependency追加を必須としない。

deep equalityについても、既存dependencyまたは小規模な既存utilityで適切に実現できる場合は、そのためだけに不要なdependencyを追加しない。

# Design references

- `docs/design/character-sheet/notes.md`
- `frontend/tests/vrt/character-sheet.spec.ts`

G7では既存のaction pane、character list dialog、toast、各dialogの視覚・文言を再設計しない。状態変更に伴って既存文言と矛盾する箇所が見つかった場合は、実装を進めずにユーザーへ報告する。

---

# 想定変更箇所

少なくとも以下を確認する。

```txt
frontend/src/character-sheet/CharacterSheetContainer.tsx
frontend/src/character-sheet/hooks/useCharacterSheetRootState.ts
frontend/src/character-sheet/hooks/useRemoteCharacterPersistence.ts
frontend/src/character-sheet/persistence/character-sheet-form.ts
frontend/src/character-sheet/persistence/character-image.ts
frontend/src/character-sheet/persistence/remote-character.ts
frontend/src/character-sheet/components/dialogs/CharacterSheetCharacterListDialog.tsx
frontend/tests/**
frontend/package.json
package-lock.json
```

実際のlocal repository stateを確認して変更対象を確定する。

`remote-character.ts`はcurrent remote ID persistenceが不要になれば削除候補とする。

必要に応じてcharacter-sheet routing専用hook / moduleを追加する。

---

# 完了条件

- [ ] query parameterなしで未保存characterを表示できる
- [ ] 未保存characterのformは初期状態との差分がある場合だけlocalStorageへ保存される
- [ ] form valuesと初期状態の比較はdeep equalityで行われる
- [ ] 初期状態の未保存characterを表示しただけではlocalStorageへform dataが作成されない
- [ ] 未保存characterのform変更がdebounce後にlocalStorageへ保存される
- [ ] 編集後に全項目を初期状態へ戻した場合、既存のlocalStorage form dataが削除される
- [ ] 初期化後にdefault form valuesがlocalStorageへ再保存されない
- [ ] 未保存characterの画像がIndexedDBへ保存・restoreされる
- [ ] `?character=<id>`で指定remote characterを取得・表示できる
- [ ] remote characterのform変更がlocalStorageへ書き込まれない
- [ ] remote characterの画像変更がIndexedDBへ書き込まれない
- [ ] current remote character IDをlocalStorageへ保存しない
- [ ] character一覧からclient-side routingでremote characterを切り替えられる
- [ ] browser back / forwardで表示characterがURLに追従する
- [ ] remote character切替時に変更前characterの未保存差分がrestoreされない
- [ ] 未保存characterのDB新規保存成功後に新remote IDのURLへ遷移する
- [ ] 新規保存失敗時は未保存draftとURLを維持する
- [ ] remote characterの通常保存ではcurrent remote IDを維持する
- [ ] コピー保存成功後にコピー先new remote IDのURLへ遷移する
- [ ] DB削除成功後にquery parameterなしURLへ遷移する
- [ ] DB削除失敗時はcurrent remote URLを維持する
- [ ] remote character表示中は初期化できない
- [ ] 未保存character表示中は初期化できる
- [ ] Firebase Authenticationのreload persistenceを維持する
- [ ] same remote character multi-tab editを禁止する仕組みを追加していない
- [ ] remote saveは既存どおりlast-write-winsで動作する
- [ ] frontend unit / component testsが成功する
- [ ] root quality checksが成功する
- [ ] production subpath `/neon-underrealm-trpg/`でroutingが破綻しない
- [ ] full page reloadを前提としないcharacter切替になっている
- [ ] ex-17へ委譲したdocumentation / archive作業をG7へ持ち込んでいない

---

# チェックポイント

## State ownership

- URLがcurrent remote character identityのSSoTになっていること
- React stateとlocalStorageでremote IDを二重管理していないこと
- local persistenceが未保存draftだけへ限定されていること
- remote form / imageがmemory-onlyであること

## Routing

以下のすべてが同じroute contractで動くこと。

- direct access
- list selection
- browser back
- browser forward
- create success
- copy success
- delete success

## Local autosave

以下をテストする。

### 1. 初期状態でmount

```txt
localStorage writeなし
localStorage keyなし
```

default form valuesを自動保存しない。

### 2. 初期状態から値を変更

debounce後にlocalStorageへ保存される。

### 3. 保存済み状態から全値を初期状態へ戻す

localStorage keyが削除される。

### 4. 初期化

- localStorage keyが削除される
- IndexedDB imageが削除される
- formはdefault valuesへ戻る
- form subscription / debounceによってdefault valuesが再保存されない

### 5. Remote characterを編集

- localStorage writeなし
- localStorage deleteなし
- IndexedDB writeなし
- IndexedDB deleteなし

remote edit sessionが未保存draft persistenceへ干渉しない。

## Persistence

未保存characterとremote characterで、form / image persistenceの境界がテストされていること。

特にremote character編集後にlocal draftを破壊しないことを確認する。

## Failure paths

以下でURLとediting stateが不整合にならないこと。

- GET失敗
- POST失敗
- PUT失敗
- DELETE失敗

成功前に先行してroute transitionしないこと。

## Async route race

remote A取得中にremote Bへ遷移した場合、

```txt
GET A start
→ navigate B
→ GET B start
→ GET B complete
→ GET A complete
```

の順序でも、遅れて返ったA responseがBの表示状態を上書きしないこと。

route identityとresponse applicabilityを確認してからstateへ反映する。

## Subpath

GitHub Pages production base:

```txt
/neon-underrealm-trpg/
```

配下でquery parameter routingが成立すること。

root absolute pathを誤って生成しないこと。

## Scope discipline

G7では実装上必要な変更だけを行う。

document全面整合、Gate plan整理、archive、ex-16 cleanupは`ex-17`へ残す。

---

# レビュー観点

- current character identityがURL以外へ重複保存されていないか
- remote characterがlocal autosaveへ混入していないか
- remote imageが共有IndexedDB keyへ書かれていないか
- default form valuesがlocalStorageへ常時保存される構造が残っていないか
- deep equalityがreference equalityや一部field比較になっていないか
- 編集後にdefault stateへ戻った際、保存dataが削除されるか
- reset後のform subscriptionによってdefault valuesが再保存されないか
- route transition前後で古いasync GETが新route stateを上書きしないか
- A取得中にBへ遷移した場合、遅れて返ったA responseがBを上書きしないか
- POST / copy / delete成功前にURLを変更していないか
- route変更時にremoteの未保存差分が意図せずlocal draftへ保存されていないか
- 未保存draftからremoteへ保存成功した後に古いlocal draftが残らないか
- remote削除後にquery parameterなし状態が正常にrestoreされるか
- login / logoutによるownership変更とroute identityが混線していないか
- Astro base pathを無視したrouting実装になっていないか
- router導入によってcharacter-sheet以外を不要にSPA化していないか
- ex-17対象のdocumentation cleanupをこのissueへ拡大していないか

---

# Local validation

- local branch: `ex-16-7-character-session-routing`（local `main`の`4b37cd5`から作成）
- issue: `docs/issue/ex-16-7-character-session-routing.md`
- 確認済み実装: character sheet root state、remote persistence、form / image / remote ID persistence、character list dialog、既存hook・component・persistence tests
- 関連TODO: JSON import時のremote binding解除は`ex-17`へ残し、G7の対象外とする
- design target: `docs/design/character-sheet/notes.md` と既存VRT targetを確認済み
- parent Gate planがG6までである不整合と、active documentationの旧仕様は、ユーザー指示により`ex-17`で回収する

未実施の確認は実装完了時に行う。

- local tests / quality checks
- frontend build
- browser routingの実動作
- production subpath相当の実ブラウザ確認
- target限定Visual Review
