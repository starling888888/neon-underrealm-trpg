# ex-02-11-sheet-noncombat

## 最優先のデザイン入力

- `/character-sheet/` の既存 `判定` section とその desktop / tablet / mobile の配置を維持し、`非戦闘技能`をリアクションの下に追加する。`CharacterSheetFormPresenter` の既存 `checks` slot と `ChecksSection` を拡張対象とする。
- `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`にある非戦闘技能の情報密度と、既存 `判定` section の枠・表現を参照する。ユーザーの次の指定を画像と `docs/design/character-sheet/notes.md` より優先する。
  - 見出しは `非戦闘技能` のみとする。
  - ヘッダー行は、左から `得意技能`、`技能`、`対応能力`、`修正`、`常時／一時` とする。
  - `常時能力値／一時能力値 + 修正 = 常時判定数／一時判定数` のような計算式型の行表示は設けない。
  - `得意技能` ヘッダーは既存 `FormulaTooltip` を使い、次の本文を表示する。

    ```txt
    得意技能にチェックを入れると能力値を2倍にして判定数を算出します。修正値は2倍になりません。
    ```

  - `修正` ヘッダーは既存 `FormulaTooltip` を使い、攻撃・リアクションの判定数 tooltip における計算式より後の本文と同じ、次の文言を表示する。

    ```txt
    修正はサイバネなど能力値ではなく判定数に影響を与えるスキル、アイテムの効果の数値を入力します。
    ```

  - 得意技能をチェックした行全体はアクセントカラーの背景で示す。
  - 非戦闘技能は初期状態で折りたたむ。折りたたみ時は、既存要件どおり得意技能チェック済みの行だけを残して表示する。
  - 非戦闘技能の各技能項目は、desktop / tabletでは3列、mobileでは2列のgridで表示する。各項目内では`得意技能`、`技能`、`対応能力`、`修正`、`常時／一時`の順を保ち、shared headerの見出し順とも一致させる。5列の表をviewportを問わず1列だけに並べない。
  - 非戦闘技能は`判定` frame内の入れ子のコンパクトな開閉領域であり、通常のtop-level section frameを再利用しない。design画像にある小さなchevronと見出し線を基準にし、既存の`判定`見出しと同じ枠・余白・button表現を重複させない。
- 上記以外の配置・導線・状態表現は、実装都合で補完しない。画像、要件、ユーザー指定が競合または不足する場合は、source codeを変更せず停止して判断を求める。

## 目的

