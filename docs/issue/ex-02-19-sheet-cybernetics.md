# ex-02-19-sheet-cybernetics

## 最優先のデザイン入力

- 実装時に、対象の`.tmp/design/character-sheet/`配下にある承認済みdesign画像を遵守する。現時点では、このGateに対応する画像は見つかっていない。
- 画像がない範囲は、同じ目的の既存`お守り`・`武器 / 防具`UIと、ユーザーの最新指示を照合する。ユーザーの最新指示を最優先とする。
- ユーザー指定により、G19はサイバネの画面表示側から実装する。desktop、tablet、mobileで効果以外の要約項目をすべて表示し、既存UIの都合で項目を省略しない。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、承認済み画像またはユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートの`専用アイテム`内にサイバネカテゴリを追加し、固定部位とその他の行、埋め込み点数の集計・上限、候補選択dialogを、指定された表示契約と操作で利用できるようにする。

## 背景

親issueのG19は、G4で整備済みの専用アイテム領域を前提に、サイバネの個別行、行操作、候補dialogを扱うGateである。G18のお守りの行操作・dialog実装を再利用可能な既存UIとして参照するが、サイバネ固有の部位、埋め込み点数、上限・エラー表示、およびユーザー指定の行クリア規則をこのGateで定める。

関連する正本は以下とする。

- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md` のアイテム、エラーと警告
- `docs/architectures/character-sheet.md` の実装時のアーキテクチャ遵守
- `docs/design/character-sheet/notes.md`
- `docs/TODO.md`（G19を直接扱う未完了項目は見つかっていない）
- `data/generated/items.json` の`cybernetics`

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G19: サイバネの個別行の選択・行操作・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。`

このissueはG19だけを実装するための自己完結した契約である。G20以降のアイテムカテゴリ、G22のカテゴリ連動・消費信用統合、G24以降の保存・出力・全体エラー集約は扱わない。

## 対象範囲

- `special-items`の既存sectionに、初期表示するサイバネカテゴリを追加する。カテゴリ自体の追加・削除や生き様との表示連動は実装しない。
- 頭、胴体、腕、足を各1行の固定部位として表示し、`その他`を初期1行・最低1行・最大4行の可変部位として表示する。各行の要約は、部位、名称、信用、`埋め込み`と`点数`の間で強制改行する埋め込み点数ヘッダー、効果の展開、操作buttonの順とする。
- 名称ヘッダーを、既存の名称選択と同じ説明を持つtooltip triggerにする。desktop、tablet、mobileのいずれでも、効果以外の前記要約項目を表示する。効果本文は初期非表示で、展開操作により行下へ開閉する。
- 名称は候補選択dialogを開くbuttonとし、未選択時の名称は既存用語と一致させる。固定部位の候補は同じ部位と`任意`、その他の候補は全サイバネとする。同一IDは複数行で選択可能とし、選択済み候補をdisabledまたはmutedにしない。
- 行操作は、頭・胴体・腕・足とその他の1行目で`クリア`buttonを表示し、選択IDを未選択へ戻す。その他の2行目以降は`削除`buttonを表示し、その行を削除する。`その他の部位を追加`buttonで、最大4行までその他行を追加する。確認dialogは開かない。
- `埋め込み点数合計／埋め込み上限`をtooltip付きlabelとして表示し、tooltip本文を次のとおり固定する。

  ```txt
  埋め込み上限 = 常時精神 + 修正。
  埋め込み点数合計 = 選択したサイバネの埋め込み点数の合計 + 修正。個々のサイバネの埋め込み点数を増減させる効果は合計して、埋め込み点数合計の修正値に入力してください。
  ```

