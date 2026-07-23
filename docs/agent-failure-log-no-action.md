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
