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

### Repeated PR reviews discovered one documentation dependency at a time

#### 2026-07-22

- source: user
- 発生箇所: `42-0-npc-data-normalization`の`no_image.webp` fallback仕様を正式化した後のPRレビュー
- 観測した失敗: 仕様変更時に、plan、TODO、変換仕様、requirements、out-of-scope、architecture、designを横断して影響範囲を一括確認せず、差分中心のPRレビューを繰り返した。そのためworld design、requirements / out-of-scope、architectureの旧仕様が第1回から第3回に分けて発見され、レビュー品質が低く見える連鎖を生んだ。
- 一次対応: 第3回レビューまでの有効な指摘をcurrent issueへ記録した。以後、仕様・データ契約・公開asset規約を変更するPRでは、初回レビュー前に関連語で全SSoTを探索し、更新対象と「確認済み・変更不要」の一覧をレビューmanifestへ残す恒久対応を検討する。

### Misread a no-newline Drive URL file as empty

#### 2026-07-22

- source: user
- 発生箇所: `42-0-npc-data-normalization` のDrive-to-raw同期前提確認
- 観測した失敗: `raw-google-drive.url`の内容確認に`wc -l`だけを使い、末尾改行のない有効な1行URLを0行、すなわち空ファイルだと誤判定した。ユーザーにURL共有を求める前に、バイト数、非空行数、URL形式を確認すべきだった。
- 一次対応: URL自体を出力せず、バイト数、非空行数、DriveフォルダURL形式を検証して有効な同期ルートを確認した。以後、設定ファイルの空判定は行数だけに依存せず、非空の内容を検証する。

### Ikizama review changes missed formatter requirements twice

#### 2026-07-22

- source: self
- 発生箇所: `31-2-ikizama-index-page` の`tests/visual/character-making.spec.ts`と`docs/issue/31-2-ikizama-index-page.md`に対する`npm run check`
- 観測した失敗: 実装後のVisual Test追記とVisual Review記録で、Biomeとdprintが求める改行・表列幅の形式を手動編集で外し、同一作業中に`npm run check`のformatter検証を2回停止させた。
- 一次対応: formatter出力に従って対象を整形し、`npm run format:md`を実行した。以後の再検証はformatter適用後に行う。

### Visual capture used dev server without page-TOC postprocessing

#### 2026-07-22

- source: self
- 発生箇所: `32-2-ikizama-detail-page` の `npm run visual:capture -- --grep @ikizama-detail`
- 観測した失敗: Page TOCがbuild後のHTML postprocessで生成されることを確認せず、Astro dev serverに対してdesktopとmobileのVisual Testを実行したため、両方で目次が空として失敗した。ページ実装ではなく検証用serverの選択が原因だった。
- 一次対応: dev serverを停止し、`npm run build`後にpreview serverへ切り替えてVisual Testを再実行する。page TOCを検証するVisual Testはpostprocess済みの出力を使う。

### Ikizama skills conversion specification table formatting repeated

#### 2026-07-22

- source: self
- 発生箇所: `32-0-ikizama-detail-data` の `docs/conversion/ikizama-skills.md` にある関連アイテム種別の表
- 観測した失敗: `npm run check:md` が示したdprintの表列幅差分を手動で反映したが、期待する列幅を再現できず、同じMarkdown整形チェックを2回連続で失敗させた。
- 一次対応: 手動で空白数を推測して直し続けず、対象ファイルだけをdprint formatterへ渡してから`npm run check:md`で確認する。

### Used `gh` after the repository workflow prohibited it

#### 2026-07-22

- source: user
- 発生箇所: `31-0-ikizama-index-data` のpush後に既存PRを確認する操作
- 観測した失敗: リポジトリのGitHub操作ではconnectorを使うべきというユーザー指示に反して、既存PRの確認に`gh pr list`を実行した。
- 一次対応: `gh`を以後のPR確認・レビューに使わず、GitHub connectorだけで確認する。実行済みの`gh`は読み取り専用であり、GitHub上の状態変更は行っていない。

### Site menu expansion predicate returned a non-boolean value

#### 2026-07-22

