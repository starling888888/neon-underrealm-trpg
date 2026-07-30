# ex-02-25-sheet-error-summary

## 最優先のデザイン入力

- `docs/requirements/character-sheet.md`、`docs/design/character-sheet/notes.md`、および`.tmp/design/character-sheet/`の承認済みdesktop / tablet / mobile draftを照合する。対象は既存の操作ペイン、エラーstatus、desktop dialog、tablet / mobile menuである。
- ユーザーの最新指示を優先する。エラーがあるdesktopのstatus外枠・文言・`確認`button、tablet / mobileのmenu buttonを`danger`カラーにする。desktop dialogの見出しは`エラー`、本文は空状態`エラーはありません。`または`エラーがN件あります。`と通常本文色の順序なしリストにする。tablet / mobileのmenuも同じ件数文言と順序なしリストを直接表示する。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningは既存の局所フィードバックに留め、集約しない。
- 個別入力・行の可視エラー文言は増やさない。既存の局所error / warning表現、section配置、menuの固定位置と`CharacterSheetDialog`の既存focus・Escape契約を保つ。
- design notes、実装結果のscreenshot、reviewer出力をdraft画像の代わりにしない。design notesとdraftに競合する箇所は、上記ユーザー指示を採用して同じtaskでdesign notesを整合する。

## 目的

現在のフォーム値とマスタデータからゲームルール上のエラーを重複なく集約し、desktopでは確認dialog、tablet / mobileでは操作menu内で、色だけに依存しないテキスト一覧として確認できるようにする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の`G25`
- 要件: `docs/requirements/character-sheet.md`の「エラーと警告」「共通動作」「非機能要件」
- architecture: `docs/architectures/character-sheet.md`の「Feature境界」「Container / Presenterの責務」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/desktop-error.png`、`desktop-error-dialog.png`、`tablet-error.png`、`tablet-menu.png`、`mobile-menu.png`
- 関連TODO: `docs/TODO.md`にG25を直接の実装先とする項目はない。永続スキルID変更の検出、JSON形式の互換性、G31のVisual Review実行経路は対象外として維持する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G25: エラーの集約表示を扱う。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningは既存の局所フィードバックに留める。`

このissueはG25だけを実装する自己完結した契約である。ユーザー指示により新規branchは作成せず、現在の親branch `ex-02-web-character-sheet` で実装する。G26以降のJSON export / import、CCFOLIAコピー、全初期化、ヘルプの業務処理と文言は扱わない。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                           | このGateで禁止する変更                                                                                                                                                                           | 確認するテスト層                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Feature境界 / データ境界    | `logic/`にフォーム値・解決済みマスタデータを入力としてerrorの安定した識別子、対象行情報を返すpureな集約境界を置く。UI文言はその識別子を入力に専用の表示変換で組み立てる。        | Component、RHF、Zod schema、localStorageへ集約結果や表示文言を保持しない。ゲームデータ名を`dictionary.ts`へ複製しない。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningを集約しない。 | Node logic                                |
| 状態と派生値の境界          | `CharacterSheetContainer`またはform adapterが現在のRHF値から集約ViewModelを一度だけ作り、root-levelのActionPaneとdialogへ表示props / callbackだけを渡す。                        | RHF外の編集state、`formState.errors`の別系統、個別sectionからActionPaneへの逆方向参照を追加しない。                                                                                              | RHF hook、Component                       |
| Container / Presenterの責務 | Containerはdialog open state、`確認`trigger、Escape / close後のfocus復帰を扱う。ActionPaneとdialogはRHF・Zod・保存・browser APIへ直接アクセスしない。                            | Containerへ各ゲーム規則をベタ書きしない。Presenterやleaf Componentでerror条件を再計算しない。                                                                                                    | Component、browser E2E                    |
| HTML / CSSの構造と責務      | error summaryを意味のある見出し、状態文、`ul` / `li`で表し、`aria-live`、dialogのlabel、triggerの状態を既存構造と整合する。error時のdanger色は色以外の件数・本文一覧と併用する。 | 個々の入力の直下へ可視error理由を追加しない。エラー一覧に未指定の入力ジャンプ、並べ替え操作、icon-onlyの意味伝達を追加しない。                                                                   | Component、browser E2E、限定Visual Review |

