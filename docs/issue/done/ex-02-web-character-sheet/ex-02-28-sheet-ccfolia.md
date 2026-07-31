# ex-02-28-sheet-ccfolia

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/`配下の承認済みdesign画像を遵守する。
- ユーザーの最新指示は画像デザインと`docs/design/character-sheet/notes.md`の既存記述を上書きする。CCFOLIAコピー操作を押した直後は、visible titleなしの確認dialogを開き、本文を「CCFOLIAのコマ作成データをクリップボードにコピーします。CCFOLIAの盤面で貼り付けを行うとコマが作成されます。」、actionをmuted outlineの`キャンセル`とdefault solidの`コピー`とする。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、画像デザインまたは上記ユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

Webキャラクターシートの`CCFOLIAコピー`操作で、現在の入力と派生値からCCFOLIA Clipboard API用のキャラクター駒JSONを生成し、ユーザー確認後にクリップボードへコピーできるようにする。

## 背景

親issue `docs/issue/done/ex-02-web-character-sheet.md` のGate planで、G28はCCFOLIA出力を扱う。`docs/requirements/character-sheet.md`はClipboard API用JSONの生成・コピーと、成功または失敗のdialog通知を初期scopeに含めている。

CCFOLIAの形式・出力項目・数値の扱い・必要なテストは、ユーザー指定の`.tmp/ccfolia_copy.md`をこのGateの正本とする。そこにある実装例は参照せず、仕様節（目的、出力JSON、未入力値・異常値、テスト要件）だけを適用する。

関連参照:

- 親issue: `docs/issue/done/ex-02-web-character-sheet.md`
- 親Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` のG28
- 要件: `docs/requirements/character-sheet.md` の「保存、復元、出力」
- アーキテクチャ: `docs/architectures/character-sheet.md` のContainer / Presenter責務、`logic/`、`browser/`、Clipboardのテスト境界
- design target: `docs/design/character-sheet/notes.md` の「操作領域」「ダイアログ」とVRT参照情報
- CCFOLIA仕様: `.tmp/ccfolia_copy.md`
- 関連TODO: `docs/TODO.md`にG28を直接対象とする項目はない。

## Gate関係

- 親issue: `docs/issue/done/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G28: CCFOLIA出力を扱う。`

