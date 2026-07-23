# 対応済みAgent Failure履歴

このファイルは、`docs/agent-failure-log.md` から退避した対応済みfailureの履歴を保持する。

`docs/agent-failure-log.md` は未反映・未確認failureを中心に保つ。failureを退避する場合は、削除ではなくこのファイルへ移す。

退避判断と恒久対応案の監査は `.agents/skills/failure-log-audit/SKILL.md` に従う。

## 退避条件

- 対象failureへの恒久対応が完了している
- 対応先の `AGENTS.md`、`.agents/skills/*`、`.agents/rules/*`、または関連docsが明記されている
- ユーザーが対応済み扱いを確認している
- コミット指示が出た直前、またはfailure-log監査の承認済み整理として実行する

plan / TODOの完了退避とは条件が異なる。単に作業が終わっただけ、または一時対応だけのfailureは退避しない。

## 記録形式

```md
### failure category

#### YYYY-MM-DD

- 発生箇所:
- 観測した失敗:
- 一次対応:
- 恒久対応:
- moved: YYYY-MM-DD
```

## 対応済み

### Repeated formatter feedback during implementation

#### 2026-07-09

- source: self
- 発生箇所: `18-0-release-notes-data` の `src/lib/schemas/release-notes.ts`、`scripts/convert-release-notes/lib.ts`、`tests/node/release-notes.test.ts`
- 観測した失敗: `npm run check` でTypeScriptの `unknown` 絞り込み不足を修正した後、Biome format / organize imports指摘を同じ作業中に複数回発生させた。さらにExcel読取依存を差し替えた後も、返り値型の `null` 考慮漏れとimport名順で `npm run check` を再度失敗させた。`npm run format` だけではorganize importsが解決しないことを見落とし、同じ `npm run check` 失敗を繰り返した。
- 一次対応: 対象ファイルのimport順と型を手修正し、`npx biome check` で局所確認してから `npm run check` を再実行して通した。`exceljs` は `npm audit` で推移依存のmoderate vulnerabilityが残ったため、`read-excel-file` と `fflate` へ差し替えた。

#### 2026-07-08

- source: self
- 発生箇所: `phase-2-prep-markdown-formatting` の `npm run format:md`
- 観測した失敗: Markdown formatter導入中、1回目はsandbox上read-only扱いの `.agents/skills/*.md` への書き込みで失敗し、2回目は `markdownlint-cli2` のglob除外設定が不十分で `node_modules/**/*.md` までlint対象に含めて失敗した。
- 一次対応: 既存Markdown一括formatの承認範囲に従って権限付きでformatterを再実行し、`markdownlint-cli2` の対象globをGit管理対象のMarkdown配置先へ限定した。

#### 2026-07-06

- 発生箇所: `12-mobile-menu` の `src/scripts/mobile-menu.ts`
- 観測した失敗: `npm run check` でBiome formatter指摘を受けた後、同じファイルで別のformatter指摘を再度発生させた。
- 一次対応: Biomeの指摘どおりに改行・インデントを修正し、`npm run check` を通した。

#### 2026-07-06

- 発生箇所: `13-page-toc` の `scripts/lib/page-toc-postprocess.ts` と `tests/page-toc-postprocess.test.ts`
- 観測した失敗: `npm run check` でBiome formatter / organize imports指摘を受けた後、同じStep 2作業中に追加のBiome指摘を再度発生させた。
- 一次対応: 対象ファイルに限定して `npx biome check --write` を実行し、`npm run check` を通した。

#### 恒久対応

- `.agents/rules/work-report.md` へ、TypeScript、JavaScript、Astro、test file変更時にBiomeのformat / organize-imports指摘が関係する場合は、`npm run check` を繰り返す前に対象ファイルへ `npx biome check --write <changed-code-files>` を実行する手順を追記した。
- moved: 2026-07-11

### PR creation through gh caused body corruption

#### 2026-07-08

