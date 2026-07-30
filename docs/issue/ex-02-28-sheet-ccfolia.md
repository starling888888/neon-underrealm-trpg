# ex-02-28-sheet-ccfolia

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/`配下の承認済みdesign画像を遵守する。
- ユーザーの最新指示は画像デザインと`docs/design/character-sheet/notes.md`の既存記述を上書きする。CCFOLIAコピー操作を押した直後は、visible titleなしの確認dialogを開き、本文を「CCFOLIAのコマ作成データをクリップボードにコピーします。CCFOLIAの盤面で貼り付けを行うとコマが作成されます。」、actionをmuted outlineの`キャンセル`とdefault solidの`コピー`とする。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、画像デザインまたは上記ユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

Webキャラクターシートの`CCFOLIAコピー`操作で、現在の入力と派生値からCCFOLIA Clipboard API用のキャラクター駒JSONを生成し、ユーザー確認後にクリップボードへコピーできるようにする。

## 背景

親issue `docs/issue/ex-02-web-character-sheet.md` のGate planで、G28はCCFOLIA出力を扱う。`docs/requirements/character-sheet.md`はClipboard API用JSONの生成・コピーと、成功または失敗のdialog通知を初期scopeに含めている。

CCFOLIAの形式・出力項目・数値の扱い・必要なテストは、ユーザー指定の`.tmp/ccfolia_copy.md`をこのGateの正本とする。そこにある実装例は参照せず、仕様節（目的、出力JSON、未入力値・異常値、テスト要件）だけを適用する。

関連参照:

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- 親Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` のG28
- 要件: `docs/requirements/character-sheet.md` の「保存、復元、出力」
- アーキテクチャ: `docs/architectures/character-sheet.md` のContainer / Presenter責務、`logic/`、`browser/`、Clipboardのテスト境界
- design target: `docs/design/character-sheet/notes.md` の「操作領域」「ダイアログ」とVRT参照情報
- CCFOLIA仕様: `.tmp/ccfolia_copy.md`
- 関連TODO: `docs/TODO.md`にG28を直接対象とする項目はない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G28: CCFOLIA出力を扱う。`

このissueはG28だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet`で実装する。G30のヘルプ、G31の統合、canonical VRT baselineの更新は扱わない。

## アーキテクチャ適用

| 適用節                                              | 許可する変更                                                                                                                                                                              | 禁止する変更                                                                                                                | 確認するテスト層                                                                                                               |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `実装時のアーキテクチャ遵守`                        | 最終diffをこの表と本issueの対象範囲へ対応付け、G28に必要なcopy action callback、CCFOLIA JSON生成、Clipboard adapter、確認・通知dialogだけを変更する。                                     | JSON export / import、保存・復元、画像、エラー集約、初期化、ヘルプ、canonical VRT baselineを混在させる。                    | 最終diff照合、Node、Component、hook、必要最小限のbrowser behavior。                                                            |
| `Feature境界`                                       | CCFOLIA固有の純粋logic、Clipboard browser adapter、root-level dialogとContainer結線を`src/character-sheet/`内に追加する。                                                                 | site共通Component、別feature、RHFと並行するstate store、全機能の先行抽象化を追加する。                                      | Nodeのlogic / browser adapter、Component、Containerまたはroot state hook。                                                     |
| `Container / Presenterの責務`、`状態と派生値の境界` | Containerがdialog開閉、操作元focus、copy requestの実行順を持ち、form値と既存派生値を純粋logicへ渡す。`CharacterSheetActionPane`とdialog Componentは値、開閉状態、callbackだけを受け取る。 | Presenter / dialogからRHF、派生値算出、Clipboard API、保存処理へ直接アクセスする。CCFOLIA JSONの組み立てをContainerへ置く。 | dialog / ActionPane Component、root state hook、Nodeの派生値入力からのJSON。                                                   |
| `データ境界`                                        | form値と派生値をserializableなCCFOLIA出力入力へ写し、出力objectを`logic/`で生成する。                                                                                                     | CCFOLIA出力を保存、JSON import / export形式、RHF値、master dataへ混在させる。セッション中の状態をformへ追加する。           | Nodeで8 status、縁の数え方、異常値の`0`化、未使用property非出力。                                                              |
| `テスト層と配置`、`Character-sheet E2E / VRTの境界` | 標準Clipboard APIを`browser/`の小さな差し替え可能adapterへ閉じ、test doubleで成功・失敗を検証する。確認・成功・失敗dialogの対象限定E2E / VRT specを追加・更新する。                       | Clipboard polyfill・UI library・browser APIをNode testへ要求する実装、canonical VRT baselineの追加・更新を行う。            | browser adapter、dialog / ActionPane Component、root state hook、ユーザーレビュー完了後の対象E2E、VRT、actual screenshot確認。 |

