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

- [x] `h1`がReact Islandの外でAstro pageから表示され、Island内に重複titleがない
- [x] formの第一階層sectionがdesktop、tablet、mobileでDOM順の1列に積まれ、2列section layoutがない
- [x] desktop右補助領域が通常のPageTocと同じ幅で表示され、第一階層sectionへのリンクと縦並び操作を持つ
- [x] PageToc / MobilePageTocを表示せず、character-sheet固有navigationはdesktop補助領域と狭幅action menuだけにある
- [x] site menu railはsheet最小幅、補助領域、rail、main左右gutterを確保できる幅だけで表示され、それ以外ではHeader buttonからdrawerを開ける。採用したbreakpointと構成要素の幅を実装記録へ残す
- [x] 狭幅layoutがtabletから適用され、独立した`?`がmenu iconの上にあり、開いたfloating menuでは第一階層section navigation、縦並びaction button、error一覧の順にある
- [x] child section、行、入力項目へのリンク・強調を追加していない
- [x] help、JSON出力・入力、CCFOLIAコピー、初期化、エラー一覧の既存機能が各layoutで利用できる
- [x] `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`が実装と整合している
- [x] 関連TODOを本taskでは扱わない理由が記録されている
- [x] `design-image-generation`でlayout draft、VRT scenario、ユーザー承認を得て、`docs/design/character-sheet/notes.md`へ記録している
- [x] `/character-sheet/`のdefault desktop、tablet、mobile、desktop補助領域、tablet / mobileのfloating menu開閉、Header drawerとaction menuが競合しない状態について、actual screenshotを開いたVisual Review記録と必要なtarget限定VRT比較結果を残している
- [x] canonical VRT baselineを更新する場合は、別途ユーザーの明示承認を得ている
- [x] `npm run check`と`npm run build`が通る

## チェックポイント

- [x] `/character-sheet/`のdesktop、tablet、mobileに横overflowがない
- [x] 採用breakpointの直前・直後で、site menu rail、Header drawer、desktop補助領域、floating menuの表示条件が競合しない
- [x] section jump buttonがGitHub Pagesのsubpath配下でもroute遷移を行わずに動作する
- [x] floating controlsが最後の入力・操作を隠さない
- [x] `h1`から`h2`への見出し順序とsection navigationのaccessible nameを確認する
- [x] Header menu drawerとaction menuのfocus、Escape、overlay状態が競合しない
- [x] 既存route、保存、JSON、CCFOLIA、error表示の動作を壊していない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] `docs/TODO.md`の候補行design taskと矛盾していない
- [x] `docs/design/character-sheet/notes.md`と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

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

- [x] requirementsとdesign notesへresponsive段階、desktop action railのsticky表示を反映する。active accentは後続の要求調整で廃止した
- [x] desktop、site-menuありtablet、site-menuなしdesktop / tablet、mobileの各表示状態を実装・確認する
- [x] section jumpを確認する。操作menu内の第一階層section linkへのactive accentは後続の要求調整で廃止した
- [x] desktop、tablet、mobile、ultrawideのactual screenshotを開いて確認する
- [x] 対象VRTを更新し、target限定比較を通す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

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
- [x] section jump後の対象sectionがHeader直下に表示される
- [x] tablet以上でform本文が最大`44rem`となり、desktopのaction railを含むgroupが中央寄せされる
- [x] `64rem`、`84rem`の各境界でsite menu rail、form、action controlsに横overflowがない
- [x] desktop、tablet、mobileのactual screenshotを開いて確認する
- [x] 対象VRTを更新し、target限定比較を通す
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
- [x] desktop、tablet、mobileのactual screenshotを開いて確認する
- [x] 対象VRTを更新し、target限定比較を通す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## 要求調整（2026-08-08）

- section navigationの現在位置追跡と、クリック対象のaccent表示は廃止する。
- 第一階層sectionへジャンプする各buttonは、下向きiconと下線で操作の意味を示す。
- section jump、第一階層だけを対象にする範囲、section frame・子section・行・入力項目へ色を付けない制約は維持する。

