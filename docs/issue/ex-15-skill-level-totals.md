# ex-15-skill-level-totals

## 目的

キャラクターシートのプライマリ流儀スキル、生き様スキル、その他流儀スキルの各区分に、経験点で取得したレベル合計と、その流儀または生き様の現在レベルによる取得可能レベル合計を表示する。

## 背景

各区分は取得レベル合計が対応する流儀または生き様のレベルを超えた場合に検証エラーとなるが、現在は共通スキルだけが追加操作領域で合計値と上限値を確認できる。流儀系スキルについても、経験点で取得したレベルの使用量と取得可能量を区分内で確認できるようにする。

- 要件正本: `docs/requirements/character-sheet.md`
  - 選択済み通常プライマリ流儀スキル、生き様スキル、その他流儀スキルの取得レベル合計が、それぞれ対応する流儀または生き様のレベルを超える場合にエラーとする。
  - プライマリ流儀ボーナスのLv1は合計に含めず、生き様ボーナスはLv2以上の超過分だけを生き様スキル合計に含める。空行は合計に含めない。
- 既存の共通スキル表示は `docs/design/character-sheet/notes.md` の G14 で定義されているが、今回の3区分について、表示位置、文言、狭幅layout、VRT比較点は未定義である。
- 関連TODO: `docs/TODO.md` の候補行の選択可能性に関する項目は、今回の合計表示とは別課題として扱い、変更しない。

## 対象範囲

- `docs/design/character-sheet/notes.md` に、3区分の合計表示について承認済みdesign intent、desktop / tablet / mobileの配置、表示文言、error表示、VRT比較点を追加する前段作業を実施する。
- 承認済みdesign intentに従い、プライマリ流儀、生き様、その他流儀の各スキル区分で、既存の共通スキルと同じ追加操作領域に「経験点による取得レベル合計／取得可能レベル合計」を表示する。
- 表示値は既存検証と同じ算出値を用いる。
  - プライマリ流儀: 選択済み通常スキルの取得レベル合計／プライマリ流儀レベル。プライマリ流儀ボーナスは含めない。
  - 生き様: 選択済み通常スキルの取得レベル合計と、生き様ボーナスのLv2以上の超過分の合計／生き様レベル。ボーナスのLv1は含めない。
  - その他流儀: 各その他流儀ごとに、選択済み通常スキルの取得レベル合計／対応するその他流儀レベル。空行は含めない。
- 合計が取得可能レベル合計を超える既存エラー状態では、該当区分の合計表示もerror状態にする。
- 未選択のプライマリ流儀、生き様、その他流儀には、既存の未選択メッセージだけを表示し、合計表示を追加しない。
- 表示と既存validationの値を一元化し、レベル入力、選択、解除、追加、削除、並べ替え、流儀または生き様のレベル変更に追従させる。その他流儀は、validation結果から`ryugiRowId`ごとの取得レベル合計を参照できるようにする。
- 対象限定VRTを実行して意図したsnapshot差分とactual screenshotをVisual Reviewで確認する。canonical VRT baselineの更新は、このissueでは行わず、別途ユーザーが明示承認した作業に限る。

## 初期スコープ外

- スキル取得・成長ルール、経験点の費用計算、スキル候補、行操作、保存形式、エラー判定のルール自体を変更しない。
- 共通スキルのsummary、基本情報の経験点表示、共通スキルボーナスの解放表示を変更しない。
- 新しい依存package、サーバー、DB、認証、同期、キャラクター作成ウィザードを追加しない。
- `docs/TODO.md` の候補行デザイン課題を回収しない。
- canonical VRT baselineを更新しない。更新が必要と判明した場合は、対象snapshotと根拠を報告してユーザーの明示指示を待つ。

## 完了条件

