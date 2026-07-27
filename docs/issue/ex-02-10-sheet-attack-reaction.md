# ex-02-10-sheet-attack-reaction

## 最優先のデザイン入力

- `/character-sheet/`のdesktop二列layoutでは、`判定`sectionを右カラムの最上段に置く。これは既存design draftの表示領域に優先するユーザー指定であり、既存`CharacterSheetFormPresenter`の`secondary` region先頭の`checks` slotを用いる。
- tabletとmobileでは既存の一列layoutに従い、副能力値と縁の後、武器・防具の前に`判定`sectionを置く。mobileでは攻撃判定の下にリアクションを置く。
- 攻撃とリアクションには、それぞれ左から`技能`、`対応能力`、`判定数`の列ヘッダーを置く。各`判定数`の横には、`常時／一時`をmute colorで常時表示する。
- `判定数`の見出しは既存`FormulaTooltip`のtriggerとし、tooltipには次を表示する。

  ```txt
  判定数 = 対応能力 + 修正

  修正はサイバネなど能力値ではなく判定数に影響を与えるスキル、アイテムの効果の数値を入力します。
  ```

- 各判定行は、`常時能力値／一時能力値 + 修正入力欄 = 常時判定数／一時判定数`を示す。常時・一時能力値と常時・一時判定数はread-onlyの計算値backgroundで表示し、修正だけを整数として編集できる。
- ユーザーの最新指示は、`.tmp/design/character-sheet/`配下のdraft画像、`docs/design/character-sheet/notes.md`、既存source code、実装結果のscreenshot、reviewer出力より優先する。ここにない配置・導線・状態表現は実装都合で補完せず、不明点または競合があればsource codeを変更せず停止してユーザー判断を求める。

## 目的

`/character-sheet/`の`checks` slotに、能力値と手動修正から常時・一時の判定数を表示する、攻撃判定とリアクション判定を追加する。攻撃行の追加・削除と、対応能力の選択・既定対応を、desktop、tablet、mobileで理解・操作できるようにする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`の`G10`
- 要件: `docs/requirements/character-sheet.md`の「副能力値、縁、判定」「攻撃、リアクション、非戦闘判定の行」
- アーキテクチャ: `docs/architectures/character-sheet.md`のContainer / Presenter / form / logic / Component testの責務分離
- design target: `docs/design/character-sheet/notes.md`の「編集画面の情報architecture」「副能力値、縁、判定」「mobileの情報密度」。ただし判定sectionのdesktop配置と、列・式の表示契約は「最優先のデザイン入力」のユーザー指定を優先する。
- 関連TODO: `docs/TODO.md`にG10で直接扱う項目はない。共通スキルボーナスは表示参照に留め、判定数への自動加算はしない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G10: 攻撃とリアクションを扱う。`

このissueはG10だけを実装するための自己完結した契約である。G11以降の非戦闘技能、スキル、アイテム、保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- form値とschemaへ、攻撃の可変行とリアクション4固定行の、行ID、技能、対応能力、判定修正を追加する。判定修正は負数を許可する整数とし、空欄は`0`へ正規化する。常時・一時能力値と常時・一時判定数は保存値に複製せず、pure logicで算出する。
- 攻撃判定は初期1行、1〜5行とする。技能候補は`喧嘩`、`暗殺`、`発砲`、`格闘`、`干渉`とし、各行に削除buttonを置く。最後に残る1行の削除buttonは操作不可とし、行数を0にしない。5行目では追加buttonを操作不可とする。リアクション種別の重複はvalidation errorにしない。追加操作で攻撃行を増やせるようにする。
- 攻撃行とリアクション行の`対応能力`は、筋力、敏捷、感覚、肉体、精神の順で選べる5能力値から選択・変更できる。攻撃の技能候補も、喧嘩、暗殺、発砲、格闘、干渉の順で表示する。技能を選んだときの既定対応は、`喧嘩／筋力`、`暗殺／敏捷`、`発砲／感覚`、`格闘／肉体`、`干渉／精神`とする。攻撃の初期行は`喧嘩／筋力`とする。追加行も`喧嘩／筋力`で開始する。
- リアクションは`防御`、`回避`、`耐え`、`抵抗`の4行を常に表示し、追加・削除できない。各行の既定対応は順に`筋力`、`筋力`、`肉体`、`精神`とする。リアクション種別は編集不可、対応能力は5能力値から変更可能とする。
- `checks` slotへ専用Componentを置く。ComponentはPresenterから表示値とcallbackだけを受け、RHF、マスタ検索、永続化、browser APIを直接扱わない。判定sectionは既存section frameで初期表示・独立して開閉できる。
- 各行の常時判定数を`対応能力の常時能力値 + 判定修正`、一時判定数を`対応能力の一時能力値 + 判定修正`としてpure logicで算出する。共通スキルボーナス、スキル効果、アイテム効果、サイバネの能力値変化を解析・自動加算しない。ユーザーは判定数に影響する効果値を各行の判定修正へ明示入力する。
- 固定文言、技能名、能力値名、tooltip本文、表示用の式は`src/character-sheet/dictionary.ts`の適切な所有者へ置く。G10に必要なpure logic、form adapter、Component、CSS Moduleと、適切なNode / hook / Component / browser / Visual testだけを追加・更新する。

## 初期スコープ外

