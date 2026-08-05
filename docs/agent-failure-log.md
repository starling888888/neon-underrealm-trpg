# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

同種失敗の監査と恒久対応案の整理は `.agents/skills/failure-log-audit/SKILL.md` に従う。

このファイルは未反映・未確認failureを中心に管理するactive failure logである。対応済みfailureは `docs/agent-failure-log-done.md` へ、ユーザーが恒久対応不要と判断した記録は `docs/agent-failure-log-no-action.md` へ移す。ユーザー指示によりactive auditから分ける機能固有のuser / review由来failureは、どちらにも分類せず `docs/agent-failure-log-archive.md` へ移す。

failureのdone退避は、恒久対応が完了し、反映先が記録され、ユーザー確認を受けた場合に限る。plan / TODOの完了退避とは条件を混ぜない。

---

## 目的

- ユーザーが指摘したエージェントの不適切な振る舞いを失われない形で残す
- 実装中にユーザーまたはエージェント自身が観測した失敗、手順違反、判断ミス、検証不足を記録する
- build、test、型検査などで同種の失敗を繰り返した場合に、エージェント自身が後から分析できる形で蓄積する
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
- build、test、型検査などで同種のエラーや指摘を繰り返した
- 同じ修正方針で複数回失敗し、別の調査や恒久対応が必要になった
- 恒久対応としてルール、skill、チェック手順に反映した方がよい失敗

通常の実装品質レビュー、設計改善提案、単発の軽微な修正依頼は、このファイルの記録対象ではない。formatterまたはlinterの指摘は、同一作業中に修正して最終確認できれば通常の開発ループとして扱い、回数を問わずfailureとして記録・報告しない。

review-to-issueでレビュー指摘を扱う場合も、以下のいずれかに該当する指摘だけをfailure-log候補とする。

- ユーザー承認なしに進めた作業
- workflow上の停止地点を越えた作業
- current issueの範囲を誤って拡大した作業
- 検証していない内容を検証済みとして扱った作業
- remote snapshot、review draft、actual screenshot、design正本などの位置づけを混同した作業
- agent自身が観測した通常のbuild、test、型検査で、同一testまたは同一commandの失敗を同一作業中に3回以上連続して繰り返した作業
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
- ユーザーが恒久対応不要と判断したentryは、active auditの対象から外し `docs/agent-failure-log-no-action.md` へ移す。
- ユーザーが指定した機能固有のuser / review由来failureは、未対応の意味を保ったまま `docs/agent-failure-log-archive.md` へ移せる。これは`done`でも`no-action`でもない。
- review-to-issueでfailure-log候補を記録しても、review-to-issueの停止地点は変えない。記録後はユーザー確認を待つ。
- 同じfailureカテゴリに3回以上の発生詳細が積み重なっている場合は、作業報告でユーザーに通知し、恒久対応候補として明示する。formatterまたはlinterのみの既存記録は、この集計と通知の対象外とする。

この方針の適用前に記録されたformatterまたはlinterのみのentryは、ユーザー確認と明示的な整理指示を受けて`docs/agent-failure-log-done.md`へ移す。

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

### Registered a GitHub Issue completion record with a summary instead of the final local issue body

#### 2026-08-05

- source: user
- failure category: completion-record accuracy
- 発生箇所: `milestone-02-phase-01-todo-resolution` のGitHub Issue #190への完了記録
- 観測した失敗: ローカルissueを削除する際、GitHub Issue #190の本文へ削除直前の`docs/issue/milestone-02-phase-01-todo-resolution.md`全文ではなく、英語の要約だけを登録した。closed Issueは完了済みissueの最終契約・完了記録であるため、原文を失わせる登録になった。
- 一次対応: 削除commit `0f218f0`の親commitからローカルissue原文を取得し、GitHub Issue #190の本文を原文へ復元した。以後、ローカルissueをGitHubへ記録してから削除する作業では、Issue本文と削除直前のファイル内容を照合してから完了を報告する。

### Requested privilege escalation after the user had already authorized the action

#### 2026-07-29

- source: user
- failure category: permission handling and instruction fidelity
- 発生箇所: `ex-02-22-sheet-special-items-integration` のE2E再実行前の一時preview確認
- 観測した失敗: E2Eが残した`4322`の一時previewを停止する必要はユーザーの「e2eとvrtを実装してbaseライン更新。devサーバ停止してpreviewに切り替えてよい」で明示済みだった。それにもかかわらず、process確認のために権限昇格を要求した。
- 一次対応: ユーザー指摘後、この作業では以後の権限昇格を行わず、通常権限で既知のE2E child processだけを扱った。今後はユーザーが対象操作を明示許可している場合、既存の通常権限手段で先に実行し、追加の昇格確認は要求しない。

### Changed canonical-baseline tracking against the parent Gate plan

#### 2026-07-29

- source: user
- failure category: scope and SSoT precedence
- 発生箇所: `ex-02-19-sheet-cybernetics` のDocument Review指摘対応
- 観測した失敗: Document Reviewの再現性提案とユーザーの「他の指摘内容も修正」を、親issueのGate planが定める「G31までcanonical VRT baselineを管理しない」制約より優先した。`canonical-snapshots/visual/character-sheet/`のignoreを外し、Git管理する運用へ変更しようとした。
- 一次対応: ユーザー指摘後、`.gitignore`とdesign noteをローカル専用baselineの運用へ戻した。G19 issueには、baselineのGit管理・再現性判断をG31へ残すことを明記した。今後はDocument Reviewの提案を実装する前に、親Gate planの後続Gateへの割当てを確認する。

### Started Gate 18 reviews before the explicitly instructed commit and push

#### 2026-07-29

