# Browser E2E Tests

このディレクトリは、VRTで確認しないbrowser behavior E2Eを置く。

ローカルでは`npm run test:e2e`を実行する。commandはVRT fixture buildとPagefind index生成を行い、port 4322のpreviewを起動して、test終了時に停止する。

GitHub Pages deploy後のPublic E2Eでは、`pagefind/deployment.json`が今回のGit commit SHAを返すことをworkflowが確認してから、同じsuiteを`E2E_BASE_URL`で実行する。このときconfigはlocal previewを起動せず、failure時だけHTML report、screenshot、traceを`frontend/playwright-report/`と`frontend/test-results/public-e2e/`へ生成する。公開buildに存在しない`-local` fixtureを参照するtestだけは、test名へ`@local-fixture` tagを付けてPublic E2Eから除外する。