## レビュー指摘 4

### 指摘事項

- mobile / tabletのsection jump後にaction menuを閉じず、jump先を確認しながら続けて操作できるようにする。
- Astro page側へ出した`h1`は、visual layoutをずらさないよう非表示にする。
- `CharacterSheetContainer`に集まったActionPane関連のcallback、ref、stateを、section jump、action button群、errorの3つのhookへ分ける。
- action button群とerror表示に続くdialog群を`ActionPaneDialogs`へ集約し、Containerのdialog配置を整理する。

### 判定

- source: human review in the active Codex conversation
- classification: valid
- local validation:
  - `CharacterSheetContainer`の`onSectionJump`は、desktop / 狭幅を区別せず`setIsActionMenuOpen(false)`を先に実行するため、mobile / tabletでjump後にaction menuが閉じる。
  - `src/pages/character-sheet.astro`はReact Island外の`h1`へ表示marginを与えており、formだけを中央寄せするlayoutと視覚上の開始位置がずれる。
  - ContainerはActionPaneのsection jump、help、CCFOLIA、reset、error summaryと、それらのdialogを同じrootに保持している。Form section picker等とは責務を分けたまま、ActionPane関連だけをhookとdialog componentへ局所化できる。

### 対応方針

- 狭幅のsection jumpではaction menuを閉じず、desktopでは現行のnavigation buttonから同じjump callbackを使う。固定Headerを避けるsmooth scrollは維持する。
- `h1`はAstro page側に残しつつvisually hiddenにして、heading構造を保ちながら見出し分のvisual spaceをなくす。requirementsとdesign notesのheading記述も更新する。
- ActionPane関連のContainer stateを、section jump、action button群、errorの3 hookへ分離する。`useActionPane`がこの3 hookを合成するfacadeとなり、ContainerはActionPane関連でこのhookだけを呼び出す。各hookが必要なcallback・ref・stateだけを返し、Form sectionとpicker dialogの状態は移動しない。
- `ActionPaneDialogs`はActionPane操作から開くconfirm / notice dialogとerror dialogをまとめ、個別dialogの既存componentとfocus復帰・操作契約を維持する。どのrestore errorを含めるかは既存発火元を確認してActionPane責務に限る。

### 対応完了チェックリスト

- [x] mobile / tabletでsection jump後もaction menuを開いたままにし、desktopを含むjump動作を確認する
- [x] `h1`をvisually hiddenにしてlayout余白をなくし、requirementsとdesign notesを更新する
- [x] section jump、action button群、errorのActionPane関連stateを3 hookへ分離する
- [x] ActionPane操作とerror表示に属するdialogを`ActionPaneDialogs`へ集約し、既存操作・focus復帰を維持する
- [x] ActionPaneのunit testと対象E2Eを更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 5

### 指摘事項

- `CharacterSheetContainer`に残る候補pickerごとの開閉state、focus復帰ref、request / close callbackを、picker dialog単位のhookへ分離する。
- `usePickers`をfacadeとして各picker hookを集約し、Containerは候補pickerについてこのhookだけを呼び出す。
- 候補picker dialogのJSXを`PickerDialogs`へ集約する。
- `PickerDialogs`、候補picker dialogとContainerの境界で、効果がある範囲の`memo`と`useCallback`を適用する。

### 判定

- source: human review in the active Codex conversation
- classification: valid
- local validation:
  - Containerには、primary / ikizama / common / other ryugi skill、weapon、armor、omamori、drugs、cybernetics、nanomachinesの10候補pickerについて、個別のstate、trigger ref、request callback、close callbackが残る。
  - request callbackはすでに個別に`useCallback`化されているが、Picker dialogのJSXではselectionとcloseのinline callbackが混在し、ActionPaneと同様の責務境界になっていない。
  - 候補の選択操作は`useCharacterSheetFormPresenterProps`が返すsection操作へ依存する。そのためpicker hookがform操作まで直接所有すると、presenter callbackとpicker request callbackの循環依存を作る。
  - この整理はcharacter-sheetの既存操作・layoutを変えない内部refactorであり、ユーザーの追加指示によりレビュー指摘4の「picker dialogの状態は移動しない」という前提を置き換えてcurrent issueで扱う。

