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
- desktop `1440x1200`、tablet `820x1180`、mobile `390x900`について、layout境界とVRT scenarioを確定する。
- ユーザー承認後に`docs/design/character-sheet/notes.md`へ最終layout intent、対象state、VRT比較対象を記録する。canonical VRT baselineは別途の明示承認なしに更新しない。

## 対象範囲

- `/character-sheet/`のAstro page、page heading、site menu表示条件、layoutを通常layoutの構成へ整理する。必要なら`AppContainer`と`NoTocPageLayout`を再利用または拡張する。
- `CharacterSheetContainer`、`CharacterSheetActionPane`、form presenterを、Astro側の`h1`、1列section、desktop補助領域、狭幅のsection navigationへ対応させる。
- section navigationは、基本情報、流儀・生き様と能力値、副能力値、縁、判定、スキル、武器・防具、専用アイテムの第一階層sectionだけを対象にする。
- desktopでは右補助領域を通常のPageTocと同じ幅にし、section navigationの下に操作とエラー状態を縦に置く。
- site menu railは`64rem`以上、desktopのtext action railは`84rem`以上で表示する。`64rem`から`84rem`ではsite menu railとfloating action icon controlsを併用し、`64rem`未満ではHeader drawerとfloating action icon controlsを用いる。
- 狭幅layoutではfloating action menu内のbutton群の上にsection navigationを置き、action buttonを縦に置く。既存のhelp dialog、error表示、JSON入出力、CCFOLIAコピー、初期化の振る舞いは維持する。
- `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`を実装と整合する範囲で維持し、対象VRT・E2E・component testsを更新する。

## 初期スコープ外

- section navigationから子section、行、入力項目へ移動する機能
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
- [ ] child section、行、入力項目へのリンク・強調を追加していない
- [ ] help、JSON出力・入力、CCFOLIAコピー、初期化、エラー一覧の既存機能が各layoutで利用できる
- [ ] `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`が実装と整合している
- [ ] 関連TODOを本taskでは扱わない理由が記録されている
- [ ] `design-image-generation`でlayout draft、VRT scenario、ユーザー承認を得て、`docs/design/character-sheet/notes.md`へ記録している
- [ ] `/character-sheet/`のdefault desktop、tablet、mobile、desktop補助領域、tablet / mobileのfloating menu開閉、Header drawerとaction menuが競合しない状態について、actual screenshotを開いたVisual Review記録と必要なtarget限定VRT比較結果を残している
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
- `64rem`と`84rem`の境界でsite menu rail、desktop text action rail、floating action icon controlsが競合しないか。
- desktopと狭幅のsection navigationが、第一階層だけを示し、PageToc / MobilePageTocと併存・誤認しないか。
- 狭幅menuで独立した`?`、section navigation、縦並び操作、エラーが指定順序で指により到達しやすく、最後の操作を覆わないか。
- `docs/TODO.md`の候補行選択のvisual designを、このlayout taskへ混ぜない判断が妥当か。
- 実装前に`.tmp/design/character-sheet/`のdesign draftを作成し、layout、breakpoint、VRT scenarioのユーザー承認を得る前提が妥当か。

## 備考

- `docs/TODO.md`の候補行を選択可能に見せるdesignは、候補dialog・選択状態の視覚表現を対象とする別taskであり、今回のlayout・navigation改訂には含めない。
- 実装開始前に、`docs/design/character-sheet/notes.md`の設計意図とVRT対象を再確認する。design draftの作成とユーザー承認を必須とし、canonical VRT baselineの更新には別途ユーザーの明示承認を必要とする。

## レビュー指摘 1

### 指摘事項

- site menu railが消えた後も右操作領域が残るresponsive解釈を修正する。
- desktopからmobileまでを、site menu railとaction controlsの表示役割が一致する段階へ分ける。site menuのないdesktop幅ではtext action railを表示せず、tablet / mobileのaction icon controlsは維持する。
- desktopのright action railを本文scrollから独立してsticky表示にする。既存のpage shell、main、Footerのscroll構造は変更しない。
- navigationの可視labelを`セクションにジャンプ`へ変更し、muted boldの表現にする。
- section jumpを確実に動作させ、現在scroll中の第一階層sectionに対応する操作menu内のlinkだけをaccentで示す。

### 判定

- source: human
- classification: valid
- local validation:
  - `src/pages/character-sheet.astro`のsite menu railと`CharacterSheetActionPane`のdesktop action railの境界がずれており、site menu railだけが先に消える。
  - `CharacterSheetActionPane`は`セクション`というlabelと通常anchorに依存しており、section移動後のactive stateを持たない。
  - current issueの`現在位置追跡、scroll連動`の初期scope外は、今回のユーザー指示によりcharacter-sheetの第一階層section navigationに限って変更する必要がある。

### 対応方針

- requirementsとdesign notesを、以下のresponsive段階とdesktop action railのsticky表示へ更新してから実装する。
  1. desktop: site menu railとtext action railを表示する。
  2. site menu railを維持するtablet: action railをicon controlsへ縮小する。
  3. site menu railを持たないdesktop / tablet: right text action railを表示せず、tablet / mobileのaction icon controlsを維持する。
  4. mobile: floating action menuを表示する。