- G11の非戦闘技能15行、得意技能、サイバネ埋込点数による非戦闘技能修正の再設定を実装しない。
- 共通スキルボーナス、個別スキル効果、アイテム効果、サイバネ効果の文字列解析または判定数への自動加算を実装しない。
- リアクション種別の追加・削除、攻撃候補の拡張、任意の技能・能力値のマスタ化、戦闘シミュレーション、ダイスローラーを実装しない。
- localStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、Header、Footer、サイトメニュー、canonical VRT baselineを追加・再設計・更新しない。

## 完了条件

- [ ] `checks` slotに、desktopでは右カラム最上段、tablet / mobileでは縁の後かつ武器・防具の前に`判定`sectionを表示できる。
- [ ] 攻撃とリアクションがそれぞれ`技能`、`対応能力`、`判定数`をヘッダーに持ち、各`判定数`の横にmute colorの`常時／一時`を表示できる。
- [ ] `判定数`headerから、指定どおりの計算式と手動修正の説明を含むtooltipを確認できる。
- [ ] 攻撃とリアクションの各行が、`常時能力値／一時能力値 + 修正入力欄 = 常時判定数／一時判定数`を示し、修正の変更で両判定数を更新できる。
- [ ] 攻撃は初期1行・1〜5行で追加・削除でき、最後の1行は削除できず、5行目では追加できない。リアクション4行は常時表示され、追加・削除できない。リアクション種別の重複はvalidation errorにしない。
- [ ] 技能・リアクション種別ごとの指定既定対応を表示し、対応能力を5能力値から変更できる。
- [x] 判定数の算出、能力値変更・修正変更、攻撃の追加・削除・最低1行、リアクション固定4行、tooltip、desktop / tablet / mobileの表示を、pure logic、schema / hook、Component、browser behavior testの適切な層で確認している。
- [ ] `@character-sheet` targetのdefaultと、攻撃行追加・対応能力変更・判定数tooltipを開いたstateをVisual Reviewし、canonical VRT baselineを更新していない。
- [ ] 関連TODOを扱わない理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`と、ユーザー指定を優先する判定sectionの配置・列・式表示契約を混同していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/ChecksSection.tsx`と対応するCSS Module
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useChecksSectionProps.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/logic/`配下の判定用pure logic
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/`、`tests/hooks/character-sheet/`、`tests/node/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- 判定sectionがdesktop二列layoutの右カラム最上段にあり、tablet / mobileでの文書化済みの順序を保っているか。
- 攻撃とリアクションにそれぞれある`技能`、`対応能力`、`判定数`とmute colorの`常時／一時`が、各数値が常時・一時で対になることを過不足なく示せているか。
- `判定数`tooltipが、修正は能力値ではなく判定数へ影響するスキル・アイテムの効果値を手入力することを、指定文言で説明できているか。
- 攻撃行の追加・削除、最後の1行の削除不可、リアクション4固定行、対応能力の既定値と変更可能性が混同されていないか。
- 常時・一時の算出値と修正inputが、共通スキルボーナスや効果文の解析を先取りせず、手入力の修正だけを反映しているか。
- tooltip open stateを含め、desktop / tablet / mobileでページ全体の横overflowを生じさせず、canonical VRT baseline更新を混入させていないか。

## 備考

- VRT targetは`tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`、routeは`/character-sheet/`とする。stateはdefault、攻撃行追加、対応能力変更、判定数tooltip open、viewportはdesktop、tablet、mobileとする。G10では変更targetだけを比較し、baselineの更新はユーザーの明示承認がある場合だけ行う。
- 現行の`CharacterSheetFormPresenter`は、`checks` slotをdesktopのright secondary column先頭に既に置く。G10はそのslotへ実入力を接続するが、G11以降の非戦闘技能へ拡張しない。
- このissueは、最新ユーザー指示によりdesign draftと異なる判定section配置・列構成・式表示を実装契約へ固定する。`docs/design/character-sheet/notes.md`の更新は、このissue作成では行わない。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@vrt @character-sheet`、追加stateは`@attack-row-added`、`@attack-attribute-changed`、`@checks-tooltip-open`
- route / states / viewports: `/character-sheet/` / default、攻撃行追加、対応能力変更、判定数tooltip open / desktop、tablet、mobile

### レビュー結果

| 対象                   | 判定   | 差分                                                                       | 対応                                                                              |
| ---------------------- | ------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `character-sheet`のVRT | 未実施 | 現行captureはfull-page screenshotだけで、G10の局所表示契約を確認できない。 | locator screenshotを出力できるtest-owned capture pathの承認済み整備後に実施する。 |
| E2E preview server     | OK     | port `4321`を使用していたPID `1797859`をユーザー許可のもと停止した。       | `npm run test:e2e`を再実行し、46件すべて通過した。                                |

### 実画面確認

- 未実施。既存`visual:capture`はfull-page screenshotしか出力しないため、`判定`sectionのheader、式、tooltip、行操作の原寸locator screenshotを取得できない。full-page screenshotを局所表示契約の確認根拠に用いない。

### 自己修正した項目

- [x] fixed 4-row schemaをtupleから長さ4の配列schemaへ変更し、form型とresolver型を整合させた。

### 人間判断が必要な差分

- G10のVisual Reviewを完了するには、対象section / state / viewportごとの原寸locator screenshotを出力できるtest-owned capture pathが必要である。現行captureの拡張を、このGate内で承認するか独立taskに分けるかを判断する。
- port `4321`を使用中のPID `1797859`を停止してよいか確認が必要である。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した
- [ ] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [ ] VRT差分を修正した、または修正不要と判断した
- [ ] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
