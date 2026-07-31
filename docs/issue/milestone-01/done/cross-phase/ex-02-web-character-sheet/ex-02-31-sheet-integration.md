# ex-02-31-sheet-integration

> 履歴注記: このissueは、当時の実装・design・仕様を基準に完了済みとする。以後のdesignまたは仕様変更には追従せず、変更が必要な場合は後続issueで扱う。

## 最優先のデザイン入力

- 本GateでGit管理から外す「デザイン正本」は、`canonical-snapshots/visual/` 配下のPlaywright canonical VRT baselineを指す。`docs/design/**/notes.md` のテキストによるdesign intentは削除対象ではない。
- baseline削除後、全VRT targetを現行の承認済み画面とユーザーの最新指示から再生成する。再生成されたlocal-only baselineは最終UI Reviewの画像入力であり、アプリケーションUIを新たに設計する入力ではない。
- UIの見た目を変更するのは、最終UI Reviewで具体的な不統一または使いにくそうな表現が確認され、ユーザーがその対応を承認した場合だけとする。操作性、focus、ARIAの再設計をこのGateで補完しない。

## 目的

G30を含むキャラクターシート実装を最終統合し、責務を守るテストとレンダリング境界へ整理する。全canonical VRT baselineをGit管理から外してlocal-onlyで再生成し、限定したTech ReviewとUI Reviewで、仕様矛盾・クライアント実行時エラー・デザインの統一性を確認する。

## 背景

親issueの最後の統合Gateである。ユーザーは、E2Eの責務逸脱の是正、ゲームドメイン用語を含むdictionaryの整理、FormValue周辺の参照安定化を指定した。また、画像であるcanonical VRT baselineをGit管理せず、既存分を一度削除して全ページを再生成する方針を指定した。

参照正本:

- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/out-of-scope.md`
- `docs/TODO.md` のG31関連項目
- `docs/design/**/notes.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `.agents/rules/data-management.md`
- `tests/visual/README.md`

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- Gate: `G31: 最終統合`

G30のヘルプ本文がユーザー承認・実装・確認され、G30の完了記録が親Gate planへ戻るまでG31の実装を開始しない。

## アーキテクチャ実装契約

`docs/architectures/character-sheet.md` の次の節を適用する。要件・design・このissueと当該節が矛盾した場合は、実装を開始せずに正本またはユーザー判断で解消する。

