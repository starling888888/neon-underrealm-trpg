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
- `ChecksSection` とそのCSS Module、form adapter、pure logic、固定文言 dictionary、必要な schema / master-data / test を、既存の責務境界に沿って追加・更新する。表示Componentは Presenter から表示値と callback だけを受け、RHF、マスタ検索、永続化、browser APIを直接扱わない。
- Node / hook / Component / browser behavior testを責務に応じて追加・更新する。Visual Reviewは変更 target の `@vrt @character-sheet` に限定し、canonical VRT baselineは更新しない。

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
- [ ] 判定数の pure logic、form / schema入力境界、Componentのtooltip・開閉・アクセント表示、代表的browser操作を適切なテスト層で確認している。
- [ ] `/character-sheet/` の default、得意技能選択、修正変更、非戦闘技能展開、各ヘッダー tooltip open を desktop / tablet / mobile でVisual Review対象として列挙し、変更targetだけを比較してcanonical VRT baselineを更新していない。
- [ ] 関連TODOを扱わない理由が記録されている。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

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
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts` の必要な対象

## レビュー観点

- 非戦闘技能の見出し、ヘッダー順、計算式型にしない行表示が、最新ユーザー指定どおりか。
- 15技能の名称・順序・固定対応能力値が `src/pages/character-making.mdx` の正本と一致し、利用者が対応能力値を変更できないか。
- 得意技能が能力値だけを2倍にして修正値を2倍にせず、選択行全体のアクセント背景と指定tooltipでその挙動を理解できるか。
- 初期折りたたみ、選択済み行だけを残す折りたたみ表示、展開時の全15行、および既存判定 section 開閉との独立性が明確か。
- desktop / tablet / mobileで、2つの tooltip open stateを含めて横overflowを起こさず、canonical VRT baseline更新を混入させないか。

## 備考

- branchは、ユーザー指示により新規作成せず、既存の `ex-02-web-character-sheet` を使用する。
- VRT targetは `tests/visual/vrt/character-sheet.spec.ts` の `@vrt @character-sheet`、routeは `/character-sheet/` とする。対象stateは default、得意技能選択、修正変更、非戦闘技能展開、得意技能tooltip open、修正tooltip open、viewportは desktop、tablet、mobile とする。G11では変更targetだけを比較し、baseline更新はユーザーの明示承認がある場合だけ行う。
- `docs/requirements/character-sheet.md` がサイバネの埋め込み点数による修正再設定にも触れるが、その入力と埋め込み点数の合計はG19以降の範囲である。本Gateでは初期値 `0` の手動修正を提供するだけとし、後続Gateが既存の各行修正を再設定できるform境界を維持する。
