# ex-10-character-sheet-layout

## 目的

`/character-sheet/`を通常のサイトlayoutへ寄せ、sectionの左右2列配置による高さの不均衡をなくす。desktopではsection navigationと操作を本文右の補助領域へ整理し、tabletからmobileまでの狭幅layoutではsection移動を操作menuへ統合して、入力中の移動と操作を行いやすくする。

## 背景

現行のcharacter sheetは、desktopでsectionを2列へ振り分け、狭い画面では右下の操作menuだけを表示する。左右のcolumnの高さが大きく異なり、desktopの横並び操作menuもページ構造と分離している。

2026-08-08のユーザー指示により、以下を正本へ反映した。

- `docs/requirements/character-sheet.md`: 1列form、Astro側の`h1`、desktop補助領域、section navigation、site menu railと狭幅layoutの切替条件
- `docs/design/character-sheet/notes.md`: desktop / 狭幅layoutの操作導線、section navigation、VRT確認の前提

参照する正本:

- `docs/requirements.md`
- `docs/requirements/character-sheet.md`
- `docs/out-of-scope.md`
- `docs/issue/milestone-02/plan.md` Phase 3
- `docs/TODO.md` の「キャラクターシートの候補行を選択可能に見せるデザインを検討する」
- `docs/design/character-sheet/notes.md`
- `.agents/skills/design-image-generation/SKILL.md`

`ex-10`はmilestone planに固有のtask名としては未記載であり、Phase 3の候補行選択design taskとは別である。ユーザーが明示指定した未計画の独立taskとして扱い、milestone planのcheckbox・項目は変更しない。

## 実装前のdesign前提

現在の`docs/design/character-sheet/notes.md`は最終layoutの承認ではない。このissueを実装する前に、`design-image-generation`で以下を行い、ユーザー承認を得る。

- `.tmp/design/character-sheet/`に、application sourceから独立したdesktop、tablet、mobileのlayout draftとcaptureを作成する。
- 1列form、Astro側の`h1`、desktop右補助領域、section navigation、縦並び操作、狭幅floating menu、site menu rail / Header drawerの切替を確認できるstateをdraftへ含める。
- desktop `1440x1200`、ultrawide `1920x1200`（actualの中央寄せ確認）、tablet `820x1180`、mobile `390x900`について、layout境界とVRT scenarioを確定する。
- ユーザー承認後に`docs/design/character-sheet/notes.md`へ最終layout intent、対象state、VRT比較対象を記録する。canonical VRT baselineは別途の明示承認なしに更新しない。

## 対象範囲

- `/character-sheet/`のAstro page、page heading、site menu表示条件、layoutを通常layoutの構成へ整理する。必要なら`AppContainer`と`NoTocPageLayout`を再利用または拡張する。
- `CharacterSheetContainer`、`CharacterSheetActionPane`、form presenterを、Astro側の`h1`、1列section、desktop補助領域、狭幅のsection navigationへ対応させる。
- section navigationは、基本情報、流儀・生き様と能力値、副能力値、縁、判定、スキル、武器・防具、専用アイテムの第一階層sectionだけを対象にする。
- desktopでは右補助領域を通常のPageTocと同じ幅にし、section navigationの下に操作とエラー状態を縦に置く。
- sheet本文最小幅、desktop右補助領域、site menu rail、main左右gutterの合計を切替条件とし、従来のcharacter-sheet固有`64rem`〜`80rem`例外と`48rem`固定の狭幅境界を廃止する。採用したbreakpointと各構成要素の幅は実装記録へ残す。
- 狭幅layoutではfloating action menu内のbutton群の上にsection navigationを置き、action buttonを縦に置く。既存のhelp dialog、error表示、JSON入出力、CCFOLIAコピー、初期化の振る舞いは維持する。
- `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`を実装と整合する範囲で維持し、対象VRT・E2E・component testsを更新する。

## 初期スコープ外

- section navigationから子section、行、入力項目へ移動する機能
- 現在位置の追跡、scroll連動、IntersectionObserverによる強調
- character sheet以外のPageToc / MobilePageTocの再設計
- 新たなcharacter sheet機能、保存形式、ゲームルール、マスタデータの変更
- `docs/TODO.md`の候補行の選択可能性を示すvisual design（本taskでは回収しない）
- DB、認証、SSR、CMS、外部UI libraryの追加
- canonical VRT baselineの更新（別途のユーザー明示承認なしに行わない）

## 完了条件