- source: self
- 発生箇所: `29-2-ryugi-index-page` の `getSiteMenuItemInitialExpanded()` とNode test
- 観測した失敗: 流儀一覧をcurrent時に展開する条件を、optional booleanをそのまま論理和へ渡す形で実装したため、該当設定がない通常のメニュー項目で`false`ではなく`undefined`を返した。全体Node testと対象testを連続して失敗させた。
- 一次対応: optional booleanは`=== true`で判定し、常にbooleanを返す条件へ修正する。optional値を返却値へそのまま伝播させる分岐を追加した場合は、設定なしの既存ケースを対象testで確認する。

### Design draft overrode contents instructions

#### 2026-07-22

- source: user
- 発生箇所: `29-2-ryugi-index-page` の `docs/design/ryugi-index/` initial draft
- 観測した失敗: ユーザーが`.raw/contents/ryugi-index.md`を他資料より優先すると明示していたにもかかわらず、planとTODOから流儀一覧に全流儀の共通スキルボーナスを追加した。contentsが指定する「ケンカヤの`RyugiDataSection`と4項目説明」「名称リンクとshortDescriptionだけの流儀一覧」を再現せず、design、notes、issueに実装ノイズとなる別の表示方針を書いた。
- 一次対応: flow一覧から全流儀のボーナス表を削除し、contentsの4項目説明と一覧構成へ修正した。contents優先が指定された場合は、下位資料の補足を画面本文やdesignへ追加せず、contentsに存在しない表示を必要と判断した時点で実装前にユーザーへ確認する。

### Conflated one JSON output with one Excel sheet

#### 2026-07-21

- source: user
- 発生箇所: `30-0-ryugi-detail-data` の変換仕様草案
- 観測した失敗: ユーザーの「1jsonにまとめる」という出力形式の決定を、Excel入力を1シートへ統合する指示と誤読した。既存の流儀別シートを所属の判断根拠として使う明示指示がないまま、`流儀ID`列の追加と単一シートへの移行を仕様へ記述した。
- 一次対応: 草案はレビューで止め、コード・Excel・issueを変更していない。以後、入力構造と生成物構造に関する指示は別々に復唱し、入力変更を伴う提案を仕様へ反映する前に明示承認を確認する。

### Search highlight test assumed one mark element twice

#### 2026-07-20

- source: self
- 発生箇所: `45-search-pagefind-integration` の `tests/visual/search-modal.spec.ts` に対する `npm run visual:capture`
- 観測した失敗: Pagefindが検索語を複数の`mark`要素へ分割することを考慮せず、検索結果抜粋と遷移先本文のハイライトを単一locatorとして2回検証したため、Playwright strict modeで同じVisual Testが連続して停止した。
- 一次対応: 検索語と一致する`mark`だけをfilterして検証する。複数のハイライト要素がありうるUIでは、locatorの件数または対象語を先に限定する。

### Visual capture Chromium sandbox launch failed twice

#### 2026-07-19

- source: self
- 発生箇所: `45-search-pagefind-integration` の `npm run visual:capture`
- 観測した失敗: 同一作業中にChromiumがsandbox hostを初期化できず、visual captureが2回起動前に停止した。承認済みのcapture実行では成功したため、検索UIのbrowser検証自体は完了している。
- 一次対応: 同じ失敗を繰り返す前に実行権限を確認し、成功したcaptureでdesktop、mobile、overlay、実index検索をまとめて確認した。sandbox実行環境の恒久対応要否は別途監査する。

### PR title missed the issue-slug rule again

#### 2026-07-19

- source: user
- 発生箇所: `44-search-modal-ui` のPR #49作成
- 観測した失敗: `create-pr` が定めるissue slugのみのPRタイトルではなく、`feat: search panel UI`としてPRを作成した。ユーザー指摘後にタイトルを`44-search-modal-ui`へ修正した。
- 一次対応: PR #49のタイトルをissue slugへ更新した。以後、PR作成またはmetadata修正時は、connector呼び出し前にcurrent issueのslugをタイトル値として照合する。

### Search UI check needed separate type and formatter corrections

#### 2026-07-19

- source: self
- 発生箇所: `44-search-modal-ui` の `src/scripts/search-modal.ts` 初回実装後の `npm run check`
- 観測した失敗: 開閉判定で`HTMLElement.hidden`をBooleanとして渡し、Astro type checkが`string | boolean`を検出した。型修正後に同じ`npm run check`を再実行したところ、Biome formatterの改行差分で再度停止した。
- 一次対応: 開閉判定を明示的なBoolean比較へ修正し、Biome formatterの出力を対象ファイルへ適用してから再検証する。

