# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

同種失敗の監査と恒久対応案の整理は `.agents/skills/failure-log-audit/SKILL.md` に従う。

このファイルは未反映・未確認failureを中心に管理するactive failure logである。対応済みfailureを退避する場合は、削除せず `docs/agent-failure-log-done.md` へ移す。

failureのdone退避は、恒久対応が完了し、反映先が記録され、ユーザー確認を受けた場合に限る。plan / TODOの完了退避とは条件を混ぜない。

---

## 目的

- ユーザーが指摘したエージェントの不適切な振る舞いを失われない形で残す
- 実装中にユーザーまたはエージェント自身が観測した失敗、手順違反、判断ミス、検証不足を記録する
- build、check、formatter、型検査、テストで同種の失敗を繰り返した場合に、エージェント自身が後から分析できる形で蓄積する
- 後続で `AGENTS.md`、`.agents/skills/*/SKILL.md`、docs、チェックリスト、レビュー手順へ恒久対応として反映する
- 同じ失敗を繰り返さないための判断材料にする

---

## 記録対象

以下に該当するものを記録する。

- ユーザーの明示指示より先に実装、生成、commit、push等を進めた
- issue-first workflow、design workflow、review workflowなどの停止地点を誤った
- スコープ外の機能、導線、UI、design要素を作った
- 既存SSoTと矛盾する判断をした
- 未検証の内容を検証済みのように扱った
- 生成物、画像、スクリーンショット、remote draft、実装結果の位置づけを混同した
- ユーザーの未コミット変更や未追跡ファイルを誤って扱うリスクがあった
- build、check、formatter、型検査、テストで同種のエラーや指摘を繰り返した
- 同じ修正方針で複数回失敗し、別の調査や恒久対応が必要になった
- 恒久対応としてルール、skill、チェック手順に反映した方がよい失敗

通常の実装品質レビュー、設計改善提案、単発の軽微な修正依頼は、このファイルの記録対象ではない。

review-to-issueでレビュー指摘を扱う場合も、以下のいずれかに該当する指摘だけをfailure-log候補とする。

- ユーザー承認なしに進めた作業
- workflow上の停止地点を越えた作業
- current issueの範囲を誤って拡大した作業
- 検証していない内容を検証済みとして扱った作業
- remote snapshot、review draft、actual screenshot、design正本などの位置づけを混同した作業
- 同じcheck、build、formatter、test、型エラーを同一作業中に2回以上繰り返した作業
- 恒久的なrules / SKILL / checklist更新が必要になりうる判断ミス

source種別は以下を使う。

- `user`: ユーザーが直接指摘した失敗
- `self`: エージェント自身が作業中に観測した失敗
- `review`: review-to-issueで扱ったレビュー指摘から、agent failureとして妥当だと判断した失敗
- `unknown`: sourceを特定できないが記録が必要な失敗

---

## 運用方針

- このファイルは失敗の一次記録であり、恒久対応そのものではない。
- 恒久対応を行う場合は、別タスクとして `AGENTS.md`、該当SKILL、または関連docsへ反映する。
- 反映済みになった項目は、削除せず「恒久対応」欄へ反映先を追記する。
- current issueで扱うべき修正を、このファイルへ逃がさない。
- 通常の後続開発TODOは `docs/TODO.md` で管理する。
- 対応済みfailureは、ユーザー確認後に `docs/agent-failure-log-done.md` へ退避できる。
- review-to-issueでfailure-log候補を記録しても、review-to-issueの停止地点は変えない。記録後はユーザー確認を待つ。
- 同じ失敗カテゴリに3回以上の発生詳細が積み重なっている場合は、作業報告でユーザーに通知し、恒久対応候補として明示する。

---

## 記録テンプレート

```md
### short-title

#### YYYY-MM-DD

- source: user / self / review / unknown
- 発生箇所:
- 観測した失敗:
- 一次対応:
```

---

## 未反映

