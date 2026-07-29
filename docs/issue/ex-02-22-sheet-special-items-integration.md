# ex-02-22-sheet-special-items-integration

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`の承認済みdesign画像を遵守する。
- ユーザーの最新指示は、既存実装UIおよび画像デザインを上書きする。特に、未選択時の案内文・カテゴリ追加button、カテゴリのwarning表示、desktop / tablet 4列およびmobile 2列の配置、カテゴリ順序をこのissueの表示契約とする。
- 同じ目的の既存実装UIは承認済みdraft画像より優先し、画像を既存UIに整合するよう解釈する。G17–G21で確定したカテゴリframe、既存行、候補dialog、行操作は再設計しない。
- design notes、実装結果のscreenshot、reviewer出力を、承認済みdesign画像または同目的の既存実装UIの代わりに画面配置・導線・状態表現を決める入力として扱わない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

生き様専用アイテムを、生き様の専用カテゴリと任意追加カテゴリとして一元的に扱う。選択済みアイテムの消費信用、スミのナノマシンによる最大体力補正、通常使用不可のwarningも同じ入力状態から導出して表示する。

## 背景

G17–G21で武器・防具、お守り、サイバネ、ナノマシン、ドラッグの個別編集を実装した。G22はそれらを生き様の`exclusiveItem`と接続し、カテゴリ表示・削除・並べ替え、信用の合計、スミ固有の最大体力補正を定義するGateである。

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- 親Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` のG22
- 要件: `docs/requirements/character-sheet.md` の「経験点と信用」「副能力値、縁、判定」「アイテム」
- アーキテクチャ: `docs/architectures/character-sheet.md` の「実装時のアーキテクチャ遵守」「可変行のデザイン指針」「Container / Presenterの責務」「状態と派生値の境界」「データ境界」「HTML / CSSの構造と責務」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md` と`.tmp/design/character-sheet/`
- 関連TODO: `docs/TODO.md` の「G22で専用アイテムカテゴリframeへカテゴリ削除buttonを追加する」。本Gateで回収する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G22: 専用アイテム統合`

このissueは、G22の実装に必要な表示状態、フォーム値の遷移、算出と確認dialogの境界を自己完結して定義する。G23以降の操作ペイン、保存・復元、JSON、CCFOLIA、全消去は扱わない。

## 実装時のアーキテクチャ遵守

| 適用節                        | 許可する変更                                                                                                                                                              | 禁止する変更                                                                                                     | 確認するテスト層                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `可変行のデザイン指針`        | カテゴリframeの表示・削除操作を追加し、各カテゴリ固有の既存行Componentと列契約をそのまま使う。                                                                            | お守り、サイバネ、ナノマシン、ドラッグ、武器・防具を単一の汎用行Componentへ統合しない。                          | Component、VRT                  |
| `Container / Presenterの責務` | Containerがカテゴリ削除確認と生き様変更時の入れ替えを調停し、form adapterがsectionごとのViewModel / ActionsをPresenterへ渡す。                                            | Presenter / leaf ComponentからRHF、マスタ検索、dialog stateを直接扱わない。                                      | hook、Component、Container      |
| `状態と派生値の境界`          | カテゴリの表示・追加順をRHFのserializableな値として保持し、カテゴリ削除時の入力初期化をRHF操作で行う。派生した専用カテゴリ、warning、消費信用、最大体力補正は保存しない。 | カテゴリ順や表示状態、入力値をlocal stateまたは別storeへ複製しない。生き様変更で入力済みitemを自動削除しない。   | Node、hook、Container           |
| `データ境界`                  | `master-data/`で選択中生き様の`exclusiveItem`と各itemの信用・ナノマシン発動精神力を解決し、logicへ解決済みの値を渡す。                                                    | generated JSONを手編集しない。logic / PresenterからマスタIDを直接検索しない。                                    | Node、hook                      |
| `HTML / CSSの構造と責務`      | `SpecialItemCategorySection`にカテゴリ見出し、warning、削除button、追加button群の意味構造を置き、共通list styleを`composes`で再利用する。                                 | CSSだけで削除可否・warning・入力内容の有無を表現しない。親selectorで既存item Componentの内部buttonを変更しない。 | Component、VRT                  |
| `テストアーキテクチャ`        | logic、form adapter、表示Component、Container dialog orchestration、代表E2E、target限定VRTを各責務に分けて追加・更新する。                                                | E2EまたはVRTだけで算出・validation・dialog副作用を検証しない。VRTを全件実行しない。                              | Node、hook、Component、E2E、VRT |