## 対象範囲

- 既存のbuild、credit、各skill区分、サイバネ、ナノマシン、ドラッグなどが既に導出している局所errorを入力に、同じ違反を一件として集約するpure logicとViewModelを追加する。集約順はDOM順や入力行の偶発順ではなく、固定の識別子順とする。複数行を対象にする違反は対象行ごとに重複せず、利用者が判断できる一文へまとめる。
- エラー文言は各ゲーム規則の識別子と現在の表示値・解決済み名称から専用translatorで生成する。Zod v4の`error` / global error mapは、現在の`characterSheetFormSchema`が担う構造・整数正規化と、G25で扱う横断的なゲームルール違反を混同するため使用しない。`dictionary.ts`には固定の操作labelだけを残し、動的な集約文言を格納しない。
- 初期文言は、経験点・信用の不足、能力値ポイント配分・成長点、流儀重複・Lv不正、各スキルのLv下限 / 最大Lv・重複・`advanced`条件・区分合計、共通スキル上限、サイバネ / ナノマシン埋め込み上限、固定サイバネ部位不一致、ドラッグ重複を利用者が区別できる日本語にする。現在の生き様では通常使用不可の専用アイテムカテゴリの`通常使用不可`表示とwarningカラーは既存の局所フィードバックとして保ち、件数化・一覧化しない。
- desktopの固定幅error statusは、エラーなしでは既存の通常色・`エラーはありません。`・通常の`確認`buttonを維持する。エラーありでは外枠、件数文言、`確認`buttonをdangerカラーにし、`エラーがN件あります。`を表示する。`確認`で既存dialog shellを使ったerror dialogを開く。
- desktop error dialogは見出し`エラー`、本文の先頭に空状態`エラーはありません。`またはdangerカラーの`エラーがN件あります。`を置き、その下に通常本文カラーのerrorを`ul`で表示する。errorなしのdialogでも同じ確認導線で内容を確認できる。
- tablet / mobileでは、エラーありの右下menu buttonをdangerカラーにし、開いたmenu内でdangerカラーの`エラーがN件あります。`と通常本文カラーの`ul`を直接表示する。エラーなしでは既存の`エラーはありません。`を表示する。desktopの確認dialogをtablet / mobileへ追加しない。
- `docs/design/character-sheet/notes.md`を上記の確定した文言、desktop status、desktop dialog、tablet / mobile menu buttonのdanger状態に整合する。実装・unit / hook / component / browser testを追加または更新する。
- UIを実装した後、E2E・VRTのspecを追加・更新する前に、既定portのdev serverで対象routeをユーザーが確認する。ユーザーの動作確認完了の明示指示後にだけ、対象E2E・VRT specを追加・更新し、errorなし・代表的な複数error・tablet / mobile menu open・desktop dialog openをdesktop（1440px）、tablet（820px）、mobile（390px）でactual screenshotとして開き、対象限定E2E / VRTを実行する。レビュー待ちにpreview serverは起動しない。canonical VRT baselineの追加・更新は、ユーザー明示承認がある場合だけ検討し、G31まで既存のGit管理snapshotを変更しない。

## 初期スコープ外

- JSON export / import、CCFOLIAコピー、全初期化、ヘルプ、保存・復元、画像失敗dialogの動作・文言を変更しない。
- Zod schemaへゲーム規則の`superRefine`、global error map、RHFの`setError`を導入しない。入力値の正規化、保持、局所error表示の契約を変更しない。
- エラー一覧から該当入力へのscroll・focus移動、修正button、フィルター、エラーの自動解消操作を追加しない。
- 個別入力・行・sectionに新しい可視error本文を追加しない。現在の生き様では通常使用不可の専用アイテムカテゴリの既存warning feedbackを変更・集約しない。warningの全画面notification、warningでのmenu buttonのdanger化、warning dialogを追加しない。
- 新しいnpm package、state store、UI kit、i18n framework、server、DB、認証を追加しない。`docs/out-of-scope.md`の初期スコープ外も実装しない。

