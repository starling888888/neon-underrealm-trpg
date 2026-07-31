# ex-05-access-analytics

## 目的

初回公開告知に備え、公開後のネオン・アンダーレルムTRPG公式ルールサイトについて、以下を把握できるアクセス解析を導入する。

- サイト全体のVisits
- サイト全体およびページ別のPage views
- 閲覧されたPath
- 外部Referer
- Device type、Browser、Operating system
- Page load time
- Core Web Vitals

アクセス解析にはCloudflare Web Analyticsを使用する。

本番公開サイトだけに解析用beaconを出力し、ローカル開発、通常のローカルbuild、PR検証、Visual Testでは実アクセスを送信しない構成にする。

本issueで得られる数値はJavaScript beaconを受信できたアクセスの集計であり、サーバーへ到達した全HTTP requestの正確な件数ではない。

## 背景

アクセス解析は初期スコープ外だったが、ユーザーの明示指示により、初回公開告知前の特別task `ex-05-access-analytics` としてCloudflare Web Analyticsだけを初期スコープへ昇格させた。

現在のサイトは以下の構成を持つ。

- Astroによる静的サイト
- GitHub Pagesでの公開
- 公開hostname: `starling888888.github.io`
- 公開base path: `/neon-underrealm-trpg`
- 共通HTML layout: `src/layouts/AppContainer.astro`
- GitHub Pages deploy workflow: `.github/workflows/deploy.yml`

Cloudflare Web Analyticsは、CloudflareへのDNS移管やCloudflare proxyを使用せず、手動のJavaScript beaconで導入する。

関連する参照先:

- `AGENTS.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `docs/requirements.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/deployment.md`
- `astro.config.mjs`
- `src/layouts/AppContainer.astro`
- `.github/workflows/deploy.yml`
- `package.json`

`docs/TODO.md` に、本issueで直接回収する既存項目はない。

## 選定済みサービス

### Cloudflare Web Analytics

以下の理由により、Cloudflare Web Analyticsを採用する。

- 静的なGitHub PagesへJavaScript beaconを追加するだけで導入できる。
- CloudflareへのDNS移管、proxy化、hosting移行を必要としない。
- npm packageを追加する必要がない。
- Cookie、`localStorage`、閲覧者単位の永続識別子をサイト側へ追加しない。
- Visits、Page views、Path、Referer、Device、Browser、Operating system、Page load time、Core Web Vitalsを確認できる。
- 広告配信、remarketing、閲覧者profile作成を本サイトへ導入しない。

Google Analytics、Google Tag Manager、Plausible、Umamiとの比較検討は行わない。

## 選定済み実装方針

### beaconの出力

Cloudflare Web Analyticsのbeaconを専用Astro Componentへ分離する。

想定Component:

```text
src/components/analytics/CloudflareWebAnalytics.astro
```

このComponentを `src/layouts/AppContainer.astro` から呼び出し、公開対象となる各HTML documentの終了 `</body>` 直前に、最大1つだけbeacon scriptを出力する。

beaconは以下の契約を満たす。

- script sourceは `https://static.cloudflareinsights.com/beacon.min.js`
- `type="module"` を指定する。
- Cloudflare dashboardから取得したsite tokenを `data-cf-beacon` へ安全にJSON serializationして渡す。
- `spa: false` を指定し、実際のdocument loadだけをPage viewとして扱う。
- Astroのbuild処理によってbeacon scriptをローカルbundleへ取り込まない。
- 同一ページへ複数のCloudflare beaconを出力しない。

### tokenの管理

環境変数名は以下に固定する。

```text
CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

tokenは公開HTMLへ埋め込まれるsite識別子であり、認証用の秘密鍵ではない。ただし、以下の理由からsource codeへ直接記載しない。

- 環境ごとの設定を分離する。
- 誤ったsite tokenをcommitしない。
- token更新時にsource変更を不要にする。
- test用tokenと本番tokenを分離する。

本番tokenはGitHub ActionsのRepository Variableとして管理する。

GitHub Actions上の参照名は以下に固定する。

```text
vars.CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