`/character-sheet/`の`判定` sectionに、15種類の非戦闘技能を固定対応能力値、得意技能、手動修正、常時／一時の判定数で扱える、初期折りたたみの入力領域を追加する。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の `G11`
- 要件: `docs/requirements/character-sheet.md` の「副能力値、縁、判定」「攻撃、リアクション、非戦闘判定の行」
- アーキテクチャ: `docs/architectures/character-sheet.md` の Container / Presenter / form / logic / Component test の責務分離、固定表示文言の `dictionary.ts` 所有、読み取り専用ゲームデータの `master-data/` 境界
- ゲーム仕様: `src/pages/character-making.mdx` の「非戦闘技能」表。15技能と対応能力値はこの表を正本として固定する。
- design target: `docs/design/character-sheet/notes.md` の「編集画面の情報architecture」「副能力値、縁、判定」「mobileの情報密度」、および `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`。ただし表示契約は「最優先のデザイン入力」の最新ユーザー指定を優先する。
- 関連TODO: `docs/TODO.md` に G11 で直接扱う項目はない。G24より前の `useFieldArray` 契約整理はこのGateへ先取りしない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G11: 非戦闘技能を扱う。`

このissueは G11 だけを実装するための自己完結した契約である。G12以降のスキル、G17以降のアイテム、G19のサイバネ、G24以降の保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- 非戦闘技能を、以下の固定順・固定対応能力値の15行として、読み取り専用の小さな `master-data/` の定義から表示する。ユーザーは技能名と対応能力値を変更できない。
  - `脅迫`、`力比べ`、`根性`: 筋力
  - `偵察`、`軽業`、`手業`: 敏捷
  - `イカサマ`、`危険察知`、`分析`: 感覚
  - `運転`、`生存`、`仁義`: 肉体
  - `賭博`、`交渉`、`ハッキング`: 精神
- form値とschemaへ、15行それぞれの得意技能 boolean と、負数を許可する整数の手動修正を追加する。技能ID、名称、対応能力値、常時・一時の能力値および判定数は保存値に複製せず、固定マスタと pure logic から導出する。空欄の修正は `0` に正規化する。
- 常時判定数は `対応能力の常時能力値 + 修正`、一時判定数は `対応能力の一時能力値 + 修正` とする。得意技能では常時・一時とも対応能力値だけを2倍にし、修正を2倍にしない。能力値が未確定で判定数を算出できない場合は、既存の表示規約どおり unavailable value を示す。
- `ChecksSection` 内に、リアクションの後、見出し `非戦闘技能` と独立した開閉操作を置く。初期状態は折りたたみとし、展開時は15行すべて、折りたたみ時は得意技能チェック済みの行だけを表示する。判定 section 全体の既存開閉とは別に操作でき、childrenを unmount しない既存 section-frame の方針と矛盾させない。
- ヘッダーは `得意技能`、`技能`、`対応能力`、`修正`、`常時／一時` の順だけを表示する。`得意技能` と `修正` は指定本文の tooltip triggerとし、tooltipの操作targetを checkbox 操作targetから分離する。既存の攻撃・リアクションの `判定数` tooltip 文言は変更しない。
- 各行は得意技能 checkbox、読み取り専用の技能名・対応能力値、手動修正 input、常時／一時の判定数を順に表示する。計算記号、能力値の常時／一時表示、計算式型の入力・output群は置かない。得意技能 checkbox が選択された行全体は既存のアクセント系 design tokenによる背景色で区別する。
- 非戦闘技能の技能項目はdesktop / tabletで3列、mobileで2列とする。各grid itemは同じ5項目をコンパクトに表示し、shared headerと項目内の視覚順・DOM順を一致させる。tabletをdesktopと異なる1列表示へ縮退させず、mobileで5列tableの幅を無理に圧縮しない。
- `ChecksSection` とそのCSS Module、form adapter、pure logic、固定文言 dictionary、必要な schema / master-data / test を、既存の責務境界に沿って追加・更新する。表示Componentは Presenter から表示値と callback だけを受け、RHF、マスタ検索、永続化、browser APIを直接扱わない。
- Node / hook / Component / browser behavior testを責務に応じて追加・更新する。`tests/visual/character-sheet.spec.ts`は、領域表示と2〜3個の代表的な操作だけを確認する最終smokeに保ち、開閉の`aria-*`属性、hidden状態、tooltip、固定15件、計算値はComponent / Node testへ置く。Visual Reviewは変更 target の `@vrt @character-sheet` に限定し、canonical VRT baselineは更新しない。G11では`tests/visual/helpers/vrt.ts`とcapture configを拡張し、scenarioが宣言したowner locatorのoriginal-pixel-resolution screenshotを`visual:capture`時だけに出力する。通常の`visual:test`は既存のfull-page canonical VRT比較だけを続ける。

## 初期スコープ外

- G10の攻撃・リアクションの表示、対応能力の選択、判定数 tooltip、追加・削除の契約を変更しない。
- サイバネの埋め込み点数に応じた非戦闘技能修正の再設定、アイテム・スキル・共通スキルボーナスの文字列解析または自動加算を実装しない。ユーザーが必要な効果値を各行の修正へ手入力する。
- 非戦闘技能の追加・削除、技能名・対応能力値の編集、任意技能の登録、ダイスローラー、戦闘シミュレーションを実装しない。
- G12以降のスキル、G17以降の武器・防具・専用アイテム、localStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、Header、Footer、サイトメニューを追加・変更しない。
- canonical VRT baselineを作成・更新しない。`docs/plan.md` のチェックボックスを変更しない。

## 完了条件

- [ ] 非戦闘技能が指定の15行・固定順・固定対応能力値で存在し、技能名と対応能力値は編集できない。
- [ ] 見出しが `非戦闘技能` のみであり、ヘッダーが `得意技能`、`技能`、`対応能力`、`修正`、`常時／一時` の順で表示される。
- [ ] `得意技能` と `修正` のヘッダー tooltip が指定の本文を表示し、checkbox と tooltip trigger が別々に操作できる。
- [ ] 各行で得意技能と修正を変更でき、常時／一時の判定数が、得意技能時には能力値のみを2倍にして更新される。計算式型の行表示を含まない。
- [ ] 得意技能チェック済み行がアクセントカラー背景になり、未選択行と区別できる。
- [ ] 非戦闘技能が初期状態で折りたたまれ、展開時は15行、折りたたみ時は得意技能チェック済みの行だけを表示する。判定 section 全体の既存開閉とは独立して操作できる。
- [ ] 非戦闘技能がdesktop / tabletで3列、mobileで2列のgridとして、design画像の情報密度・折り返し・横overflowの契約を満たす。
- [x] 判定数の pure logic、form / schema入力境界、Componentのtooltip・開閉・アクセント表示、代表的browser操作を適切なテスト層で確認している。
- [ ] `/character-sheet/` の default、得意技能選択、修正変更、非戦闘技能展開、各ヘッダー tooltip open を desktop / tablet / mobile でVisual Review対象として列挙し、変更targetだけを比較してcanonical VRT baselineを更新していない。
- [ ] `visual:capture`がscenarioで指定したowner locatorのoriginal-pixel-resolution screenshotを一時artifactとして出力し、`visual:test`のcanonical VRT比較とbaselineを変更しない。
- [x] 関連TODOを扱わない理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない。
- [ ] `docs/design/character-sheet/notes.md` と画像designを、最新ユーザー指定で上書きされる範囲以外では維持している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/ChecksSection.tsx`
- `src/character-sheet/components/ChecksSection.module.css`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useChecksSectionProps.ts`
- `src/character-sheet/logic/checks.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/master-data/` 配下の非戦闘技能固定定義
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`、`tests/visual/helpers/vrt.ts`、`playwright.capture.config.ts`、`tests/visual/README.md` の必要な対象

