# ex-02-23-sheet-action-pane

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/desktop.png`、`tablet-menu.png`、`mobile-menu.png`の承認済みdesign画像を遵守する。
- ユーザーの最新指示は、画像デザインと既存実装UIを上書きする。特に、desktopのheading横の操作列、tablet / mobileの右端に置くヘルプiconとメニューbuttonの順序、メニュー内のモック操作、末尾paddingをこのissueの表示契約とする。
- G23で、キャラクターシートで現在必要な通常の文言付きbuttonを`CharacterSheetButton`へ共通化する。Reactの通常の`button` propsを受け渡し、`color`、`size`、`className`の最小契約はこのissueで定める。既存の各sectionの配置だけを持つCSSと、Gate 22以降の共有style / shared Componentの境界を維持する。
- G23では操作UIと空のエラー表示領域だけを実装する。ヘルプ、JSON、CCFOLIA、初期化、エラー集約の実処理を実装都合で先取りしない。
- design notes、実装結果のscreenshot、reviewer出力を、承認済みdesign画像またはユーザー指示の代わりに画面配置・導線・状態表現を決める入力として扱わない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

キャラクターシートの見出しと操作領域を同一React Islandで管理し、後続Gateが接続するヘルプ、JSON、CCFOLIAコピー、初期化、エラー表示の配置・操作状態・アクセシビリティ境界を先に確立する。

## 背景

G23は親Gate planで定めた「操作ペインとモックのコントロールbutton」を担当する。現状の`h1`はAstro側にあり、操作状態を持つReact Islandの外にあるため、desktopでheading横に操作列を置けない。

Gate 22完了後には、`CharacterSheetFormPresenter`配下のフォーム共通style、`CharacterSheetSectionFrameBase`、table表示structure、削除 / clear icon actionを横断して共有化している。G23はこの共有境界を再分岐させず、通常の文言付きbuttonも同じ方針で共通Componentに集約する。

- 親Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` のG23
- 要件: `docs/requirements/character-sheet.md` の初期scope、エラー・警告表示、JSON出力・入力、CCFOLIAコピー、全消去
- アーキテクチャ: `docs/architectures/character-sheet.md` のContainer / Presenter責務、HTML / CSS構造と責務、状態と派生値の境界
- design target: `docs/design/character-sheet/notes.md` の「操作領域」とVRT参照情報
- 関連TODO: G23を直接対象とする項目はない。JSON出力（G26）、JSON入力（G27）、CCFOLIA（G28）、初期化（G29）、ヘルプ（G30）、エラー集約（G25）はこのGateでは回収しない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G23: 操作ペイン`

このissueはG23だけの実装契約である。新しいsessionでも、このissue、親Gate plan、上記SSoTだけで実装を開始できるようにする。

## 実装時のアーキテクチャ遵守

| 適用するarchitecture節                                     | 許可する変更                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 禁止する変更                                                                                                                                                                                                                                                                                                               | 確認するテスト層                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Container / Presenterの責務`                              | `CharacterSheetContainer`でmenuの開閉、trigger ref、focus復帰を保持し、Presenter / `CharacterSheetActionPane`へ表示propsとcallbackを渡す。                                                                                                                                                                                                                                                                                                                                     | ActionPane、Presenter、leaf ComponentからRHF、保存、Clipboard、ファイル、JSON APIへ直接アクセスすること。root横断状態を別storeやPresenterへ複製すること。                                                                                                                                                                  | Component、browser E2E                                                                     |
| `状態と派生値の境界`                                       | menuの開閉とfocus復帰だけを永続化しないIsland UI stateとして扱う。空のエラー表示領域は集約済みerror dataを受け取らない。                                                                                                                                                                                                                                                                                                                                                       | UI stateをRHF値、schema、保存データ、JSONへ含めること。error件数・一覧・button色を派生すること。                                                                                                                                                                                                                           | Component、browser E2E                                                                     |
| `HTML / CSSの構造と責務`（responsive contractを含む）      | Island内のheadingとdesktop操作列、ActionPaneのresponsive表示・floating操作・末尾paddingを、このGateのComponent / CSS Moduleで所有する。通常の文言付きbuttonは`CharacterSheetButton`とそのCSS Moduleで所有し、各section / dialogのCSSは配置だけを持つ。desktop / tablet / mobileの表示切替とbreakpointはPresenter / CSSの同一契約として扱う。`CharacterSheetFormPresenter`の既存共有style、`CharacterSheetSectionFrameBase`、`FormulaTooltip`は責務が一致する範囲で再利用する。 | 既存form sectionの入力・validation・layoutを変更すること。global selector、親要素依存、site共通Header / layoutへのキャラクターシート専用分岐を追加すること。親regionのmin-widthやoverflowを上書きすること。picker、開閉、並べ替え、frame見出し、削除 / clear icon actionを、見た目だけの理由で通常buttonへ置き換えること。 | Component、browser E2E、target限定VRT                                                      |
| `テストアーキテクチャ` / `Character-sheet E2E / VRTの境界` | Component testで表示、accessible name、tooltip、menu開閉、Escape、focus復帰を確認する。browser E2EとVRTのspecは、desktop default、tablet / mobile menu openだけを最小targetとして追加・更新する。                                                                                                                                                                                                                                                                              | Component testへbrowser viewportを持ち込むこと。VRTをtooltip・focus復帰・副作用の検証に使うこと。ユーザーレビュー完了前にE2E / VRTを実行すること。                                                                                                                                                                         | Component（レビュー前）、browser E2E / target限定VRT / actual screenshot（レビュー完了後） |