### 対応方針

- `usePickerStates`は10個のpicker state hookを合成し、form presenterへ渡すrequest callback、開閉対象、trigger ref、`close`を返す。targetを持つpickerはtarget型を維持し、focus復帰と既存のdialog open / close契約を変えない。
- Containerは`usePickerStates`を最初に呼び、そのrequest callbackをform presenterへ渡す。presenter propsの生成後に`usePickers({ pickerStates, form, presenterProps })`を呼び、form選択・候補絞り込み・dialog propsをhook内へまとめる。これにより依存循環を作らず、pickerの業務操作もContainerから外す。
- `PickerDialogs`は候補picker dialogだけを集約する。流儀変更・削除・専用アイテム削除のconfirm dialogは候補pickerではないため、本指摘では移動しない。
- `PickerDialogs`を`memo`化し、Containerから渡すselection / close callbackとdialog propsを`useCallback` / `useMemo`で安定させる。既存の候補picker dialog componentは、propsが安定するものだけ`memo`化する。内部だけで完結し再利用されない短いcallbackは機械的に追加しない。
- 各hookと`PickerDialogs`を単体テスト可能な入力・出力へし、Container testでpicker dialog stateの更新が無関係なform presenter propsを変えないことを確認する。

### 対応完了チェックリスト

- [x] 10候補pickerのstate、trigger ref、request / closeをpicker単位のhookへ分離する
- [x] `usePickerStates`と`usePickers`がpicker stateと操作を集約し、Containerが候補picker state・操作を直接持たない
- [x] 候補picker dialogを`PickerDialogs`へ集約し、既存の選択、候補絞り込み、focus復帰を維持する
- [x] 有効な境界に`memo`と`useCallback` / `useMemo`を適用し、不要な再renderを避ける
- [x] picker hook、`PickerDialogs`、Container memo境界のtarget testを追加・更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 6

### 指摘事項

- primary流儀変更、ikizama変更、other流儀の変更・削除、専用item category削除の確認state、pending callback、focus復帰ref、request / confirm / close callbackを、変更警告ごとのhookへ分離する。
- `useCharacterChangeWarning`を集約地点とし、form presenterへ渡す変更request callback、各dialogの操作、return focusをContainerから外す。
- 変更確認dialogのJSXを`CharacterChangeWarningDialogs`へ集約する。

### 判定

- source: human review in the active Codex conversation
- classification: valid
- local validation:
  - Containerには上記5フローのopen state、trigger ref、pending apply callback、confirm / close callbackが残り、候補pickerのrefactor前と同じ責務集中がある。
  - primary流儀とikizamaは選択済みskillがある場合だけ確認し、承認時にskillを初期化する。other流儀の変更・削除は対応するskillをclear / removeしてから変更を適用し、削除後は追加buttonへfocusを戻す。専用item category削除は保留したremove callbackを承認時に適用する。
  - request callbackはform presenter生成時に必要だが、confirm時のclear / removeはpresenter props生成後に得られる。この生成順をそのままContainerへ残す必要はない。
  - 現在のissueでは候補pickerだけを`PickerDialogs`へ集約している。ユーザーの追加指示により、変更警告dialogも同じ内部refactor範囲としてcurrent issueで扱う。

### 対応方針