## 対象範囲

- 生き様マスタの`exclusiveItem`を使い、お守り、サイバネ、ナノマシン、ドラッグの4カテゴリを専用アイテムsectionへ表示する。
  - 生き様未選択時は、`生き様を選択してください。`を表示する。カテゴリframeは既定表示しないが、未表示カテゴリを追加するbuttonは表示する。
  - 未表示カテゴリの追加buttonは、warning枠の白抜きとする。desktop / tabletでは4列1行、mobileでは2列2行に配置する。表示済みカテゴリのbuttonは除外し、残るbuttonを空きなく詰める。
  - 生き様選択時は、対応する専用カテゴリをsection先頭へ表示し、カテゴリ削除buttonを表示しない。このカテゴリは削除不可とする。
  - 非対応カテゴリは追加buttonから表示できる。追加可能カテゴリは、専用カテゴリの後に追加順で並べる。
  - 生き様を変更したときは、旧専用カテゴリを削除可能な一覧の先頭へ移し、新しい専用カテゴリを削除不可のsection先頭へ移す。カテゴリ内の入力は保持する。新しい専用カテゴリがすでに削除可能な一覧にあった場合も、そのカテゴリを一覧から外してsection先頭へ移す。
  - 生き様変更時、アイテム入力の有無を理由に専用アイテム用の確認dialogを追加表示しない。生き様スキルが選択済みの場合だけ既存の生き様スキル用確認dialogを表示し、その確定操作でカテゴリ入れ替えも反映する。生き様スキル未選択時は確認なしで即時に生き様とカテゴリを入れ替える。いずれも同一のカテゴリ入れ替え処理を使い、確認をキャンセル、Escape、閉じる場合は生き様・カテゴリとも変更しない。
- 非対応カテゴリのframeはwarning colorの外枠とし、右上にwarning colorの削除icon buttonを置く。カテゴリ見出し横には、`{選択中の生き様名}では通常使用不可`を表示する。
  - 生き様未選択時に手動追加したカテゴリでは、上記warning文を表示しない。削除可能であることだけをwarning colorの外枠と削除buttonで示す。
  - カテゴリ削除時、カテゴリが持つRHF入力のうち、選択済みitem ID、非初期値の数値入力、またはドラッグの所持セット数が1件でもある場合は確認dialogを表示する。空のカテゴリは確認なしで削除する。
  - 確認のキャンセル、Escape、閉じる操作ではカテゴリと入力を保持する。確定時だけカテゴリを非表示にしてカテゴリ内の入力を初期値へ戻し、削除buttonを押した位置へfocusを戻す。
- 選択済みの武器・防具、お守り、サイバネ、ナノマシン、ドラッグの信用を一元集計する。ドラッグは信用に所持セット数を掛け、`消費信用`と`小銭`へ反映する。
  - 消費信用が合計信用を超えたときは、基本情報側の消費信用表示と信用領域をerror状態にする。アイテムsectionへの重複error表示は追加しない。
- 生き様がスミのときだけ、選択済みナノマシンの`activationMentalCost`の最大値を最大体力へ加算する。選択がない場合は`0`とする。
  - スミ選択時だけ、最大体力の`FormulaTooltip`本文末尾に`+埋め込み中のナノマシンの消費精神力の最大値`を追加する。ほかの生き様では既存tooltip文言を維持する。
- `SpecialItemCategorySection`、各item section、form adapter、logic、Container / Presenter、dictionary、テスト、character-sheet専用E2E / VRT scenarioを、上記の責務境界内で更新する。

## 初期スコープ外

