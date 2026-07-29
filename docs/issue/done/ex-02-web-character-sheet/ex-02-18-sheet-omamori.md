# ex-02-18-sheet-omamori

## 最優先のデザイン入力

- ユーザー指定をこのGateの画面契約とする。お守りの一覧は、desktop / tabletで並べ替え、名称、信用、効果、削除buttonを表示し、効果を折り畳まない。長い名称と効果はセル内で折り返し、section・ページに横overflowを発生させない。
- mobileの一覧は、並べ替え、名称、信用、効果を開閉するicon、削除buttonを表示する。効果本文は初期状態で閉じ、icon操作で行の下に展開する。
- お守り候補選択dialogはdesktop / tablet / mobileともに、名称と信用を1行目、効果を2行目に表示する。候補を折り畳まず、展開iconを置かない。
- `.tmp/design/character-sheet/`の承認済みdraftはsection frame、既存sheetの密度、dialog shellだけを参照する。`docs/design/character-sheet/notes.md`、既存のスキル・武器・防具の表示、`docs/architectures/character-sheet.md`の可変行とCSSの指針は、上記の明示指定と矛盾しない範囲で適用する。
- design notes、実装結果のscreenshot、reviewer出力を画面配置・導線・状態表現の決定入力にしない。指定外の操作、confirmation、追加・削除の導線は実装都合で補完しない。

## 目的

`専用アイテム` sectionへ、お守りをIDで選択して表示する専用入力領域と候補選択dialogを追加する。既存スキル・アイテム用の共通form styleを再利用しつつ、desktop / tabletとmobileで指定された効果の表示方法を提供する。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の `G18: お守りの個別行の選択・追加・削除・並べ替え・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。`
- 要件: `docs/requirements/character-sheet.md` の「アイテム」「共通動作」
- ゲームデータ: `data/generated/items.json`の`omamori`、`src/lib/types/item.ts`、`src/pages/data/items/omamori.mdx`
- architecture: `docs/architectures/character-sheet.md`の「可変行のデザイン指針」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`の承認済みdraft。お守りの列・効果表示・候補dialogはユーザー指定で確定しているため、`design-image-generation`は前提にしない。canonical VRT baselineの更新にはユーザーの明示承認を必要とする。
- 関連TODO: `docs/TODO.md`にG18またはお守りを対象とする項目はない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G18: お守りの個別行の選択・追加・削除・並べ替え・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。`

このissueはG18だけを実装する自己完結した契約である。G19以降の他の専用アイテム、G22の生き様連動・カテゴリの既定表示・未選択時非表示・カテゴリ単位の追加削除・警告・消費信用集計、G24の保存復元、G25のエラー集約、G26 / G27のJSON入出力は実装しない。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                   | このGateで禁止する変更                                                                                                                | 確認するテスト層                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 可変行のデザイン指針        | お守りの独立section / candidate dialogを実装し、desktop / tabletの常時効果表示とmobileの行内展開を定める。                                                               | スキル、武器・防具、他の専用アイテムを単一の汎用行Componentへ統合しない。mobileでdesktop表を縮小して横scrollさせない。                | Component、target限定Visual Review            |
| 状態と派生値の境界          | お守りの行順と選択IDをRHFのfield arrayで保持し、行ごとの局所的なmobile効果の開閉stateだけを表示Componentへ置く。                                                         | 編集値を別state storeへ複製しない。G22のカテゴリ表示・カテゴリ単位の追加削除、G24の保存復元、G26 / G27のadapterを先行実装しない。     | schema、RHF hook、Component                   |
| データ境界                  | `items.json`の`omamori`を読み取り専用master dataとしてIDで解決し、候補と表示値をadapter / ViewModelで渡す。                                                              | 生成JSONを手編集しない。効果の自由文を解析、自動計算、自動検証しない。                                                                | master-data、Node logic                       |
| HTML / CSSの構造と責務      | 行を`fieldset` / `legend`で意味付け、既存`CharacterSheetFormList.module.css`のheader、行、picker、並べ替え、展開、候補dialog / candidate classを`composes`で再利用する。 | 共通styleを複製しない。section CSSからdialogや子Component内部へ広く一致するselectorを追加しない。単一の汎用grid列を作らない。         | Component、Visual Review                      |
| Container / Presenterの責務 | section hook / master-data adapterでお守りのViewModelとActionsを作り、Containerで候補dialog、対象row、focus復帰を調整する。                                              | Presenter / leaf ComponentへRHF、マスタ検索、候補絞り込み、業務ルールを渡さない。root orchestration hookをG18だけのために新設しない。 | Node logic、RHF hook、Component               |
| テストアーキテクチャ        | ID解決をNode、行操作と選択をRHF hook、desktop / mobileの効果表示とdialog・focus復帰をComponent、代表操作だけをPlaywrightで確認する。                                     | VRT / E2Eへ全候補データ、Container内部state、効果本文の解析を置かない。                                                               | Node、Vitest hook / Component、最小Playwright |