- label下には、`埋め込み点数の合計 + 修正入力欄 = 最終値／常時精神 + 修正入力欄 = 最終値`を表示する。両方の修正は整数入力で負数を許可し、マスタ効果の文章解析や自動加算は行わない。最終的な埋め込み点数合計が上限を超える場合、サイバネカテゴリと集計値を支援技術にも伝わるerror状態にする。個別入力へ可視のエラー理由は追加しない。
- 選択dialogは、部位ごとに小見出しを置いて候補tableを分離する。各小見出し直下のtableごとにヘッダーを置き、列は名称、信用、埋め込み点数とする。候補行は展開操作を置かず、効果を2行目へ表示する。
- `cybernetics`のmaster-data adapter、form schema・default値、pure logic、form adapter、Presenter、Container dialog orchestration、Component、CSS Module、dictionary、対象Node / hook / component / browser / Visual testを、既存の所有境界に沿って追加・更新する。
- 選択済みの埋め込み点数合計が`5以下`、`6〜10`、`11以上`の境界をまたぐ場合に、`docs/requirements/character-sheet.md`で指定された非戦闘技能の標準修正`0`、`-3`、`-6`への再設定を実装する。既存の手動修正を上書きすることを画面で説明し、同じ段階内の点数変動では再設定しない。

## 初期スコープ外

- G20のナノマシン、G21のドラッグ、ほかのアイテムカテゴリを実装・変更しない。
- G22の生き様によるサイバネカテゴリの既定表示・非表示、カテゴリ追加・削除、保持済みアイテム警告、消費信用の一元算出を実装しない。
- 個別サイバネ効果の文章解析、能力値・判定数・防御力などへの自動適用、サイバネ専用武器との選択連動を実装しない。
- G25の操作メニューへのエラー全件集約、G24以降のlocalStorage、IndexedDB、JSON、CCFOLIA、サーバー、DBを実装しない。
- confirmation dialog、UI library、キャラクター作成ウィザード、Header、Footer、サイトメニュー、canonical VRT baselineの追加・再設計・更新を行わない。
- `docs/plan.md`のチェックボックスを変更しない。初期スコープ外の項目は`docs/out-of-scope.md`に従う。

## アーキテクチャ適用

| 適用節                        | 許可する変更                                                                                                                                                     | 禁止する変更                                                                                                       | 確認するテスト層                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `実装時のアーキテクチャ遵守`  | G19の変更を以下の適用節とこのissueの対象範囲へ対応付ける。                                                                                                       | 対応付けられない共有Component、状態所有者、データ境界、テスト層を変更しない。                                      | 最終diffをこの表と照合する。                        |
| `可変行のデザイン指針`        | サイバネ固有の行・候補dialog ComponentとCSS Moduleを追加し、部位、名称、信用、埋め込み点数、展開、操作の列をこのissueの表示契約どおりに配置する。                | 異なるform値・業務条件を持つ既存アイテム行を共通Componentへ抽象化しない。mobileで要約項目を展開領域へ退避しない。  | Component、browser、target限定Visual test。         |
| `Container / Presenterの責務` | Containerが候補dialogの開閉、対象row、focus復帰を保持し、PresenterへサイバネsectionのViewModel / Actionsを渡す。                                                 | Presenter / 表示ComponentからRHF、マスタ検索、派生値算出、validation、dialog stateへ直接アクセスしない。           | Hook、Component、Container、browser test。          |
| `状態と派生値の境界`          | RHFにサイバネ行と2種類の修正を保持し、pure logicで埋め込み点数合計・上限・超過error・段階境界を導出する。境界通過時だけ既存非戦闘技能修正をRHF操作で再設定する。 | RHF値を別storeへ複製しない。効果本文を解析して修正を自動入力しない。同じ段階内の点数変更で手動修正を上書きしない。 | Node、hook、Component test。                        |
| `データ境界`                  | `master-data/cybernetics.ts`で生成JSONから候補と表示用情報を取得し、ID選択をform値に保存する。                                                                   | generated JSONを手編集しない。ComponentまたはPresenterから生成JSONを直接検索しない。                               | Node、hook test。                                   |
| `HTML / CSSの構造と責務`      | table相当の列見出し・行・展開領域、部位別候補table、error状態を意味構造とCSS Moduleで実装する。                                                                  | tableのためだけに不必要なDOMを増やさない。CSSだけで操作・errorの意味を表現しない。                                 | Component、browser、Visual test。                   |
| `テストアーキテクチャ`        | pure logic、form hook、表示Component、Container dialog orchestration、browser操作、VRT stateを対象ごとに追加・更新する。                                         | browser APIやE2Eだけでlogic / formの境界を検証しない。全件VRTやcanonical baseline更新を行わない。                  | Node、hook、Component、browser、変更target限定VRT。 |