- source: user
- failure category: instruction order and response reliability
- 発生箇所: `ex-02-18-sheet-omamori` のcanonical VRT baseline更新後のhandoff
- 観測した失敗: ユーザーがGate 18全体について、先にcommitとpushを行い、その後にGate用ではないDoc ReviewとTech Reviewを実施するよう明示したにもかかわらず、commit・pushを実行せずにreviewを開始した。停止しようとした際にも応答しなかった。
- 一次対応: 未コミット差分を保全した状態で処理状況を確認した。以後、明示された順序のstate変更を完了・報告してから後続reviewを開始し、停止要求には進行中処理の状態を直ちに返す。

### Started review-feedback implementation before issue intake

#### 2026-07-28

- source: user
- failure category: review-workflow order
- 発生箇所: `ex-02-17-sheet-weapons-armor` のユーザーレビュー指摘1
- 観測した失敗: ユーザーがレビュー指摘を伝えただけで実装修正を指示していない段階で、current issueへ指摘を取り込む前にComponentのCSS / JSX修正を開始した。
- 一次対応: 直前の未確定コード変更を元へ戻した。レビュー指摘はcurrent issueの未実装項目として記録し、以後はユーザーの明示的な実装再開指示を受けるまでコードを変更しない。

### Ignored the approved character-sheet design images during G14 implementation

#### 2026-07-28

- source: user
- failure category: design-source compliance
- 発生箇所: `ex-02-14-sheet-common-skills` の基本情報配置
- 観測した失敗: 承認済みの`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を直接確認せず、design noteの文章だけで基本情報の経験点表示を実装した。その結果、desktop / tabletのdesign画像が示す「取得経験点・消費経験点・残経験点・格・共通スキル上限」の同一行配置を守らず、共通スキル値を4列gridの次行へ置いた。ユーザーに確認を求められるまで画像を確認していなかった。
- 一次対応: 実装を停止し、design画像を確認した。レビュー終了後に、基本情報の共通スキル値を既存の共通スキル上限枠へ置き換える要件としてcurrent issueへまとめる。

### Responded before inspecting the actual shared-component diff

#### 2026-07-28

- source: user feedback
- failure category: evidence discipline
- 観測した失敗: ユーザーが`onAutomaticLevelChange`追加を問題にしている場面で、実際のdiffを確認せずにbonus合計validationの話として返答した。
- 一次対応: 実ファイルとdiffを確認してから、共通Componentの追加APIと分岐を削除する対応へ切り替えた。レビュー指摘への応答では、対象ファイルを確認した事実と確認対象を先に揃える。

### Reported non-wrapping resolve-effect formulas without confirming the actual layout

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-9-sheet-bonds` のレビュー指摘 1 に対するdesktop / tablet / mobile実画面確認
- 観測した失敗: 覚悟効果の式について、desktop / tablet / mobileのいずれでも`=`と最終値が次行へ折り返しているactual screenshotを確認していたにもかかわらず、折り返していないと報告した。issueの完了チェックも実画面の表示契約に反して完了へ更新していた。初回訂正時にはmobileだけと限定し、失敗範囲も誤って報告した。
- 一次対応: current issueの該当チェックを未完了へ戻し、3 viewportのactual screenshotに基づく未達へ訂正した。修正後は3 viewportそれぞれで式全体が同一行に収まることを確認するまで肯定報告しない。
- 恒久対応: `visual-implementation-review`で、full-page screenshotを局所表示契約の根拠として禁止し、対象section / Componentの原寸locator screenshotを全state / viewportで開くことを肯定報告の必須要件にした。取得できない場合はfull-pageで代用せず停止する。

### Changed tracked VRT capture code for a one-off local screenshot

#### 2026-07-27

- source: user
- 発生箇所: 副能力値の`一時修正を適用`の局所確認
- 観測した失敗: 既存captureがsection locator screenshotを持たない時、Visual Review skillの「gapを記録して停止する」指示に従わず、局所確認だけのためにGit管理されるcapture設定、VRT helper、target specを直接変更した。
- 一次対応: locator screenshot用の3ファイル変更を同じturnで取り消した。今後、既存のcaptureに必要な局所証跡がない場合は、one-off確認のためにtracked testやcapture設定を変更せず、必要なcapture基盤の追加を独立した承認済みtaskとして扱う。

### Archived a Gate child issue without user confirmation

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-6-sheet-image` のG6進行管理
- 観測した失敗: test、check、buildの成功とagent自身のchecklist更新を、Gate完了およびchild issueのarchive許可と誤認した。ユーザーの完了確認なしに、G6 child issueを当時のローカルarchiveへ移した。
- 一次対応: child issueを作業中のpathへ戻し、parent Gate planのG6を`in progress`へ戻した。以後、検証成功だけでarchiveせず、ユーザーが完了・archiveを明示した場合だけ処理する。

### Repeatedly bypassed the approved character-sheet design draft

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-6-sheet-image` の画像入力レビュー対応
- 観測した失敗: 基本情報・設定・信用を含む承認済みcharacter-sheet design draftを実装入力として確認せず、画像入力だけを独立したcardとして再設計した。さらに、実装結果の個別screenshotをdesign判断に使い、未承認の配置をdesign notesへ確定事項として記録した。既存failure logの「Ignored the approved character-sheet design draft during G4 implementation」と同じ判断ミスを繰り返した。
- 一次対応: G6を作業中へ戻し、review節を破棄して、design draftが定めるdesktop・tablet・mobileのprofile / setting / image / creditの位置関係を子issueの直接契約として再構成する。ユーザー承認までsource codeを変更しない。

### Configured Vitest without the React TSX transform

#### 2026-07-25

