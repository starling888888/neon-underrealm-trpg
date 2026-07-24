# ex-02-3-sheet-section-frame

## 目的

Webキャラクターシートの後続編集領域で共用する、見出し・内容領域・開閉操作を持つsection frameを作る。個別の入力機能を先行して実装せず、各Gateが一貫した操作と表示を利用できる土台にする。

## 背景

親taskのG3は、G2が提供したdesktop 2列・tablet/mobile 1列のlayout regionに、編集セクションを安全に追加する共通境界である。designでは縁、判定、武器・防具、スキル、専用アイテムを個別に開閉でき、初期状態ではすべて開き、複数を同時に開けることを定めている。開閉状態はブラウザ内保存とJSON入出力の対象に含めない。

関連する正本:

- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`

テストは既存のNode `node:test`と`tsx`、および`@playwright/test`を使う。G3はユーザー操作として確認できる開閉のみを追加するため、React Component / Hook単体test runnerなどのテスト用ライブラリは追加しない。これは`docs/architectures/character-sheet.md`のテスト用依存選定境界に従う。

section frameの枠、見出し、展開アイコン、開閉時の外観、visible focus、3 viewportでの余白とVRT比較状態は、現行design notesだけでは確定していない。実装前に`.agents/skills/design-image-generation/SKILL.md`を実行し、`docs/design/character-sheet/notes.md`へG3のdesign intentとVRT参照情報を追記して、ユーザー承認を受ける。このissueはその前提を満たすまで実装を開始しない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G3: 編集セクションの共通枠と開閉操作`

G2の完了条件である`CharacterSheetFormPresenter`の`primary` / `secondary` layout regionを前提とする。このissueはG3のみを扱い、後続Gateの個別フォーム、個別の表示データ、派生値、保存、dialogを前提にしない。

## 対象範囲

- `src/character-sheet/components/`に、後続の編集sectionが再利用できる共通section frameを追加する。
- section frameを、現行Presenterの`bonds`（`縁`）、`checks`（`判定`）、`weapons-and-armor`（`武器・防具`）、`skills`（`スキル`）、`special-items`（`専用アイテム`）の5 slotだけへ適用する。G3ではこれらの内容を実装せず、既存slotをchildrenとして保持する。
- `profile`、`build`、`secondary`にはG3でsection frameを適用せず、開閉操作を追加しない。これらの表示構成は後続の個別Gateで定める。
- section frameがsection見出し、見出しを含むaccessible nameを持つ展開button、展開アイコン、内容領域を提供し、button操作で開閉できるようにする。
- 展開buttonは現在状態を`aria-expanded`で伝え、内容領域との関係を`aria-controls`で示す。内容領域は対応する見出しを名前として参照できるようにする。
- 開閉操作はbuttonの標準キーボード操作（Enter / Space）で利用でき、visible focusを提供する。複数のsectionを独立して同時に開閉でき、5 sectionは初期表示で開いた状態にする。
- 折りたたみは内容を非表示にするだけとし、childrenをunmountしない。フォーム値、後続Gateが持つchildrenの局所表示状態、その他の編集stateを変更・初期化しない。
- G2が定めたDOM順と`primary` / `secondary` regionを維持する。
- 共通frame固有のCSS Moduleを追加し、desktop、tablet、mobileで内容が横にはみ出さず、既存layoutの列数境界を壊さない。
- `tests/visual/character-sheet.spec.ts`へ、初期展開、見出しを含むbutton名、Enter / Spaceによる開閉、`aria-expanded`、制御対象の非表示・再表示、keyboard操作後のbutton focus、2 sectionの独立操作を確認する最小browser behaviorを追加または更新する。空のslotでも確認できるよう、内容領域の非表示状態は製品仕様として`hidden`で表す。
- design-image-generationで確定するviewport・表示状態・比較対象に限定して、UI変更後のPRレビュー直前に`tests/visual/vrt/character-sheet.spec.ts`でVisual Reviewを行う。mobile VRT baselineが必要な場合は、同skillで作成しユーザー承認を受ける。VRT baselineの更新はユーザーの明示承認時だけとする。

## 初期スコープ外

