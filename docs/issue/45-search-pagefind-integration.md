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

- [ ] desktopとmobileの入力でPagefind検索を実行し、入力状態に応じた初期・検索中・結果なし・失敗・結果ありを表示できる。
- [ ] 各結果にページタイトル、該当セクション、抜粋、種別ラベルを表示し、クリックで正しいページ、見出し、またはデータカード個別アンカーへ遷移できる。
- [ ] Header、Footer、サイトメニュー、ページ内目次、検索overlayなどの共通UIが検索結果へ混入しない。
- [ ] Markdown / MDX本文、流儀・生き様ページ、スキル・アイテム一覧、戦闘・成長ルール、更新履歴を検索対象として確認する。ただし、ローカルtreeに未実装の対象ページは未実装であることをissueに記録し、存在する代表ページで確認する。
- [ ] 日本語本文、カタカナ用語、英数字ID、およびデータカード個別アンカーへの検索・遷移をローカル生成indexで確認する。
- [ ] Pagefind indexの読込みと検索結果リンクがGitHub Pagesサブパスで壊れないことを、公開対象の `data/common-skills/` を使うローカルpreviewで確認する。
- [ ] `docs/design/search-modal/` のdesktop/mobile design制約、既存のoverlay排他制御、Esc、focus復帰を維持する。
- [ ] `npm run build:public`、`npm run build:search-index`、`npm run preview` を使い、生成済みindexで実検索結果とデータカード個別アンカーへの遷移を確認する。CI/CDへの組込みは本タスクで行わない。
- [ ] `npm run check` と `npm run build` が通る。

## チェックポイント

- [ ] 既存ルート、既存のデータカード個別アンカー、PageToc postprocessが壊れていない。
- [ ] `withBase` 等の既存path utilityを使い、Pagefind index・結果URLをルート `/` 固定にしていない。
- [ ] Pagefind runtimeは検索操作時にのみ読込み、初期表示を不要に阻害しない。
- [ ] 検索入力の連続変更で古い非同期結果が新しい検索語の結果を上書きしない。
- [ ] 利用可能なPagefind metadata機構だけでページタイトル、セクション、種別ラベルを提供し、本文やIDを重複表示しない。
- [ ] 結果リンクは同一サイト内の安全なURLだけを扱い、base pathとhashを保持する。
- [ ] 不要な依存関係を追加していない。既存 `pagefind` packageを使用する。
- [ ] 静的サイト、外部検索サービスなし、DBなしという初期スコープを維持する。
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない。
- [ ] `docs/design/search-modal/`、`docs/design/site-layout/` と矛盾していない。
- [ ] ユーザーの未コミット `docs/plan.md` 変更と未追跡 `.webp` 画像を破壊していない。

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
