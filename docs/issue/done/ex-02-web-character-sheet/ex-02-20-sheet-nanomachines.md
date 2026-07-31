# ex-02-20-sheet-nanomachines

## 最優先のデザイン入力

- 対象の承認済みdesign draftは`.tmp/design/character-sheet/`、design targetは`docs/design/character-sheet/notes.md`である。ナノマシン固有のdraft画像はないため、ユーザーの最新指示と、同じ表示パターンを実装済みのサイバネUIを最優先の詳細入力とする。
- サイバネUIを基準に、desktop、tablet、mobileで要約項目を省略せず、専用アイテムカテゴリを縦に積む。ナノマシンの効果本文は初期状態で隠し、展開操作で行の下に表示する。
- ユーザー指定により、一覧は部位、名称、信用、`埋め込み`／`点数`、`発動`／`精神力`、展開、クリアの順で表示する。名称ヘッダーは既存スキル・アイテムと同じ選択操作のtooltipを持つ。追加button、削除buttonは置かない。
- ユーザー指定により、埋め込み点数集計はサイバネと同じpair expressionと修正入力を用い、埋め込み上限の基礎値だけを常時精神ではなく常時肉体とする。
- 候補dialogは一覧と同じ候補項目から部位、展開、クリアを除いた、名称、信用、`埋め込み`／`点数`、`発動`／`精神力`の列を持つ。各候補の効果は2行目に常時表示する。
- draft画像、上記ユーザー指示、既存サイバネUIのいずれにもない配置・導線・状態表現は、実装都合で補完せずに停止して判断を求める。

## 目的

キャラクターシートの専用アイテム内に、頭・胴体・腕・足の固定4行からなるナノマシンカテゴリを追加し、候補選択と埋め込み点数の集計・上限エラーを、既存サイバネと整合する操作・表示で提供する。

## 背景

親issueのG20は、G4の専用アイテム領域を前提にナノマシンの固定個別行と候補dialogを実装するGateである。G19で確立したサイバネの行、tooltip、dialog、集計、error表示、Containerのfocus復帰の境界を踏襲する。ただしナノマシンは可変の`その他`行を持たず、埋め込み上限の基礎値は常時肉体であり、候補ごとの発動精神力を表示する。

主な正本は以下である。

- `docs/requirements/character-sheet.md` の副能力値、アイテム、エラーと警告
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `.tmp/design/character-sheet/` の承認済みdraft画像
- `docs/issue/ex-02-web-character-sheet/plan.md` のG20とG19引継ぎ
- `data/generated/items.json` の`nanomachines`

`docs/TODO.md`にG20で扱う項目はない。カテゴリの表示連動・追加・削除はG22のTODOおよびGate範囲に残す。

## Gate関係

- 親issue: `docs/issue/done/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G20: ナノマシンの固定個別行の選択・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。`
- branch: ユーザー指定により、子branchは作成せず、現在の`ex-02-web-character-sheet`で実装する。子issue名はGate planの予定パスを維持する。

## 対象範囲

