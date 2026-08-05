# 対応不要Agent Failure履歴

このファイルは、ユーザーが恒久対応不要と判断したagent failureの履歴を保持する。

対象entryはactive auditの集計・恒久対策の対象外とする。削除ではなくここへ移し、発生内容と一次対応を残す。

## 移動条件

- ユーザーが恒久対応不要と明示した
- 単発の自己検知で、追加のrule、skill、checklist対応を行わないと判断した

判定・移動は `.agents/skills/failure-log-audit/SKILL.md` に従う。

## 対応不要

### Page navigation contract test ran before and then misread the 404 output path

#### 2026-07-23

- source: self
- 発生箇所: `ex-01-page-navigation-links` の `npm test`
- 観測した失敗: 公開build HTML contract testを既存node test globに置いたため、build前に実行して失敗した。移動後の再実行ではAstroの404出力が`dist/404.html`であることを見落とし、`dist/404/index.html`を読もうとして再び失敗した。
- 一次対応: contract testを通常のnode test glob外へ移し、`npm run build:public`の後に実行するscriptへ分離した。404の出力pathを明示的に扱うよう修正した。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Site menu expansion predicate returned a non-boolean value

#### 2026-07-22

- source: self
- 発生箇所: `29-2-ryugi-index-page` の `getSiteMenuItemInitialExpanded()` とNode test
- 観測した失敗: 流儀一覧をcurrent時に展開する条件を、optional booleanをそのまま論理和へ渡す形で実装したため、該当設定がない通常のメニュー項目で`false`ではなく`undefined`を返した。全体Node testと対象testを連続して失敗させた。
- 一次対応: optional booleanは`=== true`で判定し、常にbooleanを返す条件へ修正する。optional値を返却値へそのまま伝播させる分岐を追加した場合は、設定なしの既存ケースを対象testで確認する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Search highlight test assumed one mark element twice

#### 2026-07-20

- source: self
- 発生箇所: `45-search-pagefind-integration` の `tests/visual/search-modal.spec.ts` に対する `npm run visual:capture`
- 観測した失敗: Pagefindが検索語を複数の`mark`要素へ分割することを考慮せず、検索結果抜粋と遷移先本文のハイライトを単一locatorとして2回検証したため、Playwright strict modeで同じVisual Testが連続して停止した。
- 一次対応: 検索語と一致する`mark`だけをfilterして検証する。複数のハイライト要素がありうるUIでは、locatorの件数または対象語を先に限定する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Visual capture Chromium sandbox launch failed twice

#### 2026-07-19

- source: self
- 発生箇所: `45-search-pagefind-integration` の `npm run visual:capture`
- 観測した失敗: 同一作業中にChromiumがsandbox hostを初期化できず、visual captureが2回起動前に停止した。承認済みのcapture実行では成功したため、検索UIのbrowser検証自体は完了している。
- 一次対応: 同じ失敗を繰り返す前に実行権限を確認し、成功したcaptureでdesktop、mobile、overlay、実index検索をまとめて確認した。sandbox実行環境の恒久対応要否は別途監査する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Search UI check needed separate type and formatter corrections

#### 2026-07-19

- source: self
- 発生箇所: `44-search-modal-ui` の `src/scripts/search-modal.ts` 初回実装後の `npm run check`
- 観測した失敗: 開閉判定で`HTMLElement.hidden`をBooleanとして渡し、Astro type checkが`string | boolean`を検出した。型修正後に同じ`npm run check`を再実行したところ、Biome formatterの改行差分で再度停止した。
- 一次対応: 開閉判定を明示的なBoolean比較へ修正し、Biome formatterの出力を対象ファイルへ適用してから再検証する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Skill conversion test rerun without focused error output

#### 2026-07-14

- source: self
- 発生箇所: `28-0-common-skills-data` のレビュー指摘 2に対する`npm run test`
- 観測した失敗: Schema・変換器・テストを同時に変更した後、テスト失敗の詳細を取得しないまま同じNode testを再実行した。原因は、既存の`isDeepStrictEqual` importの削除と、可変列fixtureでの末尾空ヘッダー処理の不足だった。
- 一次対応: 初回失敗後はテストレポートまたは対象testを詳細出力で確認してから再実行する。変換器のheader検証では、入力ライブラリが補う末尾空セルを除外する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### MDX-only `any` cast caused repeated build failures