### dprint cache prevented formatting an untracked issue

#### 2026-07-19

- source: self
- 発生箇所: `43-install-pagefind` のissue-first準備における `docs/issue/43-install-pagefind.md` のMarkdown formatter実行
- 観測した失敗: 新規issueだけを対象にdprint formatterを2回実行したが、dprintが既定のcache directoryを作成しようとしてread-only file system errorになり、formatterを完了できなかった。
- 一次対応: 同一formatterを繰り返さず、Markdownlintでissue本文の構文・styleを確認した。新規・未追跡Markdownを安全にformatできるcache設定または専用scriptの要否は、別途検討する。

### PR reviewer used `gh` despite connector-only workflow

#### 2026-07-15

- source: user
- 発生箇所: `28-2-common-skills-page` の PR #45 初回レビューにおけるdocument reviewer
- 観測した失敗: PR metadata・diff・discussionの確認でGitHub connectorを使うべきところ、reviewerが禁止されている`gh`コマンドを1回実行した。ユーザー指摘後、connectorだけでmetadata・diff・issue comments・inline threads・reviewsを再確認した。
- 一次対応: reviewerへ`gh`禁止を即時共有し、以後のPR reviewとリモート確認をGitHub connectorだけに限定した。

### Common skills visual test formatting needed a second correction

#### 2026-07-14

- source: self
- 発生箇所: `28-2-common-skills-page` の `tests/visual/common-skills.spec.ts`
- 観測した失敗: Visual Testの初回追加と個別アンカー検証の追加後、Biomeが求める1行形式を手動で外し、同じ `npm run check` のformatter失敗を同一作業中に2回発生させた。
- 一次対応: formatter差分をそのまま適用し、以後の検証前に新規・変更したTypeScriptの短い呼び出しを既存のBiome形式と照合する。

### PR title did not follow the issue-slug rule

#### 2026-07-14

- source: user
- 発生箇所: `28-0-common-skills-data` のPR #43作成
- 観測した失敗: PRタイトルを`28-0: 共通スキルデータ基盤`として作成した。しかしGit操作規約と`create-pr`は、既定のPRタイトルをissue slugのみの`28-0-common-skills-data`と定めている。
- 一次対応: PR #43のタイトルを`28-0-common-skills-data`へ更新した。以後、PR作成前にissue slugをそのままタイトルへ使うことを確認する。

### Skill conversion test rerun without focused error output

#### 2026-07-14

- source: self
- 発生箇所: `28-0-common-skills-data` のレビュー指摘 2に対する`npm run test`
- 観測した失敗: Schema・変換器・テストを同時に変更した後、テスト失敗の詳細を取得しないまま同じNode testを再実行した。原因は、既存の`isDeepStrictEqual` importの削除と、可変列fixtureでの末尾空ヘッダー処理の不足だった。
- 一次対応: 初回失敗後はテストレポートまたは対象testを詳細出力で確認してから再実行する。変換器のheader検証では、入力ライブラリが補う末尾空セルを除外する。

### Skill conversion formatter diff was applied with incorrect indentation

#### 2026-07-14

- source: self
- 発生箇所: `28-0-common-skills-data` のレビュー指摘 2に対する`npm run check`
- 観測した失敗: Biomeが示したformatter差分を手動反映した際、オブジェクトプロパティのインデントを1段深くしてしまい、同じ`npm run check`のformatter失敗を再発させた。
- 一次対応: formatter差分を適用する際は、差分の空白数を行単位で確認する。再実行前に対象箇所を読み返す。

### MDX-only `any` cast caused repeated build failures

#### 2026-07-13

- source: self
- 発生箇所: `27-2-data-index-page` の `src/pages/data/index.mdx` にある凡例用`maxLevel` props
- 観測した失敗: ユーザー指定の文字列値を`any`で渡すため、MDX Component直前へHTMLコメントとTypeScriptの`as any`を置いた。MDXは前者をJSXコメントとして、後者をJavaScript互換のJSDocキャストとして書く必要があり、`npm run build`が2回失敗した。
- 一次対応: JSXコメントと`/** @type {any} */ (value)`のJSDocキャストへ置き換え、再ビルドで検証する。