- 頭、胴体、腕、足を各1行だけ初期表示するナノマシンform値・schema・default値を追加する。行の追加、削除、並べ替えは提供しない。各行の`クリア`は確認dialogなしで選択IDを初期値へ戻す。
- 生成済みマスタデータを`master-data/nanomachines.ts`で読み取り専用に解決する。全ナノマシンを各固定行の候補とし、同一IDの複数行選択を許可する。
- 一覧の列を、部位、tooltip付き名称、信用、`埋め込み`／`点数`、`発動`／`精神力`、展開、クリアの順に実装する。名称は既存の選択iconを含むbuttonとし、tooltip文言と操作はほかのスキル・アイテムと同じ`getNamePickerTooltip`の契約に従う。
- 効果は初期状態で非表示とし、展開で行の下に表示する。名称選択、展開、クリアのaccessible nameには部位と現在の名称を含める。
- 埋め込み点数を、`選択中ナノマシンの埋め込み点数合計 + 埋め込み点数合計の修正`、埋め込み上限を`常時肉体 + 埋め込み上限の修正`として、サイバネと同じpair expressionおよびtooltipで表示する。二つの修正は整数・負数を受け付ける。最終合計だけを`aria-invalid`を含むerror状態にし、カテゴリ全体・個別入力へ可視のエラー理由を追加しない。
- 候補dialogは名称、信用、`埋め込み`／`点数`、`発動`／`精神力`のheaderと、候補ごとの効果2行目を表示する。部位、展開、クリアの列は置かない。Escape、閉じる操作、選択後の対象行更新、操作元へのfocus復帰はContainerが所有する。
- `NanomachinesSection`、候補dialog、CSS Module、dictionary、form hook、pure logic、Presenter、Container、Node / hook / Component / browser / target限定VRT testを、既存の所有境界に沿って追加・更新する。
- `docs/requirements/character-sheet.md`のナノマシン集計式を、上記ユーザー指示（サイバネと同じ二つの修正値、基礎値のみ常時肉体）へ同じtaskで整合させる。

## 初期スコープ外

- G22の生き様によるナノマシンカテゴリの既定表示・非表示、カテゴリ追加・削除、保持済みアイテム警告、消費信用の一元算出を実装しない。
- ナノマシン効果の文章解析、能力値・判定数・防御力などへの自動適用、ナノマシン専用武器との選択連動を実装しない。
- 選択中ナノマシンの`activationMentalCost`を最大体力へ反映する生き様との接続は実装しない。G22で、カテゴリ統合とともに扱う。
- サイバネ、ドラッグ、お守り、武器・防具の個別UI・業務条件を変更しない。共通clear / delete CSSはG19引継ぎ済みのものを利用し、新たな共通化は行わない。
- G25のエラー全件集約、G24以降のlocalStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、カテゴリ操作、confirmation dialog、UI libraryを追加しない。
- 2026-07-29にユーザーが明示承認した対象限定VRT実装とcanonical baseline更新以外のbaseline再設計を行わない。
- `docs/plan.md`のチェックボックスを変更しない。初期スコープ外の項目は`docs/out-of-scope.md`に従う。

## アーキテクチャ適用

| 適用節                        | 許可する変更                                                                                                           | 禁止する変更                                                                                              | 確認するテスト層                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `実装時のアーキテクチャ遵守`  | G20の変更を以下の適用節とこのissueの対象範囲へ対応付ける。                                                             | 対応付けられない共有Component、状態所有者、データ境界、テスト層を変更しない。                             | 最終diffとの照合                    |
| `可変行のデザイン指針`        | ナノマシン固有の固定行・候補dialog ComponentとCSS Moduleで、指定列と効果展開を実装する。                               | 異なるform値・業務条件のアイテム行を共通Componentへ抽象化しない。要約項目をmobileの展開領域へ退避しない。 | Component、browser、target限定VRT   |
| `Container / Presenterの責務` | Containerがdialogの開閉、対象固定行、focus復帰を保持し、PresenterへナノマシンsectionのViewModel / Actionsを渡す。      | Presenter / 表示ComponentからRHF、マスタ検索、派生値算出、validation、dialog stateへ直接アクセスしない。  | Hook、Component、Container、browser |
| `状態と派生値の境界`          | RHFに固定4行と二つの修正を保持し、pure logicで埋め込み点数合計・上限・超過errorを導出する。                            | RHF値を別storeへ複製しない。効果文を解析して修正を自動入力しない。                                        | Node、hook、Component               |
| `データ境界`                  | `master-data/nanomachines.ts`で生成JSONから候補と表示値を取得し、IDだけをform値に保存する。                            | generated JSONを手編集しない。ComponentまたはPresenterから生成JSONを直接検索しない。                      | Node、hook                          |
| `HTML / CSSの構造と責務`      | table相当のheader・行・展開領域、候補table、集計最終値のerrorを意味構造とCSS Moduleで実装する。                        | CSSだけで操作・errorの意味を表現しない。不必要なtable DOMを増やさない。                                   | Component、browser、VRT             |
| `テストアーキテクチャ`        | pure logic、form hook、表示Component、Container dialog orchestration、browser操作、変更target限定VRTを追加・更新する。 | E2Eだけでlogic / formの境界を検証しない。全件VRTやcanonical baseline更新を行わない。                      | Node、hook、Component、browser、VRT |