- primary流儀、ikizama、other流儀変更、other流儀削除、専用item category削除の各hookは、それぞれのwarning state、trigger ref、pending apply callback、request / confirm / closeを所有する。
- `useCharacterChangeWarning`は各hookを合成し、`presenterOptions`（form presenterへ渡すrequest callbackとother流儀追加button ref）、`dialogsProps`、最新のpresenter操作を受けるbinderを返す。binderはhook内のrefだけを更新し、primary / ikizama skillのclear、other流儀skillのclear / removeをconfirm・直接適用時に正しく実行する。
- Containerは`useCharacterChangeWarning`をform presenter生成前に一度だけ呼び、`presenterOptions`を渡す。presenter props生成後にbinderへ必要なclear / remove操作を渡し、個別warning state・callback・refを保持しない。
- `CharacterChangeWarningDialogs`は5つのconfirm dialogを集約して`memo`化する。dialog props、hookのrequest / confirm / close、Containerとのbinder境界は`useCallback` / `useMemo`で安定化する。既存dialog componentのfocus復帰、copy、confirm labelは維持する。
- 各warning hookと集約hookを単体テストし、変更確認が必要な場合・不要な場合、confirm後の依存skill整理、other流儀削除後のfocus復帰を検証する。

### 対応完了チェックリスト

- [x] 5変更警告のstate、trigger ref、pending callback、request / confirm / closeをhookへ分離する
- [x] `useCharacterChangeWarning`がpresenter request callback・最新操作ref・dialog propsを集約し、Containerが個別warning state・操作を直接持たない
- [x] `CharacterChangeWarningDialogs`へ5確認dialogを集約し、既存のcopy、confirm、focus復帰を維持する
- [x] 有効な境界に`memo`と`useCallback` / `useMemo`を適用し、不要な再renderを避ける
- [x] warning hook、集約hook、dialog / Container境界のtarget testを追加・更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 7

### 指摘事項

- ActionPane、picker、character change warningをhookとdialog componentへ分割した後、状態遷移と表示契約のVitestが不足している。
- `CharacterSheetContainer.test.tsx`が、分割済みのsection、picker、warning、action menuの細部までDOM経由で検証しており、Containerの配線境界を越えて内部実装を知っている。
- `CharacterSheetContainerMemo.test.tsx`がform presenterのsection propsを個別列挙しており、presenter内部の構成変更に不要に追随する。

### 判定

- source: local-agent self-review in the active Codex conversation
- classification: valid
- local validation:
  - `useActionPane`には直接のhook testがなく、menuのEscape/focus復帰、help/reset/CCFOLIAの状態遷移、copy notice、error dialog、section jumpはContainer testへ依存している。
  - `usePickerStates`はrow pickerの一部だけ、`usePickers`はprimary skillの選択だけを直接確認している。armorのboolean state、target picker、各selection callback、drug・other ryugi・weapon等の候補導出は直接検証されていない。
  - `useCharacterChangeWarning`は2ケースだけであり、ikizama、other ryugi変更・削除、cancel、category削除後focusの状態遷移がContainer testに残っている。
  - `PrimarySkillPickerDialog`以外のpicker dialogの固有表示・候補選択は、ほぼContainer testだけで確認している。
  - `PickerDialogs`と`CharacterChangeWarningDialogs`は型付きpropsをそのまま展開するだけの集約componentであり、専用snapshot testを追加する価値は低い。`ActionPaneDialogs`はcopy noticeの分岐とconfirm callbackを持つため直接test対象とする。

### 対応方針

- `useActionPane`へ状態遷移とreturn focus ref、section jump、CCFOLIA成功/失敗通知、error dialogのunit testを追加する。実際のfocus復帰は既存の共通dialog component testが所有する。
- `usePickerStates`と`usePickers`を、picker種別を網羅するtable-driven testへ拡張する。各pickerのtarget/row、選択通知、close、候補・選択済み導出をhookで確認する。
- `useCharacterChangeWarning`へ5 warning flowのconfirm/cancel・依存skill整理・focus復帰を追加し、各picker dialogには固有の表示、disabled、selection callbackを確認するcomponent testを置く。`ActionPaneDialogs`だけはその集約固有のcallback/notice mappingをtestする。
- Containerにはroot state、form presenter、picker/warning/action paneの配線と代表的なroot操作だけを残す。section編集、picker選択、warning状態遷移、action menu細部は下位層のtestへ移す。
- memo境界のtestは個別section propの列挙をやめ、form presenter propsとaction pane propsのshallow equalityを確認する。props wrapperのobject identity自体はReactのmemoization契約に含めない。