## 完了条件

- [ ] サイバネカテゴリが初期表示され、固定4行とその他の初期1行・最小1行・最大4行を指定どおりに操作できる。
- [ ] 各行の部位、名称、信用、埋め込み点数、展開、クリアまたは削除buttonと、desktop / tablet / mobileの表示契約が指定どおりで、横overflowがない。
- [ ] 名称ヘッダーと埋め込み点数合計／埋め込み上限labelのtooltip、効果展開、候補選択、クリア・削除・追加がkeyboard操作、Escape、閉じる操作、focus復帰を含めアクセシブルに動作する。
- [ ] 埋め込み点数合計・上限の式、修正入力、超過error状態、5 / 6〜10 / 11以上の境界での非戦闘技能標準修正の再設定がpure logicと表示で一致する。
- [ ] 候補dialogが部位別の小見出しと各table headerを表示し、指定列・2行目の効果・重複選択許可を満たす。
- [ ] 関連TODOを扱わない理由と、参照するdesign target・VRT baselineを更新しない扱いが記録されている。
- [ ] `npm run build` が通る。
- [ ] 必要な`npm run check`、対象Node / hook / component / browser test、変更target限定のVRTが通る。

## チェックポイント

- [ ] `docs/architectures/character-sheet.md`に従い、pure logic、form adapter、Presenter、Container、Componentの所有境界を越えていない。
- [ ] `/character-sheet/`の既存ルート、既存special-item category、GitHub Pagesのサブパス公開に影響しない。
- [ ] desktop `1440x1200`、tablet `820x1180`、mobile `390x900`で、default、選択済み、その他追加、効果展開、名称tooltip、集計tooltip、候補dialog、上限超過errorを確認する。
- [ ] Visual Reviewでは上記route・state・viewportのactual screenshotを開き、対象target限定VRTの結果とともに記録する。canonical baselineは更新しない。
- [ ] 不要な依存関係を追加せず、初期スコープ外の機能を実装しない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/master-data/cybernetics.ts`
- `src/character-sheet/logic/cybernetics.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useCyberneticsSectionProps.ts`
- `src/character-sheet/form/presenter-state.ts`
- `src/character-sheet/components/CyberneticsSection.tsx`
- `src/character-sheet/components/CyberneticsSection.module.css`
- `src/character-sheet/components/dialogs/CyberneticsPickerDialog.tsx`
- `src/character-sheet/components/dialogs/CyberneticsPickerDialog.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/cybernetics.test.ts`
- `tests/hooks/character-sheet/useCyberneticsSectionProps.test.tsx`
- `tests/components/character-sheet/CyberneticsSection.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`
- `docs/requirements/character-sheet.md`

## レビュー観点

- 固定部位・その他の行操作と、その他の1行目だけを`クリア`にする表示契約が、ユーザー意図どおりか。
- mobileで効果以外の要約項目を省略せず、埋め込み点数ヘッダーを指定どおり折り返して横overflowを回避できているか。
- 埋め込み点数合計の修正と上限の修正を分ける式・tooltip文言、上限超過error、非戦闘技能の段階的再設定が確認可能か。
- 候補dialogを部位別tableへ分離し、候補効果を2行目へ置く構成が操作しやすいか。
- `docs/design/character-sheet/notes.md`のVRT扱いを守り、canonical baselineの更新を別途ユーザー承認とできているか。

## 備考

- branchは、ユーザー指示により新規作成せず、既存の`ex-02-web-character-sheet`を使用する。
- user-directed requirement update: 埋め込み点数合計の修正を追加し、合計値を`選択中サイバネの点数合計 + 埋め込み点数合計の修正`、上限を`常時精神 + 埋め込み上限の修正`として扱う。上限errorと非戦闘技能の段階境界は、この最終合計を基準にする。
- G19のVRT targetは`tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`、routeは`/character-sheet/`とする。変更targetだけを比較し、baseline更新はユーザーの明示承認がある場合だけ行う。
- UI実装後のE2EおよびVRTは、親Gate planの規約に従い、ユーザーレビュー完了の明示指示後に実行する。実装後のレビュー待ちではpreview serverを起動せず、既定portのdev serverを維持する。