| 適用節                             | 許可する変更                                                                                                                  | 禁止する変更                                                                                                                 | 確認するテスト層                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Feature境界`                      | `src/character-sheet/dictionary.ts`内のゲーム用語と画面文言を分類し、feature内の参照を整理する。                              | feature外への移動、ゲームデータ由来の名称・効果文のdictionary化、表示文言の変更。                                            | Node、Component、Hook                 |
| `Container / Presenterの責務`      | Presenter / section props hookの派生ViewModelとcallbackの参照安定化、error summaryのprops境界の整理。                         | Containerへのdomain logic追加、PresenterによるRHF・マスタ検索・browser API直接利用、UI導線の変更。                           | Hook、Component                       |
| `状態と派生値の境界`               | RHF FormValueを入力とする`useMemo` / `useCallback`と、その参照安定性の検証。                                                  | FormValueの別store複製、保存形式・reset・field array契約・ゲーム算出式の変更。                                               | Hook、Node                            |
| `テスト層と配置`、`責務ごとの検証` | `tests/visual/character-sheet.spec.ts`をbrowser-onlyのsmokeへ縮小し、重複した検証を既存のNode / Component / Hook testへ置く。 | 製品コードへE2E専用のstate・属性を追加すること、VRTへ固定値・算出・validationを移すこと。                                    | Node、Component、Hook、Playwright E2E |
| `Character-sheet E2E / VRTの境界`  | character-sheet専用VRT helperとlocator-only capture経路を整理し、全targetのlocal-only baselineを再生成する。                  | static page VRT helper・specへcharacter-sheet固有stateを追加すること、locator-only stateへfull-page baselineを強制すること。 | Playwright VRT、actual screenshot     |

最終diffは上表の節・許可範囲・確認テスト層へ対応付け、説明できない共有境界の変更は取り込まない。

## 対象範囲

### 1. 最終リファクタ

- E2Eの責務逸脱を最重要観点として確認する。`docs/architectures/character-sheet.md`が定める「各Gateの最終smoke」「領域表示と2〜3個の代表的なbrowser操作」という責務に照らし、詳細な個別シナリオをE2Eへ実装しすぎていないかを判定する。実ブラウザでしか保証できない主要導線以外は、純粋logic、schema、Component、hookの対応層へ戻す。
- `dictionary`を用途別に整理する。`BT強度`などゲームドメインの語彙と、汎用UI文言・操作文言を混同させず、ゲーム用語の表示文言と既存の可視文言を保持する。
- FormValueを読むPresenter / section props hookの派生ViewModelとcallbackを、実際にmemo化するprops境界で`useMemo` / `useCallback`により安定化する。無差別なmemo化は行わず、無関係なUI state更新で対象propsが不要に変わらないことをhook / Component testで確認する。
- G25のerror summaryと、既存TODOの`useCharacterSheetFormPresenterProps`について、memo化対象のprops境界全体で参照等価性が機能することを確認する。

E2E整理の変更対象は`tests/visual/character-sheet.spec.ts`だけとする。既存のspecから残すbrowser-only導線と、E2Eから外す重複検査は以下のとおりとする。

| 区分        | 対象test / 対象群                                                                                                                                                                     | G31後にE2Eで保証するもの                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 維持・統合  | `exports JSON from desktop and responsive action buttons`、`opens the titleless CCFOLIA confirmation dialog from every action pane`、`notifies CCFOLIA clipboard success and failure` | desktop / responsive action paneからの実browser download / Clipboard導線。確認dialogの個別表示・focusはComponent testへ残す。                                    |
| 維持        | `replaces form values from JSON and reports an invalid imported image`                                                                                                                | File input、FileReader、画像browser adapterにまたがるJSON import導線。form値・schema・局所errorの詳細はNode / Hook / Component testへ残す。                      |
| 維持        | `uses a menu rail only when the one-column sheet has enough width`、`uses a header menu on mobile and keeps subpath links`、`marks the page as excluded from the Pagefind index`      | character-sheet routeのresponsive menu / GitHub Pages subpath / Pagefind除外というページ固有browser契約。                                                        |
| E2Eから除去 | 保存復元、固定サイバネerror、スキル選択、流儀変更、section開閉、profile・副能力値・判定・非戦闘技能・縁、error summary、武器・防具・専用アイテム各操作を検査する残りのnamed test      | 既存または同Gateで補うNode / Component / Hook testだけで検証する。browser固有の副作用またはroute契約が残る場合は、除去せずこのissueへ理由と最小smokeを追記する。 |

### 2. canonical VRT baselineのlocal-only化と全件再生成

- Git管理中の`canonical-snapshots/visual/**`を対象一覧・件数・対象外を事前確認してから削除し、同ディレクトリ全体を`.gitignore`へ追加する。生成物は再びGit indexへ加えない。
- 明示承認済みの全件実行として、全VRT targetを`npm run visual:update`で再生成する。新しいbaselineはlocal-onlyの比較入力として保持し、更新後に全件`npm run visual:test`を実行する。
- Playwrightのsnapshot参照先、target / state / viewportの対応、locator-only stateのcapture-only経路を確認し、locator-only stateがfull-page baselineを要求しないことを確認する。
- baseline運用の変更を`docs/design/README.md`、`.agents/rules/data-management.md`、`tests/visual/README.md`、必要最小限の関連design notesへ反映する。テキストのdesign intentとactual screenshotの役割を混同しない。
- VRT比較はglobalな`maxDiffPixelRatio`を持たず厳密に行う。環境由来の差分が再現する場合だけ、該当targetへ実測に基づく最小の`maxDiffPixels`または動的領域のmaskを設定し、根拠をcurrent issueまたはdesign notesへ残す。

### 3. 最終Tech Review

- PR全体の最終差分を、`gpt-5.6-sol` / `xhigh`でレビューする。
- 現行の要件・子issue・ユーザー指示との仕様矛盾、およびクライアント実行時エラーになり得るものだけを重要度判定の対象にする。
- アーキテクチャ、細かなfocus、アクセシビリティ、一般的な改善提案は対象外とする。
- 有効な指摘はcurrent issueへ照合・記録し、修正後に同じ限定観点で再確認する。

### 4. 最終UI Review

- 第2節で再生成したlocal-only baselineを入力に、全ページ・対象state・viewportでデザインの統一性と、見た目から使い勝手が良さそうに見えるかをレビューする。
- 操作性、keyboard操作、focus、ARIA、screen reader属性、リンク到達性はレビュー対象外とする。キャラクターシートの操作可能性はG30のコンテンツレビューを再利用し、再判定しない。
- desktopとmobileの視点を分けたreviewer入力を用意し、画像名、HTML、DOM、CSS、ARIA属性を判断材料にしない。結果は一時review artifactへ保存し、修正の必要性はユーザーへ提示して判断を待つ。

### 5. 完了記録と回帰確認

- `npm run check`、`npm run build`、対象Component / hook / Node test、整理後の`npm run test:e2e`、全件VRT比較を実行する。
- 画面変更が発生した場合は、対象route・state・viewportのactual screenshotを開き、issueの表示契約と照合する。
- G31に紐づくTODOは、対応済み・条件付きで後続化・対象外のいずれかを根拠とともに記録する。

## 初期スコープ外

- G30の未承認ヘルプ本文を作成・実装しない。
- ルール、ゲームデータ、FormValueの保存形式、JSON / CCFOLIA出力形式、ゲーム算出式を変更しない。
- 新しい依存package、画面機能、サーバー機能、認証、クラウド保存、VRT以外のCI workflowを追加しない。
- デザイン意図のテキスト文書、`.tmp/design/`の対話用draft、Visual Review actual artifactをcanonical VRT baselineと混同して削除・Git管理しない。
- ユーザー承認なしに、UI Reviewの指摘を実装へ反映しない。
- `docs/issue/milestone-01/plan.md`の完了チェックを更新しない。

## 完了条件

- [x] G30が完了し、その確定事項が親Gate planへ記録されている。
- [x] キャラクターシートアーキテクチャのE2E責務と全named E2E scenarioを照合し、詳細シナリオの実装過多を解消している。
- [x] browser-onlyの主要導線だけをE2Eで確認している。
- [x] dictionaryでゲームドメイン用語と汎用UI文言が整理され、可視文言を変えていない。
- [x] FormValue周辺のmemo化対象propsとcallbackが参照安定化され、無関係な更新に対する契約をテストしている。
- [x] `canonical-snapshots/visual/**` のGit管理を解除し、local-onlyのignore規則を確認している。
- [x] 全VRT targetのbaselineを再生成し、全件比較が通る。
- [x] locator-only stateがcanonical full-page baselineを要求しない。
- [x] 最終Tech Reviewを指定の限定観点で完了し、有効な指摘を解消またはユーザー判断へ戻している。
- [x] 最終UI Reviewを指定の限定観点で完了し、結果と未対応の判断を記録している。
- [x] 関連TODOを扱った結果または未対応理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

- [x] 整理後の`npm run test:e2e`が通る。

## チェックポイント

- [x] Git削除対象は`canonical-snapshots/visual/**`だけであり、対象外のGit管理ファイルとユーザーの未コミット変更を破壊していない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] baseline運用の記述が`docs/design/`、data-management rule、Visual Test READMEで矛盾していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] 画面変更があれば、actual screenshotを開いて表示契約を確認している。

## 想定変更ファイル

- `src/character-sheet/**`
- `tests/node/character-sheet/**`
- `tests/component/character-sheet/**`
- `tests/e2e/**`
- `tests/visual/**`
- `canonical-snapshots/visual/**`（Git管理から削除し、local-onlyで再生成）
- `.gitignore`
- `docs/design/README.md`
- `docs/design/**/notes.md`（運用記述が必要なtargetだけ）
- `.agents/rules/data-management.md`
- `tests/visual/README.md`
- `docs/TODO.md`（G31関連TODOの結果記録が必要な場合のみ）
- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`（Gate完了時の確定事項だけ）

