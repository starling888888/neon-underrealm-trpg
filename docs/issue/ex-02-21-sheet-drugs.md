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
- 候補dialogはdesktop / tabletでは名称、信用、使用タイミング、1セット数量、BT強度の5列と候補ごとの効果2行目を表示する。mobileでは名称、信用、BT強度を1行目に残し、使用タイミングと1セット数量を効果本文の直前に表示する。Escape、可視の閉じる操作、選択後の対象行更新、操作元へのfocus復帰をContainerが所有する。
- `drugs`のmaster-data adapter、form schema・default値、form adapter、Presenter、Container dialog orchestration、表示Component、CSS Module、dictionary、対象Node / hook / Component / E2E / VRT testを、既存の所有境界に沿って追加・更新する。

## 初期スコープ外

- G22の生き様によるドラッグカテゴリの既定表示・非表示、カテゴリ追加・削除、通常選択不可の保持済みカテゴリ警告、消費信用の一元算出を実装しない。
- ドラッグ効果の文章解析、能力値・判定数・防御力などへの自動適用、所持数と重複ID以外の独自validationを追加しない。
- お守り、サイバネ、ナノマシン、武器・防具の個別UI・業務条件を変更しない。異なるform値・業務条件を持つアイテム行の共通Component化は行わない。
- G25のエラー全件集約、G24以降のlocalStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、confirmation dialog、UI libraryを追加しない。
- target限定のlocal canonical VRT snapshotは、ユーザーの明示承認がある場合だけ生成・更新する。親Gate planに従い、G31までGit管理へ追加・変更しない。今回のlocal更新対象はドラッグsectionと候補dialog、およびドラッグ追加で変化する既存full-page default・専用アイテムoverviewに限定する。
- `docs/plan.md`のチェックボックスを変更しない。初期スコープ外の項目は`docs/out-of-scope.md`に従う。

## アーキテクチャ適用

| 適用節                        | 許可する変更                                                                                                                           | 禁止する変更                                                                                                | 確認するテスト層                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `実装時のアーキテクチャ遵守`  | G21の変更を以下の適用節とこのissueの対象範囲へ対応付ける。                                                                             | 対応付けられない共有Component、状態所有者、データ境界、テスト層を変更しない。                               | 最終diffとの照合                |
| `可変行のデザイン指針`        | ドラッグ固有の可変行・候補dialog ComponentとCSS Moduleで、指定列、mobileの展開内詳細、行操作、行番号付きaccessible nameを実装する。    | 別のform値・業務条件を持つアイテム行を共通Componentへ抽象化しない。ユーザー指定以外の要約項目を省略しない。 | Component                       |
| `Container / Presenterの責務` | Containerがdialogの開閉、対象行、focus復帰を保持し、PresenterへドラッグsectionのViewModel / Actionsを渡す。                            | Presenter / 表示ComponentからRHF、マスタ検索、dialog stateへ直接アクセスしない。                            | Hook、Component、Container      |
| `状態と派生値の境界`          | RHFにドラッグのID、stable row ID、所持数を保持し、field array操作で追加・削除・並べ替えを行う。重複IDは各該当行のerrorとして導出する。 | RHF値を別storeへ複製しない。効果文を解析せず、G22の消費信用集計を先取りしない。                             | Node、hook、Component           |
| `データ境界`                  | `master-data/drugs.ts`で生成JSONから候補と表示用情報を取得し、IDだけをform値に保存する。                                               | generated JSONを手編集しない。ComponentまたはPresenterから生成JSONを直接検索しない。                        | Node、hook                      |
| `HTML / CSSの構造と責務`      | table相当の列見出し・行・展開領域、候補table、数値inputと行操作を意味構造とCSS Moduleで実装する。                                      | CSSだけで操作・入力の意味を表現しない。不必要なtable DOMを増やさない。                                      | Component                       |
| `テストアーキテクチャ`        | pure logic、form hook、表示Component、Container dialog orchestrationに加え、代表E2Eとtarget限定VRTを追加・更新する。                   | E2Eだけでlogic / form / dialog境界を検証しない。VRTを全件実行しない。                                       | Node、hook、Component、E2E、VRT |