tokenをGitHub Secretとして二重管理しない。

### 環境別の挙動

| 環境                | token               | beacon出力                               |
| ------------------- | ------------------- | ---------------------------------------- |
| `npm run dev`       | なし                | 出力しない                               |
| 通常のローカルbuild | なし                | 出力しない                               |
| PR用CI              | なし                | 出力しない                               |
| contract test       | dummy token         | test対象HTMLだけで検証し、外部送信しない |
| GitHub Pages deploy | Repository Variable | 出力する                                 |

Componentは少なくとも次の両方を満たす。

- production buildであってもtokenがなければbeaconを出力しない。
- development modeではtokenがあってもbeaconを出力しない。

GitHub Pages deploy workflowでは、build開始前にRepository Variableが空でないことを確認する。未設定の場合は、token値をlogへ出力せず、artifact uploadおよびdeployより前に明示的に失敗させる。

通常のローカルbuildおよびPR用CIは、token未設定でも成功させる。

### hostnameとPath

Cloudflare Web Analyticsへ登録するhostnameは以下とする。

```text
starling888888.github.io
```

Cloudflare側へ `/neon-underrealm-trpg` をhostnameとして登録しない。

解析対象は、このリポジトリがbeaconを出力する以下のPathとする。

```text
/neon-underrealm-trpg/
```

同一hostname上に別のGitHub Pages repositoryが存在しても、そのページが本site tokenのbeaconを出力しない限り、本サイトの計測対象には含まれない。

Dashboard上で本サイトのページを確認するときは、Pathが `/neon-underrealm-trpg/` から始まることを確認する。

## 解析可能範囲と制約

本issueでは、以下をアクセス数解析として扱う。

- Visits
- Page views
- Path別Page views
- Referer host
- Device type
- Browser
- Operating system
- Country
- Page load time
- Core Web Vitals

以下の制約を明示する。

- 広告ブロッカー、tracking防止機能、network errorによってbeaconが送信されない場合がある。
- 解析結果を全アクセスの正確な実数とは扱わない。
- Cloudflare Web Analytics dashboardで参照できる期間は、実装時点の公式仕様では過去6か月である。
- UTM query parameterによるcampaign分析は行えない。
- button click、検索、キャラクターシート入力、JSON出力、CCFOLIA出力などのcustom eventは計測しない。
- `/character-sheet` 内の操作回数や完了率は、Page viewから推定しない。
- 長期保存、独自集計、raw log exportは行わない。

実装開始時にCloudflare公式documentationを再確認し、仕様が変わっている場合はissueを更新してユーザー確認を受ける。

## ユーザーがコード外で行う作業

### 実装完了からmainへのmerge前まで

1. Cloudflareアカウントを作成するか、既存アカウントへログインする。
2. 必要に応じてCloudflareアカウントの二要素認証と復旧手段を設定する。
3. Cloudflare dashboardのWeb Analyticsから `Add a site` を選ぶ。
4. hostnameとして `starling888888.github.io` を登録する。
5. Cloudflareが表示するmanual JavaScript snippetを確認する。
6. snippet内のsite tokenだけをコピーする。
7. GitHub repositoryの `Settings` → `Secrets and variables` → `Actions` → `Variables` を開く。
8. 次のRepository Variableを作成する。

```text
Name: CLOUDFLARE_WEB_ANALYTICS_TOKEN
Value: Cloudflareから取得したsite token
```

9. tokenそのものをChatGPT、Codex、GitHub Issue、PR本文、review comment、commit messageへ貼らない。
10. エージェントには「Repository Variableを設定済み」とだけ伝える。

Repository Variableの設定はsource実装とlocal testには不要だが、mainへmergeしてGitHub Pages deployを実行する前までに必須とする。

### 公開後