## レビュー観点

- キャラクターシートアーキテクチャの「最終smoke」責務に照らして、詳細なE2E scenarioを実装しすぎていないか。E2Eの境界、dictionaryのゲーム用語分類、FormValue propsのmemo化が、振る舞いを変えずに検証可能な責務整理になっているか。
- tracked canonical snapshotの削除範囲と、ignore後の全件再生成・比較手順が安全か。
- 最終Tech Reviewが仕様矛盾とクライアント実行時エラーだけに絞られているか。
- 最終UI Reviewがデザイン統一性と視覚的な使いやすさだけを扱い、G30の操作性レビューを重複させていないか。

## 備考

- branchは既存の`ex-02-web-character-sheet`を継続使用する。新規branchは作成しない。
- Git操作、削除、baseline再生成、実装、reviewer起動は、ユーザーがこのissueを承認した後に行う。

## レビュー指摘 1

### 指摘事項

- `otherRyugiSkills.rows`が存在しない`ryugiRowId`を参照する復元データを、行の除外だけで部分復元している。
- その他流儀の唯一のスキル行が未知IDの場合、除外後に最低1行を補っていない。
- `BondsSection`、`CyberneticsSection`、`IkizamaSkillsSection`、`OtherRyugiSkillsSection`、`WeaponsAndArmorSection`へ渡す派生propsとcallbackが、無関係な更新でも再生成される。