## 対象範囲

- `専用アイテム` section内に、お守りだけの独立した入力領域を追加する。お守りの個別行は初期0行とし、追加buttonで空行を追加、任意の行を削除、行を並べ替えられるようにする。カテゴリの自動表示、カテゴリ単位の追加・削除、消費信用の集計は実装しない。
- お守り行は選択IDと安定したrow IDを持つ。既存武器と同様に、同じお守りIDを複数行で選択できる設計を保つ。
- desktop / tabletの一覧headerと各行は、左から並べ替え、名称、信用、効果、削除buttonの順とする。効果は常時表示し、名称と効果は自然に折り返す。効果の展開操作を置かない。
- mobileの一覧headerと各行は、並べ替え、名称、信用、効果の展開icon、削除buttonの順とする。効果本文は初期状態で隠し、展開iconで行の下に表示する。名称と効果本文は自然に折り返す。
- 候補選択dialogは既存`CharacterSheetDialog`を使い、Containerが開閉、選択対象row、操作元へのfocus復帰を保持する。候補は入力順で表示し、重複選択を許可して選択済み候補をdisabled / mutedにしない。
- dialogの候補はdesktop / tablet / mobileで、名称と信用を1行目、効果を2行目に置く。候補の効果は常時表示し、折り畳みや展開iconを追加しない。
- 既存の`CharacterSheetFormList.module.css`を再利用し、お守り固有CSSは列幅、desktop / tabletとmobileの情報配置、効果本文の折返しだけを所有する。
- お守りカテゴリ全体を、折りたたみを持たない専用frame Componentでラップする。このGateではカテゴリ削除buttonを表示しない。
- 名称ヘッダーには、名称欄のクリックでお守り選択ダイアログを開く案内tooltipを表示する。
- `characterSheetDictionary`へsection / header /操作の固定UI文言を追加し、ゲームデータ由来の名称・信用・効果はmaster dataの読み取り結果を表示する。

## 初期スコープ外

- G22の生き様連動、ブライにお守りカテゴリを既定表示する処理、未選択時のカテゴリ非表示、カテゴリ単位の追加・削除、通常選択不可の保持アイテム警告、消費信用の一元算出を実装しない。
- 他カテゴリの個別行、またはG18で定めたお守りの個別行以外のカテゴリ操作を実装しない。
- G19〜G21のサイバネ、ナノマシン、ドラッグを実装しない。
- 効果本文の解析、ルール自動計算、警告 / error集約、保存・復元、JSON / CCFOLIA入出力、confirmation dialog、UI libraryの導入を行わない。
- 初期スコープ外の項目は`docs/out-of-scope.md`に従う。

## 完了条件

- [x] お守りのform値、schema、master-data adapter、RHF hook、section、candidate dialogがG18の範囲で結線されている。
- [x] desktop / tabletで、並べ替え、名称、信用、常時表示かつ折返し可能な効果、削除buttonを表示し、効果の展開操作を置かない。
- [x] mobileで、並べ替え、名称、信用、展開icon、削除buttonを表示し、効果を初期非表示から行下へ開閉できる。
- [x] candidate dialogがすべてのviewportで名称・信用を1行目、効果を2行目に常時表示し、折り畳みや展開iconを持たない。
- [x] お守り行と候補dialogが既存共通form styleを再利用し、固有CSSが列とresponsive差分だけを持つ。
- [x] G22以降のカテゴリ連動、カテゴリ単位の追加・削除、信用集計を実装していない。
- [x] target限定Visual Reviewの対象route、states、viewports、actual screenshot、VRT結果を記録し、ユーザー承認済みcanonical VRT baselineを更新した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`と共通form design契約に矛盾していない。
- [x] desktop / tablet / mobileで一覧・candidate dialogに横overflow、clip、操作不能がない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/architectures/character-sheet.md`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/master-data/omamori.ts`
- `src/character-sheet/logic/omamori.ts`
- `src/character-sheet/form/useOmamoriSectionProps.ts`
- `src/character-sheet/components/OmamoriSection.tsx`
- `src/character-sheet/components/OmamoriSection.module.css`
- `src/character-sheet/components/dialogs/OmamoriPickerDialog.tsx`
- `src/character-sheet/components/dialogs/OmamoriPickerDialog.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/omamori.test.ts`
- `tests/hooks/character-sheet/useOmamoriSectionProps.test.tsx`
- `tests/components/character-sheet/OmamoriSection.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- G18でお守りの個別行の選択・追加・削除・並べ替えを完結させ、カテゴリ操作と生き様連動をG22へ残せているか。
- desktop / tabletの常時効果表示とmobileの展開iconが、明示した情報優先度と既存shared styleを損なわず、長文でも横overflowしないか。
- candidate dialogの二行構成が全viewportで折り畳みなしに読め、重複選択の許可とfocus復帰が保たれるか。
- architectureへ追記した共通CSS再利用契約が、今後の専用アイテムにも適切か。
- target限定Visual Reviewの結果と、ユーザー承認済みcanonical VRT baseline更新が実装契約に整合するか。