### Design canonicalization bypassed the visual test capture

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のdesign正本化
- 観測した失敗: design fixで既存の`tests/visual/scenario-play.spec.ts`によるcaptureを正本化元にすべきところ、独自の`.tmp/design/scenario-play/capture.mjs`を作成して別経路でdesign画像を生成した。
- 一次対応: 独自capture scriptを破棄し、既存visual testのdesktop / mobile captureを元にdesign画像を正本化した。以後、design fixでは既存visual testのcapture経路を使い、専用capture scriptは作成しない。

### Validity-check request was treated as implementation approval

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のcontents再レビュー回答
- 観測した失敗: ユーザーが「俺の返答の妥当性確認」と求めた判断依頼を、コンテンツ修正の実装許可と誤認して未承認の本文・MDX・テスト・issue編集を行った。
- 一次対応: ユーザーの明示的な反映指示があるまで、今回の未コミット差分へ追加の編集・commitを行わない。判断依頼では評価のみを返し、反映は「修正して」「反映して」等の明示指示を待つ。

### PR review draft was not routed through review-to-issue

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のPR #38初回レビュー
- 観測した失敗: `pr-review-draft`でdocument / technical review記録を作成した後、必須の`review-to-issue`を実行せず、レビューの検証・issueへの正式取り込みを行わなかった。
- 一次対応: ユーザーがPRレビューを無視すると指定したため、当該指摘はissueへ取り込まない。以後のPR reviewでは、結果報告前に`review-to-issue`の完了を確認する。