### 判定

- source: local-agent
- classification: valid（指摘1は仕様変更候補）
- local validation: `docs/requirements/character-sheet.md`の保存・復元契約は、関連行参照を保てない場合の全体失敗と、その他流儀ごとの最低1行を定める。`character-sheet-persistence.ts`は前者を除外して成功させ、後者を補完していない。各section props hookは`memo`化済みComponentへ渡すobject・callbackを無条件に新規生成しており、G31の参照安定化契約と矛盾する。
- 指摘1のユーザー判断: 一部の関連行参照を保てないだけで復元全体を失敗させると使いにくいため、行を除外して残りを復元する現行動作を許容する仕様変更候補とする。要件本文を変更する場合だけ、対応方針とテストを確定する。

### 対応方針

- 指摘1は仕様変更候補として保留し、現行の部分復元を変更しない。要件変更の承認後に、JSON importと端末内復元の期待値を更新する。
- 未知のその他流儀skill IDを除外した後、各有効なその他流儀に空行を最低1行補う。
- 実際に`memo`化済みsectionへ渡すprops境界だけを`useMemo` / `useCallback`で安定化し、無関係な更新でidentityが変わらないhook testを追加する。

### 対応完了チェックリスト

- [x] 指摘1の復元方針を要件変更として確定し、JSON import・端末内復元の期待値を更新する。
- [x] 未知のその他流儀skillを除外しても、各有効流儀の最低1行を維持する。
- [x] 対象section propsが無関係な更新で参照安定を維持する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- `useCharacterSheetErrorSummary`が毎renderで新しいsummary objectとerrors配列を返す。
- `DrugsSection`を含むsection props hook、画像callback、`imageState`、`profileSection`が、Containerのdialog・menuなどフォーム外stateだけを更新しても再生成される。
- 既存のidentity testは一部のskill sectionだけを対象とし、error summary、profile、Bonds、Ikizama、Other Ryugi、Drugsと、Container local state更新を確認していない。

### 判定

- source: browser-draft
- classification: valid
- local validation: `useCharacterSheetErrorSummary`は集計関数を直接returnし、`useDrugsSectionProps`はrenderごとに作る重複IDの`Set`へ依存する。root stateの画像操作は通常関数として返され、Containerの`imageState`とprofile propsへ伝播する。これはG31が完了条件とする、無関係なUI state更新に対するPresenter propsの参照安定化と一致しない。

### 対応方針

- `memo`化済みComponentへ渡る実際の境界だけを対象に、error summary、section props、画像stateを安定化する。全hookへの機械的なmemo化は行わない。
- Containerのdialogまたはmenu stateだけを変更するtestで、影響を受けないPresenter propsとerror summaryのidentityを確認する。

