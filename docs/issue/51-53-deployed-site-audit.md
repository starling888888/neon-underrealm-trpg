# 51-53-deployed-site-audit

## 目的

初回公開前の最終確認として、GitHub Pagesへ実際にデプロイされている公開ページを
対象に、軽量性、GitHub Pagesサブパス、主要ページ・導線・検索・データカード個別
アンカーを横断調査する。調査結果と再現可能な証跡を記録し、問題があれば修正対象を
切り分けてからユーザー判断を受ける。

## 背景

`docs/plan.md` の `51-performance-pass`、`52-github-pages-base-check`、
`53-content-smoke-test` は、公開物としての完成性を確認するPhase 5の連続タスクで
ある。ローカルのビルド結果だけではGitHub Pagesの実際のbase path、配信済みの
Pagefind index、外部から到達するURL、キャッシュ後の静的assetを十分に確認できない。
そのため、公開URL `https://starling888888.github.io/neon-underrealm-trpg/` を主な確認
対象とする。

参照する正本・資料:

- `docs/requirements/non-functional.md` のNFR-01、NFR-04
- `docs/requirements/assets-seo.md` の画像・OGP URL要件
- `docs/requirements/data-display.md` のFR-04-04（データカード個別アンカー）
- `docs/requirements/layout-navigation.md` のHeader、サイトメニュー、ページ内目次要件
- `docs/plan.md` の `51-performance-pass`、`52-github-pages-base-check`、`53-content-smoke-test`
- `docs/TODO.md` のPagefindが `-local` 確認ページをindex化した場合の検索Visual Test安定化
- `astro.config.mjs`、`.github/workflows/deploy.yml`、`src/lib/utils/paths.ts`
- `docs/design/site-layout/`、`docs/design/site-menu/`、`docs/design/page-toc/`、`docs/design/search-modal/` と、確認する公開ページに対応する既存design target

このissueでは、調査中に公開サイトの表示・導線・性能上の問題を発見しても、調査と
修正を混同しない。修正候補は根拠・影響・回帰確認を記録してユーザーへ報告し、ユーザーが
修正対象を明示承認した後にだけ実装する。

## Gate関係

- 親issue: `なし（このissueが親issue）`
- Gate plan: `docs/issue/51-53-deployed-site-audit/plan.md`
- Gate: 親issueでは `なし`。Gateの列挙と進捗はGate planだけで管理する。
- 子issue: ユーザー指示により作成しない。各Gateの調査・修正の実装契約は、この親issueを共通契約として扱い、Gateをまたぐ変更はユーザー承認後に限定する。

## 対象範囲

- 公開URLと、公開ページが対応する現在のmain上のソース・workflow・生成物の状態を照合する。
- Gate planの順序に従い、公開ページに対する性能、サブパス、コンテンツsmoke testを実施する。
- G1の性能確認では、静的ルールサイトの通常ページを対象にする。キャラクターシートは明示的に許容されたReact Islandであり、Reactおよびキャラクターシート専用依存は「不要な大規模UIライブラリ」の確認対象から除外する。ただし、キャラクターシート以外へ不必要にclient JavaScriptやUI依存が広がっていないことは確認する。
- 調査ごとに、確認日時、URL、操作、期待結果、実結果、スクリーンショット・network記録などの証跡、未確認理由を `.tmp/review/51-53-deployed-site-audit/` に記録する。
- 失敗は、公開artifact不一致、実装、生成・デプロイworkflow、外部配信・キャッシュ、調査環境のいずれかに分類する。現在のソースとの差異を先に確認し、公開環境だけの失敗を根拠なくソース修正しない。
- 調査で修正が必要と判明した場合は、対象ファイル、影響する公開URL・state・viewport、参照正本、回帰確認、既存designで判断可能かを修正計画へ記録してユーザーへ報告する。

## 調査・実施計画

### 共通の事前確認

1. 公開URLのHTTP応答、最終URL、公開時刻を記録し、公開HTMLのrevision手掛かりと現在のmainのdeploy対象との差異を確認する。
2. 公開対象routeを、トップ、更新履歴、ルール本文、ワールド、データindex、スキル一覧、各アイテム種別、流儀・生き様一覧と詳細、404に分類した一覧として記録する。`/-local/` は公開対象ではないため、公開smoke testの成功条件から除外する。
3. 各調査はdesktop `1440px`、tablet `820px`、mobile `390px`を基本とし、操作状態を持つ検索、サイトメニュー、ページ内目次は該当stateを明示する。見た目の肯定結果は、対象のactual screenshotを開いて確認した場合だけ記録する。
4. 調査中に起きる一時的なネットワーク障害・GitHub Pages配信遅延は、再試行時刻とともに未確定として記録し、実装不具合と断定しない。