## 対象範囲

- `/character-sheet/`の`h1`を既存のReact Islandへ取り込み、Astro側に重複した`h1`を残さない。
- `CharacterSheetButton`を、`button`として成立する通常のReact props（`children`、`disabled`、`onClick`、`aria-*`、`data-*`、`ref`を含む）を透過し、未指定時に`type="button"`となる共通Componentとして追加する。呼出し側は必要な場合だけ通常の`type`を明示して上書きできる。
  - `color`は`"muted" | "danger" | "warning" | "default" | undefined`を受け、`undefined`は`"default"`へfallbackする。`default`は既存の通常追加・主要操作と同じaccent color、`muted`はdialogのキャンセルなどの中立操作、`danger`は初期化など破壊的操作、`warning`は通常使用不可カテゴリの追加に使う。`accent` color variantは追加しない。
  - `variant`は`"outline" | "solid" | undefined`を受け、`undefined`は`"outline"`へfallbackする。`outline`は色付き外枠とsurface背景、`solid`は指定colorのfillと反転文字色を使う。dialogのキャンセルは`muted`の`outline`、確定buttonは`default`の`solid`へ接続する。
  - `size`は`"small" | "medium" | undefined`を受け、`undefined`は`"small"`へfallbackする。`small`は既存キャラクターシートの大半の通常button寸法、`medium`はwarning枠の`サイバネを追加`を含むカテゴリ追加button、dialog action、このGateで追加する操作buttonの寸法とする。dialog固有のbutton size / padding / mobile均等幅styleは持たない。
  - `className`は`string | undefined`を受け、base / variant classを保持したまま末尾に合成する。固定幅などの配置上書きは呼出し側CSS Moduleからこのpropへ渡し、親selectorやglobal classで内部buttonを変更しない。
  - `outline` / `solid`以外の見た目variant、`large` size、今回の利用箇所にないpropsは追加しない。必要になったGateで利用例と同時に拡張する。
- 既存の`character-sheet-add-button`を使う文言付き追加button、warningカテゴリ追加button、`CharacterSheetDialogActions`内の文言付き確定 / キャンセルbuttonを`CharacterSheetButton`へ接続する。dialogの確定buttonは`default` / `solid` / `medium`、キャンセルbuttonは`muted` / `outline` / `medium`とし、section / dialog固有CSSはgrid、inline-size、配置だけを残す。
- 上記共通化の対象は通常の文言付きbuttonだけとする。候補picker、詳細 / section開閉、並べ替え、frame見出し、ヘルプ / menuのicon button、`ClearButton`、`DeleteButton`は既存の操作意味・アイコン専用styleを維持し、同一Componentへ機械的に統合しない。
- desktopでは、`h1`の横に文言付きbuttonを左から`ヘルプ`、`エクスポート`、`インポート`、`CCFOLIAコピー`、`初期化`の順で置く。
  - `エクスポート`、`インポート`、`CCFOLIAコピー`には用途を説明するtooltipを付ける。
  - `初期化`だけを`danger` colorで示し、ほかの操作は`default` colorを使う。これらは`medium`の`CharacterSheetButton`とする。
  - このGateの各buttonは視覚・focus・tooltip・操作targetだけを提供するモックであり、データを変更、保存、出力、copy、importしない。
