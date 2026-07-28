# ex-02-16-sheet-experience-consistency

## 最優先のデザイン入力

- `docs/requirements/character-sheet.md`、`src/pages/advancement.mdx`、`src/pages/character-making.mdx`の数値規則を優先し、`.tmp/design/character-sheet/`の承認済みdraft（desktop / tablet / mobile）と既存のキャラクターシートUIを照合して、経験点・スキル・可変行の既存配置を維持する。
- このGateでは可視のエラー理由を入力直下へ追加しない。最大Lv違反は該当入力・行だけ、区分合計超過など既存の区分エラーは該当sectionを含むerror状態で示し、エラー集約UIはG25で扱う。
- design notes、実装結果のscreenshot、reviewer出力はdesign draftの代わりにしない。画面配置または状態表現に競合・不明点があれば、実装せずにユーザー判断を求める。

## 目的

流儀、生き様、共通スキル、各流儀スキルを含む消費経験点と局所エラーを同じ入力値から一貫して導出する。可変行をRHFの`useFieldArray`操作に統一し、後続G24 / G27が保存・復元・JSON入力を追加してもrow ID、uncontrolled number input、schemaの契約を壊さない状態にする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の`G16`
- 要件: `docs/requirements/character-sheet.md`の「共通動作」「経験点と信用」「スキル」「エラー・警告表示」
- ルール正本: `src/pages/advancement.mdx`の経験点使用規則と、`src/pages/character-making.mdx`のフルスクラッチ規則
- architecture: `docs/architectures/character-sheet.md`の「スキル区分の共通表示」「状態と派生値の境界」「テストアーキテクチャ」
- design target: `docs/design/character-sheet/notes.md`、`.tmp/design/character-sheet/`の承認済みdraft
- 関連TODO: `docs/TODO.md`の次の3件をこのGateで回収する。
  - G16で生き様bonusを含む全スキルの最大Lv制約を定義する。
  - G24 / G27着手前にスキルLvの未確定入力、最大Lv超過、復元・JSON入力値の扱いをrequirements / schema契約として確定する。
  - G24着手前にキャラクターシート可変行のRHF操作境界を`useFieldArray`契約へ整合する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G16: 消費経験点の算出整合性を確認する。`

このissueはG16だけを実装する自己完結した契約である。G17以降のアイテム、G23の操作ペイン、G24の保存・復元、G25のエラー集約、G26 / G27のJSON入出力は実装しない。

## アーキテクチャ適用

| architecture節              | このGateで許可する変更                                                                                                                                                                    | このGateで禁止する変更                                                                                                                       | 確認するテスト層                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| スキル区分の共通表示        | 各skill adapterが最大Lv・重複・区分合計のvalidationをrow / section Propsへ正規化し、生き様bonusを含めて同じ局所error契約を渡す。                                                          | shared skill ComponentへRHF、field path、マスタ検索、経験点算出、区分判定を渡さない。                                                        | Node logic、RHF hook、Component                       |
| 可変行のデザイン指針        | 既存の行・header・追加・削除・並べ替え・error表示を維持したまま、配列操作を`useFieldArray`へ置き換える。                                                                                  | 行種別を単一の汎用Componentへ統合しない。新しい可視error文言、layout、mobile最適化を追加しない。                                             | RHF hook、既存Component、必要時のPlaywright smoke     |
| Container / Presenterの責務 | section hookとpure logicでViewModel / Actionsを組み立て、既存Containerのdialog・focus orchestrationを保つ。                                                                               | Containerへ算出式・schema・RHF配列の細部を集約しない。Presenter / shared表示Componentへ業務判断を移さない。                                  | Node logic、RHF hook、Component                       |
| 状態と派生値の境界          | 編集値の唯一の保持先をRHFに保ち、可変行は`useFieldArray`の`append`、`remove`、`move`、`replace`で操作する。未確定number inputはDOMにだけ保持し、確定値をschema / adapter経由でRHFへ渡す。 | 配列全体の`setValue`更新、RHF以外の編集state、genericなpath文字列による行更新を導入しない。G24 / G27の永続化・JSON adapterを先行実装しない。 | schema、RHF hook、Component                           |
| テストアーキテクチャ        | 経験点・上限・error識別子をNode、RHF更新・row操作・外部更新契約をhook、表示済みPropsをComponent、代表操作だけをPlaywrightへ置く。                                                         | VRTへ数式・schema・RHF内部状態の網羅を置かない。UI変更がない場合にVRTを実行しない。                                                          | Node、Vitest hook / Component、必要最小限のPlaywright |

## 対象範囲

- 流儀・生き様の追加レベル、その他流儀、共通スキル通常行について、`src/pages/advancement.mdx`とフルスクラッチ規則どおりの消費経験点をpure logicで一元導出する。自動取得のプライマリbonus、基本の一撃、生き様bonusのLv 1は経験点へ加算しない。生き様bonusのLv 2以上は、生き様の成長に伴うスキルLvとして二重計上せず、生き様Lvの経験点だけで扱う。
- 消費経験点、残経験点、経験点不足のerror状態を、全区分の入力変更で一貫して更新する。スキル区分ごとの合計上限・重複は既存の局所表示境界（Build、該当行、該当section、共通スキルの基本情報枠）を保ち、最大Lv超過は該当入力・行だけで示す。
- 全通常スキルと生き様bonusについて、選択中マスタの`maxLevel`を超える値をbrowser入力、schema、pure validation、該当入力 / 行のerror状態で同じ規則として扱う。値をclamp・拒否・自動削除せず保持し、`max`属性だけを正しさの根拠にしない。
- 未確定なnumber inputはfocus中のDOMだけに保持し、確定可能な値をRHFへ渡す。blur、`reset`、端末内復元、JSON入力では、schemaで受理した値をuncontrolled inputへ同期する契約をrequirements / schema / form adapterに明記する。G16では保存・復元・JSON入力のUIやadapterを実装しない。
- `build.otherRyugi`、`bonds.rows`、`checks.attacks`、`checks.reactions`、プライマリ・生き様・共通・その他流儀スキルの可変配列を`useFieldArray`で操作する。配列全体の`setValue`による追加・削除・並べ替え・置換をなくし、各行の`rowId`、最小行数、派生行数、確認dialog、focus復帰、section固有の業務規則を保つ。
- 可変行のfield / value callbackは、genericなパス文字列ではなく各行型の編集可能fieldと値の対応を型で表す。shared表示ComponentへRHF、field path、マスタ検索、validation計算を渡さない。
- `docs/requirements/character-sheet.md`、`docs/architectures/character-sheet.md`、このissueの関連TODO記述を、決定した契約へ整合する。TODOは実装・ユーザー承認後にのみ完了扱いへ移す。
- Node logic / schema、RHF hook、Component、必要最小限のPlaywright smokeを、各責務境界へ追加または更新する。UIを変更した場合だけ、PRレビュー直前に`@character-sheet`の必要な状態をdesktop（1440px）、tablet（820px）、mobile（390px）でVisual Reviewする。canonical VRT baselineは更新しない。

## 初期スコープ外

- 武器、防具、専用アイテム、消費信用、G17以降のアイテムGateを実装しない。
- エラー一覧、sticky control、確認用エラーdialog、入力への移動などG25のエラー集約を実装しない。
- localStorage / IndexedDBの保存・復元、JSON export / import、スキーマバージョンや未知IDの復元除外を実装しない。G24 / G27は、このGateで確定した入力・schema・同期契約を適用する。
- 文章の取得制限・効果、スキルの使用コスト、共通スキルボーナスを解析または自動算出しない。
- 新しいnpm package、別のstate store、UI kit、汎用form abstractionを追加しない。
- `docs/out-of-scope.md`の初期スコープ外機能を実装しない。

## 完了条件

- [x] 全ての消費経験点が、流儀・生き様・その他流儀・共通スキルの入力値から一度だけ導出され、無料の初期 / 自動取得Lvを二重計上しない。
- [x] 生き様bonusを含む全スキルの最大Lv超過が該当入力・行だけ、重複、区分ごとの合計上限、経験点不足が既存の局所error状態として、値を自動補正せず一貫して示される。
- [x] browser入力、blur、schema、後続の復元・JSON入力における未確定値・最大Lv超過・uncontrolled input同期の契約がrequirementsとschema / form adapterへ明記され、G24 / G27と矛盾しない。
- [x] 現在存在する可変行を`useFieldArray`で追加・削除・移動・置換し、配列全体の`setValue`更新を残さない。row ID、最小・派生行数、確認dialog、focus復帰を維持する。
- [x] 変更したlogic、schema、hook、Componentのテストが、経験点境界、最大Lv前後、未選択、bonus、重複、可変行の追加・削除・並べ替え・外部更新を確認する。
- [x] 関連TODO 3件をこのissueで扱った根拠と、G24 / G27へ残す実装境界が記録されている。
- [x] UI変更がある場合、必要な`/character-sheet/`状態をactual screenshotで確認し、canonical VRT baselineを更新しない理由を記録する。
- [x] `npm run check`、`npm run build`、関連Node / Vitest / Playwright testが通る。

## ビジュアルレビュー 2

### 対象と実画面確認

- 対象route: `/neon-underrealm-trpg/character-sheet/`
- state: 共通、その他流儀、生き様、生き様bonus、プライマリの最大Lv超過。いずれも区分合計超過を同時に発生させない入力値にした。
- viewport: desktop（1440px）、tablet（820px）、mobile（390px）
- capture: `npm run visual:capture -- --grep '@(?:common-skill-maximum-level-error|other-ryugi-skill-maximum-level-error|ikizama-skill-maximum-level-error|primary-skill-maximum-level-error)(?:\\s|$)'`（12 passed）
- actual: locator screenshot 21枚を実際に開いた。共通はprofile / build / skill section各3枚、その他流儀はbuild / skill section各3枚、生き様とプライマリはskill section各3枚である。

### 結果

- 全4区分でsection外枠はerror状態にせず、最大Lv超過の入力・行だけが赤枠になることをdesktop / tablet / mobileで確認した。生き様はbonusと通常行の両方を確認対象に含めた。
- `advanced`・重複・区分合計は行 / sectionへ渡す別のerror識別子に分離したため、この最大Lv超過stateと混同しない。各画面でclip / overflow、可視error文言の追加、既存配置の変更は確認されなかった。
- `npm run visual:test`はこの4 stateが`locatorOnly`であるため12件skipとなった。canonical baselineは更新せず、比較成功としては扱わない。Visual Review 1はsectionの非error状態を検証していなかったため、この確認結果で置き換える。

## ビジュアルレビュー 3

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@common-skill-maximum-level-error`、`@other-ryugi-skill-maximum-level-error`、`@ikizama-skill-maximum-level-error`、`@primary-skill-maximum-level-error`、`@primary-skill-advanced-error`
- route / states / viewports: `/neon-underrealm-trpg/character-sheet/`の最大Lv超過4状態と、プライマリ流儀Lvを6から1へ下げた保持済みadvanced状態。desktop（1440px）、tablet（820px）、mobile（390px）。

