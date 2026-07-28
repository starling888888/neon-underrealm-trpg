# ex-02-13-sheet-ikizama-skills

## 最優先のデザイン入力

- 対象design targetは`docs/design/character-sheet/notes.md`と`.tmp/design/character-sheet/`配下の承認済みdraftである。
- 現行の`components/skills/` shared Component、G12で確定したスキル区分のheader、展開、候補dialog、mobile個別最適化は、draftより優先する既存UIとして再利用する。
- ユーザーの最新指示と`docs/architectures/character-sheet.md`の`可変行のデザイン指針`を優先する。design notes、actual screenshot、reviewer出力を画面設計の根拠にしない。

## 目的

選択中生き様のボーナススキルと通常スキルを、`スキル`大セクション内で編集できるようにする。

## 背景

G12はプライマリ流儀スキルだけを接続し、再利用可能な`components/skills/`の表示・候補dialogを整備済みである。G13は生き様固有のフォーム値、候補条件、bonusの取得Lv編集を、そのshared Componentへadapterとして接続する。

- 要件: `docs/requirements/character-sheet.md`の「スキル」「経験点と信用」
- architecture: `docs/architectures/character-sheet.md`のスキル区分の共通表示、可変行のデザイン指針、Container / Presenter、テストアーキテクチャ
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`のG13
- design: `docs/design/character-sheet/notes.md`
- data: `data/generated/ikizama-skills.json`、`data/generated/ikizama-list.json`
- TODO: `docs/TODO.md`のG24前の`useFieldArray`境界整合は扱わない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G13: 生き様のスキルを扱う`

このissueは、生き様スキルのフォーム値、表示用adapter、候補選択、局所validation、テストを新しいsessionから実装できる契約とする。

## アーキテクチャ適用

| 節                   | 許可する変更                                                                                                | 禁止する変更                                                                              | 確認するテスト層 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------- |
| スキル区分の共通表示 | shared `SkillSection`はadapterが渡す行ViewModelの削除可否を表示するだけとし、生き様の最低行数を判断しない。 | `SkillSection`へ生き様ID、RHF field path、bonus固有処理、最低行数の業務条件を追加しない。 | Component        |
| 状態と派生値の境界   | `ikizamaSkills.rows`の追加・削除・並べ替えをRHFの`useFieldArray`へ閉じる。                                  | RHF外の編集state、0行を補うUI stateを追加しない。                                         | hook             |
| テストアーキテクチャ | 0行への削除、bonusのみの合計validation、削除buttonと追加buttonをhook / Component testで確認する。           | この局所境界をbrowser E2EやVRTへ追加しない。                                              | hook / Component |

## 対象範囲

- RHFへ、生き様通常スキル初期2行（最低0行）の`rowId`、skill ID、取得Lvと、生き様bonusの取得Lvを追加する。選択時と別スキルへの変更時はLvを`1`へ戻し、空行は合計へ含めない。通常行の追加・削除・上下移動は`useFieldArray`で行い、既存可変行の移行はG24前TODOへ残す。
- `ikizama-skills.json`から選択中生き様の`bonus`を先頭へ導出する。bonusは候補に含めず、名称・マスタ由来の内容は編集不可、取得Lvだけを初期値・最低値`1`で編集可能にする。生き様IDが変更・解除されたときはbonus Lvを`1`へ戻し、同じ生き様のLv変更では値を保持する。bonus Lv1は無料とし、Lv2以上の超過分を取得合計へ含める。
- 生き様レベル4未満では`basic`、4以上では`basic`と`advanced`を候補dialogのgroupとして表示する。通常行は追加・削除・上下移動でき、先頭・末尾以外へ移動できない方向のbuttonは表示しない。
- `SkillSection`と`SkillPickerDialog`を再利用し、生き様専用の重複した行Component、候補dialog、CSS Moduleを追加しない。生き様adapterが、行ViewModel、候補group、bonusのLv編集可否、候補条件、validation結果、callbackへ正規化する。
- 生き様通常スキルの選択済み取得Lvとbonus Lv2以上の超過分の合計が生き様Lvを超えるときは、流儀・生き様入力側と生き様スキル区分の両方をerror状態にする。bonusの無料Lv1と空行は合計に含めない。通常行の最大Lv、重複、advanced条件はG16の全スキル一貫validationへ先送りする。
- 固定文言を追加・移動する場合は、ゲーム用語・スキル属性名を`characterSheetDictionary.gameDomain.terms`へ、section名、操作、button、dialog説明、未選択messageを`characterSheetDictionary.characterSheet`へ分類する。生成JSON由来の名称・制限・効果をdictionaryへ複製しない。
- browser E2Eは、領域表示と候補dialogを開いて1候補を選ぶなど2〜3個の代表操作だけを最終smokeとして確認する。固定データ全件、Lv境界、候補group、disabled、callback、dialog copy、行順はNode / Component / hook testへ置き、test-onlyのDOM・state・data属性を製品コードへ追加しない。
- shared skill表示は、desktop / tabletで`帰還不能地点`を含む最長のスキル名をclipせずに名称列へ表示する。mobileを含む幅制約時は、生成データに含まれる改行を保持して自然な改行を許可し、clipやellipsisで文字を隠さない。各スキル区分の間には、section frame内で一貫した縦余白を置く。

