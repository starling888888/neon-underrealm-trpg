# テストと検証方針

この文書は、現在の実装を確認するテスト、CI、Visual Reviewの役割分担と、新規テストを設計・レビューするときの選択基準を定義する。

## ローカル検証

- `npm run check`: format検査、Markdown検査、backend、frontend、shared packageに共通するlintと型検査を実行する。
- `npm run lint` と `npm run typecheck`: backend、frontend、shared packageに共通するlintと型検査を個別に実行する。
- `npm --workspace=@neon-underrealm/frontend run check`: frontendのAstro型検査とlintを実行する。
- `npm --workspace=@neon-underrealm/frontend run build`: 静的サイトをbuildし、ページ内目次のpostprocessを実行する。
- `npm --workspace=@neon-underrealm/frontend run test`: Vitestの通常 test（logic / schema / data、script、React Component / hook）を実行する。前処理が必要なcontract test、E2E、VRTは実行しない。
- `npm --workspace=@neon-underrealm/frontend run test:contract`: public buildを一回実行した後、Vitestのbuild contract testを実行する。
- `npm --workspace=@neon-underrealm/frontend run test:coverage`: `test` と `test:contract` をcoverage有効で実行する。CIのfrontend test jobと同じテスト範囲を確認するときに使う。
- `npm --workspace=@neon-underrealm/frontend run test:e2e`: Pagefindを含むローカルfixtureをbuildして、公開routeのbrowser behaviorを確認する。
- `npm --workspace=@neon-underrealm/shared run test`: shared packageの公開API境界を型検査する。
- `npm --workspace=@neon-underrealm/backend run test`: backendのservice / token verifier unit testとWorker境界の型検査を実行する。service unit testはmock repositoryとactor user IDを直接渡し、spyによる差し替えを使わない。authentication middlewareのHTTP contractはlocal API integration testで確認する。
- local Workerは`backend/.wrangler/state/`をD1/R2の一時stateに使う。このpathとWranglerの一時bundleである`backend/.wrangler/tmp/`はGit ignoreする。開始前は`npm --workspace=@neon-underrealm/backend run local:reset`、続けて`npm --workspace=@neon-underrealm/backend run migrate:local`を実行する。`npm --workspace=@neon-underrealm/backend run dev:local`でWrangler local Workerを`8787`に起動し、別terminalで`npm --workspace=@neon-underrealm/backend run test:integration`を実行する。`local:reset`は両pathを削除するため、確認後は必ず再実行する。CIも同じnpm scriptの順番を明示して実行する。

Markdownだけを変更したtaskは、`npm run format:md` と `npm run check:md` を実行し、通常はbuildと全testを省略する。UI、CSS、layout、page、Componentを変更したtaskは、PR review直前に変更targetだけをVRTで比較する。

## テストの層とランナー選択

Vitestをすべてのunit / contract testの標準とする。UI、hook、pure logic、データ変換、script、build contractのいずれも、まずVitestで最小の責務を検証できるか判断する。

テストの置き場所が既存のVitest対象（`frontend/tests/components`、`frontend/tests/hooks`、`frontend/tests/scripts`）に収まらない場合は、責務が分かるVitest用directoryを追加し、同じtaskでfrontendの`test`実行対象に含める。public buildを前提にするcontract testは`frontend/tests/contract/`へ置き、frontendの`test:contract`実行対象に含める。テストを実行されないdirectoryへ置いてはならない。

| 対象                                                | 標準の検証                               | E2Eへ持ち込まない理由                                                                                                |
| --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 計算、validation、変換、データ整形、状態遷移        | Vitestのunit test                        | DOM、route、browserを起動しても対象の分岐は増えず、失敗原因が不明瞭になる。                                          |
| React hookとuse case                                | Vitest + Testing Libraryのhook test      | 永続化、clipboard、file readなどはadapterを差し替え、状態と副作用の契約を個別に確認できる。                          |
| React Component                                     | Vitest + Testing LibraryのComponent test | props、表示、accessible name、入力、callback、error stateを速く局所的に確認する。                                    |
| scriptとNode入出力境界                              | Vitest                                   | fixtureを使い、入力・出力・異常系の契約を確認する。                                                                  |
| `frontend/tests/node/**`、build contract            | Vitestのlogic / contract test            | browserを起動せず、計算・schema・生成物・公開buildの契約を確認する。                                                 |
| route、実ブラウザAPI、複数Componentをまたぐ代表操作 | Playwright E2E                           | 実際のbuild、navigation、overlay、download/upload、clipboard、Pagefindなど、下位層で代替できない境界だけを確認する。 |
| 見た目、viewport、responsive layout                 | Playwright VRT                           | UIの意味・状態遷移・値の正しさを画像比較だけに委ねない。                                                             |

## 複雑な対話機能の分解

Webキャラクターシートは、複雑な対話機能の基準例とする。新規の同種機能では、E2Eへ検証を集中させず、次の順で責務を分ける。

