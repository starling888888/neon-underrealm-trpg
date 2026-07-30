# ex-02-26-sheet-json-export

## 最優先のデザイン入力

- 実装時に、対象の`.tmp/design/character-sheet/`配下にある承認済みdesign画像を遵守する。
- このGateは、既存の操作領域にある`エクスポート`buttonへ副作用を接続するだけであり、配置、button文言、menu、dialogの見た目・導線を変更しない。既存UIをdraft画像より優先する。
- ユーザーの最新指示は画像デザインを上書きする。今回、実行時はアプリ内dialogを追加せず、ブラウザ標準のファイル保存ダイアログを開く。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、画像デザインの代わりに画面配置・導線・状態表現を決める入力として扱わない。
- 画像デザインまたはユーザー指示にない配置・導線・状態表現は実装都合で補完しない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

現在のRHF form valueへ選択済み画像のbase64文字列を`imageBase64String`として合成し、JSONファイルとしてブラウザ標準の保存ダイアログから出力できるようにする。

## 背景

G23で表示だけを作成した既存の`エクスポート`buttonは、まだ副作用を持たない。G6の画像はRHF値と独立したIndexedDB recordとして保持しており、G24のlocalStorage下書きにも含めない。そのため出力時だけ、現在のform valueとroot-stateの画像recordを1つのJSONへ合成する。

関連する正本・参照先は以下とする。

- `docs/issue/ex-02-web-character-sheet/plan.md` のG26
- `docs/requirements/character-sheet.md` の「保存、復元、出力」
- `docs/architectures/character-sheet.md` の「状態と派生値の境界」「データ境界」「テスト層と配置」
- `docs/design/character-sheet/notes.md` の「操作領域」
- `.tmp/design/character-sheet/` の承認済み操作領域draft
- `docs/TODO.md` のJSON schema version互換性の将来task
- `docs/out-of-scope.md`