## 初期スコープ外

- プライマリ、共通、その他流儀スキルのフォーム値・adapter・候補を変更しない。ただし、生き様スキルの表示修正に必要なshared `SkillSection`の名称表示と区分間余白は、既存区分へ共通適用してよい。
- G14の共通スキル経験点、G15のその他流儀削除確認、G16の全区分横断validationを実装しない。生き様スキル合計と生き様Lvの局所validationだけは本Gateで扱う。bonusスキルの無料分はLv1とする。G24前TODOで扱う既存可変行の`useFieldArray`移行は実装しない。
- スキル効果、取得制限、前提、排他、能力値・アイテム条件を解析・自動算出しない。
- 保存・復元、JSON入出力、canonical VRT baseline更新、追加依存の導入を行わない。

## 完了条件

- [x] 選択中生き様のbonusと通常初期2行を、既存shared Componentで表示・編集できる。通常行は0行まで削除できる。
- [x] bonusは生き様IDの変更・解除時にLv`1`へ戻り、同じ生き様のLv変更時は値を保持する。通常行は`useFieldArray`で選択、Lv編集、追加・削除・上下移動をできる。
- [x] 生き様Lv4で候補が`advanced`を含むよう切り替わる。
- [x] 生き様スキルの取得Lv合計が生き様Lvを超えると、流儀・生き様入力側と生き様スキル区分がerror状態になる。bonusスキルはLv1だけを無料とし、Lv2以上の超過分と通常スキルを合計し、空行は含めない。
- [x] dictionaryのゲーム用語とキャラクターシートUI文言を指定の所有者へ分類し、生成データ文言を複製していない。
- [x] desktop / tabletの名称列で`帰還不能地点`をclipせずに表示し、mobileを含む狭い幅ではデータ内改行を保持して文字をclip / ellipsisしない。各スキル区分の間に一貫した縦余白がある。
- [x] E2Eが最終smokeの責務を越えず、局所契約をNode / Component / hook testへ分離している。局所logic用に追加したVRT状態は削除し、長い名称の表示受入だけをlocator-only VRTで確認した。最終smokeを再確認した。
- [x] `@character-sheet` targetのdefault、候補dialog、詳細展開をdesktop、tablet、mobileでVisual Reviewする。canonical VRT baselineは更新しない。
- [x] `npm run check`、`npm run build`、関連テストが通る。

## チェックポイント

- [x] `docs/requirements/character-sheet.md`、architecture、design targetと矛盾していない。
- [x] GitHub Pagesのsubpath公開と既存routeに影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 新設する生き様通常行だけを`useFieldArray`で操作し、既存可変行の移行はG24前TODOへ残している。
- [x] 生き様スキルの合計errorを、プライマリ・共通・その他流儀やG16の横断validationへ拡張していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 仕様変更 1

- source: user
- 生き様通常スキルは初期2行とするが、最低行数は0行へ変更する。bonusスキルだけを成長させ、通常スキルを取得しない状態を許容する。
- 影響: form初期値は2行のまま、削除操作の最低行数、0行時の追加・候補dialog操作、bonus Lvだけの合計validationを実装・hook・Component testで確認する。browser E2Eはこの局所境界を追加せず、最終smokeのままとする。
- status: requirementsと本子issueへ反映済み。通常行はRHFの`useFieldArray`で2行から0行まで削除でき、bonus Lvだけが残る状態を許容する。hook / Component testと実ブラウザ操作で確認済み。

## 想定変更ファイル