- source: validation
- 発生箇所: `ex-02-4-sheet-profile`の`tests/components/character-sheet/ProfileSection.test.tsx`
- 観測した失敗: Vitest 4へAstroの既存TypeScript設定だけを渡し、TSXを変換できなかった。`esbuild.jsx`を後から設定してもVitest 4のOXC変換に無視され、同じ`Unexpected JSX expression`で再失敗した。
- 一次対応: React Vite pluginを明示dependencyとして追加し、Vitest configから接続する。Component / hook testを実行してから設定を確定する。

### Ignored the approved character-sheet design draft during G4 implementation

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の`ProfileSection`実装
- 観測した失敗: 実装前に確認済みで、ユーザーが最終の列幅・余白調整の基準として指定していたcharacter-sheet design draftを実装入力として扱わなかった。その結果、draftの基本情報内のカラム構成・信用の横並び・枠・既存の表示形式を再現せず、独自の3列grid、読み取り専用`input`、要件・draftにない計算式表示を追加した。designを最終調整用の正本として尊重せず、実装都合で簡略化した。
- 一次対応: この指摘をfailure logへ記録し、修正はユーザーの明示指示を待つ。以後、UI実装ではdesign draftのDOM構成、列幅、余白、枠、表示形式を先に照合し、差異を実装判断で補完しない。

### Did not keep the requested implementation in the background

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の実装開始後の進行報告
- 観測した失敗: ユーザーがデザイン修正と並行して会話を続けられるよう、実装・Techレビュー・preview起動をバックグラウンドで進めるよう依頼していたが、agentは作業の完了を待つ形で会話を阻害した。ユーザーから、バックグラウンド実行の意味を理解しているかと指摘を受けた。
- 一次対応: 実装をworkerへ移し、以後のレビュー・preview起動・検証を独立して進め、結果だけを前景へ報告した。

### Test-only hydration state was added to production code

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-1-sheet-runtime`の`CharacterSheetContainer`と`tests/visual/character-sheet.spec.ts`
- 観測した失敗: `client:load`のhydrateをE2Eで観測するためだけに、画面機能に不要な`isHydrated` stateと非表示DOM属性を製品コードへ追加した。G1にはユーザーが操作できる機能がなく、内部実装を露出する検証は適切でないにもかかわらず、完了条件もそのテストに依存させた。
- 一次対応: `isHydrated`、属性、専用E2E testを削除し、G1の完了条件を検証専用実装を追加しないことへ修正した。以後、E2Eはユーザーが観測・操作できる振る舞いだけを対象にし、内部のhydrateやstateを観測するための製品コードは追加しない。

### Used raster image generation instead of the requested HTML design draft

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-web-character-sheet`のdesktop初期画面design draft作成
- 観測した失敗: ユーザーが画面draftの作成を指示した際、対話用にHTMLを作成してローカルcaptureで確認する既存の作業方法を確認せず、raster画像生成を実行した。生成画像をGit管理・design正本・VRT baselineにはしていないが、ユーザーが期待した確認可能なHTML draftではなかった。
- 一次対応: 生成画像はpreview扱いとして採用せず、`.tmp/design/character-sheet/index.html`とcapture scriptを作成し、desktop `1440x1200`のlocal captureへ切り替えた。今後、対話用の画面draftでは、画像生成を先行させず、ユーザーが指定するHTML / local captureの方法を確認する。

### Over-scoped hero layout test follow-up after PR review

#### 2026-07-23

- source: user
- 発生箇所: `ex-03-hero-layout-stability` のPR #66 第2回レビュー取り込み
- 観測した失敗: 画像request保留を使う回帰testが実際の`ImageBlock`領域予約不備を検出した後に、document座標比較、生き様detailの重複scenario、全幅表示prop分離までを同じcurrent issueの必須対応として扱った。全表示箇所の寸法属性確認と代表的な回帰testがすでにあるため、後続の提案は検証価値より複雑性が大きい可能性を十分に評価していなかった。
- 一次対応: 第2回レビュー指摘は実装せず、ユーザーの方針確認を待つ。テスト追加時は、実際に発見した不具合を再発防止する最小ケースと、全箇所を網羅する静的契約確認を分け、同一契約の複数scenarioをデフォルトで増やさない。

### Repeated PR reviews discovered one documentation dependency at a time

#### 2026-07-22

- source: user
- 発生箇所: `42-0-npc-data-normalization`の`no_image.webp` fallback仕様を正式化した後のPRレビュー
- 観測した失敗: 仕様変更時に、plan、TODO、変換仕様、requirements、out-of-scope、architecture、designを横断して影響範囲を一括確認せず、差分中心のPRレビューを繰り返した。そのためworld design、requirements / out-of-scope、architectureの旧仕様が第1回から第3回に分けて発見され、レビュー品質が低く見える連鎖を生んだ。
- 一次対応: 第3回レビューまでの有効な指摘をcurrent issueへ記録した。以後、仕様・データ契約・公開asset規約を変更するPRでは、初回レビュー前に関連語で全SSoTを探索し、更新対象と「確認済み・変更不要」の一覧をレビューmanifestへ残す恒久対応を検討する。

### PR title missed the issue-slug rule again

#### 2026-07-19

- source: user
- 発生箇所: `44-search-modal-ui` のPR #49作成
- 観測した失敗: `create-pr` が定めるissue slugのみのPRタイトルではなく、`feat: search panel UI`としてPRを作成した。ユーザー指摘後にタイトルを`44-search-modal-ui`へ修正した。
- 一次対応: PR #49のタイトルをissue slugへ更新した。以後、PR作成またはmetadata修正時は、connector呼び出し前にcurrent issueのslugをタイトル値として照合する。

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

### Unauthorized git publish

#### 2026-07-06

- 発生箇所: `13-page-toc` の `GitHub Issue #138: 13-page-toc` 完了条件チェック反映後のGit操作
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

### Unnecessary approval request for an approved GitHub read

#### 2026-07-13