このissueはG28だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet`で実装する。G30のヘルプ、G31の統合は扱わない。2026-07-30のユーザー明示指示により、CCFOLIA確認・成功・失敗の3 state × 3 viewportだけはcanonical VRT baselineの追加とGit管理を許可する。

## アーキテクチャ適用

| 適用節                                              | 許可する変更                                                                                                                                                                                                   | 禁止する変更                                                                                                                  | 確認するテスト層                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `実装時のアーキテクチャ遵守`                        | 最終diffをこの表と本issueの対象範囲へ対応付け、G28に必要なcopy action callback、CCFOLIA JSON生成、Clipboard adapter、確認・通知dialogと、ユーザー承認済みの9枚のCCFOLIA canonical VRT baselineだけを変更する。 | JSON export / import、保存・復元、画像、エラー集約、初期化、ヘルプ、CCFOLIA以外のcanonical VRT baselineを混在させる。         | 最終diff照合、Node、Component、hook、必要最小限のbrowser behavior、承認済みtarget限定VRT。                                     |
| `Feature境界`                                       | CCFOLIA固有の純粋logic、Clipboard browser adapter、root-level dialogとContainer結線を`src/character-sheet/`内に追加する。                                                                                      | site共通Component、別feature、RHFと並行するstate store、全機能の先行抽象化を追加する。                                        | Nodeのlogic / browser adapter、Component、Containerまたはroot state hook。                                                     |
| `Container / Presenterの責務`、`状態と派生値の境界` | Containerがdialog開閉、操作元focus、copy requestの実行順を持ち、form値と既存派生値を純粋logicへ渡す。`CharacterSheetActionPane`とdialog Componentは値、開閉状態、callbackだけを受け取る。                      | Presenter / dialogからRHF、派生値算出、Clipboard API、保存処理へ直接アクセスする。CCFOLIA JSONの組み立てをContainerへ置く。   | dialog / ActionPane Component、root state hook、Nodeの派生値入力からのJSON。                                                   |
| `データ境界`                                        | form値と派生値をserializableなCCFOLIA出力入力へ写し、出力objectを`logic/`で生成する。                                                                                                                          | CCFOLIA出力を保存、JSON import / export形式、RHF値、master dataへ混在させる。セッション中の状態をformへ追加する。             | Nodeで8 status、縁の数え方、異常値の`0`化、未使用property非出力。                                                              |
| `テスト層と配置`、`Character-sheet E2E / VRTの境界` | 標準Clipboard APIを`browser/`の小さな差し替え可能adapterへ閉じ、test doubleで成功・失敗を検証する。確認・成功・失敗dialogの対象限定E2E / VRT specと、ユーザー承認済みの9枚のbaselineを追加する。               | Clipboard polyfill・UI library・browser APIをNode testへ要求する実装、CCFOLIA以外のcanonical VRT baselineの追加・更新を行う。 | browser adapter、dialog / ActionPane Component、root state hook、ユーザーレビュー完了後の対象E2E、VRT、actual screenshot確認。 |

## 対象範囲

- `CCFOLIAコピー`をdesktop操作列とtablet / mobile操作メニューの両方から開ける確認dialogへ接続する。dialogはvisible titleを置かず、`aria-label`でアクセシブル名`CCFOLIAコピー`を持つ。`キャンセル`、Escape、dialogのclose requestではコピーせず、操作triggerへfocusを戻す。初期focusは`キャンセル`とする。
- `コピー`を押したときだけ、現在のフォーム値と既存の派生値から`kind: "character"`、`data.name`、`data.initiative`、固定順8件の`data.status`だけを持つJSONを生成し、標準Clipboard APIへ文字列として書き込む。新規ライブラリは追加しない。
- JSONのstatus順を`体力`、`精神力`、`気合`、`縁`、`覚悟にした縁`、`出血`、`毒`、`BT`で固定する。体力・精神力は全快、気合・出血・毒・BTは`value: 0, max: 0`、縁と覚悟にした縁は入力済み行・覚悟済み入力行とルール上の縁最大値を用いる。縁入力件数が最大値を超えても丸めず、ビルドerrorがあってもコピーを妨げない。
- PC名が未入力なら空文字列を、最終行動値・最大体力・最大精神力・縁最大値が`null`、`undefined`、非有限数または未算出なら`0`を出力する。`commands`を含む未使用のCharacter propertyは出力しない。
- コピー成功時は`docs/design/character-sheet/notes.md`の本文「クリップボードにコピーしました。」を、失敗時は`.tmp/ccfolia_copy.md`の本文「クリップボードへのコピーに失敗しました。\nブラウザの権限設定を確認してください。」を、ブラウザ組み込み`alert`ではないroot-level dialogで通知する。確認dialogとは別に扱い、Clipboard API失敗を握りつぶさない。各通知dialogはvisible titleを置かず、`aria-label`を成功時`CCFOLIAコピー完了`、失敗時`CCFOLIAコピー失敗`とし、default solidの`確認`を初期focus・dismiss actionにする。dismiss後はコピー操作triggerへfocusを戻す。
- 純粋なCCFOLIAデータ生成、Clipboard adapter、Containerの結線、確認・通知dialog、操作ペインの表示を必要最小限で追加し、unit / component / hook testで仕様を検証する。
- UI変更のため、implementationではCCFOLIA確認dialogと成功・失敗通知dialogの対象限定E2E / VRT specだけを追加・更新する。ユーザーレビュー完了の明示指示後に、desktop / tablet / mobileのactual screenshotを開いて表示契約へ照合し、対象限定VRTを実行する。2026-07-30のユーザー明示指示により、CCFOLIAの3 state × 3 viewportに限りGit管理されたcanonical VRT baselineを追加する。

## 初期スコープ外

- CCFOLIAコマンドパレット、パラメータ、memo、外部URL、画像・立ち絵、座標、角度、サイズ、色、公開設定、ownerなど、`.tmp/ccfolia_copy.md`が出力しないCharacter propertyを追加しない。
- CCFOLIA以外の外部ツール連携、ログイン、ネットワークAPI、サーバー・DB・クラウド保存、セッション中のHP等の状態管理、ダイスローラーを実装しない。
- JSON export / import、保存・復元、画像、エラー集約、初期化、ヘルプ、既存のゲーム算出式・入力validation・操作メニューのレイアウトを変更しない。
- 新規npm package、UI library、Clipboard polyfill、browser組み込み`alert`を追加しない。
- `docs/plan.md`、親Gate planのG28状態、CCFOLIAの3 state × 3 viewport以外のcanonical VRT baselineを変更しない。

## 完了条件

- [x] `CCFOLIAコピー`のdesktop / tablet / mobile triggerが、指定されたtitleなし確認dialogを開く。本文、`キャンセル`（muted outline）、`コピー`（default solid）、初期focus、cancel / Escape時のcopy抑止とfocus復帰が契約どおりである。
- [x] `コピー`の確認後だけ、CCFOLIA Clipboard APIの`kind: "character"`形式JSON文字列を標準Clipboard APIへ書き込む。キャンセル時はClipboard APIを呼ばない。
- [x] 出力JSONがPC名、最終行動値、体力、精神力、気合、縁、覚悟にした縁、出血、毒、BTについて、`.tmp/ccfolia_copy.md`の出力内容・固定順・未入力値規約を満たし、未使用propertyを含まない。
- [x] 入力済み縁、覚悟にした縁、上限超過の縁、空白だけの縁、未入力値・非有限数、ビルドerror中のコピーを純粋logic testで検証している。
- [x] Clipboard API成功時は「クリップボードにコピーしました。」、失敗時は指定の2行本文をそれぞれtitleなし通知dialogで表示し、`確認`の初期focus・dismiss・triggerへのfocus復帰を満たす。失敗時にもフォーム値・保存済み状態を変更しない。
- [x] `CharacterSheetActionPane`、dialog、Container / root state、CCFOLIA logic、Clipboard adapterの責務境界を保つcomponent / hook / browser testがある。
- [x] ユーザーレビュー完了の明示指示後に、CCFOLIA確認・成功通知・失敗通知の各stateをdesktop / tablet / mobileで実画面確認し、対象限定VRTの結果とactual screenshotをissueへ記録している。ユーザー承認済みのcanonical baseline 9枚だけを追加した。
- [x] `npm run check`、`npm run build`、対象testが通る。

## チェックポイント

- [x] `/character-sheet/`以外の既存routeを壊していない。
- [x] GitHub Pagesのサブパス公開と静的ホスティングに影響しない。
- [x] Clipboard APIを`browser/`の差し替え可能な小さなadapterへ閉じ、Presenter / leaf Componentがbrowser APIへ直接アクセスしていない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md`と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`およびユーザー指定の確認dialogと矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/logic/ccfolia.ts`
- `src/character-sheet/browser/ccfolia-clipboard.ts`
- `src/character-sheet/components/dialogs/CharacterSheetCcfoliaCopyConfirmDialog.tsx`
- `src/character-sheet/components/dialogs/`配下のCCFOLIA通知dialog Componentと必要なCSS Module
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/useCharacterSheetRootState.ts`
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/ccfolia.test.ts`
- `tests/node/character-sheet/browser/ccfolia-clipboard.test.ts`
- `tests/components/character-sheet/`配下のCCFOLIA dialog / action test
- `tests/hooks/character-sheet/useCharacterSheetRootState.test.tsx`
- `tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`
- `canonical-snapshots/visual/character-sheet/dialogs/ccfolia-copy-*.png`（ユーザー承認済み9枚のみ）