#### 2026-07-13

- source: self
- 発生箇所: `27-2-data-index-page` の `src/pages/data/index.mdx` にある凡例用`maxLevel` props
- 観測した失敗: ユーザー指定の文字列値を`any`で渡すため、MDX Component直前へHTMLコメントとTypeScriptの`as any`を置いた。MDXは前者をJSXコメントとして、後者をJavaScript互換のJSDocキャストとして書く必要があり、`npm run build`が2回失敗した。
- 一次対応: JSXコメントと`/** @type {any} */ (value)`のJSDocキャストへ置き換え、再ビルドで検証する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Rules visual test matched a duplicated heading outside the article

#### 2026-07-12

- source: self
- 発生箇所: `23-2-rules-page` の`tests/visual/rules.spec.ts`
- 観測した失敗: `ルール`見出しをページ全体の`getByRole`で数えたため、本文外の同名見出しも含めてdesktop / mobileのVisual testがともに失敗した。本文領域へ限定した再実行でも、`getByRole`の部分一致により`ゴールデンルールを参照する`を同時に数えて同じ2テストが失敗した。
- 一次対応: 検証対象を`article.mdx-layout`内へ限定し、H1の検証には`exact: true`を指定した。本文の見出し、Callout、リンク、hero非表示だけを確認する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Character-making visual capture required two corrective attempts

#### 2026-07-12

- source: self
- 発生箇所: `22-2-character-making-page` の`tests/visual/character-making.spec.ts`とVisual Review
- 観測した失敗: 初回のVisual testは、本文の内部リンク数を検証する際にSiteMenuの同名リンクも数えて失敗した。本文領域へ検証対象を限定した再実行は、sandbox内でChromiumが起動できず失敗した。
- 一次対応: 本文の`article.mdx-layout`内だけを検証対象にし、Playwrightのcaptureはsandbox外実行へ切り替えた。desktop / mobileのcaptureは成功した。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Non-interactive custom subagent smoke test failed

#### 2026-07-11

- source: self
- 発生箇所: `review-subagents` の`codex exec --ephemeral`による`issue_reviewer` smoke test
- 観測した失敗: non-interactive Codex app-serverでcustom subagentを起動しようとしたところ、`collab spawn failed: no thread with id` が2回発生した。親agentはread-only fallbackでissue本文を確認したが、custom agent自体の起動は確認できなかった。
- 一次対応: non-interactive `codex exec`はcustom subagentの起動確認に使わない。interactive Codex clientでの実運用時にsubagentを起動する前提とし、今回の設定検証はTOML schema、model catalog、strict-config読み込みに限定する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Playwright sandbox launch failure

#### 2026-07-12

- source: agent self-report
- 発生箇所: `21-2-world-page` の`NpcCard`ローカルカタログcapture test
- 観測した失敗: sandbox内で `npx playwright test tests/visual/npc-card.spec.ts` を実行したところ、Chromiumが `sandbox_host_linux.cc` の `Operation not permitted` で起動できず、desktop / mobileの両testが同じ環境制約で失敗した。
- 一次対応: browser起動が必要なPlaywright testは、sandbox内の失敗後に必要性を示してsandbox外実行の承認を得る。通常のunit checkやformatterはsandbox内で継続する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Node test used an Astro-only environment value

#### 2026-07-20

- source: agent self-report
- 発生箇所: `45-search-pagefind-integration` の検索metadata utility test
- 観測した失敗: utilityの既定引数で`import.meta.env.BASE_URL`を参照したため、Astro外で実行するNode testが読み込み時に失敗した。同じ`npm test`と対象testの再実行で2回確認した。
- 一次対応: utilityは環境値を参照せず`/`を既定値にし、Astro layoutから`import.meta.env.BASE_URL`を明示して渡す。環境非依存のutilityはNode testからも読み込める形にする。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Data visual test retained an assertion for an unrendered property

#### 2026-07-23