### 対応完了チェックリスト

- [x] `useActionPane`の状態遷移、return focus ref、section jump、notice/errorを直接testする
- [x] `usePickerStates`と`usePickers`の全picker state・selection・候補導出を直接testする
- [x] `useCharacterChangeWarning`の5 flowと各picker dialogの固有表示・操作を直接testする
- [x] `ActionPaneDialogs`の集約固有のcallback/notice mappingをtestし、純粋なprops展開componentへ不要なtestを追加しない
- [x] Container testを配線・root操作の代表フローへ縮小し、memo testをprops shallow equalityへ変更する
- [x] 変更対象のVitestが通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 8

### 指摘事項

- `/character-sheet/`のE2Eがdesktop、tablet、mobileの代表viewportだけを確認しており、`64rem`と`84rem`の直前・直後でsite menu rail、desktop text action rail、floating action controlsの表示条件と横overflowを検証していない。
- desktopのsection navigationと、Header drawerとaction menuを同時に開いた後のEscapeによるoverlay解消を、実ブラウザで確認していない。
- character-sheet VRTはdefault、desktop action rail、tablet / mobile action controlsとaction menuを持つが、character-sheet routeでmobile Header drawerを開くstateがない。共通site-menu VRTは別routeのため、floating controlsとdrawerの同居を確認できない。

### 判定

- source: local-agent self-review in the active Codex conversation
- classification: valid
- local validation:
  - `tests/e2e/character-sheet.spec.ts`は`1440px`、`1024px`、`390px`を確認するが、`1023/1024px`と`1343/1344px`の境界を網羅しない。
  - 同E2Eはsection jumpをtablet / mobileから、Header drawerをmobileで個別に確認するだけであり、desktop navigationとdrawer/action menuの競合を確認していない。
  - `tests/vrt/character-sheet.spec.ts`にはdesktop action rail、tablet / mobile action controls・open action menuのsection targetがある。一方、mobile Header drawerを開くcharacter-sheet固有stateはない。
  - `docs/requirements/character-sheet.md`とdesign notesは、上記breakpoint、Header drawerとの競合回避、最終操作への到達をcurrent issueの契約としている。

### 対応方針

- 既存のcharacter-sheet E2Eを拡張し、`1023/1024px`と`1343/1344px`のrail / controls表示と横overflow、desktop section jump、mobile drawer/action menuを同時に開いた後のEscapeによるoverlay解消を確認する。既存のJSON、clipboard、picker、warningの局所stateをE2Eへ重複して追加しない。
- `h1` / `h2`、PageToc / MobilePageToc非表示、各controlの個別focus復帰は、それぞれstatic page contract、component / hook testの責務としてE2Eへ追加しない。
- character-sheet VRTへmobile Header drawer-open stateを1件追加する。最終操作とfloating controlsの重なりはVRT / Visual Reviewで確認し、breakpoint境界とsticky scrollの利用可能性はE2Eで確認する。ultrawideはdesign notesどおりactual visual reviewだけでcanonical VRTを増やさない。
- ユーザーが許可済みのcharacter-sheet VRT targetに限り、追加stateのcanonical snapshotを更新し、target限定比較を行う。

### 対応完了チェックリスト

- [x] E2Eで`64rem`・`84rem`の直前 / 直後のrail・controls・横overflowを確認する
- [x] E2Eでdesktop section jumpと、Header drawer/action menuのoverlay解消を確認する
- [x] character-sheet VRTへmobile Header drawer-open stateを追加する
- [x] 追加VRT stateのactual screenshotを確認し、許可済みtargetのcanonical snapshotを更新してtarget限定比較を通す
- [x] 変更対象のE2E / VRTが通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## VRT baseline更新（2026-08-08）