## レビュー観点

- ユーザー指定の確認dialogが、`コピー`前のtitleなし確認であること、本文と2 actionのcolor / variantが正確であること。
- `.tmp/ccfolia_copy.md`の実装例へ依存せず、JSON構造、8 statusの順序、縁の数え方、異常値の`0`化、出力しないpropertyを満たすこと。
- 確認dialogとコピー成功 / 失敗通知を混同せず、成功本文はdesign notes、失敗本文は`.tmp/ccfolia_copy.md`を採用し、Clipboard API失敗が可視のdialog通知になること。
- 既存のActionPane、root-level dialog、Container / `logic/` / `browser/`の境界と、dialog優先のEscape・focus復帰契約を維持すること。
- 3 viewport・3 dialog stateのactual screenshotと対象限定VRTを確認し、ユーザー承認済みの9枚だけをcanonical VRT baselineへ追加していること。

## 備考

`.tmp/ccfolia_copy.md`はCCFOLIA JSONとClipboard失敗本文の正本とする。一方、成功通知の可視本文はUI design正本の`docs/design/character-sheet/notes.md`に従う。最新のユーザー指示は、コピー前の確認dialogを明示して上書きしている。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の`@ccfolia-copy`
- route / states / viewports: `/character-sheet/`の`ccfolia-copy-confirm`、`ccfolia-copy-success`、`ccfolia-copy-failure`をdesktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で確認した。