- source: agent self-report
- 発生箇所: `34-2-items-pages` の`tests/visual/data.spec.ts`
- 観測した失敗: SkillLegendの共通Component移行後にVisual Testを実行したところ、desktopとmobileの両testが、`SkillCard`が表示していない`summary` propの文言を期待して失敗した。既存の`SkillCard`実装は移行前から`summary`を描画しておらず、testだけが実際の表示契約とずれていた。
- 一次対応: `summary`の期待を削除し、実際に表示する`effect`、カード項目、3→2カラム構成と横overflowを検証する。Visual Test実行前に、ComponentのpropがDOMへ描画されるかを対象Componentで確認する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### Repeated search selector failure during Visual Test cleanup

#### 2026-07-23

- source: agent self-report
- 発生箇所: `49-50-accessibility-responsive-pass` の`tests/visual/search-modal.spec.ts`
- 観測した失敗: local data-card fixtureのPagefind resultが追加され、skill ID末尾だけで検索結果linkを選ぶselectorが2件に一致した。最初の修正で3箇所のうちretry caseを見落とし、同じVisual Testの再実行でも1件が同じstrict-mode violationで失敗した。
- 一次対応: すべての検索結果期待を`/data/common-skills/` pathとskill IDで限定する共通selectorへ統一した。複数箇所に同じselectorがあるtestを修正する場合は、再実行前に旧selectorの残存を検索する。

- disposition: user judged no permanent countermeasure necessary
- moved: 2026-07-23

### E2E search-modal tests used the visual server port during the G26 run

#### 2026-07-30

- source: self
- failure category: repeated Playwright test-configuration failure
- 発生箇所: `ex-02-26-sheet-json-export` の`npm run test:e2e:run`
- 観測した失敗: G26のcharacter-sheet E2Eは成功したが、同じe2e command内でsearch-modalの4件が`http://127.0.0.1:4321`へPagefindを要求して`ECONNREFUSED`になった。e2e configのweb serverは`4322`であり、search testが`visualBaseUrl`を参照していた。
- 一次対応: G26の範囲外の既存テスト設定不整合として修正せず、JSON出力の対象browser behavior成功と区別して記録した。検索modalのE2E server URL統一は別taskで扱う。

- disposition: user-directed no-action; one self-reported command configuration incident
- moved: 2026-08-05

### Reported G22 visual and requirement checks as complete without covering required states

#### 2026-07-29

- source: review
- failure category: unverified completion and visual review coverage
- 発生箇所: `ex-02-22-sheet-special-items-integration` のVisual Review 1と完了条件
- 観測した失敗: 未選択で手動追加したカテゴリのwarning frame stateをE2E / VRTへ含めず、スミの最大体力actual screenshotで`自動算出値 + 修正 = 最終値`が成立していないことも見落とした。また、信用超過を小銭修正から独立して判定する要件をtestで固定せず、完了条件を確認済みと記録した。
- 一次対応: レビュー指摘4としてcurrent issueへ再open条件、実装方針、未完了checklistを記録し、該当完了条件・Visual Review checkpointを未チェックへ戻した。修正と再検証はユーザー承認後に限定する。

- disposition: user-directed no-action; one non-human-review entry
- moved: 2026-08-05

### Chained two Git staging operations in one shell command

#### 2026-07-30

- source: self
- failure category: Git operation discipline
- 発生箇所: `ex-02-28-sheet-ccfolia`のcommit準備
- 観測した失敗: repository ruleが状態変更Git操作を1件ずつ実行するよう定めるなか、通常ファイルのstageとignoreされたcanonical snapshotのforce stageを`&&`で連結した。
- 一次対応: stage対象がCCFOLIA Gateとユーザー承認済みの9枚のbaselineだけであることを確認し、手順逸脱を本logへ記録した。以後のstatus確認、staged diff確認、commit、pushはすべて単独のGit操作として実行する。

- disposition: user-directed no-action; one self-reported incident
- moved: 2026-08-05

### Chained local validation commands

#### 2026-07-30

- source: self
- failure category: command execution discipline
- 発生箇所: `ex-02-30-sheet-help` のformatterとMarkdown check
- 観測した失敗: shell commandを`&&`で連結しないrepository ruleに反して、Biome formatterと`npm run check:md`を一つのcommandとして実行した。
- 一次対応: 以後のformatter、test、check、buildはそれぞれ個別のcommandとして実行する。

- disposition: user-directed no-action; one self-reported incident
- moved: 2026-08-05

### Repeated formatting check failure during Presenter memoization

#### 2026-07-30

