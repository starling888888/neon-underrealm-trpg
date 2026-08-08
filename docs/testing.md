# テストと検証方針

この文書は、現在の実装を確認するテスト、CI、Visual Reviewの役割分担と、新規テストを設計・レビューするときの選択基準を定義する。

## ローカル検証

- `npm run check`: Astroの検査、Biome、Git管理Markdownの検査を実行する。
- `npm run build`: 静的サイトをbuildし、ページ内目次のpostprocessを実行する。
- `npm run test`: Vitestのlogic / schema / data test、script test、React Component / hook test、build contract test、production analytics contract testを実行する。
- `npm run test:e2e`: Pagefindを含むローカルfixtureをbuildして、公開routeのbrowser behaviorを確認する。

Markdownだけを変更したtaskは、`npm run format:md` と `npm run check:md` を実行し、通常はbuildと全testを省略する。UI、CSS、layout、page、Componentを変更したtaskは、PR review直前に変更targetだけをVRTで比較する。

## テストの層とランナー選択

Vitestをすべてのunit / contract testの標準とする。UI、hook、pure logic、データ変換、script、build contractのいずれも、まずVitestで最小の責務を検証できるか判断する。

テストの置き場所が既存のVitest対象（`tests/components`、`tests/hooks`、`tests/scripts`）に収まらない場合は、責務が分かるVitest用directoryを追加し、同じtaskで`npm run test`の実行対象に含める。テストを実行されないdirectoryへ置いてはならない。

| 対象                                                | 標準の検証                               | E2Eへ持ち込まない理由                                                                                                |
| --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 計算、validation、変換、データ整形、状態遷移        | Vitestのunit test                        | DOM、route、browserを起動しても対象の分岐は増えず、失敗原因が不明瞭になる。                                          |
| React hookとuse case                                | Vitest + Testing Libraryのhook test      | 永続化、clipboard、file readなどはadapterを差し替え、状態と副作用の契約を個別に確認できる。                          |
| React Component                                     | Vitest + Testing LibraryのComponent test | props、表示、accessible name、入力、callback、error stateを速く局所的に確認できる。                                  |
| scriptとNode入出力境界                              | Vitest                                   | fixtureを使い、入力・出力・異常系の契約を確認する。                                                                  |
| `tests/node/**`、build contract                     | Vitestのlogic / contract test            | browserを起動せず、計算・schema・生成物・公開buildの契約を確認する。                                                 |
| route、実ブラウザAPI、複数Componentをまたぐ代表操作 | Playwright E2E                           | 実際のbuild、navigation、overlay、download/upload、clipboard、Pagefindなど、下位層で代替できない境界だけを確認する。 |
| 見た目、viewport、responsive layout                 | Playwright VRT                           | UIの意味・状態遷移・値の正しさを画像比較だけに委ねない。                                                             |

## 複雑な対話機能の分解

Webキャラクターシートは、複雑な対話機能の基準例とする。新規の同種機能では、E2Eへ検証を集中させず、次の順で責務を分ける。

1. pure logicへ計算、validation、JSON形式、データ変換を置き、Vitestで入力・境界値・異常値を確認する。
2. hookまたはuse caseへ状態遷移、初期復元、自動保存、非同期処理の順序を置き、browser APIは注入可能なadapterとしてVitestで確認する。
3. Componentへ表示、アクセシブルな操作名、入力、callback、dialogやerror stateを置き、Vitestで確認する。
4. Playwright E2Eは、公開routeからの代表フローと実ブラウザに依存する境界だけを確認する。全てのvalidation分岐、計算規則、状態遷移をE2Eで網羅しない。

character-sheetの現行構成では、`tests/node/character-sheet/`がlogic、schema、master-data、serializableなpersistence、browser adapterの契約を、`tests/hooks/character-sheet/`が復元、保存、画像・JSON・clipboardの状態管理を、`tests/components/character-sheet/`が表示と操作部品を、`tests/e2e/character-sheet.spec.ts`がexport/import、responsive action pane、dialog、clipboard、file inputなどの代表的な実ブラウザ操作を確認している。unit testはすべてVitestで実行する。

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
- Public E2E: deploy成功後のGitHub Pages URLに対して、`@local-fixture`を除くE2Eを実行する。失敗は既存公開をrollbackしない。

## CI/CD

`.github/workflows/quality.yml` は `npm ci`、`npm run check`、`npm run build`、`npm run test:coverage` を再利用可能なQuality jobとして定義する。`test` は通常の Vitest 自動検出を実行し、Playwright の E2E / VRT と前処理が必要な contract test は除外する。`test:contract` は環境変数を設定せずに一回の public build 後、contract test をまとめて実行する。coverage provider と text summary reporter は Vitest config に固定し、`test:coverage` は通常 test と `test:contract` の計測だけを有効にする。各 Vitest 実行単位のV8 coverage text summaryをCI logへ出し、HTML、JSON、artifactなどのcoverage reportは保存しない。`.github/workflows/markdown-check.yml` は、`npm ci`と`npm run check:md`だけを実行する再利用可能なMarkdown Check jobを定義する。

`.github/workflows/ci.yml` はmain以外のrepository branch pushで変更pathを分類し、deploy権限やGitHub Pages artifactを持たない。Pull Request eventでは起動しないため、同じcommitでpushとPull RequestのQuality CIが二重に実行されない。fork由来Pull Requestは対象外とする。

- Markdown-onlyの変更ではMarkdown Checkを実行する。
- 実装、設定、workflow、`.mdx`を含む変更、またはMarkdownとの混在ではQualityを実行する。
- `.codex/**/*.toml`だけの変更ではCI workflowを起動しない。

`.github/workflows/deploy.yml` はmainへの公開対象変更でQuality後にpublic build、Pagefind index、GitHub Pages deploy、Public E2Eを実行する。deployのpath filterはCIとは別であり、`docs/**`、`.agents/**`、`AGENTS.md`、`README.md`だけの変更では起動しない。`.codex/**/*.toml`はdeployの除外対象ではない。

詳細な公開順序は `docs/deployment.md`、UI変更時のVisual Review手順は `.agents/skills/visual-implementation-review/SKILL.md` を参照する。