1. GitHub Pages deployが成功していることを確認する。
2. 広告ブロッカーまたはtracking防止機能を無効にしたブラウザーで公開トップページを開く。
3. `/neon-underrealm-trpg/rules/battle/` など、トップ以外の公開ページも1ページ開く。
4. 数分待ってCloudflare Web Analytics dashboardを開く。
5. VisitsまたはPage viewsが記録されていることを確認する。
6. Pathに `/neon-underrealm-trpg/` と、確認に使用した下層ページが表示されることを確認する。
7. BrowserのNetwork panelで、beacon scriptまたは計測送信が恒常的なCORS errorになっていないことを確認する。
8. 確認結果だけをエージェントへ報告する。site tokenや計測payloadは共有しない。

広告ブロッカーを有効にした状態で計測されないことは、不具合判定の根拠にしない。

### 本issueでユーザーが行う必要のない作業

- GitHub PagesからCloudflare Pagesへの移行
- DNS nameserverの変更
- custom domainの取得
- Cloudflare proxyの有効化
- Google Analyticsアカウントの作成
- Google Tag Managerの導入
- Cloudflare API tokenの発行
- 有料planへの加入
- server、DB、CMSの準備
- Cloudflareのsnippet全文をsource codeへ直接貼り付ける作業

## 対象範囲

### SSoTと運用文書

- `docs/plan.md` に登録した `ex-05-access-analytics` の範囲を維持する。
- `docs/out-of-scope.md` のアクセス解析項目に記録した、本issueだけを個別承認された例外を維持する。
- `docs/requirements/non-functional.md` の表示パフォーマンス要件に記録した、承認済み外部解析scriptの制約を維持する。
- `docs/deployment.md` に以下を記録する。

  - 採用サービス
  - Repository Variable名
  - Cloudflare側のsite登録手順
  - deploy前提条件
  - 本番確認手順
  - tokenをsourceおよびlogへ出さない方針
  - 解析できる範囲と制約
- `docs/TODO.md` に既存の関連項目がないことを確認する。新たな将来課題が発生した場合だけ追加する。

### source code

- Cloudflare Web Analytics専用Astro Componentを追加する。
- `src/layouts/AppContainer.astro` の終了body直前へComponentを1回だけ配置する。
- 環境変数の取得、空値処理、JSON serializationをComponentまたは専用helperへ閉じ込める。
- 本番以外またはtoken未設定時にbeaconを出力しない。
- `spa: false` を指定する。
- 現行のHTML、layout、表示、client-side機能を変更しない。

### deploy workflow

- `.github/workflows/deploy.yml` の公開用buildへRepository Variableを渡す。
- tokenが空の場合は、値を表示せずbuildまたはartifact upload前に失敗させる。
- PR用CIや通常buildへ本番tokenを渡さない。
- deploy workflowの既存順序を不必要に変更しない。
- Pagefind index生成とGitHub Pages artifact uploadを維持する。

### test

少なくとも以下を自動確認する。

- tokenがない場合、beaconが出力されない。
- development modeではbeaconが出力されない。
- dummy tokenを使ったproduction相当の確認で、beaconが1ページにつき1つだけ出力される。
- beaconが `type="module"` を持つ。
- `data-cf-beacon` が有効なJSONである。
- `data-cf-beacon` にdummy tokenと `spa: false` が含まれる。
- 公開トップページと代表的な下層ページの両方に適用される。
- GitHub Pagesのbase pathを壊さない。
- test中にCloudflareへの実network requestを送信しない。
- actual site tokenがfixture、snapshot、test result、logへ残らない。
- `dist/-local/` が公開成果物へ残らない既存契約を維持する。

既存test基盤で十分に確認できる場合は、新しいtest frameworkを追加しない。

## 初期スコープ外