- [ ] `docs/design/character-sheet/notes.md` に、今回の3区分の合計表示を対象とする承認済みdesign intentとVRT参照情報がある。
- [ ] プライマリ流儀スキル区分が、選択済み通常スキルの合計／プライマリ流儀レベルを表示し、プライマリ流儀ボーナスを除外する。
- [ ] 生き様スキル区分が、選択済み通常スキルと生き様ボーナスのLv2以上の超過分の合計／生き様レベルを表示する。
- [ ] その他流儀スキル区分が、流儀ごとに選択済み通常スキルの合計／対応するその他流儀レベルを表示する。
- [ ] 空行を合計へ含めず、既存の区分合計超過時は該当する合計表示をerror状態にする。
- [ ] 未選択区分へ合計表示を追加しない。
- [ ] 変更した表示と既存validationが、レベル・選択・行操作・流儀または生き様レベルの変更後も同じ値を示す。
- [ ] 各viewportsの対象stateを実画面で確認し、承認済みdesign intentと比較したVisual Review記録を残す。
- [ ] 変更したキャラクターシートtargetの対象限定VRTで意図したsnapshot差分を確認し、canonical VRT baselineを更新しない理由または別作業へ回す判断を記録する。
- [ ] 関連TODOを変更せず、このissueで扱わない理由が記録されている。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md` の候補行デザイン課題と矛盾していない。
- [ ] 承認済みの `docs/design/character-sheet/` と矛盾していない。
- [ ] desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で横overflowがない。
- [ ] 区分合計超過状態を含め、issueの表示契約にあるstateごとのactual screenshotを開いて確認する。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/design/character-sheet/notes.md`（design-image-generationを実行し、ユーザーが承認した場合だけ）
- `src/character-sheet/components/sections/PrimarySkillsSection.tsx`
- `src/character-sheet/components/sections/IkizamaSkillsSection.tsx`
- `src/character-sheet/components/sections/OtherRyugiSkillsSection.tsx`
- `src/character-sheet/components/sections/SkillSection.tsx`
- `src/character-sheet/components/sections/SkillSection.module.css`
- `src/character-sheet/form/usePrimarySkillsSectionProps.ts`
- `src/character-sheet/form/useIkizamaSkillsSectionProps.ts`
- `src/character-sheet/form/useOtherRyugiSkillsSectionProps.ts`
- `src/character-sheet/logic/primary-skills.ts`
- `src/character-sheet/logic/ikizama-skills.ts`
- `src/character-sheet/logic/other-ryugi-skills.ts`
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/PrimarySkillsSection.test.tsx`
- `tests/components/character-sheet/IkizamaSkillsSection.test.tsx`
- `tests/components/character-sheet/OtherRyugiSkillsSection.test.tsx`
- `tests/hooks/character-sheet/`
- `tests/node/character-sheet/primary-skills.test.ts`
- `tests/node/character-sheet/ikizama-skills.test.ts`
- `tests/node/character-sheet/other-ryugi-skills.test.ts`
- `tests/vrt/character-sheet.spec.ts` または既存のcharacter-sheet VRT scenario定義（必要なstate追加時だけ）

## レビュー観点

- 「経験点による取得レベル合計」が、無料のプライマリ流儀ボーナスLv1と生き様ボーナスLv1を除外し、生き様ボーナスのLv2以上だけを含める定義で正しいか。
- 各区分が既存validationと同じ合計・上限を表示し、区分合計超過時のerror対象を広げていないか。
- 承認前のdesign intentを推測で補わず、表示位置・文言・responsive配置・VRT比較点を先に定義すべきか。
- 共通スキルのsummaryや基本情報の表示を今回の範囲外に保てているか。
- canonical VRT baselineの更新が必要な場合、対象snapshotと更新根拠を別作業へ切り出す方針でよいか。

## 備考

- 通常issueであり、Gate planは作成しない。
- 実装前に `design-image-generation` を実行して `docs/design/character-sheet/notes.md` のdesign intentとVRT参照情報を準備し、ユーザー承認を得る必要がある。
- design intentの承認後にのみ実装を開始する。Git commit / pushはこの準備では実行しない。
- Visual Reviewでbaseline更新が必要と分かった場合、このissueでは更新せず、対象限定VRTの差分と根拠を報告してユーザーの明示指示を待つ。