- source: user
- 発生箇所: `26-2-advancement-page` のPR #40再レビュー時の`gh pr view`
- 観測した失敗: `gh pr view` は承認済みcommand prefixだったにもかかわらず、sandbox内の最初の接続失敗をsandbox外実行が必要な根拠と誤認し、`require_escalated`を付けて不要な承認を求めた。ユーザーはcommit・push・local reviewer呼出しを指示しており、追加承認を求める必要はなかった。
- 一次対応: 承認済みprefixのcommandは、接続失敗後も`require_escalated`を追加せずに扱う。PR再レビューでは、取得済みのremote headとlocal diffでreviewerを起動し、追加のGitHub API読取りは必要性が明確な場合だけ行う。

### Review scope was over-broadened

#### 2026-07-22

- source: user
- 発生箇所: `31-2-ikizama-index-page` のコンテンツレビュー後のissue更新
- 観測した失敗: ユーザーの「全部無視でいいや」を、直前に報告したコンテンツレビューの指摘だけでなく、先行するPRレビュー指摘にも適用した。PRレビューの未コミット`レビュー指摘 3`をissueから削除したが、ユーザーはコンテンツレビューだけを見送る意図だった。
- 一次対応: `レビュー指摘 3`を元の内容で復元した。複数のレビュー結果が並行している場合、「全部」などの参照範囲は直前の成果物に限定して確認し、既存の別レビュー記録を変更する前には対象を明示的に照合する。

### Chained Git state operations

#### 2026-07-22

- source: user
- 発生箇所: `33-2-items-index-page` のGit操作
- 観測した失敗: 追加承認を減らす目的で、複数のGit状態変更操作を`&&`で連結した。各Git操作の対象と結果を個別に確認するリポジトリ規約に反していた。
- 一次対応: 状態変更を伴う`git add`、`git commit`、`git push`は、それぞれ独立したcommandとして実行する。以後、承認済みprefixであってもGit操作をshell演算子で連結しない。

### Repeated Playwright Chromium sandbox launch failure

#### 2026-07-24

- source: agent self-report
- 発生箇所: `ex-02-web-character-sheet` の全VRT実行とdesktop/tablet baseline更新
- 観測した失敗: `npm run visual:test`、`npm run visual:update`、targetを分割した`npx playwright test`で、Chromiumが`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出して起動に失敗した。同一作業で複数回再現し、更新後のVRT比較を完了できなかった。
- 一次対応: baseline更新と比較を区別して記録し、Chromiumが起動できた時点で書き込まれたdesktop/tablet snapshotは未コミットのまま保持した。以後、このsandbox条件ではPlaywrightの成功を前提にせず、実行可否と未検証範囲を明示して報告する。

### Character-sheet requirement omission marked complete

#### 2026-07-27

- source: review
- 発生箇所: `ex-02-7-sheet-build` のissue作成・完了確認
- 観測した失敗: 要件とdesign notesにある取得経験点の基本情報側配置、流儀増加値、生き様係数、共通スキルボーナス表示をG7契約へ取り込まず、実装後に完了条件とチェックポイントを完了扱いにした。
- 一次対応: レビュー指摘 1としてG7 issueへ不足事項と修正契約を追加した。以後、Gate issueの範囲と完了条件を確定する際は、関連要件の表示配置・派生表示まで照合する。

### Repeated flaky character-sheet section-frame browser test

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `tests/visual/character-sheet.spec.ts`（縁のsection frame開閉確認）
- 観測した失敗: 同じcharacter-sheet browser testで、`縁`の開閉buttonをclickした直後も`aria-expanded`が`true`のままとなる失敗を再度観測した。今回のG7変更はframe実装を変更しておらず、同一commandの他8件は成功したため、既存のclient hydrationまたは操作同期の不安定さとして切り分ける。
- 一次対応: G7のDOM変更を原因とみなしてframe実装へ変更を加えず、対象testを単独で再実行して再現性を確認する。frameを変更する必要がある場合は、別scopeで操作同期の契約を明確にして対応する。

### Repeated unavailable DOM matcher in Component test

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `BuildSection` Component test
- 観測した失敗: Vitest設定に`@testing-library/jest-dom` matcherがないことを確認せず、`toHaveValue`と`toHaveTextContent`を続けて使用してComponent testを2回失敗させた。
- 一次対応: このリポジトリのComponent testで利用済みの標準Chai assertionだけを使用し、inputは`.value`、Tooltipは`.textContent`で比較する。新しいDOM matcherを使う前にtest setupの導入状況を確認する。

### Repeated manual formatter mismatch in Component test

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `ProfileSection` Component test
- 観測した失敗: `npm run check`が示したインデント差分を手動で反映した際、対象行をさらに深くインデントして同じformatter errorを再発させた。
- 一次対応: formatter出力の空白数をそのまま適用し、修正後は再実行前に対象行だけを読み返す。formatterが対象fileを検出しない場合に別の整形コマンドで代替せず、`npm run check`の差分を正本として扱う。

### Tooltip indicator alignment was changed without visual confirmation

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の`FormulaTooltip` indicator追加
- 観測した失敗: tooltip文字列の直後へ`?`indicatorを追加するCSSを、Component testと型検査だけで完了報告し、desktop・tablet・mobileの実画面を確認しなかった。実際にはblock表示のラベルの後でindicatorが次行へ送られ、基本情報と副能力値の両方で縦にずれた。続く修正後も、actual screenshotで基本情報の数値行、能力値grid、一時修正の操作列が崩れていることを見落として完了報告した。
- 一次対応: `FormulaTooltip`の文字列wrapperにindicator分の幅だけを確保し、indicator本体は行高へ影響しない絶対配置にした。基本情報のtooltip rootはblock配置、狭い7列のlabelは単一行・compact indicatorにし、mobileの能力値gridは利用可能幅へ収めた。target限定のPlaywright captureでdesktop・ultrawide・tablet・mobileを再度目視確認した。以後、既存のinline文字列へ装飾要素を追加するUI変更では、報告前に少なくとも影響する代表viewportのactual screenshotを確認する。

### Repeated Playwright sandbox launch failures during G8 layout inspection

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-8-sheet-secondary` の実画面寸法確認用Playwright script
- 観測した失敗: layoutの実寸を取得するために通常sandboxでChromiumを起動したところ、`sandbox_host_linux.cc`の終了権限エラーで起動に失敗した。同じG8作業中の先行captureでも同種のsandbox起動失敗があり、browser計測を通常sandboxで再試行して同じ環境制約を繰り返した。
- 一次対応: 実画面のスクリーンショットはtarget限定captureで確認し、要素寸法の取得が必要なときだけ承認済みのsandbox外実行へ切り替えた。以後、この環境で同じChromium sandbox failureを確認した後は通常sandboxで再試行せず、必要性を明示して一度だけsandbox外実行を依頼する。