## 対象範囲

- `CCFOLIAコピー`をdesktop操作列とtablet / mobile操作メニューの両方から開ける確認dialogへ接続する。dialogはvisible titleを置かず、`aria-label`でアクセシブル名`CCFOLIAコピー`を持つ。`キャンセル`、Escape、dialogのclose requestではコピーせず、操作triggerへfocusを戻す。初期focusは`キャンセル`とする。
- `コピー`を押したときだけ、現在のフォーム値と既存の派生値から`kind: "character"`、`data.name`、`data.initiative`、固定順8件の`data.status`だけを持つJSONを生成し、標準Clipboard APIへ文字列として書き込む。新規ライブラリは追加しない。
- JSONのstatus順を`体力`、`精神力`、`気合`、`縁`、`覚悟にした縁`、`出血`、`毒`、`BT`で固定する。体力・精神力は全快、気合・出血・毒・BTは`value: 0, max: 0`、縁と覚悟にした縁は入力済み行・覚悟済み入力行とルール上の縁最大値を用いる。縁入力件数が最大値を超えても丸めず、ビルドerrorがあってもコピーを妨げない。
- PC名が未入力なら空文字列を、最終行動値・最大体力・最大精神力・縁最大値が`null`、`undefined`、非有限数または未算出なら`0`を出力する。`commands`を含む未使用のCharacter propertyは出力しない。
- コピー成功時は`docs/design/character-sheet/notes.md`の本文「クリップボードにコピーしました。」を、失敗時は`.tmp/ccfolia_copy.md`の本文「クリップボードへのコピーに失敗しました。\nブラウザの権限設定を確認してください。」を、ブラウザ組み込み`alert`ではないroot-level dialogで通知する。確認dialogとは別に扱い、Clipboard API失敗を握りつぶさない。各通知dialogはvisible titleを置かず、`aria-label`を成功時`CCFOLIAコピー完了`、失敗時`CCFOLIAコピー失敗`とし、default solidの`確認`を初期focus・dismiss actionにする。dismiss後はコピー操作triggerへfocusを戻す。
- 純粋なCCFOLIAデータ生成、Clipboard adapter、Containerの結線、確認・通知dialog、操作ペインの表示を必要最小限で追加し、unit / component / hook testで仕様を検証する。
- UI変更のため、implementationではCCFOLIA確認dialogと成功・失敗通知dialogの対象限定E2E / VRT specだけを追加・更新する。ユーザーレビュー完了の明示指示後に、desktop / tablet / mobileのactual screenshotを開いて表示契約へ照合し、対象限定VRTを実行する。G31までGit管理されたcanonical VRT baselineは追加・変更しない。

## 初期スコープ外

- CCFOLIAコマンドパレット、パラメータ、memo、外部URL、画像・立ち絵、座標、角度、サイズ、色、公開設定、ownerなど、`.tmp/ccfolia_copy.md`が出力しないCharacter propertyを追加しない。
- CCFOLIA以外の外部ツール連携、ログイン、ネットワークAPI、サーバー・DB・クラウド保存、セッション中のHP等の状態管理、ダイスローラーを実装しない。
- JSON export / import、保存・復元、画像、エラー集約、初期化、ヘルプ、既存のゲーム算出式・入力validation・操作メニューのレイアウトを変更しない。
- 新規npm package、UI library、Clipboard polyfill、browser組み込み`alert`を追加しない。
- `docs/plan.md`、親Gate planのG28状態、canonical VRT baselineを変更しない。