- tabletでは既存のfloating action icon controlsを維持する。操作を到達不能にする実装は行わない。
- 第一階層sectionだけをIntersectionObserverで観測し、操作menu内navigationの対応linkへaccentを与える。section frame、子section、行、入力項目の色・追跡は変更しない。
- section jumpは固定Headerの高さを考慮して移動し、menuを閉じた後にも移動を失わない実装へ置き換える。

### 対応完了チェックリスト

- [ ] requirementsとdesign notesへresponsive段階、desktop action railのsticky表示、active section jumpを反映する
- [ ] desktop、site-menuありtablet、site-menuなしdesktop / tablet、mobileの各表示状態を実装・確認する
- [ ] section jumpと、操作menu内の第一階層section linkだけへのactive accentを確認する
- [ ] desktop、tablet、mobile、ultrawideのactual screenshotを開いて確認する
- [ ] 対象VRTを更新し、target限定比較を通す
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- desktopの操作レールがscroll時に追従していない。
- section jump後のsection先頭に、Header高さ以上の余分な余白がある。
- character-sheet本文がtablet以上で広がりすぎる。tablet以上は本文の最小幅を上限として中央寄せする。

### 判定

- source: human review in the active Codex conversation
- classification: valid
- local validation:
  - `CharacterSheetActionPane`のsticky指定は、grid itemである操作領域の子`.desktopRail`に置かれている。親gridは`align-items: start`で子の高さに収まるため、sticky要素がscrollできる親blockの高さを得られず、実画面で追従しない。
  - global CSSは`scroll-padding-top: var(--site-header-height)`を指定している。`CharacterSheetSectionFrame`のscroll marginを併用するとHeader高さが二重に加わり、余分な余白を作る。
  - `CharacterSheetContainer`のdesktop form columnは`minmax(44rem, 1fr)`で利用可能幅まで拡大する。`character-sheet-page`の`90rem`上限だけでは、tablet以上で本文幅を固定できない。

### 対応方針

- desktopではgrid itemである操作領域自体をstickyにし、本文・Header・Footerの既存scroll構造には手を入れない。
- section jumpはContainerのnavigation hookでHeader実高さを引いたscroll位置を計算し、共通scroll paddingの影響を受けずに、可能な範囲で対象sectionをHeader直下へ置く。末尾sectionは最大scroll位置で止まることを許容する。
- `48rem`以上ではform本文を`min(100%, 44rem)`に制限して中央寄せする。desktop action railが表示される`84rem`以上では、固定幅formと`15rem`のaction railを一つの中央寄せgroupにする。site menu railが表示される`64rem`から`84rem`では、本文最小幅を維持できるmain gutterへ調整する。

### 対応完了チェックリスト

- [x] desktop操作レールが本文scroll中もHeader下へsticky表示される
- [ ] section jump後の対象sectionがHeader直下に表示される
- [x] tablet以上でform本文が最大`44rem`となり、desktopのaction railを含むgroupが中央寄せされる
- [ ] `64rem`、`84rem`の各境界でsite menu rail、form、action controlsに横overflowがない
- [ ] desktop、tablet、mobileのactual screenshotを開いて確認する
- [ ] 対象VRTを更新し、target限定比較を通す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 3

### 指摘事項

- desktopの操作メニューは右端へ固定し、中央寄せはキャラクターシート本文だけへ適用する。
- scroll中の第一階層sectionに対して、操作メニュー内navigationのactive accentが追従しない。
- `セクションにジャンプ`の上にある区切り線を外し、区切るならsection navigationと操作button群の間に置く。

### 判定

- source: human review in the active Codex conversation
- classification: valid
- local validation:
  - `CharacterSheetContainer.module.css`はdesktopでformとaction railを固定幅の一つの中央寄せgroupにしており、action railはmain右端へ寄らない。
  - `useCharacterSheetSectionNavigation`は`IntersectionObserver` callbackへ渡されたentriesだけからactive sectionを決めている。現在viewportに交差しているsection全体を比較しないため、scroll中のcurrent sectionを安定して反映できない。これは要件化済みのactive accentに対する実装bugであり、仕様解釈ではない。
  - `CharacterSheetActionPane.module.css`はdesktopの`.sectionNavigation`自身へborder-topを設定しており、labelの上に区切り線が出る。

### 対応方針

- desktopのcontainerを、中央寄せの最大`44rem` form columnと、main右端に置く`15rem` action railへ分離する。action railは現在どおり本文scrollに対してstickyとする。
- section navigation hookを、Header直下のscroll位置を基準に第一階層section全体からactive sectionを決めるscroll連動処理へ置き換える。action paneは状態を持たず、Containerから渡されたactive IDだけを表示する。
- desktopのborderをsection navigationから外し、action button群の上へ移す。

### 対応完了チェックリスト

- [x] desktopのform本文だけが中央寄せされ、action railはmain右端でsticky表示される
- [x] manual scrollとsection jumpの双方で、現在の第一階層sectionのnavigation linkだけがaccentになる
- [x] section navigation labelの上にborderがなく、action button群の上にborderがある
- [ ] desktop、tablet、mobileのactual screenshotを開いて確認する
- [ ] 対象VRTを更新し、target限定比較を通す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## 要求調整（2026-08-08）

- section navigationの現在位置追跡と、クリック対象のaccent表示は廃止する。
- 第一階層sectionへジャンプする各buttonは、下向きiconと下線で操作の意味を示す。
- section jump、第一階層だけを対象にする範囲、section frame・子section・行・入力項目へ色を付けない制約は維持する。