### Reported visual confirmation while visible defects remained

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` のtooltip indicatorレビュー報告
- 観測した失敗: actual screenshotには、基本情報の数値行の縦不揃い、副能力値ラベル下の余白、成長点・一時修正の操作列とmobile能力値gridのframe外表示が残っていた。にもかかわらず、agentは「画面を確認し、問題は解消した」と肯定報告した。これはtooltip実装の不備とは別に、可視の失敗を検出せず確認済みと虚偽の検証結果をユーザーへ伝えた重大な報告失敗である。
- 一次対応: `AGENTS.md`と`visual-implementation-review` skillへ、capture成功やsnapshot生成を確認の根拠にせず、宣言した全route・state・viewportのactual snapshotを開き、issueの受入条件ごとに確認する停止条件を追加した。後続reviewで、Gate子issueではbranch名からcurrent issueを推測できず、interactive UIのopen stateを既存VRT specだけから列挙すると漏れることも確認した。skillはparent Gate planからchild issueを解決し、current issueの受入条件と最終diffからstateを列挙するよう補完する。誤った肯定報告が判明した場合は、failure logとcurrent issueを訂正し、issueをdoneへ移さず、capture・実画面確認・VRT比較をやり直す。

### Reported desktop tooltip review without checking trigger anchoring

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の能力値table `常時修正`・`一時修正` tooltip
- 観測した失敗: `常時修正`・`一時修正`のtooltip triggerだけをgrid cell幅いっぱいのblock要素に変更した結果、tooltipの右端基準がラベル文字列ではなくcell全体となった。desktopでtooltipが意図しない位置に現れ、hover時にずれて見える表示を残したにもかかわらず、agentは表示切れだけを確認して「実画面で確認済み」と報告した。
- 一次対応: 見出しtooltipのrootとbuttonのcell全幅指定を撤去し、他のlabelと同じ文字列幅のtriggerへ戻す。以後、tooltipの実画面確認では表示切れだけでなく、triggerとの相対位置、open前後の周辺レイアウト、同種の既存tooltipとの差も確認する。

### Archived G9 while visual acceptance remained unverified

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-9-sheet-bonds` のGate完了・child issue archive
- 観測した失敗: G9 child issueにはresponsive表示、層別確認、Visual Reviewの未完了チェックが残り、後続レビューでもactual screenshotによる確認未実施を記録していた。それにもかかわらず親Gate planを`done`とし、child issueを当時のローカルarchiveへ移動した。さらに初期完了条件と後続レビューの覚悟効果表示契約が同一issue内で矛盾したまま残った。
- 一次対応: `.tmp/chatgpt-review.md`をSSoTと現行実装へ照合し、G10のレビュー指摘1へout-of-scopeとして記録した。G9の受入確認、表示契約、削除callbackはG31統合確認へTODOとして振り分け、G10では実装・完了扱いを変更しない。

### Repeated validation failures while implementing review 2

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-10-sheet-attack-reaction` の`BondsSection` clear icon変更
- 観測した失敗: 最初のComponent testで、消しゴムSVGをclear buttonではなくdelete buttonへ配置し、利用できない`toHaveTextContent` matcherも追加した。修正後の`npm run check`では、同じJSX箇所のBiome整形違反を再度出した。さらに`lucide-react`への切替後も同じ属性インデントを手動で崩し、整形違反を繰り返した。
- 一次対応: 条件分岐の両buttonを再読してiconの所属を確認し、既存test環境で提供済みのDOM APIだけを使う。JSX属性は手動で合わせず、対象fileへBiome formatterを直接適用してから、Component test・`npm run check`を再実行する。

### Replaced a native number-input control without design authority

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の修正number input
- 観測した失敗: 符号付き2桁を狭いinputに収めようとして、既存character sheetのnumber inputにはないspinner非表示styleを追加した。ユーザーは既存実装と異なるデザインを許可しておらず、この変更は要求された幅調整の代替になっていなかった。
- 一次対応: spinner非表示styleを撤去し、既存inputの見た目とpaddingを維持した。サイズ要件とmobile 2列／1行の物理的な幅不足は、別デザインを仮定せずissueへ未決定として記録する。

### Reported tooltip indicator alignment as accepted without the user's visual confirmation

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` のレビュー指摘 6 / `FormulaTooltip`
- 観測した失敗: section locator screenshotを確認し、absolute positioningを共通flex配置へ置き換えた後に、indicatorが各文言の中央に揃ったと報告した。しかしユーザーがpreviewを確認すると、なお微小な上下ずれが見えると指摘した。コンポーネント側に閉じた修正であることと、視覚的な受入可否を混同した。
- 一次対応: current issueの「揃った」という肯定記録を訂正し、G31のコンテンツレビューで違和感が再現した場合に限って、個別labelではなく共通`FormulaTooltip`を再調整するTODOへ移した。tooltipのような微小配置は、actual screenshotだけで受入とせず、ユーザーのpreview確認を待つ。