### レビュー結果

| 対象                   | 判定 | 差分                                   | 対応                                              |
| ---------------------- | ---- | -------------------------------------- | ------------------------------------------------- |
| 最大Lv超過4状態        | OK   | section error非伝播を実sectionへassert | 4区分とも該当行・inputだけがerrorであることを確認 |
| プライマリadvanced保持 | OK   | 新規locator-only state                 | sectionと該当行のerrorを確認                      |

### 実画面確認

- `npm run visual:capture -- --grep '@(?:common-skill-maximum-level-error|other-ryugi-skill-maximum-level-error|ikizama-skill-maximum-level-error|primary-skill-maximum-level-error|primary-skill-advanced-error)(?:\\s|$)'`は15 passed。owner locator screenshot 24枚を原寸で開いた。
- 共通スキル最大Lv超過はprofile / build / common skill sectionの各desktop / tablet / mobile計9枚、その他流儀はbuild / skill sectionの各3 viewport計6枚、生き様・プライマリ最大Lv・プライマリadvancedは各skill sectionの3 viewport計9枚を確認した。
- 最大Lv超過ではsectionの外枠をerrorにせず、該当行・inputだけがerrorであること、advancedではsectionと該当行がerrorであること、各viewportでcontrol境界、折返し、clip / overflowがないことを確認した。full-page screenshotは局所表示契約の根拠に使っていない。
- `npm run visual:test`は対象15 stateが`locatorOnly`のため15件skip。canonical baselineの比較成功として扱わず、baselineは更新していない。