## 完了条件

- [x] ナノマシンカテゴリが初期表示され、頭・胴体・腕・足の固定4行だけを、追加・削除なしで表示・クリアできる。
- [x] 各行が部位、tooltip付き名称、信用、`埋め込み`／`点数`、`発動`／`精神力`、展開、クリアをdesktop / tablet / mobileで横overflowなく表示する。
- [x] 名称選択、効果展開、クリア、候補dialogのEscape・閉じる・選択後のfocus復帰がkeyboard操作を含めアクセシブルに動作する。
- [x] 埋め込み点数合計・上限のpair expression、二つの修正入力、上限超過時の最終合計だけのerror状態がpure logicと表示で一致する。上限の基礎値が常時肉体である。
- [x] 候補dialogが名称、信用、埋め込み点数、発動精神力のheaderと、候補ごとの効果2行目・重複選択許可を満たす。
- [x] `docs/requirements/character-sheet.md`がこのissueのナノマシン集計契約へ整合している。
- [x] 関連TODOを扱わない理由と、`docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`、ユーザー承認済みの対象限定VRT baseline更新が記録されている。
- [x] `npm run build` が通る。
- [x] 必要な`npm run check`、対象Node / hook / Component testが通る。

## チェックポイント

- [x] `docs/architectures/character-sheet.md`に従い、pure logic、form adapter、Presenter、Container、Componentの所有境界を越えていない。
- [x] `/character-sheet/`の既存ルート、既存special-item category、GitHub Pagesのサブパス公開に影響しない。
- [x] desktop `1440x1200`、tablet `820x1180`、mobile `390x900`で、default、選択済み、効果展開、名称tooltip、集計tooltip、候補dialog、上限超過errorを確認する。
- [x] ユーザーレビュー完了後にだけ対象E2Eと`@character-sheet`限定VRTを実行し、各actual screenshotを開いて確認する。2026-07-29の明示承認に従い、ナノマシン対象のcanonical baselineを更新する。
- [x] 不要な依存関係を追加せず、初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`および`docs/design/`と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/master-data/nanomachines.ts`
- `src/character-sheet/logic/nanomachines.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useNanomachinesSectionProps.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/components/NanomachinesSection.tsx`
- `src/character-sheet/components/NanomachinesSection.module.css`
- `src/character-sheet/components/dialogs/NanomachinesPickerDialog.tsx`
- `src/character-sheet/components/dialogs/NanomachinesPickerDialog.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/dictionary.ts`
- `docs/requirements/character-sheet.md`
- `tests/node/character-sheet/nanomachines.test.ts`
- `tests/hooks/character-sheet/useNanomachinesSectionProps.test.tsx`
- `tests/components/character-sheet/NanomachinesSection.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- ナノマシンの固定4行、追加・削除なし、クリアのみという操作境界が意図どおりか。
- 表示列とheaderの強制改行、名称tooltip、desktop / tablet / mobileでの情報優先度が、ユーザー指定および既存サイバネUIと整合するか。
- サイバネと同じ二つの修正を持つpair expressionで、上限の基礎値だけを常時肉体へ変える判断が正しいか。
- 候補dialogで効果を2行目に置く構成が要件どおりか。
- G22に残すカテゴリ表示連動・追加削除・警告・信用集計を、このGateへ混ぜていないか。
- ユーザー承認済みのナノマシン対象canonical VRT baseline更新とactual screenshot確認が、既存`@character-sheet`契約と整合するか。

## 備考

- G19の引継ぎに従い、埋め込み上限超過はカテゴリ全体ではなく集計の最終値だけをerror状態にする。G19で導入済みの共通clear / delete button CSSを踏襲する。
- G20の実装後、親Gate planには固定4行、サイバネと共通の集計境界、常時肉体を使う上限、dialogのfocus復帰、VRTの確定事項だけを引き継ぐ。最大体力への反映はG22の未着手事項として残す。実装経緯やレビュー出力は戻さない。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@character-sheet.*nanomachines`
- route / states / viewports: `/character-sheet/`のdefault、名称tooltip、集計tooltip、選択済み、効果展開、上限超過、候補dialogをdesktop `1440x1200`、tablet `820x1180`、mobile `390x900`で確認した。