## 完了条件

- [x] ドラッグカテゴリが初期3行で表示され、0行までの追加・削除・上下の並べ替えを指定どおりに操作できる。
- [x] desktop / tabletで、並べ替え、名称、信用、使用タイミング、1セット数量、BT強度、所持数input、展開、削除buttonを指定順で横overflowなく表示する。名称tooltipと二つのheader強制改行がある。
- [x] mobileで、使用タイミングと1セット数量だけを効果展開内の効果本文直前へ移し、ほかの要約項目と行操作を省略せず、横overflowなく表示する。
- [x] 所持数が行ごとに0以上の整数として編集・空欄から`0`への正規化を行い、IDと独立して保持できる。G22より前に消費信用の集計を変更していない。
- [x] 重複IDを持つ各ドラッグ行がerror状態になり、候補dialogでは他行で選択済みの候補をdisabledにする。
- [x] 行番号付きaccessible nameにより、各行の名称選択、所持数input、効果展開、上下移動、削除を区別できる。名称選択、効果展開、追加・削除・並べ替え、候補dialogのEscape・閉じる・選択後のfocus復帰がkeyboard操作を含めアクセシブルに動作する。
- [x] 候補dialogがdesktop / tabletでは名称、信用、使用タイミング、1セット数量、BT強度の5列と候補ごとの効果2行目・選択済み候補のdisabledを満たす。mobileでは名称、信用、BT強度の3列と、使用タイミング、1セット数量、効果の詳細行を満たす。
- [x] 関連TODOを扱わない理由と、design targetおよびユーザー承認済みlocal VRT snapshot更新・G31までの非Git管理の扱いが記録されている。
- [x] `npm run build` が通る。
- [x] 必要な`npm run check`、対象Node / hook / Component testが通る。

## チェックポイント

