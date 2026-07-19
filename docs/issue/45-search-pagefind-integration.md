# 45-search-pagefind-integration

## 目的

既存の検索モーダルへPagefindによる静的検索を接続し、検索結果からページ、見出し、データカード個別アンカーへ遷移できるようにする。検索対象を本文とデータに限定し、検索結果にページタイトル、該当セクション、抜粋、種別ラベルを表示する。

## 背景

`44-search-modal-ui` で、desktop Headerの検索入力欄とmobileの検索panel、およびoverlay間の排他制御は実装済みである。現在は「検索機能は準備中です」と表示するだけで、検索実行と結果表示には未接続である。

`docs/plan.md` のユーザー未コミット変更により、旧タスク46の検索メタデータ要件は本タスク45へ統合されている。既に `pagefind` packageと `npm run build:search-index` scriptは存在する。本タスクではクライアント側検索と静的HTMLの検索対象・metadataを整備し、CI/CDでのindex生成・deployは後続の `48-search-index-ci-deploy` で扱う。

参照する正本は以下とする。

- `docs/requirements/search.md` のFR-02
- `docs/requirements/architecture.md` のAC-01、AC-02、AC-03、AC-09
- `docs/requirements/non-functional.md` のNFR-01、NFR-02、NFR-03、NFR-04
- `docs/out-of-scope.md` の静的サイト、外部検索サービス、高度な一覧filterの制約
- `docs/design/search-modal/notes.md` とdesign画像
- `docs/design/site-layout/notes.md`

`docs/TODO.md` に本タスクを回収する関連TODOはない。検索・集計要件のない流儀共通スキルボーナス構造化TODOは、本タスクで扱わない。

## 対象範囲

- Pagefind indexをbase path配下から遅延読込みし、desktop/mobileのどちらの入力からも同じ検索処理を実行する。
- 入力中の検索語、初期・検索中・結果なし・検索失敗・結果ありを誤認なく表示する。
- 検索結果にページタイトル、該当セクション、抜粋、種別ラベル、リンク先を表示し、結果クリック時にページ、見出し、または既存のデータカード個別アンカーへ遷移する。
- HTMLの検索対象を本文とデータ表示へ限定する。Header、Footer、SiteMenu、MobileSiteMenuDrawer、PageToc、MobilePageToc、検索overlayなどの共通UIはPagefind indexから除外する。
- Pagefindが取得するページタイトル、セクション、種別ラベルを、既存のページ構造とデータカードアンカーを壊さずに提供する。
- `docs/requirements/architecture.md` のPagefindに関する時制を、検索runtimeとローカルindex生成が導入済みであり、CI/CDへのindex生成・deploy統合はtask 48で扱う状態へ更新する。
- `/neon-underrealm-trpg/` のようなGitHub Pagesサブパス環境で、Pagefind indexと結果リンクがルート `/` 固定にならないことを確認する。
- Pagefind indexをローカルで生成した検索結果を使い、日本語本文、カタカナ用語、英数字ID、およびデータカード個別アンカーの検索・遷移を確認する。
- 既存の検索モーダルVisual Testは、通常のdev serverで公開対象・`-local` fixtureを使い、結果領域を含むUI状態、overlay排他、Esc、focus挙動を確認する。実検索結果はVisual Testの前提にしない。
- 実indexを用いる確認は、`npm run build:public`、`npm run build:search-index` の順で実行後、`npm run preview` で公開対象の `data/common-skills/` を開いて行う。Pagefind検索、データカード個別アンカー、base pathをこのpreviewで確認し、作業終了時にserverを停止する。

## 初期スコープ外