## 備考

- user-directed architecture update: `CharacterSheetFormList.module.css`の共通classを、スキル・武器防具・生き様専用アイテムの行一覧と候補dialogが再利用する契約を明文化した。
- Gate issue review 1で確認した境界の不整合は、ユーザーの明示指示に従い、個別行の操作をG18、カテゴリ操作をG22とする親plan更新で解消した。
- 実装開始は、このchild issueのユーザーレビューと明示承認後に限る。

## レビュー指摘 1

### 指摘事項

- desktopのお守り行で、削除buttonが操作列の中央に収まらず位置がずれている。
- mobileで効果を展開する行に対応するheaderが表示されていない。
- 専用アイテムカテゴリ全体は、将来のカテゴリ削除buttonを見据え、折りたたみを持たない専用frame Componentで扱う。

### 判定

- source: human
- classification: valid
- local validation: `OmamoriSection.module.css`はdesktop削除buttonを最終grid列へ置くだけで操作列全体の配置を固定していない。mobileでは`効果` headerを非表示にして展開icon列のheaderを空にしている。カテゴリ全体は現在、折りたたみ可能なtop-level `CharacterSheetSectionFrame`の内側へ直接置かれており、カテゴリ削除buttonを持つ非折りたたみframeは存在しない。
- scope decision: ユーザーの明示指示により、カテゴリ削除buttonを持たない非折りたたみframe ComponentはG18で追加する。カテゴリ削除button自体はG22に残す。

### 対応方針

- desktopでは既存共通styleを保ったまま、削除buttonを最終操作セルの縦横中央へ固定する。
- mobileでは効果の展開iconに対応するheaderを表示し、effect本文の表示が展開操作に対応することを明確にする。
- `CharacterSheetSectionFrame`の折りたたみ契約を流用せず、カテゴリ削除buttonを将来受けられる非折りたたみの専用frame ComponentをG18で追加する。

### 対応完了チェックリスト