### Initial data design draft ignored existing layout and card designs

#### 2026-07-13

- source: user
- 発生箇所: `27-2-data-index-page` の `docs/design/data/` initial draft
- 観測した失敗: `/data` のSkillCard凡例と右側説明領域のdesign draftで、既存の`docs/design/skill-card/`が定めるdesktop 3列・mobile 2列のカードgridと、`docs/design/site-layout/`が定めるHeaderを含む既存layoutを比較基準にしなかった。対象領域だけを確認するという指示を、既存layoutを除外してよいという独自判断に置き換え、Headerなし・desktop 2列・mobile 1列のprototypeを作成した。さらに、contents指示が要求していない丸囲み番号のUIを右側説明へ加えた。
- 一次対応: design artifactの修正はユーザーの明示指示まで行わない。再作成時は、既存Headerとlayout文脈を含むviewport captureを使い、SkillCardのdesktop 3列・mobile 2列の既存gridと、contents本文にある見出し付きの説明を維持する。丸囲み番号など新しい装飾を追加しない。

### Issue-first required handoff was omitted

#### 2026-07-13

- source: user
- 発生箇所: `27-2-data-index-page` のissue-first準備
- 観測した失敗: ローカルissueを作成し、必須のissue reviewerを完了した後、`issue-first-development` が定める「作業前準備完了」報告、issue本文の要約、ユーザーへレビューしてほしい点の提示をせずに、designドラフトの準備へ進もうとした。ユーザーのissue承認前にdesign作業を始める誤った順序となり、ユーザーから作業状況を確認されるまで停止地点の逸脱を報告しなかった。
- 一次対応: design画像、notes、実装コードを作成しないまま停止し、issueへ「issue承認後にdesign-image-generation initial draft modeを実行する」と明記した。本来のissue-first handoffをこの会話で提示し、以後はissue作成とreviewer完了の直後にrequired stopping pointの報告を先に返す。

### Contents reviewers received current conversation history

#### 2026-07-13

- source: user
- 発生箇所: `27-2-data-index-page` のcontents review
- 観測した失敗: contents reviewerを`fork_turns="all"`で起動し、現在会話の履歴と親agentが要約した過去のフィードバックを渡した。レビュー対象としてユーザーが個別に指定していない会話情報が判定へ混ざり、独立したレビューにならなかった。
- 一次対応: `contents-review`で`fork_turns="none"`を必須化し、ユーザーが当該レビューで明示指定した入力だけをreview packetとして渡すよう変更した。beginner / expert reviewer定義にも指定外の会話・資料を使わない境界を追記した。

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

### Resolved content conflict was left as an unresolved placeholder

#### 2026-07-12

- source: user
- 発生箇所: `.raw/contents/advancement.md` の能力値成長節
- 観測した失敗: ユーザーが各算出は現行のキャラクターメイキングを正と明示したにもかかわらず、agentは旧資料との矛盾を理由に能力値成長を未確定HTMLコメントのまま残した。さらに、ユーザーが明示的に上2点の反映を指示した後も、未確定節を確定本文へ更新しなかった。
- 一次対応: 現行`src/pages/character-making.mdx`の格の定義（プライマリ流儀のレベル＋生き様のレベル）を使い、格15ごとの能力値成長、成長点、同一能力値への一度の配分上限を本文へ明記した。以後、ユーザーが競合の採用元を明示した場合は、未確定コメントを残さず、指定された範囲の本文と指示を同じ変更で確定する。

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

### Unnecessary approval request for an approved GitHub read

#### 2026-07-13

- source: user
- 発生箇所: `26-2-advancement-page` のPR #40再レビュー時の`gh pr view`
- 観測した失敗: `gh pr view` は承認済みcommand prefixだったにもかかわらず、sandbox内の最初の接続失敗をsandbox外実行が必要な根拠と誤認し、`require_escalated`を付けて不要な承認を求めた。ユーザーはcommit・push・local reviewer呼出しを指示しており、追加承認を求める必要はなかった。
- 一次対応: 承認済みprefixのcommandは、接続失敗後も`require_escalated`を追加せずに扱う。PR再レビューでは、取得済みのremote headとlocal diffでreviewerを起動し、追加のGitHub API読取りは必要性が明確な場合だけ行う。

### Biome formatter write did not apply

#### 2026-07-13