- `.github/workflows/deploy.yml` の更新、CI/CDでのPagefind index生成、GitHub Pagesへのindex成果物deploy（`48-search-index-ci-deploy` で扱う）。
- 検索専用ページ、検索履歴、候補表示、保存検索、ページネーション、絞り込み、ソート、タグ検索。
- Algolia、ElasticSearch、Meilisearchその他の外部検索サービス、APIキー、DB、SSR、APIサーバー、認証。
- SiteMenu、PageToc、mobile menu、Footerの再設計、Headerの検索起点レイアウト変更。
- 新しいUI framework、icon package、大きなUI library、既存 `pagefind` 以外の検索package追加。
- Excel変換、生成JSONの手編集、データカードのID・アンカー仕様変更。
- `docs/design/search-modal/` の新規design画像作成・正本化。既存designとの差分は本タスクのVisual Reviewで確認する。
- 未追跡の `.webp` 画像を含む、検索と無関係な既存ユーザー変更の編集・commit。

## 完了条件

- [x] desktopとmobileの入力でPagefind検索を実行し、入力状態に応じた初期・検索中・結果なし・失敗・結果ありを表示できる。
- [x] 各結果にページタイトル、該当セクション、抜粋、種別ラベルを表示し、クリックで正しいページ、見出し、またはデータカード個別アンカーへ遷移できる。
- [x] Header、Footer、サイトメニュー、ページ内目次、検索overlayなどの共通UIが検索結果へ混入しない。
- [x] Markdown / MDX本文、流儀・生き様ページ、スキル・アイテム一覧、戦闘・成長ルール、更新履歴を検索対象として確認する。ただし、ローカルtreeに未実装の対象ページは未実装であることをissueに記録し、存在する代表ページで確認する。
- [ ] 日本語本文、カタカナ用語、英数字ID、およびデータカード個別アンカーへの検索・遷移をローカル生成indexで確認する。
- [x] Pagefind indexの読込みと検索結果リンクがGitHub Pagesサブパスで壊れないことを、公開対象の `data/common-skills/` を使うローカルpreviewで確認する。
- [x] `docs/design/search-modal/` のdesktop/mobile design制約、既存のoverlay排他制御、Esc、focus復帰を維持する。
- [x] `npm run build:public`、`npm run build:search-index`、`npm run preview` を使い、生成済みindexで実検索結果とデータカード個別アンカーへの遷移を確認する。CI/CDへの組込みは本タスクで行わない。
- [x] `npm run check` と `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、既存のデータカード個別アンカー、PageToc postprocessが壊れていない。
- [x] `withBase` 等の既存path utilityを使い、Pagefind index・結果URLをルート `/` 固定にしていない。
- [x] Pagefind runtimeは検索操作時にのみ読込み、初期表示を不要に阻害しない。
- [x] 検索入力の連続変更で古い非同期結果が新しい検索語の結果を上書きしない。
- [x] 利用可能なPagefind metadata機構だけでページタイトル、セクション、種別ラベルを提供し、本文やIDを重複表示しない。
- [x] 結果リンクは同一サイト内の安全なURLだけを扱い、base pathとhashを保持する。
- [x] 不要な依存関係を追加していない。既存 `pagefind` packageを使用する。
- [x] 静的サイト、外部検索サービスなし、DBなしという初期スコープを維持する。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/search-modal/`、`docs/design/site-layout/` と矛盾していない。
- [x] ユーザーの未コミット `docs/plan.md` 変更と未追跡 `.webp` 画像を破壊していない。

## 想定変更ファイル

- `src/scripts/search-modal.ts`
- `src/components/search/SearchModal.astro`
- `src/components/search/SearchButton.astro`（入力接続に必要な場合のみ）
- `src/layouts/AppContainer.astro`、各page layout、または検索metadataに必要な既存Component
- `src/lib/utils/paths.ts` または検索用の小さなclient utility（必要な場合のみ）
- `tests/visual/search-modal.spec.ts`
- 検索metadata・path処理を分離する場合の最小限のNode test
- `docs/requirements/architecture.md`
- `docs/issue/45-search-pagefind-integration.md`

## レビュー観点

- 検索metadataをtask 45へ統合し、CI/deployをtask 48へ残す境界が適切か。
- Pagefind indexのローカル生成確認を、公開対象の `data/common-skills/` に対するpreviewで行い、CI/CD変更を対象外とする方針が妥当か。
- 既存designに対して、実検索結果の情報量（タイトル、セクション、抜粋、種別ラベル）を追加してよいか。
- 検索対象から共通UIを除外しつつ、本文、見出し、データカードアンカーを確実に残す範囲が明確か。
- 未実装の流儀・生き様・アイテム各種ページは、実装済みの代表ページで検証し、未実装範囲を記録する扱いでよいか。