### 対応完了チェックリスト

- [x] error summaryと影響するsection / profile propsがフォーム外state更新で参照安定を維持する。
- [x] Container local state更新を起点とするidentity testを追加する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 3

### 指摘事項

- `form.reset()`後、`defaultValue`だけを渡すuncontrolledな数値入力がRHFの復元値へ同期せず、画面表示と内部状態が乖離する。
- 端末内復元またはJSON importが生き様IDを変えると、`useIkizamaSkillsSectionProps`の監視effectが復元済みの生き様bonus Lvを`1`へ上書きする。
- 端末内復元またはJSON importがサイバネの埋め込み段階を変えると、`useCyberneticsSectionProps`の監視effectが復元済みの非戦闘技能修正を標準値で上書きする。

### 判定

- source: browser-draft
- classification: valid
- local validation: reviewのsource commit `3608d50`以降は文書・VRT設定だけが変更されており、対象sourceは一致する。`BuildSection`、`ProfileSection`、`BondsSection`、副能力値・判定・アイテム修正欄などは`defaultValue`を使うuncontrolled inputで、`form.reset()`の値変更をDOMへ同期しない。生き様skills hookは初期の生き様IDと復元後のID差分を区別せずbonus Lvを`1`へsetする。サイバネhookも初期導出値との差分を区別せず全非戦闘技能修正をsetする。いずれも保存・復元要件の全入力復元および自動補正禁止に反する。

### 対応方針

- reset、端末内復元、JSON import後に数値入力のDOM値とRHF値が同じになる共通境界を定め、既存のuncontrolled inputであっても復元値を表示できるようにする。
- 生き様bonus Lvと非戦闘技能修正の再設定は、復元ではなくユーザーによる対応入力の変更時だけに限定する。
- 端末内復元、JSON import、全初期化後の表示値と、復元後に編集した値がRHFへ反映されることをテストで固定する。

### 対応完了チェックリスト

- [x] 端末内復元、JSON import、全初期化後の数値input表示とRHF値が一致する。
- [x] 復元後の数値input再編集が旧表示値をRHFへ戻さない。
- [x] 生き様bonus Lvが端末内復元・JSON importで保持され、ユーザー操作の生き様変更時だけ`1`へ戻る。
- [x] サイバネ段階と個別非戦闘技能修正が端末内復元・JSON importで保持され、ユーザー操作による段階変更時だけ標準修正を再設定する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 4

### 指摘事項

- 同一のサイバネ埋め込み段階内でユーザー操作を行った後、同期フラグが残留し、JSON importの個別非戦闘技能修正を標準修正で上書きし得る。
- サイバネカテゴリ削除はサイバネ値を初期値へ直接更新するため、埋め込み段階を跨いでも全非戦闘技能修正を標準修正へ再設定しない。
- 未知のその他流儀skillを除外した後に追加する空行の`rowId`が、別の既存skill行の`rowId`と衝突し得る。

### 判定

- source: browser-draft (`.tmp/chatgpt-review.md`)
- classification: valid
- local validation: `useCyberneticsSectionProps`はユーザー操作で同期フラグを立てる一方、導出された標準修正が同一ならeffectを実行しないため、次の`reset`までフラグが残る。`useSpecialItemsSectionProps`のサイバネカテゴリ削除はcybernetics値を直接初期化し、このユーザー起点の段階変更を同期対象へ伝えない。さらに復元schemaはtransform後の`otherRyugiSkills.rows`全体のrow IDを再検証せず、固定形式の補完IDも既存IDとの衝突を避けていない。いずれも保存・復元とサイバネ段階変更の契約、または可変行identity契約に反する。

### 対応方針

- サイバネ操作の同期要求は、段階が変わらない場合にも消費し、復元処理へ持ち越さない。カテゴリ削除もユーザー起点のサイバネ段階変更として同じ境界へ接続する。
- 補完するその他流儀skill行は、残る全行の`rowId`と衝突しないIDを生成し、復元結果のidentityをテストで保証する。
- 同一段階内のサイバネ操作後にJSON importするケース、カテゴリ削除で段階を跨ぐケース、補完ID衝突ケースを追加する。