- [x] `docs/architectures/character-sheet.md`に従い、form adapter、Presenter、Container、Component、master-dataの所有境界を越えていない。
- [x] `/character-sheet/`の既存ルート、既存special-item category、GitHub Pagesのサブパス公開に影響しない。
- [x] dev serverでdesktop `1440x1200`、tablet `820x1180`、mobile `390x900`のdefault、選択済み、効果展開、所持数編集、追加・削除・並べ替え、名称tooltip、候補dialogをユーザーが確認できる状態にした。
- [x] 重複IDのerror、候補dialogの選択済み候補disabled、行番号付きaccessible name、並べ替え後の表示順追従をNode / hook / Component testで確認した。
- [x] ユーザー指示に従い、代表E2Eとtarget限定VRTを実装・実行し、approved local canonical snapshotだけを更新した。G31までGit管理へ追加・変更していない。
- [x] 不要な依存関係を追加せず、初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`および`docs/design/`と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

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
- 候補dialogのdesktop / tabletの5列、mobileの3列と詳細行、選択済み候補のdisabledが指定どおりか。
- 消費信用の一元算出と生き様・カテゴリ連動をG22へ残し、G21では所持数の入力状態だけを導入する境界が正しいか。
- 代表E2Eとtarget限定VRTが、ドラッグ固有の操作・表示状態を過不足なく検証しているか。

## 備考

- ブランチはユーザー指示に従い新規作成しない。親issueと同じ現行branch `ex-02-web-character-sheet` で準備する。
- `.raw/contents/`にはキャラクターシートに対応する入力Markdownが見つかっていないため、ページ本文・可視構成の優先指示はユーザーの最新指示、承認済みdesign画像、requirements、design notesの順で扱う。
- VRT snapshotのlocal更新はユーザーの明示承認を必要とする。2026-07-29のユーザー指示で、G21の代表E2Eとtarget限定VRTの追加・local snapshot更新を承認された。親Gate planに従い、G31までGit管理へ追加・変更しない。

## レビュー指摘 1

### 指摘事項

1. desktop / tabletの`使用タイミング` headerで、`タイミング`という語の途中で折り返される。名称列を短くしてよいので、指定済みの`使用`と`タイミング`の2行だけへ収める。
2. ドラッグ候補dialogのdisabled候補が、既存スキル候補dialogのdisabled表現と異なる。
3. mobileの効果展開内にある使用タイミングと1セット数量は、折り返さず太字で表示する。
4. 選択dialogでも使用タイミングとBT強度のheaderが折り返される。名称列を縮め、全headerを折り返さず1行で表示する。

### 判定

- source: human
- classification: valid
- local validation:
  - `DrugsSection.module.css`のdesktop / tablet gridは名称列に比べて使用タイミング列が狭く、`white-space: pre-line`のheaderで`タイミング`の語内折り返しを防止していない。
  - `DrugsPickerDialog`はbuttonだけをdisabledにするが、`SkillPickerDialog`はcandidate全体のmuted背景とtext色を`data-disabled`で揃えている。
  - `DrugsSection`はmobile展開内に改行を含むheader文字列をそのまま表示し、メタ情報を通常weightで描画している。
  - `DrugsPickerDialog`のheaderは改行を含むmain table用のdictionaryをそのまま使い、名称列の最小幅も大きいため、使用タイミングとBT強度を含むheaderが折り返される。

### 対応方針

- desktop / tabletは名称列を必要最小限へ縮め、使用タイミング列に`タイミング`を1語で収める幅とno-wrapを与える。`使用`と`タイミング`の強制改行は維持する。
- ドラッグ候補dialogに、スキル候補dialogと同じcandidate単位の`data-disabled`、muted背景、muted text、disabled button表現を適用する。
- mobile展開内では、見出し用の改行文字列を使わず、使用タイミングと1セット数量をそれぞれ1行・太字・no-wrapで効果本文の直前に表示する。
- 選択dialogはmain tableの強制改行headerを流用せず、名称列を縮めたうえで、名称、信用、使用タイミング、1セット数量、BT強度の全headerをno-wrapの1行で表示する。

### 対応完了チェックリスト

- [x] desktop / tabletで使用タイミングheaderが語内折り返しせず、名称列との列幅配分が表示契約に一致する。
- [x] ドラッグ候補dialogのdisabled候補が既存スキル候補dialogと同じ背景・文字色・操作不可表現になる。
- [x] mobile展開内の使用タイミングと1セット数量は、後続レビュー指摘3によりラベルだけを太字にして、折り返しなしで効果本文の直前に表示する。
- [x] 選択dialogのheaderは、後続レビュー指摘2により使用タイミング・1セット数量の指定改行を維持し、語内折り返しを発生させない。
- [x] 必要な`npm run check`と対象Component testが通る。

## レビュー指摘 2

### 指摘事項

1. ドラッグ候補dialogの`使用タイミング`と`1セット数量`は、main表と同じ指定改行（`使用` / `タイミング`、`1セット` / `数量`）を維持する。ただし、`タイミング`、`数量`、`BT強度`などの語内折り返しは発生させない。

### 判定

- source: human
- classification: valid
- local validation: `pickerHeaders`を1行文字列へ変更した前回対応は、ユーザーが指定したdialog headerの改行契約を消している。`DrugsPickerDialog.module.css`には使用タイミングと1セット数量を各行へ収める列幅があり、header表示だけを指定改行へ戻しても語内折り返しを防止できる。

### 対応方針

- dialog用headerは指定改行を持つ文字列へ戻す。mobile展開用は別の1行文字列を使い続ける。
- dialog headerの`white-space: pre-line`と、使用タイミング・1セット数量・BT強度の各列幅を維持し、指定改行以外の折り返しを起こさない。

### 対応完了チェックリスト

- [x] dialogの使用タイミングと1セット数量が指定改行で表示され、タイミング・数量・BT強度が語内折り返ししない。
- [x] 必要な`npm run check`と対象Component testが通る。

## レビュー指摘 3

### 指摘事項

1. mobile展開内の使用タイミングと1セット数量は、`：`以降の値を太字にしない。効果と同じく、ラベルだけを強調する。

### 判定

- source: human
- classification: valid
- local validation: `mobileDetailsMetadata`にfont weightを指定しているため、値まで太字になる。表示構造にはすでにlabelを`strong`で分けているため、親要素のfont weightを外せば効果と同じlabel-onlyの強調になる。

### 対応方針

- mobile展開のメタ情報コンテナから太字指定を外し、`strong`で囲んだラベルと全角コロンだけを太字にする。no-wrapは維持する。

### 対応完了チェックリスト

- [x] mobile展開内で使用タイミングと1セット数量のラベルだけが太字で、値は通常ウェイトになる。
- [x] 必要な`npm run check`と対象Component testが通る。

## レビュー指摘 4

### 指摘事項

1. mobile展開内の使用タイミングと1セット数量の値は、muted textではなく効果本文と同じ通常の文字色にする。

### 判定

- source: human
- classification: valid
- local validation: `mobileDetailsMetadata`がコンテナ全体へ`--color-text-muted`を指定しているため、ラベルだけでなく値もmutedになる。効果本文は`.details`の通常文字色で表示している。

### 対応方針

- メタ情報の値を包む行に通常の文字色を指定し、既存の`strong`ラベルだけがmuted色となる表示へ分ける。no-wrapとlabel-onlyの太字は維持する。

### 対応完了チェックリスト

- [x] mobile展開内で使用タイミングと1セット数量の値が効果本文と同じ通常文字色になる。
- [x] 必要な`npm run check`と対象Component testが通る。

## レビュー指摘 5

### 指摘事項

1. mobileのドラッグ候補dialogでは、名称の折り返しを減らすため、使用タイミングと1セット数量を1行目の列から外し、効果本文の直前へ移す。ラベルと値の見た目はmain表のmobile展開内と揃える。

### 判定

- source: human
- classification: valid
- local validation: mobile dialogの1行目は5列で、使用タイミングと1セット数量が名称列を圧迫している。候補データには効果2行目がすでにあり、その直前にmobile限定のメタ情報行を置けば、desktop / tabletの5列構成を変えずに名称列を広げられる。

### 対応方針

- mobileではdialog headerと候補1行目から使用タイミング・1セット数量を隠し、名称・信用・BT強度の3列にする。
- 候補1行目と効果の間に、使用タイミング・1セット数量のmobile限定メタ情報行を追加する。main表のmobile展開と同じく、muted色の太字ラベル、通常色・通常ウェイトの値、no-wrapで表示する。

### 対応完了チェックリスト

- [x] mobile候補dialogが名称・信用・BT強度の1行目と、使用タイミング・1セット数量・効果の順の詳細行を表示する。
- [x] desktop / tabletのdialog 5列構成を維持する。
- [x] 必要な`npm run check`と対象Component testが通る。

## レビュー指摘 6

### 指摘事項

1. mobile候補dialogの使用タイミング・1セット数量と効果本文の間に、区切り線を表示しない。

### 判定

- source: human
- classification: valid
- local validation: 候補の効果本文に共通指定されている上borderが、mobileで追加したメタ情報行との間にも表示される。desktop / tabletでは候補1行目と効果を分けるために必要だが、mobileではメタ情報行が同じ候補詳細を連続して示すため不要である。

### 対応方針

- mobile media queryで効果本文の上borderだけを外す。候補1行目とメタ情報行の区切り、およびdesktop / tabletの既存区切りは維持する。

### 対応完了チェックリスト

- [x] mobile候補dialogで使用タイミング・1セット数量から効果本文までを区切り線なしで連続表示する。
- [x] 必要な`npm run check`と対象Component testが通る。

## ユーザー指示による検証範囲変更

- 2026-07-29、ユーザーはG21本体のコミット後に、代表E2E、target限定VRT、local canonical snapshot更新、追加コミットとpushを明示指示した。
- この指示は初期の「E2EとVRTを実装・実行しない」制約を置き換える。VRTは`@character-sheet`のG21関連21状態だけを対象とし、全件VRTは実行しない。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の`default`、`special-items-overview`、`drugs-default`、`drugs-input`、`drugs-expanded`、`drugs-picker`、`drugs-picker-duplicate`
- route / states / viewports:
  - full-page default: desktop / tablet / mobile
  - special-items overview: desktop / tablet / mobile
  - drugs default: desktop / tablet / mobile
  - selected drug and quantity: desktop / tablet / mobile
  - expanded drug effect: desktop / tablet / mobile
  - drugs picker dialog: desktop / tablet / mobile
  - drugs picker dialog with an already selected candidate: desktop / tablet / mobile

### レビュー結果

| 対象                                       | 判定 | 差分                            | 対応                          |
| ------------------------------------------ | ---- | ------------------------------- | ----------------------------- |
| full-page default / special-items overview | OK   | ドラッグ3行の追加による高さ増加 | approved local snapshotを更新 |
| drugs section states                       | OK   | 新規target                      | local snapshotを追加          |
| drugs picker dialog                        | OK   | 新規target                      | local snapshotを追加          |

### 実画面確認

- `/character-sheet/` default、desktop / tablet / mobile:
  - full-page overview: `test-results/visual/character-sheet/full-page/default-*.png`
  - checked: 専用アイテム全体へのドラッグ追加とページ内の横overflowなし
  - result: OK
- `drugs-default`、`drugs-input`、desktop / tablet / mobile:
  - locator screenshot: `[data-special-item-category="drugs"]` のoriginal-pixel capture
  - checked: desktop / tabletの列順と指定改行、mobileの要約列、所持数input、追加・削除・並べ替えcontrol、横overflowなし
  - result: OK
- `drugs-expanded`、desktop / tablet / mobile:
  - locator screenshot: `[data-special-item-category="drugs"]` のoriginal-pixel capture
  - checked: 効果が展開され、mobileでは使用タイミング・1セット数量が効果本文の直前にあり、ラベルだけmuted太字、値が通常色、効果との区切り線なし
  - result: OK
- `drugs-picker`、`drugs-picker-duplicate`、desktop / tablet / mobile:
  - locator screenshot: `dialog[aria-label="ドラッグを選択"]` のoriginal-pixel capture
  - checked: desktop / tabletの5列と強制改行、語内折り返しなし、mobileの名称・信用・BT強度1行目と詳細行、効果との区切り線なし。取得済み候補はスキル候補と同じmutedなdisabled表示
  - result: OK

### 自己修正した項目

- [x] mobile候補dialogでは使用タイミング・1セット数量を詳細行へ移し、名称列を広げた。

### 人間判断が必要な差分

- なし。ユーザー承認済みのG21 local snapshot更新として、対象21状態だけを更新した。親Gate planに従い、G31までGit管理へ追加・変更していない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] local snapshot更新が必要な差分を人間判断として記録した。G31までGit管理へ追加・変更しない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 7

### 指摘事項

1. G21で更新したcanonical VRT baselineがGit管理されておらず、クリーン checkoutで再現できない。
2. design notesの「現在のVRT対象」がdefaultだけとなっており、G21のsection / dialog variationを反映していない。
3. レビュー指摘1〜6の対応完了チェックリストが、後続のVisual Review 1で確認済みの表示仕様に対して未完了のままである。

### 判定

- source: local-agent
- classification:
  - 指摘1: invalid。親Gate planのG19 / G20引継ぎはcanonical VRT snapshotをG31までlocal専用とし、Git管理・更新しないと定めている。G21でもこの方針を踏襲する。
  - 指摘2: valid。design notesの現行VRT対象はG21のsection / dialog variationを含む。
  - 指摘3: valid。レビュー指摘1の一部は後続指摘で置換されたが、最終仕様とVisual Review 1の確認結果を対応完了チェックへ反映していない。
- local validation: `docs/issue/ex-02-web-character-sheet/plan.md`のG19 / G20引継ぎ、G31の範囲、G21のVisual Review 1、`tests/visual/vrt/character-sheet.spec.ts`を照合した。local canonical snapshotの更新自体はユーザー承認済みであり、Git管理への追加・変更は行っていない。

### 対応方針

- G21 issueとdesign notesを、target限定のlocal canonical snapshotを更新してもG31までGit管理へ追加・変更しない記録へ揃える。
- design notesのVRT対象を、full-page、section variation、dialog variationを含む現行構成へ更新する。
- レビュー指摘1〜6の対応完了チェックを最終仕様へ更新し、後続指摘で置換された条件はその旨を明記する。

### 対応完了チェックリスト

- [x] G31までlocal canonical snapshotをGit管理へ追加・変更しない方針をG21 issueとdesign notesへ反映した。
- [x] design notesのVRT対象を現行のfull-page / section / dialog構成へ更新した。
- [x] レビュー指摘1〜6の対応完了チェックを最終仕様とVisual Review 1の確認結果へ揃えた。
- [x] 対象Markdownのformat / lintを確認した。

## レビュー指摘 8

### 指摘事項

1. ドラッグ重複エラーがカテゴリ／セクションへ伝播していない。
2. G21完了条件が最終的なmobile候補dialog契約と矛盾している。
3. 追加操作と所持数の正規化境界が必須テストで固定されていない。

### 判定

- source: `.tmp/chatgpt-review.md`（browser-draft）
- classification:
  - 指摘1: valid。共通要件の重複に関する記述が、ドラッグ固有の「各該当行だけをerror」と矛盾していた。ユーザー判断により現在実装を正とし、要件を訂正する。
  - 指摘2: valid。完了条件だけがmobile候補dialogの旧5列構成を残している。現在実装、対象範囲、レビュー指摘5、Visual Review 1の3列＋詳細行契約が正しい。
  - 指摘3: valid。`onAdd`、全行削除後の再追加、負数・空欄・小数の所持数正規化を、Node / hook / Componentの責務に分けて固定する必要がある。
- local validation: `docs/requirements/character-sheet.md`、現行G21実装、G21 issueの対象範囲とVisual Review 1、既存Node / hook / Component / E2E testを照合した。レビュー草案のPR状態・CI状態はローカル検証の根拠に使わない。

### 対応方針

- 指摘1は、ドラッグ重複が各該当行だけをerrorとし、カテゴリ全体をerrorにしない要件へ訂正する。実装は変更しない。
- 指摘2は、desktop / tabletの5列とmobileの名称・信用・BT強度3列＋使用タイミング・1セット数量・効果の詳細行を、完了条件とレビュー観点へ反映する。実装は変更しない。
- 指摘3は、次のreview responseでテストだけを追加する。hook / Node testで所持数`"4.8"`→`4`、`"-2"`→`0`、空欄→`0`、ID変更後の数量保持、全行削除後の`onAdd`による未選択・数量`0`・一意`rowId`の再追加を確認する。Component testでは空欄blur後のDOM表示`0`を確認する。代表E2Eは責務を重複させず、必要なら0行からの追加操作だけを扱う。

### 対応完了チェックリスト

- [x] ドラッグ重複の要件を現在実装の行単位error契約へ訂正した。
- [x] mobile候補dialogの完了条件とレビュー観点を最終契約へ訂正した。
- [x] 所持数の正規化境界と0行からの再追加をNode / hook / Component testへ追加した。
- [x] 必要な対象test、`npm run check`、`npm run build`を確認した。