### 自己修正した項目

- primary / ikizama VRT locatorをwrapperからinner `section[data-skill-section]`へ変更し、最大Lvのsection非伝播を回帰検出できるようにした。
- プライマリadvanced保持のsection error stateを追加した。

### 人間判断が必要な差分

- なし。canonical VRT baselineを更新する判断は発生していない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、既存スキル選択dialog、確認dialog、focus復帰が壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] RHF以外へ編集値を複製せず、Presenter / shared skill Componentの責務境界を保つ。
- [x] エラー理由の可視文言を各入力・各行へ追加せず、errorとwarningの色を混同しない。
- [x] 関連する`docs/TODO.md`、`docs/design/character-sheet/`、`docs/architectures/character-sheet.md`と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `src/character-sheet/logic/build.ts`
- `src/character-sheet/logic/primary-skills.ts`
- `src/character-sheet/logic/ikizama-skills.ts`
- `src/character-sheet/logic/common-skills.ts`
- `src/character-sheet/logic/other-ryugi-skills.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/form/useBuildSectionProps.ts`
- `src/character-sheet/form/useBondsSectionProps.ts`
- `src/character-sheet/form/useChecksSectionProps.ts`
- `src/character-sheet/form/usePrimarySkillsSectionProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/form/useCommonSkillsSectionProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
- `src/character-sheet/components/skills/SkillSection.tsx`
- `tests/node/character-sheet/*.test.ts`
- `tests/hooks/character-sheet/useCharacterSheetFormPresenterProps.test.tsx`
- `tests/components/character-sheet/*.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- スキルLvを流儀・生き様の成長と別の経験点として二重計上せず、`advancement.mdx`の費用規則に一致しているか。
- 最大Lv超過を保持して局所エラーにする契約が、「不整合を自動補正しない」要件とG24 / G27の外部更新契約を両立できるか。
- `useFieldArray`への統一が、可変行ごとのrow ID、最小・派生行数、削除確認、focus復帰を壊さず、汎用path更新へ戻っていないか。
- このissueでTODO 3件を回収し、保存・復元・JSON入力の実装を後続Gateへ残す境界が妥当か。
- 既存designと同じエラー配置・情報密度を保ち、canonical VRT baseline更新を必要とする見た目の変更を増やしていないか。

## レビュー指摘 1

### 指摘事項

- [x] `calculateCommonSkillsValidation`の生値と経験点算出用の有効Lvを分離した。選択済み共通スキルLv`0`・負数・最大Lv超過が消費経験点を減算または正のLvと相殺しないことをNode / hook testで確認した。`source: .tmp/review/ex-02-16-sheet-experience-consistency/gate-technical-review-1.md` / classification: valid
- [x] ユーザー判断により、最大Lv違反は該当入力・行だけをerror状態にし、section errorへ伝播させない。`docs/requirements/character-sheet.md`とこのissueを訂正し、実装変更・追加testは不要とする。`source: .tmp/review/ex-02-16-sheet-experience-consistency/gate-technical-review-1.md` / classification: invalid after requirement correction
- [x] `SkillSection`の技能Lv入力を、focus中の未確定number inputをDOMに保持できるuncontrolled同期境界へ直した。`reset`による外部更新で受理済み値・row IDを同期し、最大Lv超過値を保持することをhook / Component testで確認した。`source: .tmp/review/ex-02-16-sheet-experience-consistency/gate-technical-review-1.md` / classification: valid

### 判定

- 3件はいずれもcurrent issueの経験点導出、局所error、uncontrolled input、外部更新テストの契約に一致するため、current issueで修正する。
- G17以降、保存・復元・JSON UI、エラー集約の先行実装は含めない。

## ビジュアルレビュー 1

### 対象と確認方法

- 対象route: `/neon-underrealm-trpg/character-sheet/`
- design input: `docs/design/character-sheet/notes.md` と既存キャラクターシートUI
- state: 共通スキル、その他流儀スキル、生き様bonus / 通常スキル、プライマリ流儀スキルの各最大Lv超過（`9`）
- viewport: desktop（1440px）、tablet（820px）、mobile（390px）
- capture: `npm run visual:capture -- --grep '@(?:primary-skill-maximum-level-error|ikizama-skill-maximum-level-error|common-skill-maximum-level-error|other-ryugi-skill-maximum-level-error)(?:\\s|$)'`（12 passed）
- VRT: 同じtargetで`npm run visual:test`を実行。全12 stateは`locatorOnly`のため意図どおりskipされ、canonical baselineとの比較・更新は行わない。

### 実画面確認

- 共通スキル最大Lv超過: profile / build / common skill section のdesktop・tablet・mobile計9枚を`test-results/visual/character-sheet/locators/common-skill-maximum-level-error-default-*.png`で確認。経験点、共通スキル合計、該当入力・行のerror境界が表示され、clip / overflowはない。
- その他流儀スキル最大Lv超過: build / other ryugi skill section のdesktop・tablet・mobile計6枚を`test-results/visual/character-sheet/locators/other-ryugi-skill-maximum-level-error-default-*.png`で確認。既存のbuild行と該当スキル行のerror境界が表示され、clip / overflowはない。
- 生き様スキル最大Lv超過: bonusと通常行を含むdesktop・tablet・mobile計3枚を`test-results/visual/character-sheet/locators/ikizama-skill-maximum-level-error-default-*.png`で確認。両入力と該当行のerror境界が表示され、clip / overflowはない。
- プライマリ流儀スキル最大Lv超過: desktop・tablet・mobile計3枚を`test-results/visual/character-sheet/locators/primary-skill-maximum-level-error-default-*.png`で確認。該当入力・行のerror境界が表示され、clip / overflowはない。

### 結果

- 全21枚を実際に開いて確認した。可視エラー理由は追加せず、既存の局所error表現を維持した。
- レベル入力は1桁前提とするユーザー指示に従い、超過確認値を`999`から`9`へ変更した。CSSやレイアウトは変更していない。
- canonical VRT baselineの更新は不要かつ未実施である。

### 再確認

- Gate Technical Review対応後に同じ4 state・21枚を再captureして実際に開いた。uncontrolled同期への変更後も、desktop / tablet / mobileで1桁の最大Lv超過値、入力・行のerror境界、経験点表示にclip / overflowはない。
- 同じtargetの`npm run visual:test`はlocator-onlyのため12件を意図どおりskipし、canonical VRT baselineは更新していない。

## 備考

- G16のGate plan上の範囲「消費経験点の算出整合性」を、ユーザー指示により、その算出値を正しく保つ全スキル局所エラーと可変行のRHF操作境界まで拡張する。G24 / G27の保存・JSON機能そのものは取り込まない。
- `docs/TODO.md`の関連3件は、実装完了・人間承認・merge前まで未対応のまま残す。完了後の移動は`post-merge-plan-update`で行う。
- 実装中に旧来のLv clamp期待が残るComponent testをfull testとcomponent testで連続して失敗させたため、`docs/agent-failure-log.md`へ記録した。期待値を「超過値を保持し局所errorにする」契約へ更新後、全testを再実行する。

## レビュー指摘 2

### 指摘事項

- 最大Lv違反を`hasLevelError`として行へ渡す一方、shared `SkillSection`が`hasRowError || hasLevelError`をsection errorへ集約している。そのため、要件が禁止する最大Lv違反のsection伝播が発生する。
- `advanced`をレベル低下後も保持する要件に対し、プライマリ・生き様・その他流儀に保持済み`advanced`を識別するvalidationがない。
- 重複skill row IDを返すvalidationはプライマリだけにあり、生き様・共通・その他流儀には外部更新時の重複検出がない。
- 生き様skill行は`useFieldArray`を使用しているが、更新にgeneric pathの`setValue`を残す。build scalar更新は`build`親objectを丸ごと`setValue`し、縁callbackのfield / value型は対応関係を表せていない。リアクション行にはstableな`rowId`がなく、name検索で更新している。
- 関連TODO 3件はactiveのままである。未達を確認したためactive維持は正しいが、G16の完了・回収済み記録とは矛盾している。

### 判定

- source: browser-draft
- classification: valid
- local validation: `SkillSection.tsx`、各skill logic / adapter、`useBuildSectionProps.ts`、`useIkizamaSkillsSectionProps.ts`、`useBondsSectionProps.ts`、`useChecksSectionProps.ts`、`docs/requirements/character-sheet.md`を照合した。指摘した最大Lv伝播、advanced、非プライマリ重複、可変行更新境界・リアクションidentityはいずれもG16の対象範囲・完了条件に未達として残る。経験点算出とuncontrolled input同期は現行実装・既存test根拠により維持できる。
- TODOのactive状態そのものは、未達を踏まえると正しい。G16をdoneとし完了チェックを付けた記録だけを訂正し、`docs/TODO.md`は変更しない。

### 対応方針

- 最大Lv違反を行 / inputだけへ限定し、`advanced`・重複・区分合計だけをsection errorへ伝播するViewModelを定義する。
- プライマリ、生き様、共通、その他流儀ごとのadvanced・重複validationをpure logicへ追加し、その他流儀の重複は`ryugiRowId`単位に限定する。
- skill / build / bonds / checksの編集callbackを各行の型対応と`useFieldArray`更新へ整合し、リアクションのstable row identityを確立する。
- Node、hook、Component testで各未達条件を固定し、UI変更後に対象状態・3 viewportのactual screenshotを再確認する。

### 対応完了チェックリスト

- [x] 最大Lv違反をsectionへ伝播させない。
- [x] 保持済み`advanced`と全skill区分の重複を局所errorとして検出する。
- [x] 可変行の更新境界、field / value型、リアクションrow identityをG16契約へ整合する。
- [x] 追加・更新したNode、hook、Component testで未達条件を確認する。
- [x] UI変更後の対象状態をdesktop（1440px）・tablet（820px）・mobile（390px）のactual screenshotで確認する。
- [x] `npm run check`、`npm run build`、関連Node / Vitest / Playwright testが通る。

## レビュー指摘 3

### 指摘事項

- プライマリ、生き様、その他流儀の選択済み通常スキルLv合計が負数をそのまま加算するため、Lv`1`未満の局所error行が正の取得Lvを相殺し、区分合計超過を隠せる。共通スキルは非負値だけを合計する既存契約と不整合である。
- `checks.reactions`の`rowId`は空文字・重複をschemaで受理する一方、hookはrow IDの最初の一致を更新先にする。reset / 後続の復元・JSON入力で重複IDを受理すると、別リアクション行を更新し、React keyも一意でなくなる。
- uncontrolledな技能Lv inputの外部同期effectは`row.level`だけを依存値にする。同じ受理済みLvへの`reset`ではfocus中の未確定DOM値が残り、blurで復元値を上書きできる。
- プライマリ・生き様の最大Lv VRTはerror属性を持たないwrapperをassertしているため、最大Lv違反のsection伝播を回帰検出できない。代表的な`advanced`または重複の行 / section error状態もVisual Reviewの対象にない。
- failure logのG16再open記録は未達を戻した時点で止まり、`9b905c3`で回収した範囲と、今回のreviewで新たに残った未達を区別していない。親Gate planの`active`は状態値の定義外で、現在が修正待ちかレビュー待ちかを表せない。

### 判定

- source: local-agent
- review: `.tmp/review/ex-02-web-character-sheet/document-review-2.md`、`.tmp/review/ex-02-web-character-sheet/technical-review-4.md`
- classification: valid
- local validation: `primary-skills.ts`、`ikizama-skills.ts`、`other-ryugi-skills.ts`で選択済みrowのLvを直接合計していること、reaction schemaが`z.string()`と4行長だけを検証しhookが`findIndex(rowId)`で更新すること、`SkillSection`の同期effectが`[row.level]`だけへ依存すること、primary / ikizama VRT locatorがinner `section[data-skill-section]`ではないことを確認した。architectureのuncontrolled input同期・row ID契約、G16の局所error・外部更新・`useFieldArray`完了条件にも一致する。文書2件はfailure logとparent planの現行記録を照合した。

### 対応方針

- 負数Lvを局所errorとして保持したまま、プライマリ・生き様・その他流儀の区分合計には非負の取得Lvだけを使う。各pure logicの境界testを追加する。
- reaction row IDをschema境界で非空・配列内一意にし、重複復元値を拒否する。same-value resetでもuncontrolled inputを同期する境界を設け、Component / hook testで固定する。
- VRT locatorを実際にerror属性を持つsectionへ向け、最大Lvと代表的なsection error stateをdesktop / tablet / mobileでcaptureして確認する。canonical baselineは更新しない。
- failure logへ回収済み範囲と新しい未達を追記し、parent planでは`active`をGate修正・再review待ちの正式状態として定義する。G24 / G27の保存・復元・JSON UIは実装しない。

### 対応完了チェックリスト

- [x] 負数Lvがプライマリ・生き様・その他流儀の区分合計を相殺しない。
- [x] reaction row IDの非空・一意性と、重複復元値の拒否をschema / hook testで確認する。
- [x] same-value reset後もuncontrolled技能Lv inputが受理済み値へ同期する。
- [x] 最大Lv VRTが実sectionを検査し、代表的なsection error stateをactual screenshotで確認する。
- [x] failure logとparent Gate planがG16のactive状態・回収済み範囲・未達を正しく表す。
- [x] `npm run check`、`npm run build`、関連Node / Vitest / Playwright testが通る。

## レビュー指摘 4

### 指摘事項

- `.tmp/chatgpt-review.md`の負数Lvによる区分合計相殺は、レビュー指摘3の1件目と同じである。プライマリ、生き様、その他流儀の通常skill Lvを非負値で合計する対応へ統合する。
- 同レビューのreaction `rowId`の空・重複受理は、レビュー指摘3の2件目と同じである。加えて、G16対象の`bonds.rows`、`build.otherRyugi`、`checks.attacks`、プライマリ・生き様・共通・その他流儀skill rowも、schemaが空・重複`rowId`を受理し、row IDで最初の一致を操作するhookと整合しない。
- reaction schemaは4行長だけを検証しており、4件すべて`defense`のように固定4種が欠ける値を受理する。stableなreaction row identityの契約として、非空・一意なrow IDと`defense`、`evasion`、`endurance`、`resistance`が各1件であることをschema境界で保証する必要がある。

### 判定

- source: browser-draft
- review: `.tmp/chatgpt-review.md`
- source snapshot: base `3a0d3ec81690c57408d9320ccc2249b7cce534c2`、reviewed remote head `9b905c364f0c5c27d9ff5b270e4e69dfeb972e09`
- classification: valid
- local validation: 現在のHEADはreviewed headと一致し、作業treeの未commit差分はレビュー指摘3のtracking更新だけであることを確認した。3区分のLv直接合計とreaction `rowId`の`z.string()`だけの検証はレビュー指摘3と同じ現行実装で確認した。さらに、全field arrayのrow schemaが`z.string()`だけであり、reaction schema testが4件とも`defense`を受理する期待を置いていることを確認した。G16の対象範囲に全可変配列のrow IDと外部更新契約が含まれるため、追加範囲もcurrent issueに属する。
- unchecked / not verified: browser draftはローカルtest実行、actual screenshot、実ブラウザ操作を再確認していない。この取り込みではreview draftを根拠にせず、該当コードとSSoTだけをローカル照合した。

### 対応方針

- レビュー指摘3の負数Lv対応とreaction identity対応へ統合する。全field arrayのrow IDを非空・配列内一意としてschemaで検証し、reactionは4種類のnameを各1件に固定する。G16で復元・JSON UIやadapterを先行実装しない。
- schema / hook testで重複・空IDとreaction name欠落を拒否し、正常なreaction 4種の順序変更を受理するか、順序を固定するかを実装契約として明示する。

### 対応完了チェックリスト

- [x] 全field arrayのrow IDが非空かつ配列内一意であることをschema境界で保証する。
- [x] reactionの4種類のnameが各1件であることと、row IDとの対応をschema / hook testで確認する。
- [x] レビュー指摘3と統合したNode / hook / schema test、`npm run check`、`npm run build`が通る。