### Attempted to substitute an ad hoc browser script for the VRT capture path

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のVisual Review
- 観測した失敗: test-owned locator screenshotが必要なVisual Reviewで、`npm run visual:capture`の経路を使わず、独自の`.tmp` Playwright scriptでfull-page screenshotを撮ろうとした。これは局所表示契約の確認根拠にならず、capture基盤が不足する場合は記録して停止するというskillの規約にも反していた。
- 一次対応: 独自scriptは削除し、正規の`visual:capture`を対象tagへ限定して実行した。fixtureのselect操作timeoutによりlocator screenshotを取得できなかったため、issueのVisual Reviewへ未確認として記録し、代替screenshotは使わない。

### Repeated multiline-name component-test matcher failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` の`PrimarySkillPickerDialog` Component test
- 観測した失敗: 改行を含む候補名の表示確認で、通常text matcherと空白正規化したaccessible nameを順に使い、同じtestを2回失敗させた。Testing Libraryのbutton accessible nameが改行を保持することを先に確認していなかった。
- 一次対応: 改行を許容する正規表現でbuttonを取得し、`textContent`で元の改行を確認するテストへ修正した。

### Repeated G12 Component-test assertion mistakes

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` の重複スキルvalidation Component test
- 観測した失敗: 未導入のTesting Library matcherを使い、続く修正でもReactがbooleanの`data-*`属性を`"true"`として出力することを確認せず空文字列を期待したため、同じテストを2回失敗させた。
- 一次対応: 追加matcherに依存せず、DOMの`disabled`プロパティと属性の実際の文字列値を確認するテストへ統一した。新しいattribute assertionを書く前に、React出力の値を確認する。

### Archived or closed a Gate while its child issue remained incomplete

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-12-sheet-primary-skills` のGate完了・child issue archive
- 観測した失敗: parent Gate planを`done`としchild issueを当時のローカルarchiveへ移動したが、child issue本体の完了条件、チェックポイント、Visual Reviewに未チェックが残っていた。G6での無許可archive、G9でのvisual acceptance未確認archiveに続く、完了根拠をchild issueへ反映しないままcloseする再発である。
- 一次対応: `.tmp/chatgpt-review.md`をG13のレビュー指摘2として取り込み、G13では全未チェック項目を実確認結果へ更新するまでclose / archive / parent planの`done`へ変更しない。恒久対応はfailure-log監査でユーザー承認後に行う。

### Repeated component-test failure after changing the removal callback contract

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-15-sheet-other-ryugi-skills` の`BuildSection` Component test
- 観測した失敗: 削除確認dialogのfocus復帰のため、その他流儀削除callbackへ操作元buttonを追加したが、既存testのcallback引数期待を更新しなかった。同じ失敗をfull testとcomponent testで2回確認した。
- 一次対応: callback契約に合わせてtest expectationを更新し、`npm run test:component`で16 files・78 testsの通過を確認した。callbackへ操作元を追加する変更では、呼び出し側とtest doubleの引数契約を同時に確認する。

### Recorded a locator-only VRT state that still ran full-page comparison

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-13-sheet-ikizama-skills` のビジュアルレビュー3と`@ikizama-long-skill-selected`
- 観測した失敗: Visual Review記録でscenarioをlocator-onlyと扱ったが、shared `registerVrtScenarios`はlocator capture前にfull-page `toHaveScreenshot()`を必ず実行する。canonical full-page baseline未作成のstateを通常VRTから分離できておらず、記録した実行契約と実装が一致していなかった。
- 一次対応: G13のレビュー指摘3とG31 TODOへ、locator-only stateをfull-page VRTから分離する契約を記録した。ユーザー承認なしにVRT helperやcanonical baselineは変更しない。

### Began implementation before completing the requested review-intake update

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-13-sheet-ikizama-skills` のレビュー指摘3取り込み後
- 観測した失敗: ユーザーがdictionary修正をレビュー指摘へ先に反映するよう求めたにもかかわらず、その記録更新を完了・報告する前に確認dialogのrename作業へ進もうとした。レビュー取り込みと実装の順序を混同した。
- 一次対応: レビュー指摘3へdictionary共通文言、`SkillSelectionRowValues`、`SkillSelectionChangeConfirmDialog`の対応方針と未完了チェックを追記してから実装を再開した。review-to-issue中の追記要求は、追記結果を確認してから次段階へ移る。

### Repeated test failure from obsolete skill-level clamp expectations

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-16-sheet-experience-consistency` の最大Lv超過を保持するRHF hook / Component test
- 観測した失敗: 最大Lv超過値をclampする旧契約を前提にしたexpectationを残したまま、full testとcomponent testで同じ失敗を連続して確認した。さらに、レベルを1桁前提へそろえる際にexpectationだけを`9`へ更新し、テスト操作値`999`を残して同じhook testを再度失敗させた。
- 一次対応: expectationとテスト操作値をともに「1桁の超過値を保持し、行・sectionの局所errorを示す」契約へ更新し、修正後にfull testを通した。入力規則を変更するGateでは、実装より先に既存の正規化期待とtest操作値を検索して同じ変更で更新する。