### レビュー結果

| 対象                          | 判定 | 差分                                | 対応                                                            |
| ----------------------------- | ---- | ----------------------------------- | --------------------------------------------------------------- |
| ナノマシンsection・候補dialog | OK   | 新規21 snapshot                     | ユーザー明示承認によりlocal canonical baselineを更新した。      |
| character-sheet full-page     | OK   | ナノマシンsection追加による高さ増加 | `@character-sheet` targetのlocal canonical baselineを更新した。 |

### 実画面確認

- `/character-sheet/`のdefault、名称tooltip、集計tooltip、選択済み、効果展開、上限超過、候補dialogのdesktop / tablet / mobile:
  - full-page overview: defaultとtooltip代表のlayout差分だけを確認した。
  - locator screenshot: `[data-nanomachines-section]`、`dialog[aria-labelledby]`、FormulaTooltipをoriginal pixel resolutionで確認した。
  - checked acceptance criteria: 固定4行、列順と改行、横overflowなし、効果展開、最終値だけのerror、候補dialogのheader・効果行・header非区切り線・均一な縦線、dialogの到達性。
  - result: 21状態すべてで一致した。

- environment note: 15 stateとtooltip 6 stateはそれぞれ通常比較・captureまで成功した。一括21 stateの最終再実行だけは、Chromiumの`shutdown: Operation not permitted`でbrowser起動前に失敗した。fixture・snapshot比較に到達していない環境障害であり、`docs/agent-failure-log.md`へ記録した。

### 自己修正した項目

- [x] 上限超過stateでは流儀と生き様を選択して常時肉体を確定するよう、E2E / VRTのfixtureを補正した。

### 人間判断が必要な差分

- なし。baseline更新はユーザーが明示承認済みであり、canonical snapshotはparent Gate planに従いGit管理しないlocal artifactとして保持する。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）

## レビュー指摘 1

### 指摘事項

1. 埋め込み点数の上限超過時、`aria-invalid`が最終値の`output`ではなく、修正入力を含む集計全体のwrapperに付いている。最終値だけをerror状態にする本issueの契約と一致しない。
2. E2E設定の`reuseExistingServer: true`により、`visual:build`後でも既存のdev serverを再利用し、build済み`preview`を検証しない可能性がある。
3. 個別tooltipのcanonical VRTをG20で追加しているが、architectureは個別tooltip screenshotを作成せず、Component testまたは最小browser behavior testで扱う契約である。再構成後139枚というdesign noteと、local canonical artifactに残る旧`sections/`配下のtooltip 6枚も整合していない。

### 判定

- source: `.tmp/chatgpt-review.md`、Doc Review、Tech Review
- classification: valid
- local validation:
  - `NanomachinesSection`は`.summary`に`aria-invalid`を設定し、最終値の`output`には設定していない。Component / browser testも最終値に限定していない。
  - `playwright.e2e.config.ts`は`reuseExistingServer: true`で、既定portのreview用dev serverを再利用できる。
  - `docs/architectures/character-sheet.md`は個別tooltip screenshotを禁止する一方、`tests/visual/vrt/character-sheet.spec.ts`にはナノマシンのtooltip 2状態、各3 viewportが登録されている。local artifactには`tooltips/`と旧`sections/`の双方に同じ6枚がある。