## 備考

- 関連design targetは `docs/design/search-modal/` と `docs/design/site-layout/`。両方に必要なdesign画像が存在するため、`design-image-generation` は前提条件としない。
- `docs/design/search-modal/notes.md` はtask 44時点で実検索・metadataを明示的に対象外としている。本タスクではpanelの位置、mobile Headerの扱い、overlay排他、余白・色の制約を維持したまま、結果領域を実検索状態へ置き換える。
- `docs/requirements/architecture.md` はPagefindを「後続タスクで追加予定」と記載する一方、現在の `package.json` にはPagefindが存在する。本タスクで、検索runtimeとローカルindex生成は導入済み、CI/CDでのindex生成・deploy統合はtask 48という責務分離へ更新する。
- `.tmp/review/45-search-pagefind-integration/` はreviewer出力専用の一時領域であり、commitしない。
- ローカル公開対象には流儀・生き様・アイテム詳細ページが未実装である。index生成では、存在するMarkdown / MDX本文、共通スキル、データ一覧、戦闘・成長ルール、更新履歴の13ページを対象にした。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/search-modal/`、`docs/design/site-layout/`
- reference desktop: `docs/design/search-modal/design-desktop.png`
- reference mobile: `docs/design/search-modal/design-mobile.png`
- notes: 検索panelの位置、mobile Header、overlay排他、余白・色の既存制約を維持する。

### 成果物

- actual desktop: `test-results/visual/search-modal-desktop.png`（Playwright output）
- actual mobile: `test-results/visual/search-modal-mobile.png`（Playwright output）
- report: `test-results/visual/capture-manifest.json`（Playwright output）

### レビュー結果

| 領域                  | 判定 | 差分 | 対応                                   |
| --------------------- | ---- | ---- | -------------------------------------- |
| レイアウト            | OK   | なし | 不要                                   |
| 余白                  | OK   | なし | 不要                                   |
| タイポグラフィ        | OK   | なし | 不要                                   |
| 色                    | OK   | なし | 不要                                   |
| 配置・整列            | OK   | なし | 不要                                   |
| レスポンシブ          | OK   | なし | mobile入力と送信ボタンを縦積みに修正   |
| overflow / scroll     | OK   | なし | 不要                                   |
| 既存デザインとの整合  | OK   | なし | 不要                                   |
| 既存Componentとの整合 | OK   | なし | 不要                                   |
| accessibility basics  | OK   | なし | 視覚非表示labelと既存のfocus復帰を維持 |

### 自己修正した項目

- [x] mobile検索入力のlabelを視覚非表示にし、入力と送信ボタンをdesignに合わせて縦積みにした。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した。
- [x] mobile screenshot を取得した。
- [x] reference と actual を比較した。
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した。
- [x] design正本の更新が必要な場合は、人間判断項目として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 1

### 指摘事項

- desktop検索panelの表示中に背景本文がscrollし、結果領域がviewport外へ伸びる。panelは画面上半分程度に収め、結果リストを内部scrollできるようにする。
- desktopでEscまたはbackdrop clickにより検索panelを閉じたあとも検索入力にfocusが残る。その状態の入力を検索として表示できるよう、閉じる際にfocusを外す。
- 検索語を検索結果の抜粋と遷移先本文でハイライトする。
- ひらがな、カタカナ、英字の1文字だけの入力では検索せず、2文字以上の入力を案内する。

### 判定

- source: human
- classification: valid
- local validation: desktopの`body.search-open`はmobile media query内でしか`overflow: hidden`を指定しておらず、desktopの`.search-panel`にも高さ上限・`overflow-y`がない。さらに`setOpen(false)`はdesktop入力へ明示的にfocusを戻しており、既存Visual Testもそのfocusを期待している。`あああ` は公開対象の`data/common-skills/`を使うPlaywright確認で実際に結果を返した。Pagefindは日本語の語分割に対応する一方、browser APIに最小検索語長や同一文字反復の除外設定は提供していない。Pagefindは安全な`excerpt`に`mark`を含め、`highlightParam`とhighlight scriptで`data-pagefind-body`内の遷移先本文もハイライトできる。ユーザー判断により、反復文字の除外は採用せず、空白除去・NFKC正規化後のひらがな、カタカナ、ASCII英字1文字だけを検索前に案内する。いずれも現在の検索runtime・検索panelの表示制御に属する。

### 対応方針

- desktop検索表示中も背景本文をscroll不可にし、panelの下端をviewport上半分程度に制限する。結果リストをpanel内のscroll領域として、検索入力と状態表示は常に見えるようにする。
- desktopでEscまたはbackdropから閉じる場合は入力をblurし、次回の入力はあらためてfocusしてpanelを開いた状態で行う。既存Visual Testのdesktop focus期待値をこの挙動へ更新する。
- Pagefindの`excerpt`を安全に描画して検索結果内をハイライトし、`highlightParam`と`pagefind-highlight.js`を使って遷移先の`data-pagefind-body`内も同じ検索語でハイライトする。共通UIは対象外のままとする。
- 空白除去・NFKC正規化後に、ひらがな、カタカナ、ASCII英字のいずれか1文字だけで構成される検索語はPagefindを呼ばず、2文字以上の入力を案内する。漢字1文字と英数字を含むIDは検索を維持し、反復文字だけを理由に除外しない。

### 対応完了チェックリスト

- [x] desktop背景scrollと検索結果領域のscroll制御を修正する。
- [x] desktopのEsc・backdrop close時に検索入力focusを外す。
- [x] 検索結果の抜粋と遷移先本文で検索語をハイライトする。
- [x] ひらがな、カタカナ、ASCII英字の1文字だけの入力を検索前に案内し、Pagefind検索を実行しない。
- [x] desktop / mobileの検索UIとoverlay排他をVisual Testで確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/search-modal/`、`docs/design/site-layout/`
- reference desktop: `docs/design/search-modal/design-desktop.png`
- reference mobile: `docs/design/search-modal/design-mobile.png`
- notes: desktopはHeader直下の検索panelとscrimを維持し、結果が多い場合はviewport上半分に収めてpanel内だけをscrollする。