- user approval: character-sheetの全VRT更新を明示承認。
- target: `tests/vrt/character-sheet.spec.ts` の`@character-sheet` 224件。mobile Header drawerを開いた`site-menu-open`を含む。
- result: `npm run visual:update -- --grep '@character-sheet'`で224件を更新し、同じtargetの`npm run visual:test -- --grep '@character-sheet'`で224件成功。
- baseline policy: `canonical-snapshots/visual/character-sheet/`はlocal-only artifactであり、Git管理へ追加しない。
- acceptance: 起点`3deecdb`とのCSS比較ではsection CSSに意図しないrule変更はなく、mobile sectionの局所的な文字rasterization差分はユーザー判断により許容する。全ページの高さ差は、見出しをvisually hidden化し、1列layoutへ変更した意図した差分である。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/vrt/character-sheet.spec.ts`の`@character-sheet`。captureは最終diffの操作領域を対象に、`@character-sheet.*@(default|action-pane-desktop|action-controls|action-menu-open|site-menu-open|action-pane-error|action-menu-error)`を使用した。
- route / states / viewports: `/character-sheet/`のdefault（desktop / tablet / mobile）、desktop action rail、tablet / mobileのfloating controls・action menu・error state、mobile Header drawer-open。

### レビュー結果

| 対象                                         | 判定 | 差分                                          | 対応                                       |
| -------------------------------------------- | ---- | --------------------------------------------- | ------------------------------------------ |
| desktop action rail                          | OK   | 罫線をFooter直前まで連続する表示へ修正        | desktop full-page canonical snapshotを更新 |
| tablet / mobile controls・action menu・error | OK   | 意図した狭幅操作導線                          | なし                                       |
| mobile Header drawer-open                    | OK   | 新規VRT state                                 | なし                                       |
| default desktop / tablet / mobile            | OK   | 1列layout・見出し非表示による意図した全体差分 | なし                                       |

### 実画面確認

- `/character-sheet/` default desktop / tablet / mobile:
  - full-page overview: 1列section、desktopの右端action rail、tablet / mobileのfloating controls、Footerまでのpage-level配置を確認。
  - checked acceptance criteria: 横overflowなし、desktopでは本文のみ中央寄せ、tablet / mobileではsite menu railとdesktop text action railを出さない。
- `/character-sheet/` desktop action rail、tablet / mobile controls・action menu・error:
  - locator screenshot（`CharacterSheetActionPane` owner / original pixel resolution）: action railのsection jump、button境界、divider、error表示、狭幅menu内のsection navigationから縦並び操作・errorへの順序を確認。
  - checked acceptance criteria: clip・overflowなし、buttonの操作可能な境界、第一階層だけのsection navigation、最後の操作を覆わない表示。
- `/character-sheet/` mobile Header drawer-open:
  - locator screenshot（`#character-sheet-site-menu-drawer` / original pixel resolution）: drawer、scrim、下層のfloating controlsの重なりを確認。
  - checked acceptance criteria: drawer内のsite menu、action controlsとのoverlay競合なし。

### 自己修正した項目

- desktop操作レールの左罫線をsticky要素からdesktop grid layoutの疑似要素へ移し、操作内容の末尾ではなくFooter直前で止まるようにした。
- 修正後に`@character-sheet @full-page @desktop @default`のcanonical snapshotだけを更新し、通常比較の1件成功を確認した。

### 人間判断が必要な差分

- なし。mobile section screenshotの局所的な文字rasterization差分は、baseline更新前にユーザーが許容済みと判断した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 9

### 指摘事項

- design notesのモードが、`ex-10`で承認・実装済みのlayout intentとVRT参照情報を含む正本であることを示さず、未承認の準備資料として残っている。
- 狭幅action menuは、section navigation、縦並びaction button、可変長の全errorを含む一方、viewport高さを超えた時の最大高さと縦scrollを持たない。
- 初期化confirmを閉じた直後のfocus復帰が、root operationの完了より先に行われうる。処理中のContainerは`inert`であり、完了後にtriggerへ戻らない可能性がある。