- Google Analytics、Plausible、Umamiとの比較検証
- 複数のアクセス解析サービスの同時導入
- server-side access logの取得
- Cloudflare proxy化によるedge analytics
- Page viewの完全な実数保証
- button click等のcustom event
- キャラクターシートの入力開始、入力完了、保存、import、export回数の計測
- Pagefind検索語、検索回数、検索結果clickの計測
- UTM campaign分析
- A/B test
- conversion funnel
- heatmap
- session replay
- 閲覧者単位の追跡
- 広告配信、remarketing
- raw analytics dataのexport、独自保存、GraphQL API連携
- 6か月を超える履歴保存基盤
- analytics dashboardのサイト内埋め込み
- Cookie同意banner
- プライバシーポリシーページの新設
- Footer、support page等へのアクセス解析告知追加
- Cloudflare Pagesへのhosting移行
- DNS、custom domain、CSPの新規導入
- 可視UI、CSS、layout、design、VRT baselineの変更
- `docs/plan.md` の完了チェック更新

## 完了条件

### ドキュメントと実装

- [x] `docs/plan.md` に `ex-05-access-analytics` が登録されている
- [x] `docs/out-of-scope.md` に、本issueがアクセス解析の明示承認された例外として記録されている
- [x] `docs/requirements/non-functional.md` に、外部解析scriptの性能・privacy・環境分離要件が記録されている
- [x] Cloudflare Web Analyticsが唯一のアクセス解析サービスとして記録されている
- [x] beaconの出力責務が専用Astro Componentへ分離されている
- [x] `AppContainer.astro` から全公開ページへbeaconが最大1つだけ出力される
- [x] beacon scriptが `type="module"` を持つ
- [x] `data-cf-beacon` が安全にJSON serializationされている
- [x] `data-cf-beacon` に `spa: false` が設定されている
- [x] actual site tokenがsource code、Git管理ファイル、test fixture、snapshot、logへ記録されていない
- [x] development modeではbeaconを出力しない
- [x] token未設定の通常local buildおよびPR用CIが成功し、beaconを出力しない
- [x] GitHub Pages deployだけがRepository Variableを受け取る
- [x] deploy時にRepository Variableが空なら、値を表示せずartifact upload前に失敗する
- [x] deploy workflowの既存check、public build、Pagefind index生成、artifact upload、deployが維持されている
- [x] npm packageを追加していない
- [x] `docs/deployment.md` に、ユーザーがコード外で行う設定と本番確認手順が記載されている
- [x] 解析値が広告ブロッカー等の影響を受けるclient-side集計であることが運用文書に明記されている
- [x] UTM、custom event、長期保存が対象外であることが運用文書に明記されている

### 自動検証

- [x] 自動testがtoken未設定、development、production相当、重複script、JSON属性を確認している
- [x] testがCloudflareへ実network requestを送信しない
- [x] GitHub Pagesの `/neon-underrealm-trpg` base path配下で既存ページが壊れていない
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `npm run build:public` が通る

### ユーザーによる外部設定と公開確認

- [ ] ユーザーがCloudflare Web Analyticsへ `starling888888.github.io` を登録している
- [ ] ユーザーがGitHub ActionsのRepository Variableを設定している
- [ ] mainへのmerge後、GitHub Pages deployが成功している
- [ ] 公開トップページと代表下層ページのPage viewがCloudflare dashboardへ記録されている
- [ ] Pathが `/neon-underrealm-trpg/` 配下として記録されている
- [ ] 実beacon送信で恒常的なCORS errorが発生していない

### スコープ管理