### Stopped after reporting review results without review-to-issue intake

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-16-sheet-experience-consistency` の通常Doc Review / Tech Review後
- 観測した失敗: ユーザーがG16全範囲のreviewを指示した後、review結果をcurrent issueの番号付きレビュー指摘へ取り込まず、結果報告だけで停止した。レビュー指摘の修正範囲と未完了状態が正式trackingに残らなかった。
- 一次対応: `.tmp/review/ex-02-web-character-sheet/document-review-2.md`と`technical-review-4.md`を作成し、ローカルSSoT照合済みの6件をG16のレビュー指摘3へ取り込んだ。実装はユーザー承認まで開始しない。

### Prioritized a design draft over the user-approved current issue

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具の性能値表示
- 観測した失敗: session分割後の実装で、ユーザー指示により作成したcurrent issueの計算式表示、mobileの`＝`以降の折り返し、算出値のaccent-muted領域という画面契約を確認せず、design draftに引きずられた値と修正inputの2列構成を実装した。
- 一次対応: G17のレビュー指摘4へ、current issueがdesign draftより優先することと、式表示・mobile改行・算出値背景の修正要件を記録した。以後の修正では、実装対象のcurrent issueにある画面契約を先に読み、draftは競合しない参考情報だけに限定する。

### Estimated the paired-value width too narrowly

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式の元値・最終値
- 観測した失敗: `2桁／2桁`に共通right paddingを含めて必要な表示幅を測らず、`3.75rem`を固定幅として採用したため、文字列が枠内に収まらなかった。
- 一次対応: G17のレビュー指摘11へ必要な固定幅とmobile性能列の最小幅を記録した。固定幅のUIは、表示文字列とpaddingを合算してから寸法を定める。

### Changed the mobile formula structure without rechecking its box metrics

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile性能式
- 観測した失敗: mobileを性能ごとの2行式へ変更した後も、共通算出値枠のright padding、font-size、minimum heightを残したため、性能列で横overflowし、修正inputより高いままだった。
- 一次対応: G17のレビュー指摘13へmobile限定のfont-size、padding、inputと同一高を記録した。responsive構造を変更した後は、共通Component由来のpaddingとminimum sizeを対象viewportごとに再確認する。

### Overcorrected mobile overflow with undersized text and oversized boxes

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile性能式
- 観測した失敗: overflowを避けるため算出値フォントを`.625rem`まで縮小した一方、right paddingを削除した後も`2.5rem`の枠幅を維持した。可読性を不必要に下げ、縮小後の文字に対して枠も過大だった。
- 一次対応: G17のレビュー指摘14へ既存mobileセル相当のfont-sizeと二桁用最小幅を記録した。overflow修正では、font-sizeとbox widthを同時に最小化せず、既存のmobile type scaleを基準にする。

### Removed all right padding and retained an overly small mobile type size

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile性能式
- 観測した失敗: 算出値のoverflowを直す際、right paddingを0にし、文字を`.6875rem`へ下げた。枠幅を縮められたものの、数値の視認性と枠内余白を過度に犠牲にした。
- 一次対応: G17のレビュー指摘15へ最小right padding、`.75rem`の文字、二桁を収める`2.125rem`幅を記録した。overflowの是正では、数値の可読性と余白を先に維持し、その必要寸法に枠を合わせる。

### Expanded the boxes again without accounting for the formula's total mobile width

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile性能式
- 観測した失敗: 可読性を戻す修正で各算出値枠を`2.125rem`に広げ、left paddingもright paddingより広くした。その結果、式全体が再び横overflowし、枠の余白も不自然に見えた。
- 一次対応: G17のレビュー指摘16へ、mobile式全体の幅と左右対称のpaddingを含めた`1.875rem`固定枠を記録した。個別枠を調整する際は、mobile式の合計幅と余白の対称性を同時に確認する。

### Adjusted button sizing without inspecting the border cascade

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: 右側の線が消える問題をbuttonの幅やfont-sizeとして扱い、desktopのcomputed styleとselector specificityを確認しなかった。実際には最後のgrid itemの区切り線を消すruleがbutton自身のright borderを上書きしていた。
- 一次対応: G17のレビュー指摘20へ、desktop実寸とcomputed borderを記録した。borderの欠落では、寸法変更より前にcomputed styleとcascade上のwinning selectorを確認する。

### Repeated a new visual test failure across viewports with an unverified accessible name

#### 2026-07-29

- source: agent
- 発生箇所: `tests/visual/vrt/character-sheet.spec.ts` の武器・防具詳細展開capture
- 観測した失敗: 追加したVRT scenarioで詳細buttonのaccessible nameを「刀の詳細を開く」「チンピラ服の詳細を開く」と推測した。実装は助詞を含まないため、desktop／tablet／mobileで同じlocator timeoutを繰り返した。
- 一次対応: Componentの`aria-label`組み立てを確認し、test locatorを実際の「刀詳細を開く」「チンピラ服詳細を開く」へ修正した。新規browser testでは、操作対象のaccessible nameを実装または先行E2Eで確認してから複数viewportへ展開する。

### Let a shared CSS Module override mobile-specific rules

#### 2026-07-29

- source: agent
- 発生箇所: `ex-02-17-sheet-weapons-armor` のCSS共通化後の`@character-sheet` VRT
- 観測した失敗: 共通classをCSS Modulesの`composes`で導入した際、共通moduleのdesktop向けfont sizeとpaddingが出力順により個別moduleのmobile規則を再上書きした。複数のmobile skill stateで同じ差分を発生させた。
- 一次対応: 共通moduleへ既存と同一のmobile規則を移し、target限定VRTを再実行して既存full-page snapshot 51件の差分がないことを確認した。CSS Modulesで共通classがbreakpoint依存値を持つ場合は、個別moduleのoverride順に依存せず、共通module内に対応するmedia queryを置く。

### Repeated component-test invocation and matcher failures during G17 review response

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-17-sheet-weapons-armor` のレビュー指摘22・23対応中のComponent test
- 観測した失敗: Vitestにない`--runInBand` optionを渡してComponent test commandを失敗させた後、既存test setupにない`toHaveValue` matcherを使い、同じtest確認を続けて失敗させた。
- 一次対応: package scriptのVitest optionを変更せず実行し、Component testでは既存規約どおり`HTMLInputElement.value`と標準Chai assertionで確認する。