### 判定

- source: local-pr-review
- classification: valid
- local validation:
  - `docs/design/character-sheet/notes.md`の`## モード`は「要件の復元とデザイン準備」「最終レイアウトのドラフトでも、ページ実装の承認でもない」とする一方、同ファイルには`ex-10`のユーザー承認済み最終表示とcanonical baseline更新を記録している。current issueもdesign承認・実装を完了としている。
  - `CharacterSheetActionPane.module.css`の`.menu`はfixed positionと幅を指定するが、`max-block-size`と`overflow-y`を指定しない。menuには8件のsection navigation、4つの縦並び操作、可変長error listが入る。
  - `useActionPane`はreset dialogのclose後に二重`requestAnimationFrame`でfocus復帰する。`CharacterSheetContainer`は`onResetConfirmed`中にrootを`inert`にするが、hookへroot operation状態を渡していない。抽出前にはroot operation完了後までfocus復帰を保留する処理があった。
  - GitHub connectorでPR #197のtop-level comment、submitted review、inline review threadはいずれも0件である。

### 対応方針

- design notesのモードを、承認・実装済みのcharacter-sheet layout intentとVRT参照情報を含む正本へ更新する。将来の未決定事項だけを明示する。
- mobile縦長では、狭幅action menuのsection navigation、action button群、`エラーがN件あります。`は固定表示に保つ。可変長のerror一覧だけを最大`12rem`で縦scrollできるようにし、多数error時の高さ上限とscroll設定はComponent testで確認する。極端に低いviewportへの追加設計は行わない。
- resetのreturn focusをroot operation完了後まで保留する。deferred Promiseを用いるtestで、処理中はfocusせず、成功完了後にtriggerへ復帰し、error dialogのfocus契約を妨げないことを確認する。

### 対応完了チェックリスト