- 基本情報、設定、ビルド、能力値、副能力値、縁、判定、スキル、武器・防具、専用アイテムの具体的な入力・計算・検証を実装しない。
- `profile`、`build`、`secondary`へG3で共通frameまたは開閉操作を追加しない。
- 設定欄、非戦闘技能、スキル区分、スキル効果行などの個別開閉は、該当する後続Gateで実装する。
- 開閉状態をRHF、localStorage、JSON export/import、URL、サーバーへ保存しない。
- dialog、画像、マスタデータ検索、派生値算出、保存・復元、JSON入出力を実装しない。
- React Component / Hook専用test runnerなど、新しいテスト用ライブラリを導入しない。
- G3本体の実装でdesign notesやVRT baselineを変更しない。必要なdesign notesとVRT参照情報の作成・承認は、実装前提として別途`design-image-generation`で扱う。
- `docs/out-of-scope.md`が除外する認証、クラウド保存、共有、PDF出力、ルールエンジンを実装しない。

## 完了条件

- [ ] 実装前に`design-image-generation`でG3のdesign intentとVRT参照情報を`docs/design/character-sheet/notes.md`へ記録し、ユーザー承認を受ける。
- [ ] 共通section frameが、`縁`、`判定`、`武器・防具`、`スキル`、`専用アイテム`の5 slotへ見出し、展開アイコン、内容領域を一貫して提供する。
- [ ] `profile`、`build`、`secondary`はG3で開閉可能にしない。
- [ ] 5 sectionは初期状態で開き、独立して複数のsectionを開閉できる。
- [ ] 開閉操作は見出しを含むaccessible name、`aria-expanded`、制御対象との関連、visible focusを持ち、Enter / Spaceで利用できる。
- [ ] 折りたたみ時もchildrenをunmountせず、後続Gateのフォーム値と局所表示状態を変更・初期化しない。
- [ ] G2の`primary` / `secondary` regionとsection slotのDOM順を維持する。
- [ ] 開閉状態がRHF、ブラウザ内保存、JSON export/importの対象にならない。
- [ ] Playwrightで初期展開、button名、Enter / Space、展開状態、制御対象の非表示・再表示、keyboard操作後のfocus、2 sectionの独立操作を確認する。
- [ ] design targetとVRT baselineの扱いを記録し、PRレビュー直前にdesign-image-generationで確定したtargetだけをVisual Reviewする。
- [ ] テスト用ライブラリを追加せず、既存のテスト基盤だけで必要な検証を行う。
- [ ] `npm run build` が通る。
- [ ] `npm run check` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] `primary` / `secondary`の列数境界（`80rem`）を壊していない。
- [ ] 不要な依存関係を追加していない。
- [ ] 内部stateやhydrateを観測するためだけの製品コード・testを追加していない。
- [ ] 開閉の確認は、ユーザーが観測・操作できるbutton、表示状態、visible focusだけを対象とし、内部stateを対象にしていない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する`docs/TODO.md`項目と矛盾していない。
- [ ] `docs/design/character-sheet/notes.md`の初期展開、複数同時展開、非永続化と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.module.css`
- `src/character-sheet/components/CharacterSheetSectionFrame.tsx`
- `src/character-sheet/components/CharacterSheetSectionFrame.module.css`
- `tests/visual/character-sheet.spec.ts`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/issue/ex-02-3-sheet-section-frame.md`

## レビュー観点

- 共通frameの範囲を、後続Gateの個別入力・個別開閉まで広げずに保てているか。
- `bonds`、`checks`、`weapons-and-armor`、`skills`、`special-items`だけをG3の共通frame適用対象とし、他の3 slotを後続Gateへ残す範囲が妥当か。
- 開閉を初期展開・複数同時展開・非永続化・children維持として扱う設計が、`docs/design/character-sheet/notes.md`と合うか。
- button、キーボード操作、展開状態、制御対象、visible focusの契約が、ユーザーが観測できるものとして十分か。
- 既存のNode / Playwright testで十分であり、新しいテスト用ライブラリを導入しない判断が妥当か。
- `character-sheet` VRT baselineは実装後のPRレビュー直前に限定して確認し、更新を別途明示承認とする境界が妥当か。

## 備考

関連TODOのうち、永続スキル参照のID変更検出は、永続保存の将来taskに関する初期範囲外の項目であり、G3では扱わない。Astro Component contract test基盤のTODOも、共通section frameのユーザー操作を既存Playwrightで確認できるため、このGateでは回収しない。

実装時のbrowser behavior確認は、`npm run test:e2e:run -- tests/visual/character-sheet.spec.ts`を用いる。design-image-generationの前提が未完了のため、この子issueの実装はまだ開始できない。