## レビュー観点

- 非戦闘技能の見出し、ヘッダー順、計算式型にしない行表示が、最新ユーザー指定どおりか。
- desktop / tabletの3列、mobileの2列が、各技能項目の5項目順を崩さず、design画像どおりの情報密度で表示されるか。
- 15技能の名称・順序・固定対応能力値が `src/pages/character-making.mdx` の正本と一致し、利用者が対応能力値を変更できないか。
- 得意技能が能力値だけを2倍にして修正値を2倍にせず、選択行全体のアクセント背景と指定tooltipでその挙動を理解できるか。
- 初期折りたたみ、選択済み行だけを残す折りたたみ表示、展開時の全15行、および既存判定 section 開閉との独立性が明確か。
- 非戦闘技能の開閉が、top-level section frameとは別の入れ子のコンパクトな表示として、design画像のchevron・見出し線・余白に沿っているか。
- desktop / tablet / mobileで、2つの tooltip open stateを含めて横overflowを起こさず、canonical VRT baseline更新を混入させないか。

## 備考

- branchは、ユーザー指示により新規作成せず、既存の `ex-02-web-character-sheet` を使用する。
- VRT targetは `tests/visual/vrt/character-sheet.spec.ts` の `@vrt @character-sheet`、routeは `/character-sheet/` とする。対象stateは default、得意技能選択、修正変更、非戦闘技能展開、得意技能tooltip open、修正tooltip open、viewportは desktop、tablet、mobile とする。G11では変更targetだけを比較し、baseline更新はユーザーの明示承認がある場合だけ行う。
- `docs/requirements/character-sheet.md` がサイバネの埋め込み点数による修正再設定にも触れるが、その入力と埋め込み点数の合計はG19以降の範囲である。本Gateでは初期値 `0` の手動修正を提供するだけとし、後続Gateが既存の各行修正を再設定できるform境界を維持する。

## レビュー指摘 1

### 1. design画像のresponsive gridを遵守していない

- 指摘: 現在の実装は5列のtable型gridをdesktop / tablet / mobileで共通に用いている。`.tmp/design/character-sheet/desktop.png`と`tablet.png`の3列、および`mobile.png`の2列の非戦闘技能表示を再現していない。
- 対応: このissueの最優先デザイン入力、対象範囲、完了条件、レビュー観点へdesktop / tablet 3列、mobile 2列の表示契約を追加した。修正時は現在の5列共通gridを残さない。

### 2. character-sheet最終smoke E2Eが責務境界を越えている