1. pure logicへ計算、validation、JSON形式、データ変換を置き、Vitestで入力・境界値・異常値を確認する。
2. hookまたはuse caseへ状態遷移、初期復元、自動保存、非同期処理の順序を置き、browser APIは注入可能なadapterとしてVitestで確認する。
3. Componentへ表示、アクセシブルな操作名、入力、callback、dialogやerror stateを置き、Vitestで確認する。
4. Playwright E2Eは、公開routeからの代表フローと実ブラウザに依存する境界だけを確認する。全てのvalidation分岐、計算規則、状態遷移をE2Eで網羅しない。

character-sheetの現行構成では、`frontend/tests/node/character-sheet/`がlogic、schema、master-data、serializableなpersistence、browser adapterの契約を、`frontend/tests/hooks/character-sheet/`が復元、保存、画像・JSON・clipboardの状態管理を、`frontend/tests/components/character-sheet/`が表示と操作部品を、`frontend/tests/e2e/character-sheet.spec.ts`がexport/import、responsive action pane、dialog、clipboard、file inputなどの代表的な実ブラウザ操作を確認している。unit testはすべてVitestで実行する。

## テスト実装とレビューの判断基準

新規の振る舞いを追加・変更するtaskでは、利用者に影響する規則または失敗状態を、もっとも低い適切な層で少なくとも1つ確認する。レビューでは次を確認する。

- 計算、validation、変換、状態遷移を、E2Eだけで確認していないこと。
- hookとComponentの責務が分かれ、browser APIや永続化が必要以上にComponentへ埋め込まれていないこと。
- E2Eは公開route、実ブラウザAPI、複数層をまたぐ代表フローなど、下位層で置き換えられない理由を持つこと。
- E2Eのlocatorはtest-only属性の追加ではなく、既存のrole、accessible name、label、実際の構造を優先すること。
- VRTは視覚契約、E2Eはbrowser behavior、Vitestは局所的な振る舞いを担当し、同じ分岐を目的なく重複させていないこと。
- matcherが未提供または不明でtestが失敗した場合は、実装・再実行の前にContext7でVitestまたはPlaywrightの公式APIを確認する。使用可否はContext7だけで判断せず、このリポジトリの依存関係、test setup、既存testを照合する。

## E2E、VRT、Public E2Eの責務

- E2E: 実ブラウザでしか確認できない公開route、menu、検索、キャラクターシートの代表操作を確認する。
- VRT: design notesのroute、state、viewportに対応する見た目の回帰を比較する。canonical baselineはローカル専用で、ユーザー承認なしに更新しない。
- Public E2E: deploy成功後のGitHub Pages URLに対して、`@local-fixture`を除くE2Eを実行する。失敗時のdiagnostic outputは`frontend/test-results/`と`frontend/playwright-report/`へ出力し、既存公開をrollbackしない。

## CI/CD

`.github/workflows/quality.yml` は `npm ci`とrootの`npm run check`（format検査、Markdown検査、lint、type check）を実行する再利用可能な先行jobとして定義する。`.github/workflows/workspace-test.yml` はworkspaceごとのtestを実行する。frontendは`test:coverage`、shared packageとbackendは各workspaceの`test`を使う。backend変更時はこれに加え、Wrangler local WorkerへD1 migrationを適用してからcharacter sheet API integration testを実行する。backendのCIはCloudflare credentialを読まない。`test` は通常のVitest自動検出を実行し、PlaywrightのE2E / VRTと前処理が必要なcontract testは除外する。`test:contract` は環境変数を設定せずに一回のpublic build後、contract testをまとめて実行する。coverage providerはVitest configに固定し、`test:coverage`は通常testと`test:contract`の計測を有効にする。HTML、JSON、artifactなどのcoverage reportは保存しない。

`.github/workflows/ci.yml` はmain以外のrepository branch pushで変更pathを分類し、deploy権限やGitHub Pages artifactを持たない。Pull Request eventでは起動しないため、同じcommitでpushとPull RequestのQuality CIが二重に実行されない。fork由来Pull Requestは対象外とする。

- root Qualityは、Markdown-onlyを含むすべての対象pushで実行する。Markdown-only専用workflowは置かない。
- root Qualityと並行して変更pathを分類し、frontend、shared package、backendのtestは、各directory、root依存設定、または`.github/workflows/**`が変わったときだけ、root Qualityの成功後に並列実行する。frontend testはshared packageだけの変更では起動しない。
- `.codex/**/*.toml`だけの変更ではCI workflowを起動しない。

`.github/workflows/frontend-deploy.yml` はmainへの公開対象変更で、同じroot Qualityと必要な差分testの後にpublic build、Pagefind index、GitHub Pages deploy、Public E2Eを実行する。deployのpath filterはCIとは別であり、`docs/**`、`.agents/**`、`AGENTS.md`、`README.md`だけの変更では起動しない。`.codex/**/*.toml`はdeployの除外対象ではない。

詳細な公開順序は `docs/deployment.md`、UI変更時のVisual Review手順は `.agents/skills/visual-implementation-review/SKILL.md` を参照する。
