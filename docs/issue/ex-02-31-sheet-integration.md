# ex-02-31-sheet-integration

## 最優先のデザイン入力

- 本GateでGit管理から外す「デザイン正本」は、`canonical-snapshots/visual/` 配下のPlaywright canonical VRT baselineを指す。`docs/design/**/notes.md` のテキストによるdesign intentは削除対象ではない。
- baseline削除後、全VRT targetを現行の承認済み画面とユーザーの最新指示から再生成する。再生成されたlocal-only baselineは最終UI Reviewの画像入力であり、アプリケーションUIを新たに設計する入力ではない。
- UIの見た目を変更するのは、最終UI Reviewで具体的な不統一または使いにくそうな表現が確認され、ユーザーがその対応を承認した場合だけとする。操作性、focus、ARIAの再設計をこのGateで補完しない。

## 目的

G30を含むキャラクターシート実装を最終統合し、責務を守るテストとレンダリング境界へ整理する。全canonical VRT baselineをGit管理から外してlocal-onlyで再生成し、限定したTech ReviewとUI Reviewで、仕様矛盾・クライアント実行時エラー・デザインの統一性を確認する。

## 背景

親issueの最後の統合Gateである。ユーザーは、E2Eの責務逸脱の是正、ゲームドメイン用語を含むdictionaryの整理、FormValue周辺の参照安定化を指定した。また、画像であるcanonical VRT baselineをGit管理せず、既存分を一度削除して全ページを再生成する方針を指定した。

参照正本:

- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/out-of-scope.md`
- `docs/TODO.md` のG31関連項目
- `docs/design/**/notes.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `.agents/rules/data-management.md`
- `tests/visual/README.md`

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
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
- `docs/plan.md`の完了チェックを更新しない。

## 完了条件

- [x] G30が完了し、その確定事項が親Gate planへ記録されている。
- [x] キャラクターシートアーキテクチャのE2E責務と全named E2E scenarioを照合し、詳細シナリオの実装過多を解消している。
- [x] browser-onlyの主要導線だけをE2Eで確認している。
- [x] dictionaryでゲームドメイン用語と汎用UI文言が整理され、可視文言を変えていない。
- [x] FormValue周辺のmemo化対象propsとcallbackが参照安定化され、無関係な更新に対する契約をテストしている。
- [ ] `canonical-snapshots/visual/**` のGit管理を解除し、local-onlyのignore規則を確認している。
- [ ] 全VRT targetのbaselineを再生成し、全件比較が通る。
- [ ] locator-only stateがcanonical full-page baselineを要求しない。
- [ ] 最終Tech Reviewを指定の限定観点で完了し、有効な指摘を解消またはユーザー判断へ戻している。
- [ ] 最終UI Reviewを指定の限定観点で完了し、結果と未対応の判断を記録している。
- [ ] 関連TODOを扱った結果または未対応理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [ ] 整理後の`npm run test:e2e`が通る。

## チェックポイント

- [ ] Git削除対象は`canonical-snapshots/visual/**`だけであり、対象外のGit管理ファイルとユーザーの未コミット変更を破壊していない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [ ] baseline運用の記述が`docs/design/`、data-management rule、Visual Test READMEで矛盾していない。
- [ ] 関連する`docs/TODO.md`項目と矛盾していない。
- [ ] 画面変更があれば、actual screenshotを開いて表示契約を確認している。

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
- `docs/issue/ex-02-web-character-sheet/plan.md`（Gate完了時の確定事項だけ）

## レビュー観点

- キャラクターシートアーキテクチャの「最終smoke」責務に照らして、詳細なE2E scenarioを実装しすぎていないか。E2Eの境界、dictionaryのゲーム用語分類、FormValue propsのmemo化が、振る舞いを変えずに検証可能な責務整理になっているか。
- tracked canonical snapshotの削除範囲と、ignore後の全件再生成・比較手順が安全か。
- 最終Tech Reviewが仕様矛盾とクライアント実行時エラーだけに絞られているか。
- 最終UI Reviewがデザイン統一性と視覚的な使いやすさだけを扱い、G30の操作性レビューを重複させていないか。

## 備考

- branchは既存の`ex-02-web-character-sheet`を継続使用する。新規branchは作成しない。
- Git操作、削除、baseline再生成、実装、reviewer起動は、ユーザーがこのissueを承認した後に行う。