### 成果物

- actual desktop: `test-results/visual/search-modal-desktop.png`（Playwright output）
- actual desktop results: `test-results/visual/search-modal-results-desktop.png`（Playwright output）
- actual mobile: `test-results/visual/search-modal-mobile.png`（Playwright output）
- report: `test-results/visual/capture-manifest.json`（Playwright output）

### レビュー結果

| 領域                  | 判定 | 差分                                             | 対応     |
| --------------------- | ---- | ------------------------------------------------ | -------- |
| レイアウト            | OK   | なし                                             | 不要     |
| 余白                  | OK   | なし                                             | 不要     |
| タイポグラフィ        | OK   | なし                                             | 不要     |
| 色                    | OK   | なし                                             | 不要     |
| 配置・整列            | OK   | なし                                             | 不要     |
| レスポンシブ          | OK   | なし                                             | 不要     |
| overflow / scroll     | OK   | 背景scrollを停止し、結果リストを内部scrollへ変更 | 修正済み |
| 既存デザインとの整合  | OK   | なし                                             | 不要     |
| 既存Componentとの整合 | OK   | なし                                             | 不要     |
| accessibility basics  | OK   | desktop close時にinput focusを残さない           | 修正済み |

### 自己修正した項目

- [x] desktop検索panelをviewport上半分に制限し、結果リストだけを内部scrollにした。
- [x] desktopのEsc・backdrop close時に検索入力をblurするようにした。
- [x] 検索結果と遷移先本文の検索語をハイライトした。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した。
- [x] mobile screenshot を取得した。
- [x] reference と actual を比較した。
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した。
- [x] design正本の更新が必要な場合は、人間判断項目として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