- 指摘: `tests/visual/character-sheet.spec.ts`のG11 testは、開閉の`aria-expanded`属性とhidden状態まで検証している。`docs/architectures/character-sheet.md`が定める「領域表示と2〜3個の代表操作だけ」の最終smokeから外れ、局所開閉stateとDOM属性をE2Eへ重複させている。
- 対応: E2Eは非戦闘技能を開いて代表的な得意技能または修正を一つ変更する程度へ縮小する。初期折りたたみ、開閉後の全件・選択済み行だけの表示、`aria-*`属性、tooltipはComponent test、計算はNode testで確認する。

### 3. Character Sheet Visual Review用の要素指定captureがない

- 指摘: 現行のVRT helperはpage全体のsnapshotだけであり、`判定` sectionや`非戦闘技能`をoriginal resolutionのtest-owned locator screenshotとして確認できない。このままでは各viewport・tooltip open stateのVisual Reviewを完了できない。
- 対応: ユーザー指示により専用Gateへ分割せず、G11で共有capture基盤を拡張する。scenarioが一つ以上のowner locatorを宣言できるようにし、`visual:capture`時だけ`test-results/visual/`へlocator screenshotを出力する。固定配置のtooltip open stateは、非戦闘技能sectionとtooltip本体を別のlocatorとして取得する。`visual:test`は既存のfull-page canonical VRT比較を変更せず、one-off scriptやproduction test-only attributeは追加しない。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@vrt @character-sheet`、`@noncombat-expanded`、`@noncombat-favorite-selected`、`@noncombat-modifier-changed`、`@noncombat-favorite-tooltip-open`、`@noncombat-modifier-tooltip-open`
- route / states / viewports: `/character-sheet/`の非戦闘技能展開、得意技能選択、修正変更、得意技能tooltip open、修正tooltip open。それぞれdesktop、tablet、mobile。

### レビュー結果

| 対象                 | 判定       | 差分                                                    | 対応                                                                         |
| -------------------- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 非戦闘技能responsive | 要人間判断 | userが起動したdev serverでのtemporary captureだけを確認 | preview serverで同じlocator captureを再取得してから正式なVisual Reviewを行う |
| tooltip open         | 要人間判断 | tooltip本体のlocator screenshotは取得できた             | preview serverでtriggerとの相対位置を含むactualを再確認する                  |
| canonical VRT        | 要人間判断 | 非戦闘技能stateのcanonical snapshotは存在しない         | baseline更新は行わず、必要な差分判断をユーザーへ提示する                     |

### 実画面確認

- `/character-sheet/` / 非戦闘技能展開、得意技能選択、修正変更 / desktop・tablet・mobile:
  - full-page overview (page-level確認のみ): temporary captureを取得したが、dev server由来のため正式な確認根拠に使わない。
  - locator screenshot（`section[aria-labelledby="noncombat-checks-heading"]` / original pixel resolution）: 9枚を開いた。desktop・tabletは3列、mobileは2列で、得意技能選択のアクセント背景と修正変更を含む。
  - checked acceptance criteria: grid列数、headerの存在、行の表示、入力・outputのclipping。
  - result: previewでの再確認前につき要人間判断。
- `/character-sheet/` / 得意技能tooltip open、修正tooltip open / desktop・tablet・mobile:
  - full-page overview (page-level確認のみ): temporary captureを取得したが、dev server由来のため正式な確認根拠に使わない。
  - locator screenshot（非戦闘技能sectionおよび`[role="tooltip"]` / original pixel resolution）: 各state・viewportのsection 6枚とtooltip本体6枚を開いた。tooltip本文は全文を表示した。
  - checked acceptance criteria: tooltip本文、tooltip本体のwrap・clipping、header triggerの存在。
  - result: previewでのtriggerとの相対位置の再確認前につき要人間判断。

### 自己修正した項目

- [x] `visual:capture`に複数locatorのtemporary screenshot出力を追加し、fixed tooltipをsectionとtooltip本体へ分けて取得した。
- [x] tooltip open stateをclickで準備し、touch viewportでもhover依存を持ち込まないようにした。

### 人間判断が必要な差分

- userが起動中のdev serverを停止し、4321のpreview serverへ切り替えてformal Visual Reviewを実行してよいか。
- noncombat state用canonical snapshotが存在しない。今回のactualをbaselineとして採用するかは、previewでの確認後にユーザーが判断する。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した（noncombat stateのcanonical baselineが未作成のため）。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した（dev server由来のtemporary artifactは正式なVisual Reviewの根拠にしない）。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [ ] VRT差分を修正した、または修正不要と判断した（canonical baselineが未作成のため）。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