### レビュー結果

| 対象                                | 判定 | 差分                           | 対応                                  |
| ----------------------------------- | ---- | ------------------------------ | ------------------------------------- |
| 3 state × desktop / tablet / mobile | OK   | 新規baselineのため比較対象なし | 承認済み9枚を作成し、更新後比較で確認 |

### 実画面確認

- `/character-sheet/` / confirm・success・failure / desktop・tablet・mobile:
  - full-page overview: 取得しない。局所dialogの表示契約には使用しない。
  - locator screenshot: 各dialog本体をoriginal pixel resolutionで9枚開き、本文の折返し、action配置・到達性、visible titleなし、dialog幅、clipping、横overflowがないことを確認した。
  - checked acceptance criteria: confirmは指定本文、muted outlineの`キャンセル`、default solidの`コピー`。success / failureは指定本文とdefault solidの`確認`を満たす。
  - result: OK。

### 自己修正した項目

- [ ] なし。

### 人間判断が必要な差分

- なし。ユーザー明示指示により、CCFOLIAの3 state × 3 viewportのcanonical baselineを追加した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分をユーザー明示指示として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- 既存の`exports JSON from desktop and responsive action buttons` E2Eが、`CCFOLIAコピー`を副作用のない操作として連続クリックしている。G28ではこの操作がmodal確認dialogを開くため、dialogを閉じずに続けると外側のエラー集約`確認`buttonを操作できない。

### 判定

- source: browser-draft（`.tmp/chatgpt-review.md`）
- classification: valid
- local validation: `tests/visual/character-sheet.spec.ts`の現行loopが`ヘルプ`、`インポート`、`CCFOLIAコピー`を連続クリックしていること、`CCFOLIAコピー`のdialogには`キャンセル`と`コピー`だけがあることを確認した。全E2Eの直近実行では、この箇所より前の既存JSON exportファイル名assertionで失敗したため、review本文が述べる操作不能timeoutまでは到達していない。ただし、前段の既存失敗を解消した後に現行loopが統合回帰になることはローカル実装とdialog契約から確認できる。

### 対応方針

- 既存smoke testの副作用なし操作loopから`CCFOLIAコピー`を外す。CCFOLIAの確認・成功・失敗・focus復帰は、このGateで追加済みの専用E2Eへ保持する。
- 修正時は、CCFOLIA専用E2Eに加え、`tests/visual/character-sheet.spec.ts`全体を実行して既存smokeとの統合を確認する。直近で観測したJSON exportファイル名の既存失敗は、同一実行で再現した場合に原因を分離して扱う。

### 対応完了チェックリスト

- [x] 既存smoke testからCCFOLIAを副作用なし操作として扱う前提を除く
- [x] CCFOLIA専用E2Eとcharacter-sheet全体E2Eを実行する。`npx playwright test tests/visual/character-sheet.spec.ts --workers=1` は31件通過した。
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- Containerが現在のフォーム値と派生値をCCFOLIA JSONへ渡す結線を、Container testまたはE2Eで直接検証していない。現行のContainer testはClipboard操作の呼出回数だけを、E2Eは通知dialogだけを確認しているため、値の取り違え・縁行の渡し忘れを検知できない。

### 判定

- source: local-agent（通常Tech Review）
- classification: valid
- local validation: `CharacterSheetContainer`がPC名、行動値、体力、精神力、縁上限、縁行を`serializeCcfoliaCharacterClipboardData()`へ渡すことを確認した。純粋logic testは合成入力を検証している一方、Container testの`onCcfoliaCopy`は呼出回数のみ、E2Eの`navigator.clipboard.writeText` stubはpayloadを保持しないため、この結線境界は未検証である。

### 対応方針

- Container testでフォーム入力と派生値を設定し、`onCcfoliaCopy`へ渡したJSON文字列をparseして、少なくともPC名、行動値、体力、精神力、縁・覚悟にした縁を確認する。純粋logicの仕様testは重複させず、Containerからlogicへの入力結線だけを担保する。

### 対応完了チェックリスト

- [x] ContainerからCCFOLIA logicへ渡す実フォーム値・派生値を検証するtestを追加する
- [x] 対象Component / hook testが通る。`CharacterSheetContainer.test.tsx` は15件通過した。
- [x] `npm run check` が通る
- [x] `npm run build` が通る