- `.tmp/chatgpt-review.md`の既存picker UIを戻す指摘は対応対象外とした。縦罫線と`効果：`はユーザー明示指示による共通表示調整であり、`.tmp/review/ex-02-web-character-sheet/user-directed-changes.md`に記録済みで、対象pickerのVRT確認も完了しているためである。

### 対応方針

- 集計wrapperのerror用属性は見た目用に限定し、最終値の`output`だけへ`aria-invalid`を移す。Component / browser testは対象要素を固定する。
- E2Eはreview用dev serverと分離したbuild済みpreviewを起動する設定へ戻し、既存serverを無条件に再利用しない。
- ナノマシンの個別tooltipをcanonical VRT対象から外し、tooltipの文言・操作・配置は既存のComponent / browser behavior testへ置く。VRT設計と一致しなくなるlocal canonical tooltip artifactを整理する。

### 対応完了チェックリスト

- [x] 上限超過時の`aria-invalid`を最終値だけへ設定し、対象を限定したComponent / browser testを追加・更新する。
- [x] E2Eをbuild済みpreviewで再現可能に実行する設定へ修正し、対象E2Eを確認する。
- [x] 個別tooltipのcanonical VRTと不要なlocal artifactを整理し、tooltip behavior testと対象VRTを確認する。
- [x] 修正後のactual screenshotを開いて確認し、不要なcanonical baselineを整理した。

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@character-sheet.*nanomachines`
- route / states / viewports: `/character-sheet/`のdefault、選択済み、効果展開、上限超過、候補dialogをdesktop `1440x1200`、tablet `820x1180`、mobile `390x900`で確認した。名称tooltipと埋め込み点数集計tooltipはcanonical VRTから除外し、共通`FormulaTooltip` Component testとナノマシンbrowser behavior testで確認する。

### レビュー結果

| 対象                          | 判定 | 差分                                       | 対応                                                             |
| ----------------------------- | ---- | ------------------------------------------ | ---------------------------------------------------------------- |
| ナノマシンsection・候補dialog | OK   | VRT対象をtooltipなしの15 snapshotへ再整理  | 既存canonical snapshotとの通常比較が15件成功した。               |
| canonical tooltip artifact    | OK   | `sections/`の旧6枚と`tooltips/`の6枚が不要 | ユーザー承認済みのreview修正としてlocal artifactを12枚削除した。 |

### 実画面確認

- `/character-sheet/`のdefault、選択済み、効果展開、上限超過、候補dialogのdesktop / tablet / mobile:
  - full-page overview: 今回は局所Componentの確認だけであり、full-page screenshotは取得していない。
  - locator screenshot: `[data-nanomachines-section]`のdefault、選択済み、効果展開、上限超過各12枚と、`dialog[aria-labelledby]`の候補dialog 3枚をoriginal pixel resolutionで確認した。
  - checked acceptance criteria: 列幅とheader改行、横overflowなし、効果展開、上限超過時に最終値だけがerror色になること、候補dialogの列・縦線・効果2行目、desktop / tablet / mobileの収まり。
  - result: 15状態すべてで表示契約に一致した。

### 自己修正した項目

- [x] `aria-invalid`を集計wrapperから最終値`output`へ移し、wrapperは表示用`data-invalid`にした。
- [x] E2Eを4322の専用build済みpreviewで実行し、4321のreview用previewを再利用しない設定にした。
- [x] 個別tooltip VRTとtooltip scenario typeを削除し、不要なlocal canonical tooltip artifactを整理した。

### 人間判断が必要な差分

- なし。baselineの整理は、ユーザーがレビュー指摘への修正開始を明示承認した範囲で実施した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] 不要なbaseline artifactをユーザー承認済みの範囲で整理した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）