- tablet / mobileでは、画面右端のfloating操作として、上からヘルプicon button、メニューbuttonの順に置く。
  - ヘルプはicon buttonとし、操作のaccessible nameを持つ。
  - メニューbuttonは開閉状態を持ち、開いたときに`エクスポート`、`インポート`、`CCFOLIAコピー`、`初期化`の4操作とエラー表示領域をモックで表示する。4操作はdesktopと同じ`medium`の`CharacterSheetButton`とし、`初期化`だけ`danger` colorとする。
  - メニューbuttonは`aria-expanded`と`aria-controls`で表示領域を関連付け、Escapeで閉じる。閉じた後のfocusはメニューbuttonへ戻す。
  - エラー表示領域は領域・見出し・読み上げ可能な空状態を持つが、既存sectionのerrorを収集、件数化、列挙、メニューbuttonの色へ反映しない。
- tablet / mobileでは、フォームの末尾にfloating icon buttonと同じ高さ以上のbottom paddingを確保し、最終sectionの入力・追加・削除操作が操作領域の下へ隠れないようにする。
- 操作領域の状態、menu trigger、focus復帰をIslandのContainerで保持し、RHF、保存対象、JSON対象へ含めない。
- desktop `1440x1200`、tablet `820x1180`、mobile `390x900`の操作領域を対象に、Component / browser E2E / target限定VRTのspecを追加または更新する。ユーザーレビュー前はComponent test、`npm run build`、必要な`npm run check`だけを実行し、browser E2E、VRT、actual screenshot確認は行わない。レビュー完了のユーザー明示指示後にだけ対象E2E、target限定VRT、actual screenshot確認を実行する。canonical baselineの更新は、比較後にユーザーが明示承認した場合だけ行う。

## 初期スコープ外

- ヘルプ本文・ヘルプdialogの実装はG30で扱う。
- JSON export / importの実処理、ファイル選択、schema、失敗feedbackはG26 / G27で扱う。
- CCFOLIA文字列の生成・Clipboard APIの呼出し・成功失敗通知はG28で扱う。
- 初期化の確認dialog、RHF reset、画像・保存データの削除はG29で扱う。
- エラーの集約、個別エラー一覧、件数、menu triggerのerror色、エラーから該当入力への移動はG25で扱う。
- 通常button以外のpicker、開閉、並べ替え、frame見出し、icon actionの共通化または挙動変更は扱わない。
- site header、site menu drawer、既存sectionの入力・validation・layout、保存・復元、DB、認証、SSR、CMS、新規npm packageは変更しない。
- その他の初期スコープ外項目は`docs/out-of-scope.md`に従う。

## 完了条件

- [ ] `h1`と操作領域を同一React Islandで表示し、Astro側の見出しと重複しない。
- [x] `CharacterSheetButton`が通常のReact button propsとrefを受け渡し、`color`の`undefined`をaccent colorの`default`へ、`variant`の`undefined`を`outline`へ、`size`の`undefined`を`small`へfallbackし、`className`をbase / variant classと合成する。`muted`、`danger`、`warning`、`default`の`outline` / `solid`以外と、`large`は追加しない。
- [x] 既存の文言付き追加button、warningカテゴリ追加button、dialogの文言付きaction buttonが、表示・disabled・focus・既存のsection / dialog配置を保ったまま`CharacterSheetButton`を使う。
- [ ] desktopで指定順の文言付き操作button、3つのtooltip、初期化だけのdanger colorを表示する。
- [ ] tablet / mobileでヘルプicon button、メニューbutton、開閉するモックmenu、4操作、空のエラー表示領域を表示する。
- [ ] tablet / mobileで末尾paddingにより最終操作がfloating操作領域に隠れない。
- [ ] モック操作がフォーム値、画像、保存データ、Clipboard、JSONへ副作用を起こさない。
- [ ] menuの開閉、Escape、focus復帰、tooltip、desktop / tablet / mobileのaccessible nameをComponent testで確認する。
- [ ] ユーザーレビュー完了の明示指示後にだけ、menuの開閉、Escape、focus復帰、tooltip、desktop / tablet / mobileのaccessible nameを対象browser E2Eで確認する。
- [ ] ユーザーレビュー完了の明示指示後にだけ、操作領域のdesktop default、tablet / mobileのmenu openをtarget限定VRTとactual screenshotで確認する。
- [ ] canonical baselineは上記比較後にユーザーが明示承認した場合だけ更新し、更新有無と理由を記録する。
- [ ] `npm run build` と必要な`npm run check`が通る。