### 結果の扱い

1. Gateごとに、合格、失敗、未確認、適用外を条件単位で記録する。
2. 調査だけで解決しない失敗は、再現手順、期待・実結果、影響度、想定原因、関連ソース、必要なdesign判断、回帰確認を `fix-plan.md` に整理してユーザーへ報告する。
3. ユーザーが修正開始を明示するまで、ソース、テスト、design正本、VRT baseline、GitHub Pages設定を変更しない。
4. 修正後は、ローカル確認に加えて次回のmain deploy完了後に同じ公開URL・条件で再確認し、修正前後の証跡を対応付ける。

## 事前承認の境界

2026-07-31のユーザー指示により、次の承認を記録する。調査開始前にこの境界を確定し、
調査結果が出るまで内容を特定できない承認待ち事項を実装開始の理由にしない。

| 項目                                               | 承認状態                       | 実施時点                                                  | 境界                                                                              |
| -------------------------------------------------- | ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| G1〜G3の公開ページ調査                             | 承認済み。ただし現在は開始停止 | ユーザーが調査再開を指示した後                            | 本issueの調査計画と初期スコープ内だけを実施する。                                 |
| 各Gateの調査記録とcommit                           | 承認済み                       | 各Gateの調査記録・issueチェック・Gate状態更新を確認した後 | 1 Gateにつき1 commit。push、PR作成、mergeは含めない。                             |
| G1〜G3完了後の修正を一括実施                       | 承認済み                       | G3後、調査結果から作る修正計画に含む項目だけ              | 既存designとcurrent issue内で判断できる最小修正、対応する検証、修正commitに限る。 |
| existing designで判断できないUI変更                | 未承認                         | 実施しない                                                | `design-image-generation`、design判断、baseline更新は別途明示承認が必要。         |
| current issue外の機能・要件変更                    | 未承認                         | 実施しない                                                | `docs/TODO.md` または別issue候補として記録する。                                  |
| GitHub Pages設定変更、push、PR作成、merge、release | 未承認                         | 実施しない                                                | このissueで許可されたのはローカルcommitだけである。                               |

未承認の項目が調査で必要になった場合は、G3完了後に実施しなかった内容、必要な承認、
理由、影響をまとめて記録する。調査中に新しい承認待ちを理由に停止しない。

## コマンド承認インベントリ

この節は、2026-07-31の「Codexがユーザーへ承認を求めるコマンドを先に洗い出す」指示に
基づく実行制限である。以後のshell commandは、次表の目的・範囲に一致するものだけを
実行する。表にないcommand、表の範囲を広げるoption、別の外部サービスへの書込みは
実行しない。

| 用途                     | 許可するcommandの範囲                                                                                                                           | Codexのsandbox承認          | ユーザーの作業承認                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| 公開artifactの読取り     | `curl` による `https://starling888888.github.io/neon-underrealm-trpg/` 配下へのGET / HEAD                                                       | このsessionで承認済み       | G1〜G3調査として承認済み。調査再開指示後だけ実行する。 |
| GitHubの読取り           | `gh api` による対象repositoryのread-only API GET                                                                                                | 既存承認済み                | G1〜G3調査として承認済み。調査再開指示後だけ実行する。 |
| 公開ページのブラウザ確認 | `node --input-type=module -e` または `npx playwright test` による公開URLのread-only確認と `.tmp/review/51-53-deployed-site-audit/` への証跡出力 | 既存承認済み                | G1〜G3調査として承認済み。調査再開指示後だけ実行する。 |
| 調査記録の整形・確認     | `npm run format:md`、`npm run check:md`、`git diff --check`、`git status --short`                                                               | sandbox内または既存承認済み | issue・Gate記録の更新時に承認済み。                    |
| Gate commit              | 対象Gateのissue、Gate plan、調査記録だけをstageする `git add` と、1 Gateにつき1回の `git commit`                                                | 既存承認済み                | ユーザーが明示承認済み。Gate完了確認後だけ実行する。   |
| 修正後の検証             | `npm run check`、`npm run build`、対象限定の `npx playwright test`                                                                              | 既存承認済み                | G3後の一括修正に対して承認済み。                       |

現時点で、新たにCodexがsandbox承認を求めるcommandはない。公開artifact読取りの `curl`
は、このsessionでユーザー承認済みである。`git push`、PR作成、merge、deploy設定変更、
package install、任意script実行、削除commandはこのインベントリに含めない。

## 初期スコープ外