### Contents instruction omitted reviewable Markdown body

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` の `.raw/contents/scenario-play.md` 作成
- 観測した失敗: ユーザーが評価すべきシーン進行ルールの本文を作らず、内容指示をHTMLコメントへ閉じ込めたため、Markdown本文がH1だけになった。
- 一次対応: failure logへ記録した。ユーザーが明示的に修正を指示した後、本文として読めるシーン進行ルールを作成し、HTMLコメントは解釈・実装指示だけに限定する。

### Commit message language did not follow repository convention

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のサイトメニュー順序変更commit
- 観測した失敗: 直近の英語コミットメッセージ形式を確認せず、日本語のcommit messageを作成した。
- 一次対応: ユーザー許可のsoft resetで当該commitを取り消し、同一差分へ英語のcommit messageを付けて作り直す。

### Rules page Visual test formatting needed a second correction

#### 2026-07-12

- source: self
- 発生箇所: `23-2-rules-page` の`tests/visual/rules.spec.ts`
- 観測した失敗: 同タスク中にVisual testの追加・更新後、`npm run check`のBiome formatterで2回、Playwrightの期待値の改行形式が不一致となった。
- 一次対応: formatterが要求する複数行形式へ修正し、hero画像の属性検証を再実行する。

### Rules visual test matched a duplicated heading outside the article

#### 2026-07-12

- source: self
- 発生箇所: `23-2-rules-page` の`tests/visual/rules.spec.ts`
- 観測した失敗: `ルール`見出しをページ全体の`getByRole`で数えたため、本文外の同名見出しも含めてdesktop / mobileのVisual testがともに失敗した。本文領域へ限定した再実行でも、`getByRole`の部分一致により`ゴールデンルールを参照する`を同時に数えて同じ2テストが失敗した。
- 一次対応: 検証対象を`article.mdx-layout`内へ限定し、H1の検証には`exact: true`を指定した。本文の見出し、Callout、リンク、hero非表示だけを確認する。

### Character-making visual capture required two corrective attempts

#### 2026-07-12

- source: self
- 発生箇所: `22-2-character-making-page` の`tests/visual/character-making.spec.ts`とVisual Review
- 観測した失敗: 初回のVisual testは、本文の内部リンク数を検証する際にSiteMenuの同名リンクも数えて失敗した。本文領域へ検証対象を限定した再実行は、sandbox内でChromiumが起動できず失敗した。
- 一次対応: 本文の`article.mdx-layout`内だけを検証対象にし、Playwrightのcaptureはsandbox外実行へ切り替えた。desktop / mobileのcaptureは成功した。

### MDX emphasis and PageToc preview verification were incomplete

#### 2026-07-12

- source: user
- 発生箇所: `21-2-world-page` の`/world`実装とVisual Review
- 観測した失敗: `**〈仕事人〉**`をMDX本文へそのまま書いたため、出力でMarkdown記法の`**`が可視化された。また、build後の処理でPageTocを生成するページにもかかわらず、`npm run dev`でVisual Review用captureを行い、`npm run preview`による確認をしていなかった。
- 一次対応: 強調箇所をMDXで確実に解釈される`<strong>〈仕事人〉</strong>`へ置き換え、world visual testに生成済みPageTocの検証を追加する。build後に`npm run preview`を起動してdesktop / mobile captureを取り直し、そのactualだけを正本化の材料にする。

### Contents authoring was incorrectly blocked by issue-first workflow

#### 2026-07-11

- source: user
- 発生箇所: `21-2-world-page` の作業開始
- 観測した失敗: ユーザーは「issue作成をせずにcontentsを作り始めて」と明示した。`.raw/contents/` の作成は `contents-markdown-authoring` の対象であり、サイト実装ではないにもかかわらず、agentは `issue-first-development` を優先してbranch作成、ローカルissue作成、issue reviewer実行まで進めた。
- 一次対応: 作成した `docs/issue/21-2-world-page.md` を削除し、contents authoring workflowへ切り替えた。今後、ユーザーが明示しているローカルcontents作成を、実装用issueの停止条件で妨げない。

### Content-instruction stopping point overrun

#### 2026-07-11

- source: user
- 発生箇所: `20-2-introduction-page` のissue-first準備
- 観測した失敗: ユーザーは、issueを作成する前にコンテンツ指示書を作成するよう明示した。agentは `.raw/contents/introduction.md` を作成した後、その完了を報告して指示を待たずに `docs/issue/20-2-introduction-page.md` まで作成した。コンテンツ指示書作成後の報告・停止というユーザー指定の確認地点を越えた。
- 一次対応: ユーザー指示に従い、誤って作成した `docs/issue/20-2-introduction-page.md` を削除した。コンテンツ指示書だけを残し、以後のissue作成、reviewer実行、design作成、実装を行わず、ユーザーの次の指示を待つ。

### Ambiguous remote source placeholder replaced an explicit source list

#### 2026-07-11

- source: user
- 発生箇所: `local-content-authoring` の情報源優先順位を更新したSKILL/rule/issue
- 観測した失敗: ユーザーが求めた「リモートモードで確認する情報源の列挙」を、実体のない「ユーザーがリモートで確認するよう明示した情報源」という条件文に置き換えた。どのファイルや正本を確認するかが定義されず、agentが再現可能に実行できない仕様にした。続く修正でも実行環境の取得可否を情報源の優先順位へ混在させ、SKILL入口READMEと後続の動作確認TODOを更新せずに完了チェックを付けた。
- 一次対応: 当該変更を不正確として扱い、remote modeで元から列挙されていたcurrent issue、requirements、plan、out-of-scopeを明示した優先順位へ修正する。関連するSKILL本文、入口README、後続TODO、issueチェックをまとめて照合してから完了扱いにする。

### v1.0 Google Docs export format was incorrect

#### 2026-07-11

- source: user
- 発生箇所: `.agents/skills/drive-to-raw-sync/SKILL.md` と `v1.0/` の初回ローカル同期
- 観測した失敗: スタイル付きGoogle Docsである `v1.0/` 配下の資料を、Markdown exportではなく `text/plain` exportで `.md` 化した。これによりGoogle Docs上のスタイル情報をMarkdownへ変換できなかった。
- 一次対応: `contents/` はMarkdownソースをそのまま扱うため `text/plain` exportを維持し、`v1.0/` は `text/markdown` exportへ分離した。誤った形式で作成したローカルv1.0ファイルは、正しい形式で再同期するまで参照に使わない。

### Non-interactive custom subagent smoke test failed

#### 2026-07-11

- source: self
- 発生箇所: `review-subagents` の`codex exec --ephemeral`による`issue_reviewer` smoke test
- 観測した失敗: non-interactive Codex app-serverでcustom subagentを起動しようとしたところ、`collab spawn failed: no thread with id` が2回発生した。親agentはread-only fallbackでissue本文を確認したが、custom agent自体の起動は確認できなかった。
- 一次対応: non-interactive `codex exec`はcustom subagentの起動確認に使わない。interactive Codex clientでの実運用時にsubagentを起動する前提とし、今回の設定検証はTOML schema、model catalog、strict-config読み込みに限定する。

### Design canonicalization bypassed visual output convention

#### 2026-07-09

- source: user
- 発生箇所: `18-2-home-page` の `docs/design/home/` 正本化
- 観測した失敗: design正本化時、既存運用では `tests/visual/*` 等のtestコードで実装スクリーンショットを `test-results/` に出力し、そのactual artifactを材料としてdesign正本へ反映する前提があるにもかかわらず、専用 `.tmp/capture-home-design-canonical.mjs` から直接 `docs/design/home/design-*.png` へ書き出した。さらに `notes.md` とissueに「`test-results/` を直接コピーせず再キャプチャした」と記録し、既存の正本化運用との関係を曖昧にした。
- 一次対応: ユーザー確認に対し、既存運用は `test-results/` 由来のactual artifactを材料にする理解が妥当であり、今回の直接書き出しは運用ズレとして扱う方針に修正する。

### Visual screenshot bypassed visual test file convention

#### 2026-07-09

- source: user
- 発生箇所: `19-2-release-notes-page` のVisual Review screenshot取得
- 観測した失敗: 画面表示確認では `tests/visual/*` のvisual testファイルを作成または更新し、そのtest実行から `test-results/` へスクリーンショットを出力するべきだった。にもかかわらず、`node -e` の独自Playwrightコマンドを直接実行して `test-results/visual-implementation/*.png` を作成した。これは `18-2-home-page` のdesign正本化時に `.tmp/capture-home-design-canonical.mjs` から直接画像を書き出した手順逸脱に続く、同種の2回目の指摘である。
- 一次対応: 本ログへ2回目の手順逸脱として記録した。以後、画面表示確認・Visual Reviewのスクリーンショット取得は、既存または新規の `tests/visual/*` を通して実行し、独自の一時Playwright scriptや `node -e` で代替しない。

### Page description changed without confirmation

#### 2026-07-09

- source: review
- 発生箇所: `18-2-home-page` の `src/pages/index.astro`
- 観測した失敗: トップページ実装中、`.raw/contents/home.md` のfrontmatterに `description` がない状態で、ユーザー確認なしにページ固有の新しい `description` 文言を作成した。人間一次レビューでは文言自体は問題ないが、独自判断で変更した点が逸脱として指摘された。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、指摘対応時に今回の文言をdefault descriptionへ反映する方針を記録した。

### Repository documentation written in wrong language

#### 2026-07-09

- source: user
- 発生箇所: `18-2-home-page` の `docs/design/home/notes.md`
- 観測した失敗: リポジトリ内の設計文書として作成する `docs/design/home/notes.md` を、既存docsの日本語運用に合わせず英語で作成した。ユーザーから「docだから日本語で書け」と指摘された。
- 一次対応: `docs/design/home/notes.md` を日本語へ全面修正し、本ログへ記録した。以後、リポジトリ内docs / issue / design notes / rule / skill本文は、既存文書の言語に合わせ、原則日本語で作成する。

### Completed checklist with stale unverified note

#### 2026-07-09

- source: review
- 発生箇所: `18-0-release-notes-data` の `docs/issue/18-0-release-notes-data.md`
- 観測した失敗: 完了条件と備考の実装確認では `npm run test`、`npm run check`、`npm run build` が検証済みになっていたが、末尾の `ローカル検証メモ` に同じコマンドが `not yet verified` として残り、検証済みなのか未検証なのかが矛盾する状態でPR化した。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、レビュー対応時にローカル検証メモを実際の検証済み状態へ整理する方針へ入れた。

#### 2026-07-09

- source: review
- 発生箇所: `phase-2-prep-contents-markdown-workflow` の `docs/issue/phase-2-prep-contents-markdown-workflow.md`
- 観測した失敗: 完了条件とチェックポイントをすべて確認済みにした後も、`Local Validation Summary` に `remaining unverified before final report: final failure-log category check` が残り、未検証項目が残っているのか確認済みなのかが曖昧な状態でPR化した。
- 一次対応: review-to-issueで `レビュー指摘 1` に取り込み、issue修正時にfailure-log確認結果を明確化する対応方針へ入れた。

### Workflow stopping point overrun

#### 2026-07-09

- source: user
- 発生箇所: `18-0-release-notes-data` のZod schema責務分離検討
- 観測した失敗: ユーザーは「`getReleaseNoteBody` がschemaにあるのが適切か」と「`data/generated` 以下をZod schemaに使ってテストする必要がないか」を検討するよう求めたが、実装前に検討結果と方針を返さず、先に `src/lib/data/release-notes.ts`、`src/lib/schemas/release-notes.ts`、`tests/node/release-notes.test.ts` を変更した。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、「検討して」と明示された場合は、実装に入る前に判断、選択肢、推奨方針を返し、ユーザーの実装開始指示を待つ。

#### 2026-07-05

- 発生箇所: `09-base-layout` のissue-first / design準備
- 観測した失敗: ユーザーが「まずはlayoutにベタ書き」「今回の作成範囲はデスクトップレイアウトのみ」と指示した後、実装前のdesign準備として `docs/design/base-layout/` のdesign artifact作成まで進めた。
- 一次対応: `docs/issue/done/phase-2/09-base-layout.md` を画像未生成前提へ戻し、そのissueファイルだけをcommitした。

#### 2026-07-05

- 発生箇所: `09-base-layout` のdesign画像生成準備
- 観測した失敗: `docs/design/base-layout/notes.md` のユーザーレビューを挟まずに、`design-desktop.png` の画像生成へ進んだ。
- 一次対応: 生成済みdesign artifactはcommitせず未追跡に残し、`docs/issue/done/phase-2/09-base-layout.md` から画像生成済み扱いを取り除いた。

#### 恒久対応

- `AGENTS.md` の最重要ルールへ、検討、確認、妥当性確認、レビュー依頼は実装承認ではなく、判断と推奨方針を返して停止することを追記した。
- `.agents/skills/design-image-generation/SKILL.md` へ、design方針の確認や `notes.md` レビューcheckpointでは画像生成へ進まず、明示承認後に生成することを追記した。

### Design draft overproduction and method drift

#### 2026-07-05

- 発生箇所: `09-base-layout` のdesign画像生成
- 観測した失敗: design画像が未レビューのドラフトであるにもかかわらず、SiteMenu風の文言やスコープ外導線の混入にこだわって複数回画像生成を行い、最終的にSVGを手作りしてPNGへ変換するという、当初の画像生成手順から逸脱した生成へ進んだ。
- 一次対応: 生成済みdesign artifactはcommitせず未追跡に残し、`docs/issue/done/phase-2/09-base-layout.md` から画像生成済み扱いを取り除いた。

### Out-of-scope UI leakage in design artifacts

#### 2026-07-05

- 発生箇所: `09-base-layout` の `design-desktop.png`
- 観測した失敗: パンくずリストをdesign画像に含めない方針を `notes.md` に記録した後も、`Chapter 1 / Foundation` というスラッシュ付きラベルが残り、パンくずリストのように見える状態になっていた。
- 一次対応: `design-desktop.png` の該当ラベルを `Rule text sample` に変更し、パンくず風のスラッシュ表現を削除した。

### Uncommitted work disappeared despite editor history

#### 2026-07-05

- 発生箇所: `.mcp.json`、`AGENTS.md`、`README.md` のContext7関連作業
- 観測した失敗: VS Code HistoryやCodexセッション履歴にはContext7関連の `.mcp.json` 作成、`AGENTS.md` 追記、`README.md` 追記の作業記録が残っていたが、該当変更がcommitされておらず、現在の作業ツリーから消えていた。
- 一次対応: 履歴に残っていた内容を参照し、`.mcp.json`、`AGENTS.md` のMCP / Context7利用方針、`README.md` の任意開発支援設定を再作成した。

### Visual verification gap after UI-affecting change

#### 2026-07-05

- 発生箇所: `09-base-layout` の `src/pages/mdx-test.mdx` frontmatter layout変更
- 観測した失敗: MDXページのLayout適用方法を本文内Componentからfrontmatter `layout` 指定へ変更した後、`npm run check` と `npm run build` は実行したが、MDXページで実際にLayoutが表示されているかVisual確認を再実行しないまま報告した。
- 一次対応: `/mdx-test/` を対象にVisual captureを再実行し、MDXページで共通Layoutが表示されていることを確認する。

### Text labels treated as icon implementation

#### 2026-07-05

- 発生箇所: `10-header-footer` の Footerリンク実装
- 観測した失敗: issueとdesign notesで「アイコンリンク」として扱うべきGitHub / X / Discordリンクを、`GH` / `X` / `DC` の文字ラベルで実装し、ユーザーからアイコンライブラリを使った実装へ修正するよう指摘された。
- 一次対応: `simple-icons` を追加し、FooterリンクをGitHub / X / DiscordのブランドSVGアイコン表示へ変更した。

### Error page exposed as normal navigation

#### 2026-07-06

- 発生箇所: `11-site-menu` の `src/lib/site/menu.ts`
- 観測した失敗: 404ページを通常のサイドメニュー導線に含め、ユーザーから不要であると指摘された。
- 一次対応: `src/lib/site/menu.ts` から404リンクを削除した。

### Unauthorized git publish

#### 2026-07-06

- 発生箇所: `13-page-toc` の `docs/issue/done/phase-2/13-page-toc.md` 完了条件チェック反映後のGit操作
- 観測した失敗: ユーザーの指示は「issueの完了条件チェック入ってない」であり、commit / pushの明示許可ではなかったにもかかわらず、`docs: check page toc issue completion` をcommitし、既存PR branchへpushした。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、直前にcommit / push許可がない修正指示では、作業ツリー上の変更に留めて報告する。

#### 2026-07-08

- source: user
- 発生箇所: `todo-md-style-unification` のmain直接commit
- 観測した失敗: ユーザーは「mainブランチ上にコミットを積むことを許可」と述べたが、個別commitの実行承認ではなかった。にもかかわらず、作業完了後に追加承認を取らず `b4c7b34 docs: unify markdown list style` をcommitした。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、commit可能な例外許可と、特定commitの実行承認を分け、commit直前に明示承認がない場合は作業ツリー上の変更に留める。

### Unnecessary approval request for an approved command

#### 2026-07-11

- source: user
- 発生箇所: `README.md` のmainへのcommit後、`git push origin main` を実行する承認要求
- 観測した失敗: `git push` はすでに承認済みcommand prefixだったにもかかわらず、agentが `require_escalated` を明示指定して実行し、不要な追加承認を求めた。ユーザーから同じ事象が以前にも発生したと指摘された。
- 一次対応: 承認済みprefixに一致するコマンドでは、必要性を確認せず `require_escalated` を付けない。既存の承認状態を利用して実行する。

#### 2026-07-11

- source: user
- 発生箇所: `local-content-authoring` のcommit / push
- 観測した失敗: ユーザーが明示的に「コミットpush」と指示した後、agentが複数のGit操作を`&&`で連結して実行し、承認済みcommand prefixを利用せず追加承認を求めた。さらに同じ承認要求を繰り返した。
- 一次対応: userが明示承認したGit操作は、承認済みprefixを認識できる単独コマンドとして実行する。status・diff確認をcommit / pushの追加承認理由にしない。

#### 恒久対応

- `AGENTS.md` の最重要ルールへ、承認済みcommand prefixに一致するコマンドで `require_escalated` を明示指定して不要な追加承認を要求しないことを追加した。
- `AGENTS.md` の最重要ルールへ、承認済みの状態変更Git操作を`&&`、`;`、pipe、subshellで連結せず、1つずつ実行することを追加した。

### Local dev server port left running

#### 2026-07-09

- source: user
- 発生箇所: `18-1-common-image-block-component` の表示確認
- 観測した失敗: Astro dev server / preview serverのport管理で、`4322` と `4325` に既存serverが残っていた。`4321` で起動できない原因確認中に、ユーザーから「4322以降4329までは動いてたら全部止めて」と指示されるまで、使われたportを確実に停止しきれていなかった。
- 一次対応: ホスト側の `lsof -nP -iTCP:4321-4329 -sTCP:LISTEN` で `4322`、`4325` のAstro processを特定し、ユーザー許可範囲に従って停止した。作業終了時にも `4321-4329` にLISTENが残っていないことを確認した。

### Repeated design image conversion failure

#### 2026-07-06

- 発生箇所: `12-1-site-menu-layout-copy` の `docs/design/mobile-menu/design-mobile-open.png` 更新
- 観測した失敗: ImageMagick `convert` で `.tmp/mobile-menu-design-open.svg` をPNG化する際、同じ `non-conforming drawing primitive definition ','` エラーを複数回発生させた。
- 一次対応: SVG内のfont-family指定からImageMagickが解釈しづらいcomma指定を外し、SVGをPNG化した後に `メニュー` ラベルをImageMagick annotateで合成した。

### Mobile horizontal overflow missed after UI implementation

#### 2026-07-06

- 発生箇所: `14-mobile-page-toc` の `MobilePageToc.astro` / `BaseLayout.astro`
- 観測した失敗: 実装後のPlaywright確認で開閉挙動とスクリーンショットは確認したが、document全体の横方向overflowを数値確認しておらず、mobile PageTocのgrid item自動最小幅により右側余白が崩れた状態を見落とした。
- 一次対応: `MobilePageToc`、`desktop-layout`、`site-main` に `min-width: 0` / `width: 100%` を追加し、390px viewportで `documentElement.scrollWidth` が390pxに収まることを確認した。

### Design canonicalization from unprocessed dev output

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `docs/design/site-layout/design-mobile-page-toc-open.png`
- 観測した失敗: build後postprocessでH1横へ移動するMobilePageTocを、dev server由来の未postprocess DOMから撮影してdesign正本化したため、実ブラウザ確認ではH1下に表示される目次がdesign正本ではH1上に表示されていた。
- 一次対応: visual testに `data-mobile-page-heading` の存在確認を追加し、build後previewのpostprocess済みDOMに対してスクリーンショットを再取得した。あわせてMobilePageTocのH1+trigger sticky挙動を実装・検証した。

### Excessive CSS added during targeted UI fix

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにする修正で、必要な位置指定を超えて背景色、border、box-shadow、負margin、paddingを追加し、既存本文面と異なる背景ブロックを発生させた。
- 一次対応: stickyに必要な `position` / `top` / `z-index` だけを残し、追加した背景色、border、box-shadow、負margin、paddingを削除した。

### Sticky heading transparent background missed

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにした際、背景を透過のままにしていたため、スクロール中の本文がH1背面に重なって読みにくくなる状態を見落とした。
- 一次対応: sticky heading rowに白背景を追加して上端の透過を防ぎ、通常H1位置を崩しにくい範囲で上paddingと同量の負marginを使ってsticky時の上余白と目次triggerの縦位置を調整した。

### Repeated validation failure in one implementation task

#### 2026-07-11

- 発生箇所: `20-2-introduction-page` のVisual Reviewテスト追加後の `npm run check`
- 観測した失敗: 使用できないPlaywright matcherによるTypeScriptエラー、同じテストファイルのBiome整形不一致、リスト項目の一部を完全一致テキストとして探したPlaywright assertionの3件により、同一タスク内で検証失敗を繰り返した。
- 一次対応: matcherをこのプロジェクトのPlaywright型定義で利用可能なlocator評価へ置き換え、Visual Review前のテスト編集後にBiome formatを実行する。本文の一部は親要素に対する部分一致で確認する。修正後に `npm run check`、`npm run build`、対象Visual testを再実行する。

### Playwright sandbox launch failure

#### 2026-07-12

- source: agent self-report
- 発生箇所: `21-2-world-page` の`NpcCard`ローカルカタログcapture test
- 観測した失敗: sandbox内で `npx playwright test tests/visual/npc-card.spec.ts` を実行したところ、Chromiumが `sandbox_host_linux.cc` の `Operation not permitted` で起動できず、desktop / mobileの両testが同じ環境制約で失敗した。
- 一次対応: browser起動が必要なPlaywright testは、sandbox内の失敗後に必要性を示してsandbox外実行の承認を得る。通常のunit checkやformatterはsandbox内で継続する。

### Unauthorized git publish

#### 2026-07-11

- source: agent self-report
- 発生箇所: `20-2-introduction-page` のユーザーレビュー指摘 3 対応
- 観測した失敗: ユーザーは`review-to-issue`実行と`titleHeadingLevel`の実装を指示したが、このターンにはcommit・pushの明示指示がなかった。にもかかわらず、agentは `cf8d004 feat: support callout heading levels` をcommitし、既存PR branchへpushした。
- 一次対応: 追加のGit操作、履歴改変、PR操作を行わず停止する。以後、直前のターンでcommit・pushを許可されていても、新しいレビュー指摘対応では改めて明示指示があるまで作業ツリー上に留める。

#### 2026-07-11

- source: user
- 発生箇所: `20-2-introduction-page` のユーザーレビュー指摘 3 に対する`review-to-issue`
- 観測した失敗: `review-to-issue`ではreview itemをlocal SSoTへ照合してvalid判定、対応方針、ユーザー確認待ちを報告して停止すべきだった。しかしagentはvalid判定結果を正式に返さず、同じターン内で実装を開始した。
- 一次対応: review-to-issueを明示された場合は、ユーザーが実装意図を併記していても、まず正式なレビュー取り込み結果を返して停止する。実装は、取り込み結果を確認した後の別メッセージで明示承認された場合だけ開始する。

### Unapproved review-response implementation

#### 2026-07-12

- source: user
- 発生箇所: `22-2-character-making-page` のレビュー指摘 1 に対する用語説明追加
- 観測した失敗: ユーザーは内容の修正方針を示したが、レビュー指摘の取り込み後に必要な実装開始の明示指示を出していなかった。にもかかわらず、agentは公開MDX、`.raw/contents/character-making.md`、issue checklistを変更し、検証まで実行した。
- 一次対応: ユーザー指示に従い差し戻しは行わず、変更は未コミットのまま保持する。レビュー指摘への内容追加や方針確認では実装せず、明示的な「実装開始」「修正して」等の指示を受けるまで停止する。

### Ambiguous design canonicalization approval

#### 2026-07-12

- source: review
- 発生箇所: `22-2-character-making-page` の`docs/design/character-making/design-desktop.png`と`design-mobile.png`更新
- 観測した失敗: Visual Review actualをdesign正本へ反映する前に、ユーザーのdesign正本化許可が曖昧な状態だった。ユーザーは後に、actualを最終的なdesign正本へ反映する方針自体は正しく、問題は明確な許可前にコピーしたことだと訂正した。
- 一次対応: ユーザーは文言修正後のactualをdesign正本へ反映することを明示許可した。以後、design fixではactualを正本化してよいかを事前に明示確認し、その許可とcapture元を`notes.md`とissueへ記録する。