- [x] design notesのモードを承認・実装済みlayoutの正本として更新する
- [x] mobile縦長で、狭幅action menuのerror一覧だけが多数error時に縦scrollし、section navigation、action button群、`エラーがN件あります。`は固定表示される
- [x] reset成功時のfocusをroot operation完了後にtriggerへ復帰する
- [x] 上記の狭幅menu到達性とreset focus復帰のtarget testを追加・更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/vrt/character-sheet.spec.ts`の`@character-sheet.*@action-menu-error`
- route / states / viewports: `/character-sheet/`のaction menu error state、tablet（`820x1180`）とmobile（`390x900`）

### レビュー結果

| 対象                              | 判定 | 差分                           | 対応             |
| --------------------------------- | ---- | ------------------------------ | ---------------- |
| tablet / mobile action menu error | OK   | canonical baselineとの差分なし | baseline更新なし |

### 実画面確認

- `/character-sheet/` / action menu error / tablet（`820x1180`）:
  - locator screenshot: action menu（`352x491`、original pixel resolution）
  - checked: 2列section navigation、縦並びのaction button、一覧外のerror count、2件のerror文の折返し、clipping / overflowの有無
  - result: 全要素が枠内に収まり、error countとerror listの間隔はcanonical baselineと一致する。
- `/character-sheet/` / action menu error / mobile（`390x900`）:
  - locator screenshot: action menu（`352x491`、original pixel resolution）
  - checked: tabletと同じ局所表示契約
  - result: 全要素が枠内に収まり、canonical baselineとの差分はない。

### 自己修正した項目

- [x] error countとerror listの間に不要な4pxのgapを追加してVRT差分を生じさせたため、そのgapを除去した。

### 人間判断が必要な差分

- なし

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した（baseline更新は行わない）
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 10

### 指摘事項

- レビュー指摘9で変更したaction-menu-errorの最終Visual Reviewが未確認である一方、issue全体のVisual Review / VRT完了条件が完了のまま残っている。
- 追加E2Eはerrorのない初期DOMへerror listを追加しようとするが、初期状態には`ul`が存在しない。長大なerror listの高さ上限はbrowser E2Eの責務ではなく、Componentへ多数のerrorを渡して検証する。
- reset focus testも即時resolve mockと手動rerenderに留まり、非同期root operationの成功・失敗との連動を検証しない。

### 判定

- source: local-pr-review
- classification: valid
- local validation:
  - `ビジュアルレビュー 2`は最終CSS調整後のactual screenshot・target限定VRT比較を未確認としている。集約完了条件も未チェックへ戻し、同じ最終確認で完了させる必要がある。
  - `ErrorSummary`は`hasErrors`がfalseの時に`ul`をrenderしない。追加E2Eは`エラーはありません。`状態で`section[aria-live] ul`をlocatorにしている。
  - `useActionPane` testはroot operation propの分岐を確認するが、deferred Promiseを通じてoperationの開始・完了・失敗とfocusを連動させない。

### 対応方針

- browser実行可能な環境で、最終CSSのaction-menu-errorをtablet / mobileでcapture・実画面確認・target限定VRT比較し、`ビジュアルレビュー 2`と集約完了条件を同時に更新する。
- DOMを注入する追加E2Eは削除する。Component testで16件以上のerrorを渡し、件数表示が一覧の外にあり、全件を描画し、error listだけが`max-block-size: 12rem`かつ`overflow-y: auto`であることを確認する。
- deferred Promiseとroot operation状態を連動するhook testへ直し、処理中はreset triggerへfocusを戻さず、成功後だけ復帰することを確認する。失敗時はimage error dialogがfocusを管理するため、action paneはそのfocusを奪わない。

### 対応完了チェックリスト

- [x] 最終action-menu-errorのtablet / mobile actual screenshotを開き、target限定VRT比較を通す
- [x] Component testが多数error時のerror listの高さ上限とscroll設定を確認する
- [x] reset focusが非同期root operationの処理中・成功後に正しく動作し、失敗時にerror dialogのfocusを奪わない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 11

### 指摘事項

- 狭幅action menuの可変長error一覧について、一覧だけを最大`12rem`で縦scrollし、section navigation・action button・error countを一覧外に固定する表示契約がcurrent issueにしかなく、承認済みdesign正本へ残っていない。
- reset失敗時、`isImageErrorFromReset`がerror dialogを閉じた後も残るため、`useActionPane`の保留されたfocus復帰要求が後続の画像操作で発火し、古いreset triggerへfocusを奪う経路がある。

### 判定

- source: local-pr-review
- classification: valid
- local validation:
  - `docs/design/character-sheet/notes.md`は狭幅menuのerror一覧を記録するが、可変長一覧だけの高さ上限・scroll・固定要素・全errorへの到達性を記録していない。
  - `useCharacterSheetRootState`はreset失敗時に`isImageErrorFromReset`をtrueへする。`CharacterImageErrorDialog`のcloseでは`imageError`だけをnullへするため、`useActionPane`の`shouldRestoreResetFocus`は保留されたままになる。
  - PR #197のremote head `abe9d10`、GitHub connectorのtop-level comment、submitted review、inline review threadはいずれも追加なしである。

### 対応方針

- design正本へ、狭幅action menuでは可変長error listだけを最大`12rem`で縦scrollし、section navigation・action button・error countをscroll領域外に置き、全errorへ到達可能にすることを追記する。

### ユーザー判断

- 2026-08-08: reset失敗からのfocus復帰は発生頻度に対して修正コストが高いため、対応しない。focus周辺の追加修正・testは本issueで行わない。

### 対応完了チェックリスト

- [x] design正本が可変長error listの表示契約を記録する
- [x] `npm run check` が通る（Review 10のsource変更後に実行済み。本対応はMarkdownのみ）
- [x] `npm run build` が通る（Review 10のsource変更後に実行済み。本対応はMarkdownのみ）