### 対応完了チェックリスト

- [x] 同一段階内のサイバネ操作後でも、端末内復元・JSON importの個別非戦闘技能修正を保持する。
- [x] サイバネカテゴリ削除で段階を跨いだ場合、全非戦闘技能修正を標準修正へ再設定する。
- [x] その他流儀skillの補完行が既存row IDと衝突せず、行操作の対象を取り違えない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 5

### 指摘事項

- `useIkizamaSkillsSectionProps`が毎renderでvalidation objectを再生成し、その参照をsection propsの依存に含めるため、フォーム外state更新でも生き様スキルpropsとerror summaryが再生成される。
- ローカルレビューのその他流儀skill補完ID衝突とサイバネ同期フラグ残留は、レビュー指摘4と同一内容として照合済みであり、重複登録しない。

### 判定

- source: local-agent (Sol xhigh)
- classification: valid
- local validation: `calculateIkizamaSkillsValidation()`の結果は`useMemo`化されておらず、`sectionProps`の依存配列にobject全体を含めている。`useCharacterSheetErrorSummary`もこの不安定な`ikizamaSkills` stateへ依存するため、G31が求めるフォーム外更新時の参照安定化を満たさない。

### 対応方針

- 生き様スキルvalidationと、memo化済みsectionへ渡すcallbackを、実際に値または処理が変わる依存だけで安定化する。
- Containerのdialogまたはmenu stateだけを更新する結合テストで、生き様スキルpropsとerror summaryの参照安定を確認する。

### 対応完了チェックリスト

- [x] 生き様スキルpropsとerror summaryがフォーム外state更新で参照安定を維持する。
- [x] Container local state更新を起点とするidentity testを追加する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 6

### 指摘事項

- 生き様スキルvalidationの毎render再生成により、フォーム外state更新でも生き様スキルpropsとerror summaryが再生成される。
- サイバネカテゴリ削除がユーザー起点の段階変更として扱われず、閾値を跨いでも非戦闘技能修正を標準修正へ戻さない。

### 判定

- source: browser-draft (`.tmp/chatgpt-review.md`、2件目)
- classification: valid（レビュー指摘4・5と重複）
- local validation: `useIkizamaSkillsSectionProps`のvalidation objectはmemo化されておらず、section propsとerror summaryへ参照変化が伝播する。`useSpecialItemsSectionProps`のカテゴリ削除はcybernetics値を直接初期化するため、`useCyberneticsSectionProps`のユーザー起点同期へ接続されない。いずれも既存のレビュー指摘4・5と同一の未解消問題である。

### 対応方針

- 対応とテストはレビュー指摘4・5のチェックリストへ集約する。重複した実装項目は追加しない。

### 対応完了チェックリスト

- [x] レビュー指摘4・5の該当チェックリストを完了する。

## 最終UI Review

- input: `canonical-snapshots/visual/character-sheet/`のdesktop / tablet / mobile screenshot
- artifacts: `.tmp/review/ex-02-31-sheet-integration/contents-review-1.md`、`contents-expert-review-1.md`、`contents-beginner-review-1.md`
- 固定actionの本文重なり、mobileの情報密度、入力順、破壊的操作の色、icon-only操作は、ユーザー判断で非対応とする。
- 候補行の選択可能性はdesignへの影響があるため、`docs/TODO.md`へ後続化する。
- errorがないdesktop error dialogの枠色は、ユーザー承認により通常のstrong borderへ修正する。
- HTML、DOM、CSS、link、別route、実操作、keyboard / focus / ARIAは画像reviewの対象外とした。

## ユーザー指摘 1

### 指摘事項

- ドラッグを選択した直後、初期の所持セット数が`0`のため、消費信用の表示が変わらない。

### 判定

- source: preview serverでのユーザー確認と2026-07-31の再現確認
- classification: valid（仕様変更）
- local validation: ドラッグの信用計算は`信用 × 所持セット数`であり、選択直後の所持セット数が`0`なら消費信用は増えない。武器、防具、お守り、サイバネ、ナノマシンでは選択直後に消費信用が更新されるため、ドラッグだけが選択済み状態と消費信用表示で乖離して見える。