## 完了条件

- [ ] `CCFOLIAコピー`のdesktop / tablet / mobile triggerが、指定されたtitleなし確認dialogを開く。本文、`キャンセル`（muted outline）、`コピー`（default solid）、初期focus、cancel / Escape時のcopy抑止とfocus復帰が契約どおりである。
- [ ] `コピー`の確認後だけ、CCFOLIA Clipboard APIの`kind: "character"`形式JSON文字列を標準Clipboard APIへ書き込む。キャンセル時はClipboard APIを呼ばない。
- [ ] 出力JSONがPC名、最終行動値、体力、精神力、気合、縁、覚悟にした縁、出血、毒、BTについて、`.tmp/ccfolia_copy.md`の出力内容・固定順・未入力値規約を満たし、未使用propertyを含まない。
- [ ] 入力済み縁、覚悟にした縁、上限超過の縁、空白だけの縁、未入力値・非有限数、ビルドerror中のコピーを純粋logic testで検証している。
- [ ] Clipboard API成功時は「クリップボードにコピーしました。」、失敗時は指定の2行本文をそれぞれtitleなし通知dialogで表示し、`確認`の初期focus・dismiss・triggerへのfocus復帰を満たす。失敗時にもフォーム値・保存済み状態を変更しない。
- [ ] `CharacterSheetActionPane`、dialog、Container / root state、CCFOLIA logic、Clipboard adapterの責務境界を保つcomponent / hook / browser testがある。
- [ ] ユーザーレビュー完了の明示指示後に、CCFOLIA確認・成功通知・失敗通知の各stateをdesktop / tablet / mobileで実画面確認し、対象限定VRTの結果とactual screenshotをissueへ記録している。canonical baselineは変更していない。
- [ ] `npm run check`、`npm run build`、対象testが通る。

## チェックポイント

- [ ] `/character-sheet/`以外の既存routeを壊していない。
- [ ] GitHub Pagesのサブパス公開と静的ホスティングに影響しない。
- [ ] Clipboard APIを`browser/`の差し替え可能な小さなadapterへ閉じ、Presenter / leaf Componentがbrowser APIへ直接アクセスしていない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md`と矛盾していない。
- [ ] `docs/design/character-sheet/notes.md`およびユーザー指定の確認dialogと矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

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
- `tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet-scenarios.ts`（必要なtarget追加のみ。baselineは変更しない）

## レビュー観点

- ユーザー指定の確認dialogが、`コピー`前のtitleなし確認であること、本文と2 actionのcolor / variantが正確であること。
- `.tmp/ccfolia_copy.md`の実装例へ依存せず、JSON構造、8 statusの順序、縁の数え方、異常値の`0`化、出力しないpropertyを満たすこと。
- 確認dialogとコピー成功 / 失敗通知を混同せず、成功本文はdesign notes、失敗本文は`.tmp/ccfolia_copy.md`を採用し、Clipboard API失敗が可視のdialog通知になること。
- 既存のActionPane、root-level dialog、Container / `logic/` / `browser/`の境界と、dialog優先のEscape・focus復帰契約を維持すること。
- G31までcanonical VRT baselineを変更しないまま、3 viewport・3 dialog stateのactual screenshotと対象限定VRTを確認すること。

## 備考

`.tmp/ccfolia_copy.md`はCCFOLIA JSONとClipboard失敗本文の正本とする。一方、成功通知の可視本文はUI design正本の`docs/design/character-sheet/notes.md`に従う。最新のユーザー指示は、コピー前の確認dialogを明示して上書きしている。