- source: self
- failure category: validation formatting discipline
- 発生箇所: `ex-02-31-sheet-integration` のPresenter再レンダリング防止リファクタ
- 観測した失敗: 最初の`check`で新規Hook記述の整形差分を見落とし、formatter適用後の再実行でも`ProfileSection`のReact import順がBiome規則に合わず、同じformat検証を再度失敗させた。
- 一次対応: import順をBiome指定へ修正し、最終検証は`format`後に`check`を単独実行して確認する。

- disposition: user-directed no-action; fewer than three consecutive formatting-check failures
- moved: 2026-08-05

+### Chromium failed before sample-character VRT capture

#### 2026-07-31

- source: self
- failure category: repeated Playwright environment failure
- 発生箇所: `55-0-sample-characters` の`@character-making` target限定Visual Review
- 観測した失敗: `npm run visual:capture -- --grep '@vrt.*@character-making(?:\s|$)'`でdesktop、tablet、mobileの3 targetが、Chromiumの`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`により起動前に失敗した。snapshot、VRT差分、actual screenshotは取得していない。
- 一次対応: 再試行や代替browser captureを行わず、current issueのVisual Reviewを未確認として記録した。browser環境が利用可能な場所で対象限定VRTと原寸locator screenshotを再実行する。

- disposition: user-directed no-action; Chromium sandbox launch constraint is retried outside the sandbox
- moved: 2026-08-05

### Chromium failed before the G24 restore-dialog VRT capture

#### 2026-07-30

- source: self
- failure category: repeated Playwright environment failure
- 発生箇所: `ex-02-24-sheet-persistence`の`@persistence-restore-error` target限定VRT capture
- 観測した失敗: desktop、tablet、mobileの3 targetでChromiumが`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出して起動できなかった。captureとbaseline比較には到達していない。
- 一次対応: 同一command内で3回発生したため再試行せず、Node・hook・browser E2Eの結果とは区別してissueへ未確認として記録した。

- disposition: user-directed no-action; Chromium sandbox launch constraint is retried outside the sandbox
- moved: 2026-08-05

### Chromium failed to launch for a target-limited VRT comparison

#### 2026-07-30

- source: self
- failure category: repeated Playwright environment failure
- 発生箇所: `g22-special-items-warning`のdesktop / tablet / mobile VRT比較
- 観測した失敗: `visual:capture`では3 viewportのlocator screenshotを取得できたが、後続の通常比較では各viewportでChromiumが`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出して起動できなかった。snapshot差分の比較処理には到達していない。
- 一次対応: 原寸captureと既存canonical snapshotを開いて警告frameの二重線を確認した。browser起動環境が回復するまで通常VRT比較は未確認として扱う。

- disposition: user-directed no-action; Chromium sandbox launch constraint is retried outside the sandbox
- moved: 2026-08-05

### Repeated Chromium sandbox launch failures while adding G20 tooltip VRT

#### 2026-07-29