- [ ] `h1`がReact Islandの外でAstro pageから表示され、Island内に重複titleがない
- [ ] formの第一階層sectionがdesktop、tablet、mobileでDOM順の1列に積まれ、2列section layoutがない
- [ ] desktop右補助領域が通常のPageTocと同じ幅で表示され、第一階層sectionへのリンクと縦並び操作を持つ
- [ ] PageToc / MobilePageTocを表示せず、character-sheet固有navigationはdesktop補助領域と狭幅action menuだけにある
- [ ] site menu railはsheet最小幅、補助領域、rail、main左右gutterを確保できる幅だけで表示され、それ以外ではHeader buttonからdrawerを開ける。採用したbreakpointと構成要素の幅を実装記録へ残す
- [ ] 狭幅layoutがtabletから適用され、独立した`?`がmenu iconの上にあり、開いたfloating menuでは第一階層section navigation、縦並びaction button、error一覧の順にある
- [ ] child sectionへのリンク、現在位置追跡、scroll連動を追加していない
- [ ] help、JSON出力・入力、CCFOLIAコピー、初期化、エラー一覧の既存機能が各layoutで利用できる
- [ ] `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`が実装と整合している
- [ ] 関連TODOを本taskでは扱わない理由が記録されている
- [ ] `design-image-generation`でlayout draft、VRT scenario、ユーザー承認を得て、`docs/design/character-sheet/notes.md`へ記録している
- [ ] `/character-sheet/`のdefault desktop、tablet、mobile、ultrawide中央寄せ、desktop補助領域、tablet / mobileのfloating menu開閉、Header drawerとaction menuが競合しない状態について、actual screenshotを開いたVisual Review記録と必要なtarget限定VRT比較結果を残している
- [ ] canonical VRT baselineを更新する場合は、別途ユーザーの明示承認を得ている
- [ ] `npm run check`と`npm run build`が通る

## チェックポイント

- [ ] `/character-sheet/`のdesktop、tablet、mobileに横overflowがない
- [ ] 採用breakpointの直前・直後で、site menu rail、Header drawer、desktop補助領域、floating menuの表示条件が競合しない
- [ ] section linkがGitHub Pagesのsubpath配下で動作する
- [ ] floating controlsが最後の入力・操作を隠さない
- [ ] `h1`から`h2`への見出し順序とsection navigationのaccessible nameを確認する
- [ ] Header menu drawerとaction menuのfocus、Escape、overlay状態が競合しない
- [ ] 既存route、保存、JSON、CCFOLIA、error表示の動作を壊していない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] `docs/TODO.md`の候補行design taskと矛盾していない
- [ ] `docs/design/character-sheet/notes.md`と矛盾していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `src/pages/character-sheet.astro`
- `src/layouts/AppContainer.astro` または `src/layouts/NoTocPageLayout.astro`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.module.css`
- `src/character-sheet/dictionary.ts`
- `src/scripts/character-sheet-menu.ts`
- `tests/e2e/character-sheet.spec.ts`
- `tests/vrt/character-sheet.spec.ts`
- `docs/requirements/character-sheet.md`
- `docs/design/character-sheet/notes.md`

## レビュー観点

- 1列formと右補助領域が、左右columnの高さ差を解消しながら入力幅を不自然に狭めていないか。
- site menu railを隠す境界がsheet最小幅、右補助領域、rail、main左右gutterを根拠にしており、tabletでmenu railと入力領域が競合しないか。
- desktopと狭幅のsection navigationが、第一階層だけを示し、PageToc / MobilePageTocと併存・誤認しないか。
- 狭幅menuで独立した`?`、section navigation、縦並び操作、エラーが指定順序で指により到達しやすく、最後の操作を覆わないか。
- `docs/TODO.md`の候補行選択のvisual designを、このlayout taskへ混ぜない判断が妥当か。
- 実装前に`.tmp/design/character-sheet/`のdesign draftを作成し、layout、breakpoint、VRT scenarioのユーザー承認を得る前提が妥当か。

## 備考

- `docs/TODO.md`の候補行を選択可能に見せるdesignは、候補dialog・選択状態の視覚表現を対象とする別taskであり、今回のlayout・navigation改訂には含めない。
- 実装開始前に、`docs/design/character-sheet/notes.md`の設計意図とVRT対象を再確認する。design draftの作成とユーザー承認を必須とし、canonical VRT baselineの更新には別途ユーザーの明示承認を必要とする。
