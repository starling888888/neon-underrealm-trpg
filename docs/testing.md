# テストと検証方針

この文書は、現在の実装を確認するテスト、CI、Visual Reviewの役割分担を定義する。

## ローカル検証

- `npm run check`: Astroの検査、Biome、Git管理Markdownの検査を実行する。
- `npm run build`: 静的サイトをbuildし、ページ内目次のpostprocessを実行する。
- `npm run test`: Node test、script test、React Component / hook test、build contract test、production analytics contract testを実行する。
- `npm run test:e2e`: Pagefindを含むローカルfixtureをbuildして、公開routeのbrowser behaviorを確認する。

Markdownだけを変更したtaskは、`npm run format:md` と `npm run check:md` を実行し、通常はbuildと全testを省略する。UI、CSS、layout、page、Componentを変更したtaskは、PR review直前に変更targetだけをVRTで比較する。

## テストの責務

- Node test: 変換、schema、データ取得、pure logic、build後のHTML契約を確認する。
- Vitest: React Component、hook、browser adapter以外のUI境界を確認する。
- E2E: 実ブラウザでしか確認できない公開route、menu、検索、キャラクターシートの代表操作を確認する。
- VRT: design notesのroute、state、viewportに対応する見た目の回帰を比較する。canonical baselineはローカル専用で、ユーザー承認なしに更新しない。
- Public E2E: deploy成功後のGitHub Pages URLに対して、`@local-fixture`を除くE2Eを実行する。失敗は既存公開をrollbackしない。

## CI/CD

`.github/workflows/quality.yml` は `npm ci`、`npm run check`、`npm run build`、`npm run test` を再利用可能なQuality jobとして定義する。

`.github/workflows/ci.yml` はmain以外のbranch pushとPull RequestでQualityだけを実行する。deploy権限やGitHub Pages artifactは持たない。

`.github/workflows/deploy.yml` はmainへの公開対象変更でQuality後にpublic build、Pagefind index、GitHub Pages deploy、Public E2Eを実行する。docs、AI Ops、READMEだけの変更はQualityとdeployを起動しない。

詳細な公開順序は `docs/deployment.md`、UI変更時のVisual Review手順は `.agents/skills/visual-implementation-review/SKILL.md` を参照する。