### Repeated character-sheet VRT setup failures during scenario-helper migration

#### 2026-07-29

- source: agent self-report
- 発生箇所: `tests/visual/vrt/character-sheet.spec.ts` の専用scenario helperへの移行後のtarget限定VRT
- 観測した失敗: React hydration前のselect操作を一度だけ行いdesktop / tabletでstateを反映できなかった。続いて、変更確認dialogがselect値を即時変更しない既存契約へ、値変更を待つ汎用helperを誤用した。sandbox内のChromium起動失敗も同じ再実行中に重なった。
- 一次対応: select値を反映するstateは`toPass`で再試行し、確認dialog stateはdialog表示を待機条件に分離した。Chromiumがsandbox内で起動できない場合は、理由を確認して許可済みtarget限定VRTだけをsandbox外で実行する。新しいVRT scenarioは、入力後のDOM stateと確認dialogのstate遷移を別契約として先に確認する。

### Ran a search-state VRT without the required visual build, then treated its baseline difference as helper validation

#### 2026-07-29

- source: agent self-report
- 発生箇所: static VRT helper復元後の`@search-modal @search-results`確認
- 観測した失敗: 最初にPagefind indexを含まない通常buildで検索結果stateを実行し、3 viewportで結果が表示されなかった。`visual:build`後にはstate表示へ進んだが、desktop / tabletで既存baselineとの差分が残った。この差分はhelper変更ではなく、画面左側の既存static内容であった。
- 一次対応: 検索stateを含むVRTは必ず`visual:build`後のpreviewで実行する。helper変更の回帰確認では、既存baselineとの差分をhelper起因と断定せず、diff画像で影響領域を確認してから対応範囲を判断する。

### Repeated a component-test assertion without resolving the rendered element

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-20-sheet-nanomachines` の`NanomachinesSection` error-state Component test
- 観測した失敗: 既存setupにない`toHaveAttribute` matcherを使用した後、集計tooltipのlabelを最終値`output`のaccessible nameと取り違えた。さらに、hover中のtooltipへEscapeを送ればpointer stateにかかわらず閉じると仮定した。そのため、上限超過とtooltip操作を確認するtestを連続して失敗させた。
- 一次対応: 標準Chaiで属性値を比較し、最終値は実際の`output[aria-label]`で明示的に特定する。表示Componentに近い文言の操作と値が併存する場合、testの対象roleまたはelement typeと実際のaccessible nameを先に確認する。共通Componentで担保済みのkeyboard操作を個別browser testへ複製せず、個別testはpointer移動を含む固有の表示契約だけを確認する。

### Repeatedly ran a broad Container test before isolating its existing dialog-focus contract

#### 2026-07-30

- source: agent self-report
- 発生箇所: `ex-02-28-sheet-ccfolia` の`CharacterSheetContainer` Component test
- 観測した失敗: G28の確認・Clipboard通知結線を追加した直後、既存のresponsive reset / image errorのfocus復帰testを含むContainer全体を2回実行した。1回目はjsdomでnative Escapeを再現できない既存assertion、2回目は同じ既存testの画像エラーdialogからmenu triggerへのfocus復帰assertionで失敗し、CCFOLIA対象testを切り分ける前に同じ広いtest実行を繰り返した。
- 一次対応: CCFOLIAのContainer結線は対象test名で単独実行し、ActionPane、CCFOLIA dialog、root-state hook、Node logic / Clipboard adapterを別々に確認した。reset test harnessがerrorを閉じた直後に本番root stateでは保持される`isImageErrorFromReset`までfalseにしていたため、本番と同じ保持契約へ修正した。対象Component / hook testは55件すべて通過した。

### Reported an obsolete VRT capture as a current dialog defect

#### 2026-07-30

- source: user
- failure category: visual implementation verification
- 発生箇所: `ex-02-30-sheet-help` のHelp dialog contents review報告
- 観測した失敗: 先に作成されたVRT captureで最下部のヘッダーと閉じる操作が見えないことを、現行preview・現行buildで再captureせず、実装の外側scroll不備として報告した。ユーザーからVRT側の問題ではないかと指摘された。
- 一次対応: VRT scenarioのscroll対象が`header + div`の本文要素だけであることを確認し、実行時にdialogの`scrollTop`が`0`、本文の`scrollTop`だけが最大値へ移動することをdesktop / tablet / mobileで確認した。現行4321 previewに対して9状態を再captureし、すべてでheaderと閉じる操作が残ることを原寸画像で確認した。VRT captureをreview入力へ渡す前に、現行build由来であることと対象stateを再確認する。

### Put a local fixture policy into a shared layout

#### 2026-08-04

- source: user
- failure category: implementation scope discipline
- 発生箇所: `milestone-02-phase-01-todo-resolution` G5のPagefind除外
- 観測した失敗: `-local`配下の確認ページだけをPagefindから除外する要件に対し、最初に`AppContainer`へpath判定を追加した。個別fixtureの明示的な属性追加で足りる範囲へ共通layoutの責務を広げ、ユーザーから訂正を受けた。続く除外testでも、fixture固有語句が公開本文に部分一致することを確認せず、結果0を期待して同じ確認を再度失敗させた。
- 一次対応: `AppContainer`の変更を撤回し、7つの`src/pages/-local/`ページ本体へ`data-pagefind-ignore`を明示した。Pagefind APIを使うtestは検索結果が空であることではなく、結果URLに`/-local/`が含まれないことを検証する。局所的な除外・表示制御では、共通layoutの変更前に対象ページだけで完結できるかを確認する。