- [x] desktopの削除buttonを最終操作セルの縦横中央へ配置する。
- [x] mobileの展開iconに対応するheaderを表示する。
- [x] お守りカテゴリを非折りたたみの専用frame Componentでラップし、カテゴリ削除buttonを追加していない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`
- route / states / viewports:
  - default full-page baseline: desktop / ultrawide / tablet / mobile
  - お守り候補dialog、選択済み行、名称tooltip: desktop / tablet / mobile
  - mobile効果展開: mobile
  - 武器・防具・スキルの名称tooltip: desktop / tablet / mobile

### レビュー結果

| 対象                                      | 判定 | 差分                                         | 対応                                  |
| ----------------------------------------- | ---- | -------------------------------------------- | ------------------------------------- |
| `@character-sheet` full-page baseline     | OK   | お守りカテゴリ追加に伴う下部領域・footer位置 | ユーザー承認によりbaseline更新        |
| お守り一覧・候補dialog・mobile効果展開    | OK   | なし                                         | locator screenshotを確認              |
| 名称tooltip（お守り・武器・防具・スキル） | OK   | スキル種別の初回表示が`名称`                 | `スキル`を渡すよう自己修正し再capture |

### 実画面確認

- owner locator: `data-special-item-category="omamori"`、`お守りを選択` dialog、tooltip、武器・防具section、プライマリ流儀スキルsection
- checked acceptance criteria: desktop / tabletの常時効果、mobileの効果headerと行下展開、候補の二行構成、名称／効果の折返し、削除buttonのセル内位置、tooltipの種別文言、clip / overflow / 操作領域
- result: 宣言した全state・viewportの原寸locator screenshotを開いて確認した。full-page screenshotはbaseline差分の確認だけに用いた。

### 自己修正した項目

- [x] スキル名称tooltipへヘッダー名ではなく種別`スキル`を渡した。

### 人間判断が必要な差分

- なし。canonical baseline更新はユーザーが明示承認済み。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分をユーザー承認として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- desktop / tabletでは、非表示の効果展開buttonがgrid自動配置から外れるため、削除cellが幅`0`の5列目へ配置される。最終操作列（6列目）は空き、削除buttonを操作cellの縦横中央へ置くG18契約を満たしていない。
- G18で追加したmaster data、RHF hook、section表示、候補dialog / Container結線に対するNode・hook・Componentの直接テストがない。代表操作のPlaywrightだけでは、ID解決、0行、重複選択、row ID単位の更新、responsive表示、Escape・close・選択後focus復帰を局所的に固定できない。

### 判定

- source: browser-draft
- classification: valid
- local validation: reviewの対象commit `84686e1` は現在のローカルHEADと一致する。`OmamoriSection.tsx`では効果展開buttonが削除cellより前に置かれ、`OmamoriSection.module.css`ではdesktop / tabletで`.detailsToggle`を`display: none`にする一方、gridの5列目を`0`幅にしている。`.removeCell`に列指定はない。さらに、G18が想定変更ファイルとテストアーキテクチャで定めたお守り専用のNode・hook・Component testは存在せず、追加された確認はPlaywright E2E / VRTに限られる。

### 対応方針

- desktop / tabletでは削除cellを最終操作列へ明示配置し、mobileでは既存の展開操作列と削除列の構成を維持する。修正後はdesktop / tablet / mobileの行配置をComponent testとtarget限定Visual Reviewで確認する。
- master-data、RHF hook、OmamoriSection、候補dialogを含むContainer結線へ責務別の直接テストを追加する。schema testにはお守りの空行とrow ID重複境界を含め、Playwrightは代表操作だけを維持する。

### 対応完了チェックリスト

- [x] desktop / tabletの削除buttonを最終操作cellの縦横中央へ配置する。
- [x] master data、RHF hook、Component、Container / dialogのG18責務別テストを追加する。
- [x] schema testへお守りの空行とrow ID重複境界を追加する。
- [x] target限定Visual Reviewでdesktop / tablet / mobileの削除操作cellを確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@omamori-*`、`@bond-resolved`
- route / states / viewports:
  - お守り候補dialog、選択済み行、名称tooltip: desktop / tablet / mobile
  - mobile効果展開: mobile
  - `bond-resolved` full-page baseline、縁section、tooltip: desktop / tablet / mobile

### レビュー結果

| 対象                          | 判定 | 差分                                  | 対応                               |
| ----------------------------- | ---- | ------------------------------------- | ---------------------------------- |
| お守りの一覧・候補dialog      | OK   | なし                                  | locator screenshotを原寸確認       |
| mobileの効果展開・名称tooltip | OK   | なし                                  | locator screenshotを原寸確認       |
| `bond-resolved` baseline      | OK   | 旧baselineの高さ・縁解決stateとの差分 | ユーザー承認により3 viewportを更新 |

### 実画面確認

- owner locator: `data-special-item-category="omamori"`、`お守りを選択` dialog、名称tooltip、縁section、`覚悟の説明` tooltip
- checked acceptance criteria: desktop / tabletの効果常時表示と削除buttonの最終操作cell配置、mobileの効果header・展開icon・行下本文、候補の二行構成、名称／効果の折返し、clip / overflow / 操作領域、縁解決stateのcheckbox・tooltip
- result: 宣言した全state・viewportの原寸locator screenshotを開いて確認した。full-page screenshotは`bond-resolved` baseline差分の確認だけに用いた。

### 自己修正した項目

- [x] desktop / tabletの削除cellを6列目へ、mobileを5列目へ明示配置した。
- [x] mobileの`bond-resolved` VRT stateは、checkboxのキーボード操作とchecked確認で安定化した。

### 人間判断が必要な差分

- なし。`bond-resolved` canonical baselineの更新はユーザーが明示承認済み。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分をユーザー承認として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