- `src/character-sheet/form-values.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/master-data/ikizama-skills.ts`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/components/skills/`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- 生き様固有の候補条件とbonus Lv編集をadapterへ閉じ、shared Componentへ業務条件を持ち込んでいないか。
- dictionary所有者、E2Eの最終smoke責務、可変行デザイン指針を守れているか。
- G16の全区分validationを前倒ししていないか。

## 備考

- G12のshared表示契約とrequirementsのdesktop / tablet列契約に差異がある場合は、実装前にrequirementsの正本を同期してから進める。

## ビジュアルレビュー 1（記録訂正）

### VRT対象

- design target: `character-sheet`
- VRT test / tags: なし。生き様の候補・詳細stateをVRTへ追加していたが、テストアーキテクチャ外のため削除した。
- route / states / viewports: `/character-sheet/`の生き様選択済み、候補dialog表示、bonus詳細展開をdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）で確認。

### レビュー結果

| 対象                                    | 判定 | 差分                                                        | 対応                                                         |
| --------------------------------------- | ---- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 生き様スキル領域、候補dialog、bonus詳細 | 訂正 | 長い名称の選択stateを含めておらず、clipなしの報告は確認不足 | レビュー指摘1で追加入力し、ビジュアルレビュー2で再確認する。 |

### 実画面確認

- `/character-sheet/` / 生き様選択済み / desktop, tablet, mobile:
  - locator screenshot: `[data-ikizama-skills-section]`（original pixel resolution）
  - checked acceptance criteria: bonus先頭表示とLv編集、通常2行、追加・削除・移動button、行内overflowなし
  - result: OK
- `/character-sheet/` / 候補dialog表示 / desktop, tablet, mobile:
  - locator screenshot: `[data-ikizama-skills-section]`、`[role="dialog"][aria-label="生き様スキルを選択"]`（original pixel resolution）
  - checked acceptance criteria: basic候補の表示、dialog内scroll、mobileを含む横overflowなし
  - result: OK
- `/character-sheet/` / bonus詳細展開 / desktop, tablet, mobile:
  - locator screenshot: `[data-ikizama-skills-section]`（original pixel resolution）
  - checked acceptance criteria: 自動習得の内容は読み取り専用、bonus Lvだけ編集可能、詳細の折り返し
  - result: OK。長い通常スキル名のclipはこのstateで確認しておらず、レビュー指摘1で未達と判明した。

### 自己修正した項目

- [x] 生き様領域のaccessible nameを`生き様スキル`へ明確化し、E2Eの領域選択を通した。

### 人間判断が必要な差分

- VRT対象として追加した生き様stateはテストアーキテクチャ外だったため、baselineを作成・更新しない。

### 訂正履歴

- 削除済みVRT targetはbaseline未作成で比較・snapshot取得ができず、受入条件と最終diffのstate列挙、原寸locator screenshot、差分判断にも使わない。
- full-page screenshotは局所表示契約の確認根拠に使わず、baseline更新要否は人間判断として記録した。
- 長い名称の未確認はレビュー指摘1で訂正した。現行の受入結果と`npm run check` / `npm run build`の結果はビジュアルレビュー3へ集約した。

## ビジュアルレビュー 3（preview最終確認）

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `@primary-skills-selected`、`@primary-skill-picker-open`、`@primary-skill-details-expanded`、`@primary-ryugi-change-confirm`、`@ikizama-long-skill-selected`
- route / states / viewports: `/character-sheet/` のprimary shared skill表示、候補dialog、詳細、確認dialog、および生き様の長い名称をdesktop、tablet、mobileでcapture。

### レビュー結果

| 対象                             | 判定     | 差分                                                               | 対応                                                                                         |
| -------------------------------- | -------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| shared skill表示とprimary dialog | 確認済み | canonical baselineとの差分は、G13で意図したスキル区分間gapによる。 | baselineを更新せず、actual locator screenshotを確認した。                                    |
| 生き様の長い名称                 | 確認済み | canonical baselineは未作成のため比較不能。                         | locator-onlyの`@ikizama-long-skill-selected`で原寸画像を取得・確認し、baselineは更新しない。 |

### 実画面確認

- `/character-sheet/` / primary shared skill表示、候補dialog、詳細、確認dialog / desktop、tablet、mobile:
  - locator screenshot: `primary-skills-section`とdialog ownerをoriginal pixel resolutionで開いた。
  - checked acceptance criteria: automatic行の追加legendによる表示崩れなし、名称列・headerの揃え、詳細toggle、候補dialogと確認dialogのbounds、mobileの横overflowなし。
  - result: OK。
- `/character-sheet/` / 生き様の`帰還不能地点`選択済み / desktop、tablet、mobile:
  - locator screenshot: `ikizama-skills-section`をoriginal pixel resolutionで開いた。
  - checked acceptance criteria: desktop / tabletの名称列幅、データ内改行、mobileを含むclip / ellipsisなし、行内の横overflowなし、skill section間gap。
  - result: OK。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した（12状態はcanonical baselineとの差分、3状態はcanonical baseline未作成）。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した（意図した区分間gapであり、baselineは更新しない）。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- G12 child issueが、完了条件・チェックポイント・Visual Reviewの未チェックを残したままparent Gate planで`done`となり、`docs/issue/done/`へ移動している。current Gateでも同じ完了記録の不整合を起こしてはならない。
- `IkizamaSkillsSectionProps`にも、表示Componentが使わない候補groupと選択callbackが含まれ、ContainerがPresenter propsの内部を直接参照している。
- 生き様skill pickerのキャンセル・Escape時の入力保持と、close後のtriggerへのfocus復帰は、shared dialog単体では確認されるがContainer結線として固定されていない。
- 生き様通常skillを選択した状態で別の生き様へ変更しても、現在は即時に切り替わり確認dialogが出ない。選択済みskillを破棄する変更は、プライマリ流儀と同じ確認UIを用い、cancel / Escape時は現在の生き様とskillを保持する必要がある。
- 生き様bonusはLv inputを持つautomatic行だが、shared `SkillSection`がautomatic行の`fieldset`に`legend`を出さない。詳細toggleも対応する詳細領域を`aria-controls`で参照しない。
- 通常skill Lvのbrowser直接入力をmax Lvへclampする実装は、`docs/requirements/character-sheet.md`の「不整合を自動補正しない」原則と矛盾する。保存・復元・JSON入力時の扱いをG24 / G27で確定する必要がある。
- プライマリ流儀skillの可変行を`useFieldArray`へ移行する指摘は、既存のG24前TODOで追跡済みである。

### 判定

- source: unknown (`.tmp/chatgpt-review.md`)
- classification: valid（完了記録、dialog props、Container結線、生き様変更確認、bonus行の意味付け、詳細toggle）/ follow-up（入力自動補正）/ stale（既存G24 TODOの可変行移行）
- local validation: parent Gate planのG12は`done`でchild issueは`docs/issue/done/`へ移動済みだが、review sourceが指摘する未チェック記録を持つ。G13もContainerが`presenterProps.ikizamaSkillsSection.candidateGroups`と`onSelect`を直接参照し、表示Componentはそれらを利用しない。shared dialog単体にはfocus復帰testがある一方、G13のContainer結線testはない。`useBuildSectionProps`の`onIkizamaChange`は生き様IDを即時設定し、Containerは生き様変更のpending stateも確認dialogも持たない。G13 bonusはLv inputを持つautomatic `fieldset`であり、`legend`なしは現行契約に不適合である。`useFieldArray`移行は`docs/TODO.md`のG24前TODOで既に追跡する。

### 対応方針

- G13をclose / archive / parent Gate planの`done`へ変更する前に、child issueの完了条件、チェックポイント、レビュー節の未チェックを実確認結果と照合する。未チェックが残る間はarchiveしない。
- hookの返却を表示用`sectionProps`とRoot dialog用の候補・選択actionへ分離し、Containerが表示Component用propsの内部を参照しないようにする。
- 生き様pickerのキャンセル、Escape、focus復帰と選択値保持をContainer結線testへ追加する。browser E2Eの最終smoke境界は拡張しない。
- 生き様変更前に通常skillの選択有無を確認し、選択済みならプライマリ流儀変更と同じ確認dialogを表示する。confirm時だけ生き様通常skillの選択を解除して変更を適用し、cancel / Escape時は生き様とskillを保持する。dialogの表示構造は再利用し、生き様向けの文言が必要な場合だけdictionaryへ追加する。
- automatic bonus行の入力groupを意味付け、詳細toggleと詳細領域を関連付ける。表示Component testで確認する。
- 入力自動補正の優先順位と、復元・JSON入力の既存超過値の扱いは、G24 / G27の着手時にrequirementsと入力schemaの契約として確定する。このGateでは変更しない。

### 対応完了チェックリスト

- [x] G13をarchiveする前に、child issueの完了条件・チェックポイント・レビュー節の未チェックを実確認結果と照合する。未確認の長い名称の原寸画像は残っているため、archive / parent Gate planの`done`には進まない。
- [x] Root dialog用の候補・選択actionを表示用section propsから分離する。
- [x] 生き様pickerのキャンセル・Escape・focus復帰をContainer結線testで確認する。
- [x] 選択済み生き様skillがある変更で確認dialogを表示し、confirm時だけskillを解除して生き様を変更する。cancel / Escape時の入力保持とfocus復帰をContainer結線testで確認する。
- [x] bonus行のinput groupと詳細toggleのアクセシビリティ関連付けを表示Componentで確認する。
- [x] G24 / G27着手時に、skill Lvの入力自動補正と既存超過値の扱いをrequirements / schema契約として確定する。`docs/TODO.md`へ追跡先を追加した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 1

### 指摘事項

- ブライLvを生き様通常スキルの取得Lv合計が超えても、error表示にならない。
- `帰還不能地点`のような長い名称が、改行されない表示でclipする。必要な名称列幅を確保し、幅制約時は生成データ内の改行を尊重して文字を隠さない。
- スキル区分どうしが連続しており、区分間の縦余白がない。

### 判定

- source: human
- classification: valid
- local validation: `docs/requirements/character-sheet.md`は生き様を含むスキル合計超過を検証対象とする。現行G13 issueは生き様合計整合をG16へ先送りしており、ユーザー指示により本Gateの局所validationへ戻す。現行shared `SkillSection`は名称に`white-space: nowrap`を指定し、sectionを`overflow: clip`しているため、長い名称を隠しうる。スキル区分は同一コンテナで縦に連続している。

### 対応方針

- 生き様通常スキルの選択済みLvとbonusスキルのLv2以上の超過分を合計し、生き様Lv超過をBuildと生き様スキル区分へ伝える局所validationを追加する。bonusの無料Lv1、空行、他区分は計算へ含めない。
- shared skill表示の名称列はdesktop / tabletで最長名を表示できる幅を確保し、狭幅ではデータ内改行を保持して折り返す。clip / ellipsisでの隠蔽は行わない。
- shared skill区分を積む親コンテナに縦gapを追加し、既存のプライマリ流儀スキルとの間にも適用する。

### 対応完了チェックリスト

- [x] 生き様スキルの合計Lv超過をBuildと生き様スキル区分へerror表示する
- [x] `帰還不能地点`を含む長い名称とデータ内改行を各viewportでclipせずに表示する。
- [x] スキル区分間の縦余白をdesktop、tablet、mobileで確認する
- [x] Node / hook / Component testとE2E smokeの責務境界を保つ
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2（記録訂正）

### VRT対象

- design target: `character-sheet`
- VRT test / tags: なし。名称、余白、Lv超過の局所契約をVRTへ追加していたが、テストアーキテクチャ外のため削除した。
- route / states / viewports: `/character-sheet/`のスキル区分表示、生き様の`帰還不能地点`選択済み、生き様通常スキルLv合計超過をdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）で確認。

### レビュー結果

| 対象                       | 判定 | 差分 | 対応                                                                          |
| -------------------------- | ---- | ---- | ----------------------------------------------------------------------------- |
| 長い名称と区分間余白       | OK   | なし | desktop / tabletで名称を2行表示し、mobileでもデータ内改行を保持してclipなし。 |
| 生き様通常スキルLv合計超過 | OK   | なし | Buildと生き様スキル区分の双方をerror状態にした。                              |

### 実画面確認

- `/character-sheet/` / スキル区分表示 / desktop, tablet, mobile:
  - locator screenshot: `[data-character-sheet-section-slot="skills"]`（original pixel resolution）
  - checked acceptance criteria: プライマリ流儀と生き様スキル区分の縦余白、横overflowなし
  - result: OK
- `/character-sheet/` / 生き様の`帰還不能地点`選択済み / desktop, tablet, mobile:
  - locator screenshot: `[data-ikizama-skills-section]`（original pixel resolution）
  - checked acceptance criteria: データ内改行の保持、名称のclip / ellipsisなし、各cellの整列
  - result: OK
- `/character-sheet/` / 生き様Lv1・bonus Lv3による合計超過 / desktop, tablet, mobile:
  - locator screenshot: `[data-character-sheet-section-slot="build"]`、`[data-ikizama-skills-section]`（original pixel resolution）
  - checked acceptance criteria: Buildと生き様スキル区分のerror表示、行内overflowなし
  - result: OK

### 自己修正した項目

- [x] 通常スキルの選択済みLvとbonusスキルのLv2以上の超過分を生き様Lvと比較する局所validationを追加した。
- [x] shared skill名称の改行を保持し、sectionのclipを解除した。
- [x] スキル区分を積む親コンテナへ縦gapを追加した。

### 人間判断が必要な差分

- VRT対象として追加した局所stateはテストアーキテクチャ外だったため、baselineを作成・更新しない。

### 訂正履歴

- 削除済みVRT targetはbaseline未作成で比較・snapshot取得ができず、受入条件と最終diffのstate列挙、原寸locator screenshot、差分判断にも使わない。
- full-page screenshotは局所表示契約の確認根拠に使わず、baseline更新要否は人間判断として記録した。
- 現行の受入結果と`npm run check` / `npm run build`の結果はビジュアルレビュー3へ集約した。
