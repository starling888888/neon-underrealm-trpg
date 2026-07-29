# ex-02-21-sheet-drugs

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/desktop.png` と `.tmp/design/character-sheet/mobile.png` の承認済みdesign画像を遵守する。
- ユーザーの最新指示に従い、ドラッグ行のdesktop列順を「並べ替え、名称、信用、使用タイミング、1セット数量、BT強度、所持数（編集枠）、展開、削除button」とする。画像にある列順または表記と異なる場合は、この指定を優先する。
- ユーザーの最新指示に従い、mobileでは使用タイミングと1セット数量を行の要約から外し、効果の展開領域の先頭、効果本文の直前に表示する。ほかの要約項目と行操作はmobileでも省略しない。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、承認済み画像または上記ユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートの`専用アイテム`内にドラッグカテゴリを追加し、初期3行のドラッグ選択、所持数編集、追加・削除・並べ替え、効果展開、候補選択dialogを、desktop / tablet / mobileの指定表示契約で利用できるようにする。

## 背景

親issueのG21は、G4で整備済みの専用アイテム領域を前提に、ドラッグの可変行と候補dialogを扱うGateである。G18〜G20の個別アイテムUIを既存の実装境界として参照するが、ドラッグ固有の使用タイミング、1セット数量、BT強度、所持数と、そのresponsive表示をこのGateで定める。

関連する正本は以下とする。

- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md` のアイテム、経験点と信用
- `docs/architectures/character-sheet.md` の実装時のアーキテクチャ遵守
- `docs/design/character-sheet/notes.md`
- `.tmp/design/character-sheet/desktop.png`
- `.tmp/design/character-sheet/mobile.png`
- `data/generated/items.json` の`drugs`
- `docs/TODO.md`（G21を直接扱う未完了項目は見つかっていない）

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G21: ドラッグの個別行の選択・追加・削除・並べ替え・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。`

このissueはG21だけを実装するための自己完結した契約である。G22の生き様連動、カテゴリ操作、消費信用の一元算出、G24以降の保存・出力・全体エラー集約は扱わない。

## 対象範囲

- `special-items`の既存sectionに、初期3行のドラッグカテゴリを追加する。各行は0行まで削除でき、追加・削除と上下の並べ替えを提供する。カテゴリ自体の追加・削除や生き様との表示連動は実装しない。
- 各ドラッグ行は、desktop / tabletで、行の並べ替え操作、名称、信用、使用タイミング、1セット数量、BT強度、所持数の編集input、効果を展開する操作、削除buttonの順に表示する。名称headerは、既存の名称選択と同じ説明を持つtooltip triggerとする。headerは`使用`と`タイミング`、`1セット`と`数量`の間でそれぞれ強制改行する。
- mobileでは、並べ替え、名称、信用、BT強度、所持数の編集input、効果展開、削除buttonを要約として表示する。使用タイミングと1セット数量は、展開時だけ効果本文の直前に表示する。効果本文は初期非表示とし、展開操作で行下へ開閉する。
- 名称は候補選択dialogを開くbuttonとし、未選択時は既存用語と一致する`ドラッグを選択`を表示する。同じIDを複数行で選択した状態は各該当行をerror状態にし、候補dialogでは他行で選択済みの候補をdisabledにする。
- 現在の表示順の行番号を含む行labelを定義し、名称選択、所持数input、効果展開、上下移動、削除のaccessible nameへ含める。並べ替え後は表示順に追従させる。
- 所持数は行ごとに保持する、0以上の整数の編集inputとする。初期値は`0`とし、空欄になる操作では`0`へ正規化する。G21では、この値をドラッグ行に保持・表示するまでとし、消費信用への一元算出への接続はG22で行う。
- 候補dialogはdesktop / tablet / mobileで同じ列構成とし、名称、信用、使用タイミング、1セット数量、BT強度を一行のheaderと候補行へ表示する。候補ごとの効果は、その候補行の直下に全列をまたぐ2行目で表示する。Escape、可視の閉じる操作、選択後の対象行更新、操作元へのfocus復帰をContainerが所有する。
- `drugs`のmaster-data adapter、form schema・default値、form adapter、Presenter、Container dialog orchestration、表示Component、CSS Module、dictionary、対象Node / hook / Component testを、既存の所有境界に沿って追加・更新する。ユーザー指示により、E2EとVRTはこのGateで実装・実行しない。

## 初期スコープ外

- G22の生き様によるドラッグカテゴリの既定表示・非表示、カテゴリ追加・削除、通常選択不可の保持済みカテゴリ警告、消費信用の一元算出を実装しない。
- ドラッグ効果の文章解析、能力値・判定数・防御力などへの自動適用、所持数と重複ID以外の独自validationを追加しない。
- お守り、サイバネ、ナノマシン、武器・防具の個別UI・業務条件を変更しない。異なるform値・業務条件を持つアイテム行の共通Component化は行わない。
- G25のエラー全件集約、G24以降のlocalStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、confirmation dialog、UI libraryを追加しない。
- canonical VRT baselineの追加・再設計・Git管理を行わない。親Gate planの方針に従い、必要なtarget限定VRTのbaseline更新はユーザーの明示承認がある場合だけ行う。
- `docs/plan.md`のチェックボックスを変更しない。初期スコープ外の項目は`docs/out-of-scope.md`に従う。

## アーキテクチャ適用

| 適用節                        | 許可する変更                                                                                                                           | 禁止する変更                                                                                                | 確認するテスト層           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| `実装時のアーキテクチャ遵守`  | G21の変更を以下の適用節とこのissueの対象範囲へ対応付ける。                                                                             | 対応付けられない共有Component、状態所有者、データ境界、テスト層を変更しない。                               | 最終diffとの照合           |
| `可変行のデザイン指針`        | ドラッグ固有の可変行・候補dialog ComponentとCSS Moduleで、指定列、mobileの展開内詳細、行操作、行番号付きaccessible nameを実装する。    | 別のform値・業務条件を持つアイテム行を共通Componentへ抽象化しない。ユーザー指定以外の要約項目を省略しない。 | Component                  |
| `Container / Presenterの責務` | Containerがdialogの開閉、対象行、focus復帰を保持し、PresenterへドラッグsectionのViewModel / Actionsを渡す。                            | Presenter / 表示ComponentからRHF、マスタ検索、dialog stateへ直接アクセスしない。                            | Hook、Component、Container |
| `状態と派生値の境界`          | RHFにドラッグのID、stable row ID、所持数を保持し、field array操作で追加・削除・並べ替えを行う。重複IDは各該当行のerrorとして導出する。 | RHF値を別storeへ複製しない。効果文を解析せず、G22の消費信用集計を先取りしない。                             | Node、hook、Component      |
| `データ境界`                  | `master-data/drugs.ts`で生成JSONから候補と表示用情報を取得し、IDだけをform値に保存する。                                               | generated JSONを手編集しない。ComponentまたはPresenterから生成JSONを直接検索しない。                        | Node、hook                 |
| `HTML / CSSの構造と責務`      | table相当の列見出し・行・展開領域、候補table、数値inputと行操作を意味構造とCSS Moduleで実装する。                                      | CSSだけで操作・入力の意味を表現しない。不必要なtable DOMを増やさない。                                      | Component                  |
| `テストアーキテクチャ`        | pure logic、form hook、表示Component、Container dialog orchestrationを対象ごとに追加・更新する。                                       | E2Eだけでlogic / form / dialog境界を検証しない。E2EとVRTを実装・実行しない。                                | Node、hook、Component      |

## 完了条件

- [ ] ドラッグカテゴリが初期3行で表示され、0行までの追加・削除・上下の並べ替えを指定どおりに操作できる。
- [ ] desktop / tabletで、並べ替え、名称、信用、使用タイミング、1セット数量、BT強度、所持数input、展開、削除buttonを指定順で横overflowなく表示する。名称tooltipと二つのheader強制改行がある。
- [ ] mobileで、使用タイミングと1セット数量だけを効果展開内の効果本文直前へ移し、ほかの要約項目と行操作を省略せず、横overflowなく表示する。
- [ ] 所持数が行ごとに0以上の整数として編集・空欄から`0`への正規化を行い、IDと独立して保持できる。G22より前に消費信用の集計を変更していない。
- [ ] 重複IDを持つ各ドラッグ行がerror状態になり、候補dialogでは他行で選択済みの候補をdisabledにする。
- [ ] 行番号付きaccessible nameにより、各行の名称選択、所持数input、効果展開、上下移動、削除を区別できる。名称選択、効果展開、追加・削除・並べ替え、候補dialogのEscape・閉じる・選択後のfocus復帰がkeyboard操作を含めアクセシブルに動作する。
- [ ] 候補dialogがdesktop / tablet / mobileで同一の名称、信用、使用タイミング、1セット数量、BT強度のheaderと、候補ごとの効果2行目・選択済み候補のdisabledを満たす。
- [ ] 関連TODOを扱わない理由と、design targetおよびVRT baselineを更新しない扱いが記録されている。
- [ ] `npm run build` が通る。
- [ ] 必要な`npm run check`、対象Node / hook / Component testが通る。

## チェックポイント

- [ ] `docs/architectures/character-sheet.md`に従い、form adapter、Presenter、Container、Component、master-dataの所有境界を越えていない。
- [ ] `/character-sheet/`の既存ルート、既存special-item category、GitHub Pagesのサブパス公開に影響しない。
- [ ] dev serverでdesktop `1440x1200`、tablet `820x1180`、mobile `390x900`のdefault、選択済み、効果展開、所持数編集、追加・削除・並べ替え、名称tooltip、候補dialogをユーザーが確認できる状態にする。
- [ ] 重複IDのerror、候補dialogの選択済み候補disabled、行番号付きaccessible name、並べ替え後の表示順追従をNode / hook / Component testで確認する。
- [ ] ユーザー指示に従い、E2EとVRTを実装・実行せず、canonical baselineを更新していない。
- [ ] 不要な依存関係を追加せず、初期スコープ外の機能を実装していない。
- [ ] 関連する`docs/TODO.md`および`docs/design/`と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/master-data/drugs.ts`
- `src/character-sheet/logic/drugs.ts`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useDrugsSectionProps.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/components/DrugsSection.tsx`
- `src/character-sheet/components/DrugsSection.module.css`
- `src/character-sheet/components/dialogs/DrugsPickerDialog.tsx`
- `src/character-sheet/components/dialogs/DrugsPickerDialog.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/dictionary.ts`
- `tests/hooks/character-sheet/useDrugsSectionProps.test.tsx`
- `tests/node/character-sheet/drugs.test.ts`
- `tests/components/character-sheet/DrugsSection.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`

## レビュー観点

- desktop / tabletの列順、名称tooltip、二つのheader強制改行、所持数inputの位置がユーザー意図どおりか。
- mobileで使用タイミングと1セット数量だけを効果展開内の先頭へ置き、BT強度、所持数、行操作を要約に残す境界が正しいか。
- 可変3行、0行までの削除、追加、上下の並べ替え、重複IDのerrorと候補dialogのdisabledを、このGateで扱う範囲として十分か。
- 候補dialogの5列と効果2行目、選択済み候補のdisabledを全viewportで同じ構成にする判断が正しいか。
- 消費信用の一元算出と生き様・カテゴリ連動をG22へ残し、G21では所持数の入力状態だけを導入する境界が正しいか。
- E2EとVRTを実装せず、dev server上のユーザーレビューに留める判断が正しいか。

## 備考

- ブランチはユーザー指示に従い新規作成しない。親issueと同じ現行branch `ex-02-web-character-sheet` で準備する。
- `.raw/contents/`にはキャラクターシートに対応する入力Markdownが見つかっていないため、ページ本文・可視構成の優先指示はユーザーの最新指示、承認済みdesign画像、requirements、design notesの順で扱う。
- VRT baselineはGit管理対象外のlocal artifactであり、G31まで管理判断を持ち越す。G21でbaselineを更新する必要が生じた場合は、実装完了前にユーザーの明示承認を得る。
- ユーザー指示により、G21ではE2EとVRTを実装・実行しない。実装後はdev serverを起動し、ユーザーレビューを待つ。