出力機能完成後、ユーザーが全項目を埋めたJSONを`docs/architectures/`配下へ配置し、G27以降の入出力JSONフォーマット正本として管理する。このGateでは、そのユーザー作成artifactを先行作成・更新しない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G26: JSON出力`

このissueはG26だけを実装する自己完結した契約である。現在の作業branchはユーザー指示により親branchの`ex-02-web-character-sheet`を継続利用する。子branchは作成しないが、issue名はGate planに対応する`ex-02-26-sheet-json-export`を使う。

## アーキテクチャ適用

| 適用節                       | 許可する変更                                                                                                                                                                                                             | 禁止する変更                                                                                                                | 確認するテスト層                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `実装時のアーキテクチャ遵守` | 最終diffをこの表と本issueの対象範囲へ対応付け、G26に必要なaction callback、JSON組立て、browser download adapterだけを変更する。                                                                                          | JSON import、localStorage persistence、画像のIndexedDB保存、CCFOLIA出力、全消去を混在させる。                               | 最終diff照合、Node、browser behavior  |
| `状態と派生値の境界`         | RHFの現在値を`getValues()`で1回取得し、root-stateの現在画像recordだけを出力入力に渡す。                                                                                                                                  | form valueや画像recordを別stateへ複製すること、派生値・error・dialog・menu開閉stateを出力すること。                         | Node、Container結線                   |
| `データ境界`                 | `CharacterSheetFormValues`と`imageBase64String`を組み立てる純粋なJSON出力境界、およびbrowser download adapterを分離する。                                                                                                | Containerまたは表示Componentへ`Blob`、object URL、`document`の直接操作を置くこと。                                          | Node、browser adapter                 |
| `テスト層と配置`             | JSON文字列・ファイル名・object URL解放を、browser APIを差し替えるNode testで確認する。desktopとtablet / mobileの既存buttonが同じ出力導線を起動するbrowser behaviorは、既存`tests/visual/character-sheet.spec.ts`へ置く。 | download APIを直接要求する不安定なテスト、新しい未定義のbrowser test層、見た目変更のない本GateでのVRTを追加・実行すること。 | Node、既存Playwright browser behavior |

## 対象範囲

- 既存の`CharacterSheetActionPane`のdesktopおよびtablet / mobile menuにある`エクスポート`buttonへ、同じ`onExport` callbackを接続する。実行後にmenuを閉じるかどうかは、既存の操作menuの副作用契約に従い、このGateで新たな表示状態を追加しない。
- 現在の`CharacterSheetFormValues`をそのまま基礎とし、トップレベルの`imageBase64String`だけを合成したJSON文字列を生成する。画像未選択時は`imageBase64String: null`とし、選択済み時はIndexedDB画像recordの`base64`だけを文字列として含める。MIME typeは既存仕様どおりWebP固定のため、このGateの出力へ別fieldとして追加しない。
- JSONへ派生値、error・warning、master data、dialog・menu・section開閉state、localStorage下書き、IndexedDB recordのkey / database情報を含めない。出力はエラー状態のform valueを拒否・clamp・補正しない。
- `browser/`の小さなdownload adapterで、JSON MIME typeの`Blob`、object URL、一時`<a download>`操作、object URL解放を扱い、ブラウザ標準の保存ダイアログを開く。追加npm packageおよびアプリ内の成功・失敗dialog / notificationは追加しない。
- ダウンロード属性の既定ファイル名は、クリック時のローカル日付と現在のプロフィール値から、正確に`neon-underrealm_character-sheet_YYYY-MM-DD_$PL名_$PC名.json`を生成する。`$PL名`は`profile.playerName`、`$PC名`は`profile.pcName`へ置換し、未入力値は空文字のままとする。
- JSON出力値、既定ファイル名、browser APIを差し替えたdownload adapterのobject URL解放をNode testで確認する。desktopおよびtablet / mobileの既存`エクスポート`buttonが同じ出力導線を起動することは、既存`tests/visual/character-sheet.spec.ts`のPlaywright browser behavior testで確認する。

## 初期スコープ外

- JSON file選択、JSON parse / schema検証、current form・localStorageを置換する確認dialog、import失敗dialogを実装しない（G27）。
- schema version、旧形式の互換性・移行、JSON入出力のユーザー作成fixtureを実装しない。将来のJSON schema version互換性は`docs/TODO.md`の既存項目へ残す。
- `docs/architectures/`配下の完成JSON fixtureまたはJSONフォーマット文書を作成・更新しない。ユーザーが出力機能完成後に配置する。
- 画像の選択・変換・IndexedDB保存・復元・削除、localStorage下書きの形式、CCFOLIAコピー、全消去、操作menuの配置・文言・新規dialog・通知を変更しない。
- DB、認証、クラウド保存、複数キャラクター、PDF出力、追加npm package、canonical VRT baseline更新を行わない。

## 完了条件

- [ ] 現在のform valueと画像recordのbase64を、トップレベル`imageBase64String`を持つ1つのJSON文字列へ合成できる。画像未選択時は`null`を明示する。
- [ ] JSON出力に派生値、error・warning、UI state、master data、画像recordの永続化メタデータを含めず、入力上の不整合を理由に出力を拒否・補正しない。
- [ ] desktopおよびtablet / mobileの既存`エクスポート`buttonから同じ処理を実行し、ブラウザ標準の保存ダイアログを開く。
- [ ] ファイル名が`neon-underrealm_character-sheet_YYYY-MM-DD_$PL名_$PC名.json`の指定どおりに生成される。
- [ ] JSON文字列・画像あり / なし・ファイル名・object URL解放をbrowser API差し替えのNode testで確認し、両buttonの出力導線を既存Playwright browser behavior testで確認する。
- [ ] 関連TODOを扱わず、schema version互換性を将来taskとして維持する理由が記録されている。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] RHFを唯一の編集stateとして維持し、画像recordを出力時以外にRHFまたはlocalStorageへ混在させていない。
- [ ] browser APIの副作用を`browser/` adapterへ分離し、object URLを解放している。adapterはbrowser APIを要求しないtest doubleでNode testできる。
- [ ] 既存route、GitHub Pagesのsubpath公開、G6の画像処理、G24の自動保存・復元を壊していない。
- [ ] 画面配置・button文言・menu・dialogを変更しないため、VRT baselineを更新または実行していない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/useCharacterSheetRootState.ts` またはG26専用の最小限のroot-level action hook
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/browser/`配下のJSON download adapter
- G26専用のJSON出力組立てmodule
- `tests/node/character-sheet/`配下のJSON出力test
- `tests/visual/character-sheet.spec.ts`（既存Playwright browser behavior test）

## レビュー観点

- JSONのトップレベルへ`imageBase64String`を合成し、選択済み画像のbase64だけを含める最小形式が、G27の入力実装へ引き継げるか。
- 既定ファイル名の`character`という綴り、日付形式、PL名・PC名の順序がユーザー指定どおりか。
- 画面UIを変更せず、既存のdesktopおよびtablet / mobile操作からブラウザ標準の保存ダイアログだけを開く範囲に限定できているか。
- user-createdの完全入力JSONを後続の入出力フォーマット正本にする時点まで、schema version互換性とJSON importを別scopeに保てているか。

## 備考

- 親Gate planでG26の依存Gateはすべて`done`である。
- `imageBase64String`はRHF form valueではなく、出力時にだけ合成するトップレベルfieldである。JSON.stringifyによりfieldが欠落しないよう、画像未選択状態を`null`で明示する。
- ブラウザ標準の保存ダイアログは環境ごとに表示表現が異なるため、製品コードでは`Blob` downloadを起動するまでを責務とし、テストではdownload adapterへ渡すJSON文字列と`download`属性の既定ファイル名を確認する。
- ユーザーのtypo訂正に従い、`character`を使う。
- Git commit / push はこのissue作成時点で実行しない。