- source: agent self-report
- 発生箇所: `27-1-skill-card-component` の`tests/visual/skill-card.spec.ts`
- 観測した失敗: `npm run check` が新規Visual testのBiome format差分で失敗した。続けて `npm exec biome format --write tests/visual/skill-card.spec.ts` を実行したが、差分を表示するだけで書込みが行われず、同じformat errorが残った。
- 一次対応: formatterが示した改行・インデントを`apply_patch`で反映し、`npm run check`で再確認する。formatterのwrite実行を前提にせず、失敗時は差分とファイル内容を照合して手動修正後に検証する。

### Markdown formatter check was rerun after a cache write failure

#### 2026-07-15

- source: self
- 発生箇所: `29-0-ryugi-index-data` の `docs/conversion/ryugi-index.md`
- 観測した失敗: dprintの対象ファイル整形を試みたが、既定cache directoryへの書込みがread-only filesystemで失敗した。その結果を確認せず、未整形のまま同じ`npm run check:md`を再実行して同じtable format errorを2回発生させた。
- 一次対応: formatterの失敗後は、出力と対象ファイルの変更有無を確認してから再検証する。今回のtable整形は`apply_patch`で反映し、以後のcheckは差分確認後に1回だけ実行する。

### Node test used an Astro-only environment value

#### 2026-07-20

- source: agent self-report
- 発生箇所: `45-search-pagefind-integration` の検索metadata utility test
- 観測した失敗: utilityの既定引数で`import.meta.env.BASE_URL`を参照したため、Astro外で実行するNode testが読み込み時に失敗した。同じ`npm test`と対象testの再実行で2回確認した。
- 一次対応: utilityは環境値を参照せず`/`を既定値にし、Astro layoutから`import.meta.env.BASE_URL`を明示して渡す。環境非依存のutilityはNode testからも読み込める形にする。

### Page-specific content was invented from agent-authored assumptions

#### 2026-07-21

- source: user
- 発生箇所: `30-2-ryugi-detail-page` の `src/pages/data/ryugi/[ryugiId].astro`
- 観測した失敗: 流儀詳細の実装で、ユーザーの当時のコンテンツ指示に含まれていない関連ページリンクを独自に追加した。また、データにないケンカヤ固有の画像説明を`heroAlt`として分岐実装した。後者はagent自身が作成したdesign noteの文言を根拠にしており、独立した正本ではない。要件・既存実装・agent作成物の記述を、ユーザー承認済みのページ本文や画像代替テキストの根拠として扱った。
- 一次対応: 関連ページリンクとケンカヤ固有の`heroAlt`は、明示されたcontentsまたはデータから導ける範囲に限定する。agentが作成したdesign noteやprototypeの固有文言は、ユーザーが採用を明示しない限り新しい実装コンテンツの根拠にしない。既存実装の修正は、現在のreview-to-issue手順に従いユーザー承認後に行う。

### Repeated visual capture against stale build output

#### 2026-07-22

- source: agent self-report
- 発生箇所: `29-2-ryugi-index-page` のPageToc修正後のVisual Test
- 観測した失敗: `RyugiDataSection`のPageToc除外属性を修正した後、`npm run build`で`dist/`を更新せずに`npm run visual:capture`を2回実行した。captureはpostprocess済みの既存build出力を使うため、両回とも旧出力のH3を読み、同じPageToc assertionが失敗した。
- 一次対応: PageTocまたは生成HTMLに影響する変更後は、Visual Testの前に必ず`npm run build`を実行する。Visual Test失敗時は、ソース変更かbuild出力の鮮度かを先に区別してから再実行する。

### Review scope was over-broadened

#### 2026-07-22

- source: user
- 発生箇所: `31-2-ikizama-index-page` のコンテンツレビュー後のissue更新
- 観測した失敗: ユーザーの「全部無視でいいや」を、直前に報告したコンテンツレビューの指摘だけでなく、先行するPRレビュー指摘にも適用した。PRレビューの未コミット`レビュー指摘 3`をissueから削除したが、ユーザーはコンテンツレビューだけを見送る意図だった。
- 一次対応: `レビュー指摘 3`を元の内容で復元した。複数のレビュー結果が並行している場合、「全部」などの参照範囲は直前の成果物に限定して確認し、既存の別レビュー記録を変更する前には対象を明示的に照合する。