## チェックポイント

- [ ] 既存の`/character-sheet/` routeとGitHub Pages subpath公開を壊していない。
- [ ] desktop、tablet、mobileでheading、操作順、menuの表示領域、末尾操作の到達性、横overflowを確認する。
- [ ] 操作状態をRHFや永続化値へ混在させず、後続Gateが個別の副作用を接続できる責務境界を保つ。
- [ ] `CharacterSheetDialog`、`CharacterSheetButton`、既存の削除 / clear icon action、`FormulaTooltip`を責務が一致する範囲で再利用し、tooltip / dialog / menu / 通常buttonの構造とstyleを重複実装しない。
- [ ] `CharacterSheetButton`の呼出し側CSSが配置上書きだけを持ち、Component内部へ親selector、global class、要素selectorで依存していない。
- [ ] 不要な依存関係を追加していない。
- [ ] G25〜G30と関連する`docs/TODO.md`項目の範囲を先取りしていない。
- [ ] `docs/design/character-sheet/notes.md`の操作領域・VRT境界と矛盾していない。
- [ ] ユーザーレビュー前はE2E / VRTを実行せず、既定portのdev serverだけを起動して確認を待つ。レビュー完了のユーザー明示指示後に、対象E2E、target限定VRT、actual screenshot確認へ進む。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/pages/character-sheet.astro`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.tsx`
- `src/character-sheet/components/CharacterSheetActionPane.module.css`
- `src/character-sheet/components/CharacterSheetButton.tsx`
- `src/character-sheet/components/CharacterSheetButton.module.css`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.module.css`
- `src/character-sheet/components/{BuildSection,ChecksSection,ProfileSection,SpecialItemsSection,CyberneticsSection,DrugsSection,OmamoriSection,WeaponsAndArmorSection}.tsx`
- `src/character-sheet/components/skills/SkillSection.tsx`
- `src/character-sheet/components/dialogs/{CharacterSheetDialog,CharacterImageErrorDialog,SkillSelectionChangeConfirmDialog,SpecialItemCategoryRemoveConfirmDialog}.tsx`
- `src/character-sheet/components/dialogs/CharacterSheetDialog.module.css`
- `src/character-sheet/components/FormulaTooltip.tsx`
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/CharacterSheetButton.test.tsx`
- `tests/components/character-sheet/CharacterSheetActionPane.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- desktopのheading横操作列とtablet / mobileのfloating操作が、最新のユーザー指定とdesign画像のviewport別意図を満たすか。
- G23のモックが、G25〜G30の実処理・エラー集約を先取りせず、接続可能な責務境界を残しているか。
- 通常の文言付きbuttonだけを共通化し、Gate 22以降の共有style / shared Componentの境界と、既存のicon・picker・開閉操作の専用契約を壊していないか。
- `color`、`variant`、`size`、`className`、通常button propsのfallback・透過契約が、`default`のaccent color、`muted`、`danger`、`warning`、`outline` / `solid`、small / mediumだけで後続Gateの操作buttonと既存の追加 / dialog actionを重複実装なしに扱えるか。
- 空のエラー表示領域の読み上げと、未実装のエラー集約を誤認させない表示が適切か。
- `h1`をIslandへ移すことで、見出し階層、ページSEO、Astroの静的shell、subpath公開を損なわないか。
- VRTを操作領域のdesktop defaultとtablet / mobile menu openへ限定する方針と、baseline更新をユーザー承認待ちにする前提が適切か。

## 備考

- ユーザー指示に従い、新規branchは作成せず、現行branch `ex-02-web-character-sheet`で作業する。
- Gate 22後のdesign横断修正とshared refactorを確認し、共通Component化は`CharacterSheetFormPresenter`配下の通常の文言付きbuttonへ限定する。`CharacterSheetActionButton`、`ClearButton`、`DeleteButton`のicon action契約は維持する。
- `.raw/contents/`にはキャラクターシートに対応する入力Markdownがないため、可視構成の優先順位はユーザーの最新指示、承認済みdesign draft、design notes、要件、既存実装の順とする。
- このissue作成時点で`docs/design/character-sheet/notes.md`は操作領域とVRT参照情報を持つため、`design-image-generation`の追加実行を実装前提にしない。canonical baseline更新は実装後にユーザーが明示承認した場合だけ行う。