- [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
- [x] 本issueが可視UIを変更しないため、design targetとVRT baselineを追加・更新していない

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 公開HTMLの各documentにbeaconが複数出力されていない
- [x] tokenをconsole、GitHub Actions log、error messageへ出力していない
- [x] production以外から実計測を送信していない
- [x] testからCloudflareへ実通信していない
- [x] 現行のPagefind、404、Webキャラクターシートを壊していない
- [x] 外部scriptが初期表示を同期的にblockする構成になっていない
- [x] 不要なnpm dependencyを追加していない
- [x] server、DB、authentication、SSRを追加していない
- [x] Cookie、`localStorage`、個人識別用storageを追加していない
- [x] custom eventや閲覧者単位のtrackingを追加していない
- [x] access countをserver accessの完全な実数として説明していない
- [x] Cloudflare側hostnameと公開hostnameが一致している
- [ ] Cloudflare automatic injectionとmanual beaconを重複して有効化していない
- [x] CSPが実装時点で存在する場合は、beacon sourceと送信先の許可要否を確認している
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] `docs/design/` を変更していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/ex-05-access-analytics.md`
- `docs/plan.md`
- `docs/out-of-scope.md`
- `docs/requirements/non-functional.md`
- `docs/deployment.md`
- `.github/workflows/deploy.yml`
- `src/components/analytics/CloudflareWebAnalytics.astro`
- `src/layouts/AppContainer.astro`
- 環境値取得またはserializationを分離する場合のみ `src/lib/site/web-analytics.ts`
- 必要最小限の `tests/node/` または `tests/contract/`
- test command追加が必要な場合のみ `package.json`

以下は変更しない。

- `astro.config.mjs`
- 公開ページ本文
- `.raw/contents/`
- `src/styles/`
- `docs/design/`
- canonical VRT snapshots
- 画像asset
- 生成JSONの内容
- Excel変換処理

## レビュー観点

- Cloudflare Web Analyticsを唯一のproviderとして固定し、provider比較を初期スコープ外としてよいか。
- `CLOUDFLARE_WEB_ANALYTICS_TOKEN` をGitHub Actions Repository Variableで管理する構成でよいか。
- 通常local buildではtokenなしで成功させ、deployだけをtoken必須にする境界でよいか。
- `spa: false` とし、document loadだけをPage viewとして扱う方針でよいか。
- beaconを `AppContainer.astro` から全公開ページへ出力する範囲でよいか。
- 404ページもPage view計測対象に含めてよいか。
- 広告ブロッカー等による未計測を許容し、全HTTP accessの正確な実数とは扱わない方針でよいか。
- custom event、UTM、長期保存を別taskへ分離してよいか。
- publicな解析告知やプライバシーポリシーの追加を本issueから除外してよいか。
- production dashboardへの実データ到達確認を、ユーザー確認が必要な最終完了条件としてよいか。

## 備考

- 本issueの承認後は、子issueやGateを作らず、このissueを実装契約としてそのまま実装する。
- site tokenは公開HTML内に現れるため、認証情報としての秘密性はない。ただし、誤設定防止のためsource codeや会話へ貼らない。
- Cloudflare Web Analyticsのmanual embedでは、Cloudflare側hostnameと実際の公開hostnameが一致しない場合、CORS errorになりうる。
- beaconは広告ブロッカー等で遮断されるため、解析値は傾向把握に用い、ダウンロード数や利用者総数の断定には用いない。
- `/character-sheet` は同一document内の操作をPage viewとして追加計測しない。
- 週次analytics reportの有効化はユーザー任意のCloudflare account設定とし、完了条件に含めない。
- 実装時点でCSPが導入されていた場合は、`static.cloudflareinsights.com` とmanual beaconの送信先を許可する必要があるか確認する。CSP自体の新規導入は行わない。
- `ex-02-web-character-sheet` がmainへmergeされる前に本issueへ着手する場合、branch baseと `AppContainer.astro` の最新状態をローカルで再確認する。
- Cloudflare dashboardとGitHub repository settingsを参照できないエージェントは、production確認を推測で完了扱いしない。
- 法的義務や公開告知の要否は本issueで断定しない。ユーザーが告知を追加すると判断した場合は、contents正本と可視UIを扱う別taskを作成する。
- ユーザーの明示指示により、current issue外だったsample character JSONの末尾改行を整え、`tests/node/character-making-sample-characters.test.ts`の旧path `public/sample-charcter/` を現行の `public/sample-character/` へ訂正した。JSONの内容、公開ページ本文、Excel変換処理は変更していない。これにより `npm test` と `npm run check` が成功した。詳細は `.tmp/review/ex-05-access-analytics/user-directed-changes.md` を参照する。

## 初期draftのローカル検証履歴

- mode: local repository validation
- branch: `ex-05-access-analytics`（`main` の `b033948` から作成）
- issue: `docs/issue/ex-05-access-analytics.md`（ユーザー作成の未追跡draftを検証・更新）
- checked:

  - `AGENTS.md`
  - `.agents/skills/issue-first-development/SKILL.md`
  - `.github/ISSUE_TEMPLATE/issue-first-development.md`
  - `docs/requirements.md`
  - `docs/requirements/non-functional.md`
  - `docs/out-of-scope.md`
  - `docs/plan.md`
  - `docs/TODO.md`
  - `docs/deployment.md`
  - `package.json`
  - `astro.config.mjs`
  - `.github/workflows/deploy.yml`
  - `src/layouts/AppContainer.astro`
  - Cloudflare Web Analytics公式documentationのmanual beacon、SPA、FAQ、metrics、data collection

以下は、初期draftを検証した時点で未確認だった項目である。現在の実装・検証状態は完了条件および「レビュー指摘 1」を正本とする。

- Cloudflare account、site登録、actual site token、GitHub Actions Repository Variable
- GitHub Pages公開後の実beacon送信、Cloudflare dashboardへの実データ到達、CORS error

このissueは既存draftのローカル検証を経てユーザー承認後に実装を開始した。初期draft検証では`issue-first-development`の規約によりissue reviewerを実行していない。実装後のPR review結果は「レビュー指摘 1」を参照する。

## レビュー指摘 1

### 指摘事項

- [重要] `src/pages/character-sheet.astro` は共通`AppContainer`を使わない独自HTMLだが、Cloudflare beaconを配置していない。そのため、本番でも`/character-sheet`のPage view、Path、Performance指標が計測されない。
- [重要] current issueが要求するdummy token付きproduction相当の生成HTML検証（トップ、代表下層、`/character-sheet`、404の各1 beacon、`type="module"`、有効な`data-cf-beacon` JSON、token、`spa: false`）を自動testで行っていない。
- [重要] 「ローカル検証」末尾に実装前時点の未確認・実装停止記録が残り、現在の完了条件および実装済み状態と矛盾している。

### 判定

- source: local-pr-review
- classification: valid
- local validation: PR #72のremote head `efa52eda090225d85c2323374c3681c6220c8c2d`がlocal `HEAD`と一致すること、document / technical reviewer report、current issue、`src/pages/character-sheet.astro`、analytics Component、helper、contract / node testを照合した。`character-sheet.astro`は独自の`<html>`・`<body>`を出力し、`CloudflareWebAnalytics`を含まない。既存testはtokenなしartifactとhelper JSONだけを確認する。issue末尾には実装前の未確認・停止記録が残る。

### 対応方針

- `character-sheet.astro`の終了`</body>`直前へ専用Componentを最大1回配置し、`AppContainer`利用ページと同じproduction / token境界を適用する。
- 実network requestを発生させないdummy token付きproduction相当buildの検査を追加し、トップ、代表下層、`/character-sheet`、404の生成HTMLを確認する。token未設定buildのbeacon不在確認も維持する。
- 「ローカル検証」を初期draft検証の履歴として明示し、実装済み状態と矛盾する未確認・停止記述を修正する。

### 対応完了チェックリスト

- [x] `/character-sheet`を含む全公開HTML documentへbeaconが最大1つ出力される
- [x] dummy token付きproduction相当buildの生成HTMLについて、beacon数、`type="module"`、JSON属性、token、`spa: false`を確認するtestがある
- [x] issueのローカル検証記録が現在の実装・検証状態と矛盾しない
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る
