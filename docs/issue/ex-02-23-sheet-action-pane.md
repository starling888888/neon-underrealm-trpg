# ex-02-23-sheet-action-pane

## 最優先のデザイン入力

- 実装時に、`.tmp/design/character-sheet/desktop.png`、`tablet-menu.png`、`mobile-menu.png`の承認済みdesign画像を遵守する。
- ユーザーの最新指示は、画像デザインと既存実装UIを上書きする。特に、desktopのheading横の操作列とエラー集約の空表示、tablet / mobileの右下に横並びで置くヘルプ・メニューbutton、メニュー内のモック操作をこのissueの表示契約とする。
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

| 適用するarchitecture節                                     | 許可する変更                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 禁止する変更                                                                                                                                                                                                                                                                                                                                                           | 確認するテスト層                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `Container / Presenterの責務`                              | `CharacterSheetContainer`でmenuの開閉、trigger ref、focus復帰を保持し、Presenter / `CharacterSheetActionPane`へ表示propsとcallbackを渡す。                                                                                                                                                                                                                                                                                                                          | ActionPane、Presenter、leaf ComponentからRHF、保存、Clipboard、ファイル、JSON APIへ直接アクセスすること。root横断状態を別storeやPresenterへ複製すること。                                                                                                                                                                                                              | Component                            |
| `状態と派生値の境界`                                       | menuの開閉とfocus復帰だけを永続化しないIsland UI stateとして扱う。空のエラー表示領域は集約済みerror dataを受け取らない。                                                                                                                                                                                                                                                                                                                                            | UI stateをRHF値、schema、保存データ、JSONへ含めること。error件数・一覧・button色を派生すること。                                                                                                                                                                                                                                                                       | Component                            |
| `HTML / CSSの構造と責務`（responsive contractを含む）      | Island内のheading、desktop操作列とエラー集約の空表示、ActionPaneのresponsive表示・floating操作を、このGateのComponent / CSS Moduleで所有する。通常の文言付きbuttonは`CharacterSheetButton`とそのCSS Moduleで所有し、各section / dialogのCSSは配置だけを持つ。desktop / tablet / mobileの表示切替とbreakpointはPresenter / CSSの同一契約として扱う。`CharacterSheetFormPresenter`の既存共有styleと`CharacterSheetSectionFrameBase`は責務が一致する範囲で再利用する。 | 既存form sectionの入力・validation・layoutを変更すること。global selector、親要素依存、site共通Header / layoutへのキャラクターシート専用分岐を追加すること。親regionのmin-widthやoverflowを上書きすること。picker、開閉、並べ替え、frame見出し、削除 / clear icon actionを、見た目だけの理由で通常buttonへ置き換えること。`FormulaTooltip`のAPI・styleを変更すること。 | Component                            |
| `テストアーキテクチャ` / `Character-sheet E2E / VRTの境界` | Component testで表示、accessible name、menu開閉、Escape、focus復帰を確認する。browser E2Eでdesktopのモック操作の無副作用とtablet / mobileのmenu開閉を確認する。VRTで操作ペインのdesktop、tablet、mobile状態を追加し、既存の`@character-sheet` full-page、section、dialogのcanonical baselineをユーザー承認済みの現行画面へ更新する。                                                                                                                                | Component testへbrowser viewportを持ち込むこと。VRTをfocus復帰・副作用の検証に使うこと。未承認でcanonical baselineを更新すること。                                                                                                                                                                                                                                     | Component / browser E2E / target VRT |

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
  - `初期化`だけを`danger` colorで示し、ほかの操作は`default` colorを使う。これらは`medium`の`CharacterSheetButton`とする。
  - `初期化`の横に、空状態`エラーはありません。`または後続Gateで接続する`エラーがN件あります。`と、smallの`確認` buttonを1行に収める固定幅のエラーstatus領域を置く。status領域はerror件数の増減で操作列を縦方向へ移動させない。既存sectionのerrorは集約しない。
  - このGateの各buttonは視覚・focus・操作targetだけを提供するモックであり、データを変更、保存、出力、copy、importしない。