- source: user
- 発生箇所: `phase-2-prep-markdown-formatting` のPR #25作成
- 観測した失敗: `gh pr create --body "..."` にMarkdown本文を直接渡したため、shellがバッククォート内をコマンド置換として解釈し、PR本文の `docs/issue/...`、`review-to-issue`、`docs/agent-failure-log.md` が壊れた。さらに `gh pr edit` はGitHub側GraphQLのclassic Projectsフィールドエラーで失敗し、REST API fallbackが必要になった。
- 一次対応: PR本文をREST APIで修正した。
- 恒久対応: PR作成とPR metadata更新をGitHub connector経由で行い、`gh pr create` / `gh pr edit` / `gh api` を標準のPR書き込み経路にしないよう `AGENTS.md`、`.agents/skills/create-pr/SKILL.md`、`.agents/skills/README.md`、`.agents/rules/git-operations.md` へ反映した。
- moved: 2026-07-08

### Hero layout visual capture retained unrelated Pagefind failures

#### 2026-07-23

- source: self
- 発生箇所: `ex-03-hero-layout-stability` の `npm run visual:capture`
- 観測した失敗: 初回はPagefind index未生成のため検索modal 2件が失敗した。index生成後の再実行では、`-local/data-cards`の検索結果も含まれ、既存search modal test 3件がstrict locator重複で失敗した。一方、追加したhero layout test 2件は通過した。
- 一次対応: index生成後の結果で対象testの成功を確認し、同じcaptureを再実行しなかった。Pagefindの`-local`除外または既存search testのlocator絞り込みはcurrent issue外として別途扱う。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Visual capture rerun exposed unrelated Pagefind search failures

#### 2026-07-23

- source: self
- 発生箇所: `ex-01-page-navigation-links` の `npm run visual:capture`
- 観測した失敗: Pagefind indexなしの初回captureでは検索UIの2件が失敗した。index生成後の再実行では、`-local/data-cards`もindex化されたため、既存の検索結果testが同一アンカーを2件見つけ、search modalの3件がstrict locatorで失敗した。
- 一次対応: 前後ナビゲーションのVisual Reviewは、対象componentだけを実行するcaptureで継続する。`-local`ページのindex除外またはsearch testの対象絞り込みはcurrent issue外として扱い、恒久対応を別途検討する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Visual capture repeated without the required Pagefind index

#### 2026-07-23

- source: self
- 発生箇所: `34-2-items-pages` の `npm run visual:capture`
- 観測した失敗: `npm run build`後のpreviewに対してVisual Captureを2回実行したが、Pagefind indexを生成していなかった。そのため、武器ページのdesktop / mobile Visual Testは成功した一方、既存の`data.spec.ts`と`search-modal.spec.ts`の検索結果を期待する4件が同じ理由で失敗した。
- 一次対応: 実装対象の武器Visual Testは成功し、`test-results/visual/items-weapons-desktop.png`と`test-results/visual/items-weapons-mobile.png`を取得した。検索を含むVisual Captureを再実行する前に、Pagefind indexを生成する手順を確認する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Ikizama review changes missed formatter requirements twice

#### 2026-07-22

- source: self
- 発生箇所: `31-2-ikizama-index-page` の`tests/visual/character-making.spec.ts`と`docs/issue/31-2-ikizama-index-page.md`に対する`npm run check`
- 観測した失敗: 実装後のVisual Test追記とVisual Review記録で、Biomeとdprintが求める改行・表列幅の形式を手動編集で外し、同一作業中に`npm run check`のformatter検証を2回停止させた。
- 一次対応: formatter出力に従って対象を整形し、`npm run format:md`を実行した。以後の再検証はformatter適用後に行う。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Visual capture used dev server without page-TOC postprocessing

#### 2026-07-22