- ユーザー承認前のソース、テスト、workflow、design正本、VRT baselineの変更
- 性能値の恣意的な目標設定、Lighthouseの点数競争、WCAG完全準拠監査
- デプロイworkflow、GitHub Pages設定、CDN・キャッシュ設定の再設計
- 検索、ナビゲーション、カード、コンテンツの新機能・情報設計変更
- `/-local/` の開発用ページを公開対象にすること
- キャラクターシートのReact Island、React、およびキャラクターシート専用依存を不要な大規模UIライブラリとして評価・削減すること
- 新規npm package、外部解析、DB、認証、SSR、CMS、APIサーバーの追加
- `docs/plan.md` のチェックボックス更新と関連TODOの完了・退避

## 完了条件

- [x] Gate G1〜G3の公開サイト調査結果が、条件ごとの合格・失敗・未確認・適用外と証跡を含めて記録されている。
- [ ] 調査時点の公開artifactと現在のmainの差異、または差異を確認できなかった理由が記録されている。
- [x] 性能、subpath、主要導線・検索・個別アンカーの各失敗が、公開artifact不一致、実装、workflow、外部配信・キャッシュ、調査環境に分類されている。
- [ ] 修正が必要な項目は、修正対象・根拠・影響範囲・回帰確認・design判断の要否を含む修正計画として記録され、ユーザーへ報告されている。
- [x] ユーザー承認前には、調査目的のソース、テスト、workflow、design正本、VRT baselineを変更していない。
- [ ] 修正を実施した場合だけ、対象のローカル検証とmain deploy後の公開URL再確認が完了している。
- [x] 関連TODOを扱った場合は、対応結果またはこのissueで保留する理由が記録されている。
- [ ] `npm run check`、`npm run build` は、修正を実施した場合だけ実行結果を記録している。

## チェックポイント

- [x] 公開URLは必ず `https://starling888888.github.io/neon-underrealm-trpg/` 配下を使い、ルート直下URLを公開サイトの成功根拠にしていない。
- [x] 画像、CSS、JavaScript、OGP、Pagefind index、内部リンク、フラグメントリンクを、公開HTML・network・遷移結果のいずれかで確認している。
- [x] 主要ページ、サイトメニュー、ページ内目次、検索、スキル・アイテムの個別アンカーを、公開ページで実際に操作している。
- [x] Pagefind検索結果が `-local` routeへ誤って誘導しないこと、または関連TODOとして未解決の事実を記録している。
- [ ] hero画像の表示領域、非hero画像のlazy loading、キャラクターシート以外で初期表示を妨げる不要なclient JavaScript、カード一覧の過剰なclient描画、外部解析スクリプトを確認している。
- [ ] 画像・スクリプトなどの外部assetが、混在コンテンツ・CORS・404などにより主要導線を壊していない。
- [x] 既存route、GitHub Pagesサブパス、design target、初期スコープ外を回帰させていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

調査段階ではGit管理ファイルを変更しない。調査証跡と修正計画は以下に置く。

- `.tmp/review/51-53-deployed-site-audit/g1-performance-report.md`
- `.tmp/review/51-53-deployed-site-audit/g2-github-pages-base-report.md`
- `.tmp/review/51-53-deployed-site-audit/g3-content-smoke-report.md`
- `.tmp/review/51-53-deployed-site-audit/fix-plan.md`

修正時の変更ファイルは、調査結果とユーザー承認後の修正計画で限定する。

## レビュー観点

- 実デプロイページを主対象にする調査順序と、公開artifact不一致を先に切り分ける方針が妥当か。
- 調査・修正計画・修正・公開後再確認の停止点が、ユーザーの承認判断に十分か。
- 51〜53を1つの親issueにまとめつつ、Gate間の進捗と証跡が混ざらない構成か。
- Gate子issueを作らないというユーザー指定と、親issueを共通の実装契約とする運用が明確か。
- Pagefindの `-local` index化TODOを、G3で調査・記録し、必要なら修正計画へ入れる扱いが適切か。
- キャラクターシートのReact Islandと関連依存をG1の評価対象から除外しつつ、他ページの不要なclient JavaScript・UI依存を確認する境界が明確か。
- 実ページのUI上の問題を見つけた際に、design-image-generationを必要な前段作業として切り出せるか。

## 備考

- Gateの一覧・状態・依存関係は `docs/issue/51-53-deployed-site-audit/plan.md` のみで管理する。
- GitHub Pagesへのdeployはmainへの反映で行われる。公開URL再確認が必要な修正は、ユーザーがcommit・push・PR・mergeを明示承認した後のdeploy完了を待つ。
- 2026-07-31のユーザー承認: G1〜G3の公開ページ調査、各Gateの調査記録とcommit、全Gate完了後にまとめるこのissue内の修正を実施してよい。既存designで判断できないUI変更、current issue外への拡張、GitHub Pagesの外部設定変更は、この承認に含めない。これらはG3後に未実施事項として記録する。