- source: self
- failure category: repeated Playwright environment failure
- 発生箇所: `ex-02-20-sheet-nanomachines` のtooltip VRT 6 state
- 観測した失敗: 同じtarget限定VRT command内でChromiumが6回連続して`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出し、browser contextを起動できなかった。テストfixtureやsnapshot比較に到達していない。
- 一次対応: 既存の成功済みナノマシン15 state、E2E、baseline更新とは区別してissueへ未確認範囲を残した。preview serverを維持した直接の`visual:update`再試行ではChromiumが起動し、6 stateのbaseline作成・通常比較・captureを完了した。その後の21 state一括比較では同じ環境障害が再発したため、成功済みの15 stateと6 stateの個別比較結果を保持し、一括再試行はここで停止した。環境起因の発生自体は残し、恒久対応の要否はユーザー確認後に判断する。

- disposition: user-directed no-action; Chromium sandbox launch constraint is retried outside the sandbox
- moved: 2026-08-05

+### Repeated an unrelated sample-character node test failure during analytics validation

#### 2026-07-31

- source: self
- failure category: validation command targeting
- 発生箇所: `ex-05-access-analytics` の `npm test` / `npm run test:node`
- 観測した失敗: analytics変更と無関係な`tests/node/character-making-sample-characters.test.ts`が2回失敗した。testは`public/sample-charcter/`を参照するが、公開assetと`src/pages/character-making.mdx`は`public/sample-character/`を参照しており、最初のJSON fileを開けず`ENOENT`になる。analyticsのnode testは成功している。
- 一次対応: current issue外のsample character test / contentsを変更せず、個別実行で原因を確認してanalytics validationの失敗と区別した。後続のユーザー明示指示により、testの参照pathを現行assetへ訂正し、2026-07-31に`npm test`成功を確認した。

- disposition: user-directed no-action; fewer than three consecutive failures of the same command
- moved: 2026-08-05

### Retried a contract test that attempted a sandbox-blocked nested build

#### 2026-07-31

- source: self
- failure category: validation command targeting
- 発生箇所: `ex-05-access-analytics` の`tests/contract/page-navigation-build.test.ts`
- 観測した失敗: dummy token付きのHTMLを確認するため、Node contract test内から`npm run build:public`を子process起動した。sandboxで`spawnSync npm EPERM`となる失敗を、package script経由と個別詳細取得で2回確認した。また、dummy token build後の`dist/`を直接再実行に再利用し、tokenなし検証がその生成物に依存した。
- 一次対応: nested buildを削除し、tokenなしpublic buildのHTML contract、layoutの単一配置contract、dummy tokenのJSON serializationを純粋node testへ分離した。以後、build済みartifactを前提にするcontract testから再buildを起動しない。

- disposition: user-directed no-action; fewer than three consecutive failures of the same command
- moved: 2026-08-05

### Retried VRT capture with an unmatched tag expression

#### 2026-07-30

- source: self
- failure category: validation command targeting
- 発生箇所: `ex-02-28-sheet-ccfolia`のCCFOLIA dialog VRT capture
- 観測した失敗: `@ccfolia-copy`を完全tagとして扱う正規表現を2回指定したが、実際のtagは`@ccfolia-copy-confirm`、`@ccfolia-copy-success`、`@ccfolia-copy-failure`であり、Playwrightが対象なしで終了した。
- 一次対応: VRT scenarioの実際のtagを先に確認し、3 stateをまとめて選ぶprefix `@ccfolia-copy`でtarget限定capture・baseline更新・通常比較を実行した。

- disposition: user-directed no-action; fewer than three consecutive failures of the same command
- moved: 2026-08-05

+### Let an optional mocked root-state value open a dialog during component tests

#### 2026-07-30

- source: self
- 発生箇所: `CharacterSheetContainer`のG27 JSON入力確認dialogのopen判定、および`npm run test` / `npm run test:component`
- 観測した失敗: 新設した`pendingJsonImport !== null`は既存Component test harnessの`undefined`をopenとして扱い、操作menuのEscape testと既存の変更確認dialog testを失敗させた。同じComponent test失敗を全体testと個別testで2回実行した。
- 一次対応: open判定を`pendingJsonImport != null`へ変更し、optionalな旧test harnessをclosed stateとして扱うようにした。再実行前にfailure logとcurrent Gate issueへ記録した。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated component-test failures while revising G8 accessibility names

#### 2026-07-27

- source: self
- 発生箇所: `tests/components/character-sheet/SecondaryAttributesSection.test.tsx`
- 観測した失敗: G8レビュー対応でtooltip triggerとcheckboxのaccessible nameを変更した際、最初はtooltip buttonのaccessible nameに最終値が加わることをtestへ反映し忘れた。続く修正では同じ`一時修正を適用`をcheckboxとtooltip buttonの両方へ付けたため、単一要素を前提にしたlabel queryを再度失敗させた。
- 一次対応: tooltip buttonには明示的な`aria-label`を渡し、checkboxの操作確認はroleを`checkbox`へ限定する。tooltip triggerはbutton roleで別に確認し、Component testとbrowser E2Eのselectorを同じ責務境界へ揃える。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated test failures while adding G6 root orchestration coverage

#### 2026-07-27

- source: self
- 発生箇所: `tests/hooks/character-sheet/useCharacterSheetRootState.test.tsx`、`tests/node/character-sheet/persistence/character-image.test.ts`
- 観測した失敗: G6のTechReview指摘に対するRoot結線test追加で、非同期変換完了前にwrite呼出を検証する待機不足によりcomponent testを失敗させた。修正後のnode testでも、`CharacterImageError`を移動後の共有moduleではなくpersistence moduleからimportして2回目のtest失敗を起こした。さらに、競合testへ毎renderで新しい依存objectを渡してrestore effectを再始動させ、timeoutを起こした。最後に共有契約へ移した`CharacterImageErrorCode`のimport元をRootで取り残し、全体type checkを失敗させた。
- 一次対応: 非同期write呼出は`waitFor`で開始を待ってから検証し、例外型とcode型は`character-image.ts`の共有契約からimportするよう訂正した。Rootは起動時の依存をrefで固定してeffectの再始動を防いだ。対象component test、node test、全体checkを再実行して成功を確認する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated a component test before checking the available matcher setup

#### 2026-07-27

- source: self
- 発生箇所: `tests/components/character-sheet/ProfileSection.test.tsx`
- 観測した失敗: loading中のdisabled状態を確認するtestで、このrepositoryに導入されていないjest-domの`toBeDisabled` matcherを使った。全体testと対象component testで同じmatcher不足による失敗を2回確認した。
- 一次対応: repositoryで利用可能なChai matcherへ切り替え、HTMLButtonElement / HTMLInputElementの`disabled` propertyを直接確認する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated the full check before resolving all image-gate static analysis findings

#### 2026-07-27

- source: self
- 発生箇所: `ex-02-6-sheet-image`の`src/character-sheet/components/ProfileSection.tsx`、関連testとimport整列
- 観測した失敗: 画像Gateの初回`npm run check`で型エラー3件を確認・修正した後、全体checkを再実行してa11y lintとBiome整列・formatの残件により2回目も失敗させた。drag and drop領域をstaticな`div`へ置いたことがa11y lintの主因だった。
- 一次対応: drop領域をfile pickerを開けるnative `button`へ変更し、対象ファイルへBiomeのfixを適用する。画像のdrop・button操作は同じhandlerへ渡す。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated a TypeScript check failure while renaming dictionary keys

#### 2026-07-27

- source: self
- 発生箇所: `src/character-sheet/dictionary.ts`と`src/character-sheet/components/ProfileSection.tsx`
- 観測した失敗: `sections`から`terms`への辞書構造のリネーム時に、最初は同名キーのうち誤った側を変更し、次は辞書の`credit`とフォーム値の`credit`を同一scopeで衝突させた。同一作業中のTypeScript checkが2回失敗した。
- 一次対応: リネーム対象を`gameDomain`配下へ限定し、辞書由来の参照は`creditTerms`としてフォーム値と明確に区別する。変更後に型検査、build、関連Component testを実行する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Retried a browser interaction before Astro client hydration completed

#### 2026-07-25

- source: self
- 発生箇所: `ex-02-5-sheet-dialogs`の`tests/visual/character-sheet.spec.ts`
- 観測した失敗: `page.goto()`直後にReact Island内の確認dialog openerをclickしたため、client hydration前のclickがstate更新へ届かず、dialogが見つからないPlaywright失敗を繰り返した。入力値の保持確認もhydration前の入力では安定しなかった。
- 一次対応: dialogを開くユーザー操作を短い`expect(...).toPass()`で再試行し、client側の操作が有効になった後に確認を開始するようtestを修正した。test-onlyのhydration stateやDOM属性は追加していない。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated an accessibility lint failure while wiring FormulaTooltip hover behavior

#### 2026-07-25

- source: self
- 発生箇所: `FormulaTooltip`のhover領域
- 観測した失敗: hoverを維持するためのstatic要素へevent handlerを置き、a11y lintを実行後にARIA roleだけを足して同じlint失敗を2回繰り返した。要素の入れ子とpointer移動を先に整理せず、lint出力への局所的な対応を試みた。
- 一次対応: Tooltipをtrigger buttonの子要素へ移し、hover handlerもbuttonへ限定した。これによりTooltip上へのpointer移動もbuttonの領域内に保ち、static要素へのhandlerを不要にした。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated an E2E invocation while the preview server occupied its port

#### 2026-07-24

- source: self
- 発生箇所: `ex-02-4-sheet-profile`のPlaywright最終確認
- 観測した失敗: `playwright.e2e.config.ts`が`reuseExistingServer: false`で自身のpreview serverを起動する契約を確認せず、すでに4321でpreviewを起動した状態で同じE2Eを実行した。workerの同種失敗に続き、port使用中でE2Eが開始できない失敗を繰り返した。
- 一次対応: Techレビュー完了後に自分で起動したpreviewだけを停止し、`npm run build`後にE2E configへserver起動を任せて再実行した。以後、Playwright configの`webServer`と既存previewの共存可否を確認してから実行する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated a focus-style assertion with an unstable focus-visible setup

#### 2026-07-24

- source: self
- 発生箇所: `ex-02-3-sheet-section-frame`のPlaywright focus確認
- 観測した失敗: Techレビュー後に追加したfocus ringのbrowser testで、programmatic focusの後に`:focus-visible`が適用されると仮定し、同じ`box-shadow: none`失敗を2回繰り返した。Playwrightのfocus modalityとCSS selectorの関係を確認せず、keyboard操作の検証方法を十分に切り分けていなかった。
- 一次対応: frame内で切れないfocus ringを`:focus`で明示し、ユーザー操作としてのEnter / Space・focus保持を既存browser testで確認する。focusの見た目を自動検証する場合は、最初にselectorが実際のbrowser focus modalityで適用されることを確認する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Parallel Playwright capture exhausted the Chromium sandbox

#### 2026-07-24

- source: self
- 発生箇所: `character-sheet` design draftの既存capture一括更新
- 観測した失敗: 独立したPlaywright Chromium起動を9本並列実行し、2本がsandbox hostの`Operation not permitted`で起動直後に終了した。直後のsandbox内逐次再試行も同じ制約で失敗した。prototypeまたはcapture scriptの失敗として扱うべきではない実行競合・sandbox制約を作った。
- 一次対応: 失敗したcaptureは並列実行を避け、sandbox外の承認済み逐次実行で再生成した。複数のローカルcaptureを更新する際は、Chromiumを同時起動せず、必要時は最初から承認済みのcapture commandを使う。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated direct Playwright listing bypassed the VRT script

#### 2026-07-23

- source: self
- 発生箇所: PR #68 第2回Technical Reviewのtarget filter検証
- 観測した失敗: `npx playwright test --config playwright.config.ts --list`を2回実行し、VRT専用の`tests/visual/vrt`指定を持つ`npm run visual:test`を経由しなかった。そのため無関係なtest fileも読み込み、Node ESMのJSON import attribute errorでtest listを作れなかった。
- 一次対応: `npm run visual:test -- --list --grep ...`へ切り替え、`@items`が`items-*`を含む21件に一致することを確認した。VRT scriptの対象directoryと既定configを手作業で再現せず、package scriptから検証する。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated VRT state-preparation failures before client hydration

#### 2026-07-28

- source: self
- 発生箇所: `ex-02-11-sheet-noncombat` の `tests/visual/vrt/character-sheet.spec.ts`
- 観測した失敗: locator screenshot captureの初回実行で、非戦闘技能を開くclickとheader tooltipのhoverをclient hydration完了前に一度だけ実行した。tablet / mobileを中心に同じ状態準備が6件失敗し、`脅迫を得意技能にする`がhiddenのまま、またはtooltipが存在しない状態でtimeoutした。
- 一次対応: open stateは可視になるまでの短い`expect(...).toPass()`内で、閉じている場合だけclickする。tooltip stateもhoverとvisible確認を同じ再試行境界へ置く。VRTのstate準備はこの範囲に留め、最終smoke E2Eへ局所UIの再試行を持ち込まない。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05

### Repeated G12 primary-ryugi browser-operation timeouts

#### 2026-07-28

- source: self
- 発生箇所: `ex-02-12-sheet-primary-skills` のprimary ryugi select操作とVisual Review capture
- 観測した失敗: Playwrightの実ブラウザでプライマリ流儀または生き様のselect変更を行うと、変更後のフォーム再描画を待つ操作がtimeoutした。同じ失敗を原因確定前に複数回繰り返し、G12のlocator captureも完了できなかった。
- 一次対応: 一時的な切り分け変更はすべて戻し、dev serverを既定portで再起動した。今後は既存form更新経路の最小再現を先に作り、再描画を伴わないdialog操作と区別してから、G12 UIまたはform stateへ修正を加える。

- disposition: user-directed no-action; uncategorized self entry with no duplicate title in the active log
- moved: 2026-08-05