- source: self
- 発生箇所: `32-2-ikizama-detail-page` の `npm run visual:capture -- --grep @ikizama-detail`
- 観測した失敗: Page TOCがbuild後のHTML postprocessで生成されることを確認せず、Astro dev serverに対してdesktopとmobileのVisual Testを実行したため、両方で目次が空として失敗した。ページ実装ではなく検証用serverの選択が原因だった。
- 一次対応: dev serverを停止し、`npm run build`後にpreview serverへ切り替えてVisual Testを再実行する。page TOCを検証するVisual Testはpostprocess済みの出力を使う。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Ikizama skills conversion specification table formatting repeated

#### 2026-07-22

- source: self
- 発生箇所: `32-0-ikizama-detail-data` の `docs/conversion/ikizama-skills.md` にある関連アイテム種別の表
- 観測した失敗: `npm run check:md` が示したdprintの表列幅差分を手動で反映したが、期待する列幅を再現できず、同じMarkdown整形チェックを2回連続で失敗させた。
- 一次対応: 手動で空白数を推測して直し続けず、対象ファイルだけをdprint formatterへ渡してから`npm run check:md`で確認する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Design draft overrode contents instructions

#### 2026-07-22

- source: user
- 発生箇所: `29-2-ryugi-index-page` の `docs/design/ryugi-index/` initial draft
- 観測した失敗: ユーザーが`.raw/contents/ryugi-index.md`を他資料より優先すると明示していたにもかかわらず、planとTODOから流儀一覧に全流儀の共通スキルボーナスを追加した。contentsが指定する「ケンカヤの`RyugiDataSection`と4項目説明」「名称リンクとshortDescriptionだけの流儀一覧」を再現せず、design、notes、issueに実装ノイズとなる別の表示方針を書いた。
- 一次対応: flow一覧から全流儀のボーナス表を削除し、contentsの4項目説明と一覧構成へ修正した。contents優先が指定された場合は、下位資料の補足を画面本文やdesignへ追加せず、contentsに存在しない表示を必要と判断した時点で実装前にユーザーへ確認する。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### dprint cache prevented formatting an untracked issue

#### 2026-07-19

- source: self
- 発生箇所: `43-install-pagefind` のissue-first準備における `docs/issue/43-install-pagefind.md` のMarkdown formatter実行
- 観測した失敗: 新規issueだけを対象にdprint formatterを2回実行したが、dprintが既定のcache directoryを作成しようとしてread-only file system errorになり、formatterを完了できなかった。
- 一次対応: 同一formatterを繰り返さず、Markdownlintでissue本文の構文・styleを確認した。新規・未追跡Markdownを安全にformatできるcache設定または専用scriptの要否は、別途検討する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Common skills visual test formatting needed a second correction

#### 2026-07-14

- source: self
- 発生箇所: `28-2-common-skills-page` の `tests/visual/common-skills.spec.ts`
- 観測した失敗: Visual Testの初回追加と個別アンカー検証の追加後、Biomeが求める1行形式を手動で外し、同じ `npm run check` のformatter失敗を同一作業中に2回発生させた。
- 一次対応: formatter差分をそのまま適用し、以後の検証前に新規・変更したTypeScriptの短い呼び出しを既存のBiome形式と照合する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Skill conversion formatter diff was applied with incorrect indentation

#### 2026-07-14

- source: self
- 発生箇所: `28-0-common-skills-data` のレビュー指摘 2に対する`npm run check`
- 観測した失敗: Biomeが示したformatter差分を手動反映した際、オブジェクトプロパティのインデントを1段深くしてしまい、同じ`npm run check`のformatter失敗を再発させた。
- 一次対応: formatter差分を適用する際は、差分の空白数を行単位で確認する。再実行前に対象箇所を読み返す。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Initial data design draft ignored existing layout and card designs

#### 2026-07-13