## 完了条件

- [ ] 現在のフォーム値から、既存の局所errorと矛盾しない、重複のない安定順の集約ViewModelがpure logicで導出される。
- [ ] dynamicなエラー文言が、Zodの構造エラーや`dictionary.ts`へ混在せず、識別子と実行時値を入力に専用translatorで生成される。
- [ ] desktopのerror statusは、エラー時だけ外枠・文言・`確認`buttonをdangerカラーにし、固定幅と操作列の配置を保つ。
- [ ] desktopの`確認`で、見出し`エラー`、空状態またはdangerカラーの件数文言、通常本文カラーの`ul`を持つdialogが開き、既存dialogのclose・Escape・focus復帰を保つ。
- [ ] tablet / mobileのmenu buttonはエラー時だけdangerカラーになり、開いたmenuで空状態またはdangerカラーの件数文言と通常本文カラーの`ul`を直接表示する。
- [ ] 個別のerror入力・行・sectionの可視本文を増やさず、現在の生き様では通常使用不可の専用アイテムカテゴリの既存warning feedback、入力値の保持・保存・JSON出力の既存契約を変えない。
- [ ] `docs/design/character-sheet/notes.md`がユーザー指定の状態・文言へ整合している。
- [ ] 関連TODOを追加せず、対象外のTODOを変更していない。
- [ ] UI系タスクとしてdesign target、actual screenshotの確認対象、canonical VRT baselineを無断更新しない扱いが記録されている。
- [ ] `npm run check`、`npm run build`、関連Node / Vitest / browser testが通る。

## チェックポイント

- [ ] 既存routeとerrorなしの操作ペインが壊れていない。
- [ ] GitHub Pagesのsubpath公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する`docs/TODO.md`、`docs/design/character-sheet/notes.md`、親Gate planと矛盾していない。
- [ ] UI実装後かつE2E・VRT specを追加・更新する前に、既定portのdev serverでユーザーが対象routeを動作確認している。
- [ ] ユーザーの動作確認完了の明示指示後にだけ、desktop / tablet / mobileの指定stateのactual screenshotを実際に開き、error色、本文色、`ul`、clip / overflow、dialog / menuの状態を確認している。
- [ ] ユーザーの動作確認完了の明示指示後にだけ、変更targetのE2E・VRT specを追加・更新し、限定VRTで比較してcanonical baselineの扱いを記録している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/logic/`配下のerror集約と文言translator
- `src/character-sheet/form/`配下の集約ViewModel adapter
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.module.css`
- `src/character-sheet/components/dialogs/`配下のerror dialog
- `docs/design/character-sheet/notes.md`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、必要最小限のbrowser / VRT test
- `docs/issue/ex-02-25-sheet-error-summary.md`

## レビュー観点

- Zodの構造検証と横断ゲームルールの集約を分離し、dynamicな文言を`dictionary.ts`へ押し込まない境界が妥当か。
- エラー件数はerrorだけを数え、同じ違反の局所表示とsummary listが矛盾・重複しないか。
- desktop status / dialog、tablet / mobile menuが、ユーザー指定のdanger色、見出し、空状態、件数文言、通常本文色の順序なしリストを満たすか。
- 現在の生き様では通常使用不可の専用アイテムカテゴリのwarningを既存局所feedbackに留め、error summaryへ含めない範囲が妥当か。
- design notes更新と限定Visual Reviewの対象・canonical VRT baselineを無断更新しない扱いが妥当か。

## 備考

- 親Gate planのG25はplannedのままとする。実装完了後、child completion-record auditを満たしてから親Gate planへ耐久的な引継ぎだけを戻す。
- このissue作成時点で`.raw/contents/`にcharacter-sheet対応Markdownは存在しない。ページ本文・可視構成の追加の正本は、ユーザー指示、requirements、design target、承認済みdraftの順で照合する。