- G17–G21の各カテゴリ内にある行の項目、候補dialogの候補・列・行追加・並べ替え契約を再設計しない。
- 生き様選択を理由に、既存アイテムIDや入力値を自動削除・自動補正しない。
- 生き様スキル以外の確認dialog、保存・復元、JSON入出力、CCFOLIA出力、全消去を実装または変更しない。
- アイテム効果文の解析、消費以外の自動計算、カテゴリの任意名称変更、カテゴリ順の手動並べ替えを追加しない。
- 新規npm package、DB、認証、SSR、CMSを追加しない。その他の初期スコープ外項目は`docs/out-of-scope.md`に従う。

## 完了条件

- [ ] 生き様未選択時に指定の案内文、未表示カテゴリだけの追加button、カテゴリframe非表示を満たす。
- [ ] 追加buttonがdesktop / tabletで4列1行、mobileで2列2行になり、表示済みカテゴリを除外して詰めて表示される。warning枠の白抜き表現を持つ。
- [ ] 選択中生き様の専用カテゴリが削除不可で先頭に表示され、非対応カテゴリは追加・削除できる。非対応カテゴリのwarning枠・右上のwarning削除icon・見出し横warning文を満たす。
- [ ] カテゴリ削除の確認条件、確定・キャンセル・Escape・閉じる、focus復帰が指定どおりに動作する。
- [ ] 生き様変更時に、生き様スキル選択済みでは既存の確認dialogだけを表示し、未選択では即時にカテゴリを入れ替える。いずれもカテゴリ入力の有無にかかわらず専用アイテム用の確認dialogを表示せず、確定時の専用・追加カテゴリ順と入力保持が指定どおりである。
- [ ] 消費信用が武器・防具と全カテゴリの選択済みアイテムを一元集計し、ドラッグの所持セット数を掛ける。信用超過の基本情報側error feedbackを表示する。
- [ ] スミ選択時だけ、ナノマシンの消費精神力最大値を最大体力とtooltipへ反映する。
- [ ] 関連TODOの対応結果を記録している。
- [x] `npm run build` と必要な`npm run check`、対象Node / hook / Component testが通る。
- [ ] 実装後のユーザーレビュー承認を受けて、対象E2Eとtarget限定VRTを実行し、必要なactual screenshotを開いて確認している。canonical baselineの更新は別途ユーザーが明示承認した場合だけ行う。

## チェックポイント