- source: user
- 発生箇所: `27-2-data-index-page` の `docs/design/data/` initial draft
- 観測した失敗: `/data` のSkillCard凡例と右側説明領域のdesign draftで、既存の`docs/design/skill-card/`が定めるdesktop 3列・mobile 2列のカードgridと、`docs/design/site-layout/`が定めるHeaderを含む既存layoutを比較基準にしなかった。対象領域だけを確認するという指示を、既存layoutを除外してよいという独自判断に置き換え、Headerなし・desktop 2列・mobile 1列のprototypeを作成した。さらに、contents指示が要求していない丸囲み番号のUIを右側説明へ加えた。
- 一次対応: design artifactの修正はユーザーの明示指示まで行わない。再作成時は、既存Headerとlayout文脈を含むviewport captureを使い、SkillCardのdesktop 3列・mobile 2列の既存gridと、contents本文にある見出し付きの説明を維持する。丸囲み番号など新しい装飾を追加しない。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Design canonicalization bypassed the visual test capture

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のdesign正本化
- 観測した失敗: design fixで既存の`tests/visual/scenario-play.spec.ts`によるcaptureを正本化元にすべきところ、独自の`.tmp/design/scenario-play/capture.mjs`を作成して別経路でdesign画像を生成した。
- 一次対応: 独自capture scriptを破棄し、既存visual testのdesktop / mobile captureを元にdesign画像を正本化した。以後、design fixでは既存visual testのcapture経路を使い、専用capture scriptは作成しない。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Contents instruction omitted reviewable Markdown body

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` の `.raw/contents/scenario-play.md` 作成
- 観測した失敗: ユーザーが評価すべきシーン進行ルールの本文を作らず、内容指示をHTMLコメントへ閉じ込めたため、Markdown本文がH1だけになった。
- 一次対応: failure logへ記録した。ユーザーが明示的に修正を指示した後、本文として読めるシーン進行ルールを作成し、HTMLコメントは解釈・実装指示だけに限定する。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Rules page Visual test formatting needed a second correction

#### 2026-07-12

- source: self
- 発生箇所: `23-2-rules-page` の`tests/visual/rules.spec.ts`
- 観測した失敗: 同タスク中にVisual testの追加・更新後、`npm run check`のBiome formatterで2回、Playwrightの期待値の改行形式が不一致となった。
- 一次対応: formatterが要求する複数行形式へ修正し、hero画像の属性検証を再実行する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Ambiguous remote source placeholder replaced an explicit source list

#### 2026-07-11

- source: user
- 発生箇所: `local-content-authoring` の情報源優先順位を更新したSKILL/rule/issue
- 観測した失敗: ユーザーが求めた「リモートモードで確認する情報源の列挙」を、実体のない「ユーザーがリモートで確認するよう明示した情報源」という条件文に置き換えた。どのファイルや正本を確認するかが定義されず、agentが再現可能に実行できない仕様にした。続く修正でも実行環境の取得可否を情報源の優先順位へ混在させ、SKILL入口READMEと後続の動作確認TODOを更新せずに完了チェックを付けた。
- 一次対応: 当該変更を不正確として扱い、remote modeで元から列挙されていたcurrent issue、requirements、plan、out-of-scopeを明示した優先順位へ修正する。関連するSKILL本文、入口README、後続TODO、issueチェックをまとめて照合してから完了扱いにする。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Design canonicalization bypassed visual output convention

#### 2026-07-09

- source: user
- 発生箇所: `18-2-home-page` の `docs/design/home/` 正本化
- 観測した失敗: design正本化時、既存運用では `tests/visual/*` 等のtestコードで実装スクリーンショットを `test-results/` に出力し、そのactual artifactを材料としてdesign正本へ反映する前提があるにもかかわらず、専用 `.tmp/capture-home-design-canonical.mjs` から直接 `docs/design/home/design-*.png` へ書き出した。さらに `notes.md` とissueに「`test-results/` を直接コピーせず再キャプチャした」と記録し、既存の正本化運用との関係を曖昧にした。
- 一次対応: ユーザー確認に対し、既存運用は `test-results/` 由来のactual artifactを材料にする理解が妥当であり、今回の直接書き出しは運用ズレとして扱う方針に修正する。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Visual screenshot bypassed visual test file convention

#### 2026-07-09

- source: user
- 発生箇所: `19-2-release-notes-page` のVisual Review screenshot取得
- 観測した失敗: 画面表示確認では `tests/visual/*` のvisual testファイルを作成または更新し、そのtest実行から `test-results/` へスクリーンショットを出力するべきだった。にもかかわらず、`node -e` の独自Playwrightコマンドを直接実行して `test-results/visual-implementation/*.png` を作成した。これは `18-2-home-page` のdesign正本化時に `.tmp/capture-home-design-canonical.mjs` から直接画像を書き出した手順逸脱に続く、同種の2回目の指摘である。
- 一次対応: 本ログへ2回目の手順逸脱として記録した。以後、画面表示確認・Visual Reviewのスクリーンショット取得は、既存または新規の `tests/visual/*` を通して実行し、独自の一時Playwright scriptや `node -e` で代替しない。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Page description changed without confirmation

#### 2026-07-09

- source: review
- 発生箇所: `18-2-home-page` の `src/pages/index.astro`
- 観測した失敗: トップページ実装中、`.raw/contents/home.md` のfrontmatterに `description` がない状態で、ユーザー確認なしにページ固有の新しい `description` 文言を作成した。人間一次レビューでは文言自体は問題ないが、独自判断で変更した点が逸脱として指摘された。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、指摘対応時に今回の文言をdefault descriptionへ反映する方針を記録した。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Design draft overproduction and method drift

#### 2026-07-05

- 発生箇所: `09-base-layout` のdesign画像生成
- 観測した失敗: design画像が未レビューのドラフトであるにもかかわらず、SiteMenu風の文言やスコープ外導線の混入にこだわって複数回画像生成を行い、最終的にSVGを手作りしてPNGへ変換するという、当初の画像生成手順から逸脱した生成へ進んだ。
- 一次対応: 生成済みdesign artifactはcommitせず未追跡に残し、`docs/issue/done/phase-2/09-base-layout.md` から画像生成済み扱いを取り除いた。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Out-of-scope UI leakage in design artifacts

#### 2026-07-05

- 発生箇所: `09-base-layout` の `design-desktop.png`
- 観測した失敗: パンくずリストをdesign画像に含めない方針を `notes.md` に記録した後も、`Chapter 1 / Foundation` というスラッシュ付きラベルが残り、パンくずリストのように見える状態になっていた。
- 一次対応: `design-desktop.png` の該当ラベルを `Rule text sample` に変更し、パンくず風のスラッシュ表現を削除した。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Repeated design image conversion failure

#### 2026-07-06

- 発生箇所: `12-1-site-menu-layout-copy` の `docs/design/mobile-menu/design-mobile-open.png` 更新
- 観測した失敗: ImageMagick `convert` で `.tmp/mobile-menu-design-open.svg` をPNG化する際、同じ `non-conforming drawing primitive definition ','` エラーを複数回発生させた。
- 一次対応: SVG内のfont-family指定からImageMagickが解釈しづらいcomma指定を外し、SVGをPNG化した後に `メニュー` ラベルをImageMagick annotateで合成した。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Design canonicalization from unprocessed dev output

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `docs/design/site-layout/design-mobile-page-toc-open.png`
- 観測した失敗: build後postprocessでH1横へ移動するMobilePageTocを、dev server由来の未postprocess DOMから撮影してdesign正本化したため、実ブラウザ確認ではH1下に表示される目次がdesign正本ではH1上に表示されていた。
- 一次対応: visual testに `data-mobile-page-heading` の存在確認を追加し、build後previewのpostprocess済みDOMに対してスクリーンショットを再取得した。あわせてMobilePageTocのH1+trigger sticky挙動を実装・検証した。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Ambiguous design canonicalization approval

#### 2026-07-12

- source: review
- 発生箇所: `22-2-character-making-page` の`docs/design/character-making/design-desktop.png`と`design-mobile.png`更新
- 観測した失敗: Visual Review actualをdesign正本へ反映する前に、ユーザーのdesign正本化許可が曖昧な状態だった。ユーザーは後に、actualを最終的なdesign正本へ反映する方針自体は正しく、問題は明確な許可前にコピーしたことだと訂正した。
- 一次対応: ユーザーは文言修正後のactualをdesign正本へ反映することを明示許可した。以後、design fixではactualを正本化してよいかを事前に明示確認し、その許可とcapture元を`notes.md`とissueへ記録する。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Visual capture used dev output before PageToc postprocess

#### 2026-07-12

- source: agent self-report
- 発生箇所: `25-2-battle-page` のVisual Review capture
- 観測した失敗: sandbox外で起動したPlaywrightの初回test修正後、dev serverを対象にcaptureした。dev outputにはbuild後のPageToc postprocessが反映されないため、desktop / mobileともPageTocが空でVisual testが失敗した。
- 一次対応: build後のpreview serverを対象にcaptureする。PageTocを確認するVisual Reviewでは、dev serverをcapture対象にしない。

#### 2026-07-12（追記）

- source: agent self-report
- 発生箇所: `25-2-battle-page` の関連Visual test
- 観測した失敗: 戦闘ページのフラグメントリンクを追加した後、buildを更新せずに既存previewへ関連Visual testを実行したため、古い出力にリンクがなくscenario-play testが失敗した。
- 一次対応: previewを使うVisual testの前に、対象ソース変更後の `npm run build` が完了していることを確認し、既存previewを再起動する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Resolved content conflict was left as an unresolved placeholder

#### 2026-07-12

- source: user
- 発生箇所: `.raw/contents/advancement.md` の能力値成長節
- 観測した失敗: ユーザーが各算出は現行のキャラクターメイキングを正と明示したにもかかわらず、agentは旧資料との矛盾を理由に能力値成長を未確定HTMLコメントのまま残した。さらに、ユーザーが明示的に上2点の反映を指示した後も、未確定節を確定本文へ更新しなかった。
- 一次対応: 現行`src/pages/character-making.mdx`の格の定義（プライマリ流儀のレベル＋生き様のレベル）を使い、格15ごとの能力値成長、成長点、同一能力値への一度の配分上限を本文へ明記した。以後、ユーザーが競合の採用元を明示した場合は、未確定コメントを残さず、指定された範囲の本文と指示を同じ変更で確定する。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Unnecessary alternate-port preview during design canonicalization

#### 2026-07-12

- source: user
- 発生箇所: `26-2-advancement-page` のdesign正本化準備
- 観測した失敗: 4321番portに既存previewがある状態で、そのpreviewをcapture元として使えるかをsandbox外のbrowser実行で確認する前に、新しいpreviewを起動した。Astroが4322へ退避したため停止してユーザー確認を求めたが、その後もsandbox内の接続失敗をport未使用と誤認し、再度4322への退避を発生させた。さらに、既存のcaptureワークフローを使わず、agentが作成した `.tmp/design/advancement/capture.mjs` を実行してdesign正本を書き出そうとした。
- 一次対応: 既存previewのsocket確認とbrowser captureは、同じ実行環境で行う。4321が使用中の場合は新しいserverを起動せず、既存previewが対象commitの生成物かを確認する。別portへの退避が起きた時点で、そのserverを停止し、ユーザーの明示許可がない限り再起動しない。正本化では、既存の承認済みcapture workflow以外のアドホックな `.tmp/*.mjs` を作成・実行しない。

#### 恒久対応

- `package.json` の `visual:capture` はcapture manifestへbranch、HEAD、開始時刻、実行引数を記録するwrapperへ変更した。
- `visual:canonicalize` は同一HEADのmanifestと、capture開始後に更新されたdesktop / mobile artifactを検証してから、design正本と`notes.md`のprovenanceを更新する。
- `.agents/skills/design-image-generation/SKILL.md` と `.agents/skills/visual-implementation-review/SKILL.md` に、既存visual workflowの使用、アドホックcapture禁止、4322以降へのfallback禁止を明記した。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### Biome formatter write did not apply

#### 2026-07-13

- source: agent self-report
- 発生箇所: `27-1-skill-card-component` の`tests/visual/skill-card.spec.ts`
- 観測した失敗: `npm run check` が新規Visual testのBiome format差分で失敗した。続けて `npm exec biome format --write tests/visual/skill-card.spec.ts` を実行したが、差分を表示するだけで書込みが行われず、同じformat errorが残った。
- 一次対応: formatterが示した改行・インデントを`apply_patch`で反映し、`npm run check`で再確認する。formatterのwrite実行を前提にせず、失敗時は差分とファイル内容を照合して手動修正後に検証する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Markdown formatter check was rerun after a cache write failure

#### 2026-07-15

- source: self
- 発生箇所: `29-0-ryugi-index-data` の `docs/conversion/ryugi-index.md`
- 観測した失敗: dprintの対象ファイル整形を試みたが、既定cache directoryへの書込みがread-only filesystemで失敗した。その結果を確認せず、未整形のまま同じ`npm run check:md`を再実行して同じtable format errorを2回発生させた。
- 一次対応: formatterの失敗後は、出力と対象ファイルの変更有無を確認してから再検証する。今回のtable整形は`apply_patch`で反映し、以後のcheckは差分確認後に1回だけ実行する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Page-specific content was invented from agent-authored assumptions

#### 2026-07-21

- source: user
- 発生箇所: `30-2-ryugi-detail-page` の `src/pages/data/ryugi/[ryugiId].astro`
- 観測した失敗: 流儀詳細の実装で、ユーザーの当時のコンテンツ指示に含まれていない関連ページリンクを独自に追加した。また、データにないケンカヤ固有の画像説明を`heroAlt`として分岐実装した。後者はagent自身が作成したdesign noteの文言を根拠にしており、独立した正本ではない。要件・既存実装・agent作成物の記述を、ユーザー承認済みのページ本文や画像代替テキストの根拠として扱った。
- 一次対応: 関連ページリンクとケンカヤ固有の`heroAlt`は、明示されたcontentsまたはデータから導ける範囲に限定する。agentが作成したdesign noteやprototypeの固有文言は、ユーザーが採用を明示しない限り新しい実装コンテンツの根拠にしない。既存実装の修正は、現在のreview-to-issue手順に従いユーザー承認後に行う。

#### 恒久対応

- AGENTS.mdの`.raw/contents/<slug>.md`最優先規約、`.agents/skills/contents-markdown-authoring/SKILL.md`、Phase D後の`docs/design/` notes-only運用で、contentsを根拠としない表示・design artifactの追加を防ぐ手順へ統一した。
- moved: 2026-07-23

### Repeated visual capture against stale build output

#### 2026-07-22

- source: agent self-report
- 発生箇所: `29-2-ryugi-index-page` のPageToc修正後のVisual Test
- 観測した失敗: `RyugiDataSection`のPageToc除外属性を修正した後、`npm run build`で`dist/`を更新せずに`npm run visual:capture`を2回実行した。captureはpostprocess済みの既存build出力を使うため、両回とも旧出力のH3を読み、同じPageToc assertionが失敗した。
- 一次対応: PageTocまたは生成HTMLに影響する変更後は、Visual Testの前に必ず`npm run build`を実行する。Visual Test失敗時は、ソース変更かbuild出力の鮮度かを先に区別してから再実行する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Visual test ran before the Pagefind index was generated

#### 2026-07-22

- source: agent self-report
- 発生箇所: `34-0-items-data` のSkill ID移行後の `tests/visual/search-modal.spec.ts`
- 観測した失敗: build済みpreviewに対して検索Visual Testを実行したが、`dist/`へPagefind indexを生成していなかった。そのため、検索結果を期待するdesktop testと短い日本語検索のtestが同じ理由で失敗した。
- 一次対応: 検索結果を検証するVisual Testの前に、`npm run build`の後でPagefind indexを生成し、previewをその出力から再起動する。Pagefind依存testの失敗時は、IDや検索UIの変更とindex未生成を先に区別する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Repeated formatter failure while updating a Visual Test selector

#### 2026-07-23

- source: self
- 発生箇所: `34-1-item-card-components` の `tests/visual/search-modal.spec.ts`
- 観測した失敗: `SkillCard`のDOM変更に合わせてselectorを更新した際、Biomeが要求する複数行呼び出しの改行位置を確認せず、同じ`npm run check`を2回formatter不一致で停止させた。
- 一次対応: formatter出力の差分をそのまま`apply_patch`へ反映し、同一検証を再実行する前に対象行を読み直す。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23

### Canonical design was captured before its implementation was committed

#### 2026-07-23

- source: review
- 発生箇所: `40-2-404-page` の`docs/design/404/` canonicalization
- 観測した失敗: 404実装を未コミットworktreeに置いたままcanonicalizeを実行し、`notes.md`のsource commitには実装前の`e71bbb1`を記録した。そのcommitには404ページ、Visual Test、design artifactがなく、正本画像を固定済み実装から再現できない。
- 一次対応: PR #63のローカルレビューでcurrent issueへ記録した。以後、canonicalizeは対象実装を含むcommitをHEADにしてから実行し、source commitが画面状態を再現できることを確認する。今回の再captureとprovenance更新はユーザー承認後に行う。

#### 恒久対応

- Phase Dで`docs/design/`をnotes-onlyへ移行し、比較正本をPlaywright snapshotへ統合した。`AGENTS.md`、`.agents/skills/design-image-generation/SKILL.md`、`tests/visual/README.md`で旧design画像の正本化経路を廃止した。
- moved: 2026-07-23

### VRT comparison ran after a non-Pagefind build

#### 2026-07-23

- source: agent self-report
- 発生箇所: `49-50-accessibility-responsive-pass` のVRT構成移行後の`npm run visual:test`
- 観測した失敗: `npm run visual:build`で作成したPagefind indexを含む出力に対してVRTを準備した後、通常の`npm run build`を実行した。同じpreviewで全件VRTを再実行したため、検索結果stateの3 viewportがPagefind indexを読めず失敗した。
- 一次対応: VRT実行の直前には、通常buildではなく`npm run visual:build`を最後に実行する。検索結果stateが失敗した場合は、UIやselectorを修正する前に`dist/pagefind/`の有無とbuild手順を確認する。

#### 恒久対応

- `npm run visual:build`をPagefind indexを含む唯一のVRT準備コマンドとし、`visual:capture`専用config、`tests/visual/README.md`、`.agents/skills/visual-implementation-review/SKILL.md`でbuild済み4321 previewとtarget限定実行を定義した。
- moved: 2026-07-23

### Repeated formatter failure while restoring temporary VRT capture

#### 2026-07-23

- source: agent self-report
- 発生箇所: `49-50-accessibility-responsive-pass` の`.agents/skills/visual-implementation-review/SKILL.md`
- 観測した失敗: `npm run format:md`が対象skillへの書き戻し時にread-only file systemエラーで停止した。その後の`npm run check`で、2桁の番号付き手順の継続行に必要なindentが1文字不足している同じMarkdown整形不一致を検出した。
- 一次対応: formatterが示した4文字indentを`apply_patch`で反映した。formatterが書き戻せない場合は、同じformatter出力を再実行する前に、対象行の差分を読み取り`apply_patch`で修正してから`npm run check`を実行する。

#### 恒久対応

- formatter / linterの指摘を、修正後の最終確認が通ればfailureとして記録・報告しない方針を`AGENTS.md`、`.agents/rules/work-report.md`、`docs/agent-failure-log.md`へ反映した。
- moved: 2026-07-23