- tablet / mobileでは、画面右下のfloating操作として、左にヘルプicon button、右にメニューbuttonを横並びで置く。
  - ヘルプは`?`だけを可視contentに持つicon buttonとし、操作のaccessible nameを持つ。丸い`?` iconをbutton内へ重ねない。
  - メニューbuttonは開閉状態を持ち、開いたときに`エクスポート`、`インポート`、`CCFOLIAコピー`、`初期化`の4操作とエラー表示領域をモックで表示する。4操作はdesktopと同じ`medium`の`CharacterSheetButton`とし、`初期化`だけ`danger` colorとする。
  - メニューbuttonは`aria-expanded`と`aria-controls`で表示領域を関連付け、Escapeで閉じる。閉じた後のfocusはメニューbuttonへ戻す。
  - menuはfloating操作列の直上に余分な縦方向の間隔を作らずに表示する。開いている間のmenu buttonは`×` iconへ切り替え、同じbuttonで閉じる。backdropや外側clickによるdismissは追加しない。
  - エラー表示領域は領域・見出し・読み上げ可能な空状態`エラーはありません。`を持つが、既存sectionのerrorを収集、件数化、列挙、メニューbuttonの色へ反映しない。
- tablet / mobileのフォーム末尾へ、floating操作を避けるためだけの追加bottom paddingは入れない。Footerがある通常のページ余白を維持する。
- 操作領域の状態、menu trigger、focus復帰をIslandのContainerで保持し、RHF、保存対象、JSON対象へ含めない。
- desktop `1440x1200`、tablet `820x1180`、mobile `390x900`の操作領域をComponent test、browser E2E、VRTの表示・操作契約として実装する。ユーザー明示承認により、既定portのpreview serverで`@character-sheet` targetのactual screenshotを確認し、full-page、buttonを含むsection、dialog、操作ペインのcanonical baselineを更新する。

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

- [x] `h1`と操作領域を同一React Islandで表示し、Astro側の見出しと重複しない。
- [x] `CharacterSheetButton`が通常のReact button propsとrefを受け渡し、`color`の`undefined`をaccent colorの`default`へ、`variant`の`undefined`を`outline`へ、`size`の`undefined`を`small`へfallbackし、`className`をbase / variant classと合成する。`muted`、`danger`、`warning`、`default`の`outline` / `solid`以外と、`large`は追加しない。
- [x] 既存の文言付き追加button、warningカテゴリ追加button、dialogの文言付きaction buttonが、表示・disabled・focus・既存のsection / dialog配置を保ったまま`CharacterSheetButton`を使う。
- [x] desktopで指定順の文言付き操作button、初期化だけのdanger color、固定幅のエラーstatus領域を表示する。
- [x] tablet / mobileでヘルプicon button、メニューbutton、開閉するモックmenu、4操作、空のエラー表示領域を表示する。
- [x] tablet / mobileでヘルプ・メニューbuttonを横並びにし、フォーム末尾へfloating操作用の追加bottom paddingを入れない。
- [x] モック操作がフォーム値、画像、保存データ、Clipboard、JSONへ副作用を起こさない。
- [x] menuの開閉、Escape、focus復帰、desktop / tablet / mobileのaccessible nameをComponent testで確認する。
- [x] browser E2Eでdesktopのモック操作の無副作用とtablet / mobileのmenu開閉を確認する。
- [x] VRTでdesktopの操作ペイン、tablet / mobileのfloating controls・開いたmenuを追加し、`@character-sheet`のfull-page、buttonを含むsection、dialogのcanonical baselineを更新する。
- [x] target VRTのactual screenshotをdesktop、tablet、mobileの各追加状態で確認する。
- [x] `npm run build` と必要な`npm run check`が通る。

## チェックポイント