- [x] `docs/architectures/character-sheet.md`に従い、RHFを入力値の唯一の保持先とし、派生値・validationをpure logic、dialog状態をContainer、表示をPresenter / sectionへ分離している。
- [x] `exclusiveItem`、item master-data、各行のform値を明示してlogicへ渡し、Component / Presenterから生成JSONを直接検索していない。
- [x] 消費信用、信用超過、スミの最大体力補正、tooltip条件、カテゴリ表示順、削除確認条件をNode / hook / Component testで確認している。
- [ ] `/character-sheet/`、GitHub Pagesのサブパス公開、既存の武器・防具とG18–G21のカテゴリ内操作を壊していない。
- [ ] desktop `1440x1200`、tablet `820x1180`、mobile `390x900`で、未選択、専用カテゴリ、追加カテゴリ、warning、信用超過、スミの最大体力、カテゴリ削除確認、生き様変更後を確認対象として列挙している。
- [ ] character-sheet VRTは、専用アイテム全体frameのdefaultを3 viewportで、カテゴリ追加・warning・削除確認は該当sectionまたはdialog locatorで対象限定する。tooltipはComponent / browser behavior testで確認し、個別tooltip snapshotを追加しない。
- [x] 不要な依存関係を追加せず、初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`、`docs/design/character-sheet/notes.md`、承認済みdesign draftと矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/SpecialItemCategorySection.tsx`
- `src/character-sheet/components/SpecialItemCategorySection.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/ProfileSection.tsx`
- `src/character-sheet/components/SecondaryAttributesSection.tsx`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useProfileSectionProps.ts`
- `src/character-sheet/form/useSecondaryAttributesSectionProps.ts`
- `src/character-sheet/logic/credit.ts`
- `src/character-sheet/logic/secondary-attributes.ts`
- `src/character-sheet/logic/` 配下の専用アイテム統合logic
- `src/character-sheet/master-data/` 配下の生き様・item表示adapter
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/credit.test.ts`
- `tests/node/character-sheet/secondary-attributes.test.ts`
- `tests/node/character-sheet/` 配下の専用アイテム統合logic test
- `tests/hooks/character-sheet/` 配下の対象form adapter test
- `tests/components/character-sheet/SpecialItemCategorySection.test.tsx`
- `tests/components/character-sheet/ProfileSection.test.tsx`
- `tests/components/character-sheet/SecondaryAttributesSection.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet-scenarios.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- 未選択時にも4カテゴリの追加導線を残しつつ、既定カテゴリframeを表示しない境界がユーザー意図どおりか。
- 生き様変更時の「旧専用カテゴリを削除可能一覧の先頭へ、新専用カテゴリをsection先頭へ」の順序と、入力保持の範囲が明確か。
- 消費信用の集計と信用超過feedbackを基本情報側に限定し、アイテムsectionに重複errorを出さない範囲が適切か。
- スミ固有の最大体力算出とtooltipの差分を、ほかの生き様へ波及させない境界が明確か。
- 既存design draftとユーザー指定を踏まえたVRT対象・baseline更新の前提が適切か。

## レビュー指摘 1

### 指摘事項

- カテゴリ追加buttonと、通常使用不可を示す色が`danger`になっている。これらは`warning` paletteで示すべきである。
- 通常使用不可カテゴリの削除icon buttonにwarning colorの外枠を付ける必要はない。warningの外枠はカテゴリsectionだけに置く。

### 判定

- source: human
- classification: valid

### 対応方針

- 未表示カテゴリを追加するbuttonは、白抜きの`--color-warning` border / textと`--color-warning-soft` hover backgroundを使用する。
- 通常使用不可カテゴリは、section outer frameと見出し横のwarning文で`--color-warning`を使用する。
- 削除icon buttonはwarning色のiconを維持しても、warning色の外枠・区切り線を追加しない。

### 対応完了チェックリスト

- [x] 追加カテゴリbuttonをwarning paletteへ統一する
- [x] 通常使用不可カテゴリのsection outer frameとwarning文をwarning paletteへ統一する
- [x] 削除icon buttonにwarning色の外枠・区切り線を付けない

## レビュー指摘 2

### 指摘事項

- warningカテゴリのsection outer frameと追加カテゴリbuttonの線幅を、既存error状態の強調枠と統一したい。

### 判定

- source: human
- classification: valid

### 対応方針

- error状態と同じく、通常の`--border-width` borderに同幅のinset box-shadowを重ね、warningカテゴリsectionの見た目の線幅を統一する。
- 追加カテゴリbuttonはwarning色の通常`--border-width` borderを維持し、強調枠は追加しない。
- 削除icon buttonにはこの強調枠を追加しない。

### 対応完了チェックリスト

- [x] warningカテゴリのsection outer frameをerror状態と同じ見た目の線幅にする
- [x] 追加カテゴリbuttonを通常のwarning border幅へ戻す
- [x] 削除icon buttonへ強調枠を追加しない

## 備考

- ユーザー指示に従い、新規branchは作成しない。親issueと同じ現行branch `ex-02-web-character-sheet`で作業する。
- `docs/issue/ex-02-web-character-sheet/plan.md` のG22から参照する子issue名と一致する。
- `.raw/contents/`にはキャラクターシートに対応する入力Markdownがないため、可視構成の優先順位はユーザーの最新指示、同目的の既存実装UI、承認済みdesign draft、要件、design notesの順とする。
- `docs/design/character-sheet/notes.md`と親Gate planは、VRT canonical baselineの更新に明示的なユーザー承認を必要とする。現時点ではdesign-image-generationの実行やbaseline更新は前提にしない。
- ユーザー確認済み: カテゴリ削除の「入力内容あり」は、選択済みitem ID・非初期値の数値入力・ドラッグの所持セット数のいずれかとする。生き様未選択で手動追加したカテゴリには`{選択中の生き様名}では通常使用不可`を表示しない。