### 対応方針

- 初期3行と追加行の所持セット数を`1`とする。選択操作で所持セット数を補正しない。
- 保存・復元された所持セット数は変更しない。

### 対応完了チェックリスト

- [x] 初期3行と追加行の所持セット数が`1`であり、ドラッグ選択後に消費信用と小銭が更新される。
- [x] 保存・復元された所持セット数を選択操作で上書きしない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ユーザー指摘 2

### 指摘事項

- スキル選択ダイアログの候補表にタイミングが表示されていない。

### 判定

- source: user
- classification: valid
- local validation: `SkillPickerDialog`は4種のスキル候補dialogで共有されるが、headerと候補行は名称、最大Lv、コスト、使用制限だけを表示していた。`Skill.timing`はマスタから取得済みであり、スキル行と要件には表示契約がある。

### 対応方針

- shared `SkillPickerDialog`へタイミング列を追加し、最大Lvとコストの間に置く。
- 全viewportでタイミング値が折り返さない列幅を確保し、既存の横overflow禁止を維持する。

### 対応完了チェックリスト

- [x] プライマリ流儀、生き様、共通、その他流儀の全スキル候補dialogで、名称・最大Lv・タイミング・コスト・使用制限を同じ順で表示する。
- [x] タイミング値がdesktop、tablet、mobileで折り返さず、候補dialogに横overflowがない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

### VRT確認

- capture: `npm run visual:capture -- --grep '@vrt.*@(primary-skill-picker|ikizama-skill-picker|common-skill-picker|other-ryugi-skill-picker)(?:\\s|$)'` は12件通過した。
- checked actual screenshots: 4種の候補dialogそれぞれでdesktop / tablet / mobileのdialog locator screenshotを原寸で確認した。タイミング列は最大Lvとコストの間にあり、値の折り返し、横overflow、clipはない。
- comparison: 同じ12 targetの`npm run visual:test`は、旧canonical baselineとの差分として12件失敗した。差分はタイミング列の追加と列幅変更による意図的なもの（primary / ikizama / other ryugi: 3〜4%、common: 5〜6%）である。
- baseline update: ユーザー明示承認後に同じ12 targetを更新し、通常比較も12件通過した。ドラッグの既定所持数変更を含め、4種のスキル候補dialogとドラッグの5 state（表示、入力、展開、候補、重複候補）のdesktop / tablet / mobileを再captureし、27件すべてのactual screenshotを原寸で確認した。タイミング列の位置・折り返し・横overflow、ドラッグの既定所持数`1`、選択後の所持数と効果展開、候補dialogの表示に問題はない。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`error-dialog-empty`、`@vrt @character-sheet @dialog @desktop @error-dialog-empty`
- route / states / viewports: `/character-sheet/`、errorなしのerror確認dialog、desktop（1440x1200）

### レビュー結果

| 対象                      | 判定       | 差分                                | 対応                            |
| ------------------------- | ---------- | ----------------------------------- | ------------------------------- |
| errorなしerror dialog枠線 | 要人間判断 | canonicalとの差分580 pixels（0.01） | 通常strong borderへ意図的に変更 |

### 実画面確認

- `/character-sheet/` / errorなしerror確認dialog / desktop:
  - locator screenshot: `getByRole("dialog", { name: "エラー" })` のoriginal-pixel-resolution capture
  - checked acceptance criteria: 白いsurface、通常strong border、本文・actionのalignment、text wrapping、clipping、overflow、`閉じる`buttonのbounds
  - result: 通常strong borderで表示され、本文・actionにclippingまたはoverflowはない。

### 自己修正した項目

- [x] `errorSummary.hasErrors`がfalseの時だけ、error dialogのdanger borderを通常strong borderへ切り替えた。

### 人間判断が必要な差分

- canonical baselineは旧danger borderとの差分でVRT比較が失敗する。baseline更新はユーザー明示承認が必要なため、更新していない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] VRT差分を修正した、または修正不要と判断した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る（該当する場合）。
- [x] `npm run build` が通る（該当する場合）。