- [x] 既存の`/character-sheet/` routeとGitHub Pages subpath公開を壊していない。
- [x] desktop、tablet、mobileでheading、操作順、menuの表示領域、末尾操作の到達性、横overflowを確認する。
- [x] 操作状態をRHFや永続化値へ混在させず、後続Gateが個別の副作用を接続できる責務境界を保つ。
- [x] `CharacterSheetDialog`、`CharacterSheetButton`、既存の削除 / clear icon actionを責務が一致する範囲で再利用し、dialog / menu / 通常buttonの構造とstyleを重複実装しない。`FormulaTooltip`は変更前の契約へ戻す。
- [x] `CharacterSheetButton`の呼出し側CSSが配置上書きだけを持ち、Component内部へ親selector、global class、要素selectorで依存していない。
- [x] 不要な依存関係を追加していない。
- [x] G25〜G30と関連する`docs/TODO.md`項目の範囲を先取りしていない。
- [x] `docs/design/character-sheet/notes.md`の操作領域・VRT境界と矛盾していない。
- [x] 既定portのpreview serverでtarget E2E / VRTを実行し、baseline更新後の通常比較を通す。
- [x] ユーザーの未コミット変更を破壊していない。

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
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/CharacterSheetButton.test.tsx`
- `tests/components/character-sheet/CharacterSheetActionPane.test.tsx`
- `tests/components/character-sheet/CharacterSheetContainer.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`
- `docs/design/character-sheet/notes.md`

## レビュー観点

- desktopのheading横操作列とtablet / mobileのfloating操作が、最新のユーザー指定とdesign画像のviewport別意図を満たすか。
- G23のモックが、G25〜G30の実処理・エラー集約を先取りせず、接続可能な責務境界を残しているか。
- 通常の文言付きbuttonだけを共通化し、Gate 22以降の共有style / shared Componentの境界と、既存のicon・picker・開閉操作の専用契約を壊していないか。
- `color`、`variant`、`size`、`className`、通常button propsのfallback・透過契約が、`default`のaccent color、`muted`、`danger`、`warning`、`outline` / `solid`、small / mediumだけで後続Gateの操作buttonと既存の追加 / dialog actionを重複実装なしに扱えるか。
- 空のエラー表示領域の読み上げと、未実装のエラー集約を誤認させない表示が適切か。
- `h1`をIslandへ移すことで、見出し階層、ページSEO、Astroの静的shell、subpath公開を損なわないか。
- browser E2Eで、desktopの操作がモックのままフォーム値を変えず、tablet / mobileでmenuの開閉・Escape・focus復帰を保つか。
- `@character-sheet`のfull-page、buttonを含むsection、dialogのcanonical baseline更新後に通常VRT比較が通るか。

## ユーザーレビュー指摘（2026-07-30）

1. `エクスポート`、`インポート`、`CCFOLIAコピー`のtooltipは実装しない。`FormulaTooltip`への拡張は破棄して既存契約へ戻す。
2. desktopでも、操作列の下にエラー集約のモック表示領域を常時表示する。実集約はG25へ残し、空状態の文言は`エラーなし`とする。
3. tablet / mobileのfloating操作は右下で横並びとし、左をヘルプ、右をメニューにする。ヘルプbuttonの可視contentは`?`だけとし、丸い`?` iconを重ねない。
4. Footerがあるため、floating操作を避けるためだけのform末尾bottom paddingは追加しない。
5. tablet / mobileのmenuはfloating操作列の直上に表示し、開いている間のmenu buttonは`×` iconへ切り替える。backdropによるdismissは不要とする。
6. desktopのエラー領域は操作列の下へ増やさず、`初期化`の横に固定幅で置く。空状態は`エラーはありません。`、後続Gateで接続するエラー状態は`エラーがN件あります。`とし、smallの`確認` buttonを含める。
7. 実装後はproduction buildと4321番portのpreview serverを使い、browser E2EとVRTを作成・実行する。今回変更の影響を受けるfull-page、buttonを表示する領域、dialogのcanonical baselineを更新する。

## ビジュアルレビュー 1（2026-07-30）

- 対象: `/character-sheet/`、desktop `1440x1200`、tablet `820x1180`、mobile `390x900`。
- actual screenshot: full-page default 3 viewportと、`action-pane-desktop`、`action-controls`（tablet / mobile）、`action-menu-open`（tablet / mobile）をoriginal pixelで確認した。
- 結果: desktopはheading横の操作列と固定幅のエラーstatusが1行に収まり、tablet / mobileは`?`とmenu buttonが横並びで、開いたmenuがcontrolsの直上に表示される。横overflow、Footerとの不自然な余白は確認されなかった。
- canonical baseline: ユーザー承認により`@character-sheet`のfull-page、section、dialogを更新し、180件の通常VRT比較が通過した。local canonical snapshotは180枚である。

## 備考

- ユーザー指示に従い、新規branchは作成せず、現行branch `ex-02-web-character-sheet`で作業する。
- Gate 22後のdesign横断修正とshared refactorを確認し、共通Component化は`CharacterSheetFormPresenter`配下の通常の文言付きbuttonへ限定する。`CharacterSheetActionButton`、`ClearButton`、`DeleteButton`のicon action契約は維持する。
- `.raw/contents/`にはキャラクターシートに対応する入力Markdownがないため、可視構成の優先順位はユーザーの最新指示、承認済みdesign draft、design notes、要件、既存実装の順とする。
- このissue作成時点で`docs/design/character-sheet/notes.md`は操作領域とVRT参照情報を持つため、`design-image-generation`の追加実行を実装前提にしない。canonical baseline更新は実装後にユーザーが明示承認した場合だけ行う。
