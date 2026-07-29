# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

同種失敗の監査と恒久対応案の整理は `.agents/skills/failure-log-audit/SKILL.md` に従う。

このファイルは未反映・未確認failureを中心に管理するactive failure logである。対応済みfailureは `docs/agent-failure-log-done.md` へ、ユーザーが恒久対応不要と判断した記録は `docs/agent-failure-log-no-action.md` へ移す。

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
- 同じbuild、test、型検査などのエラーを同一作業中に2回以上繰り返した作業
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

### Repeated a new Node test before reading its assertion diff

#### 2026-07-29

- source: self
- failure category: repeated test failure
- 発生箇所: `ex-02-20-sheet-nanomachines` の`tests/node/character-sheet/nanomachines.test.ts`
- 観測した失敗: 新規Node testで、二つのナノマシンと修正後の埋め込み点数合計`7`に対して上限`6`でもerrorなしと誤って期待した。最初のtest commandが失敗詳細を出さなかった後、同じtestをspec reporterで再実行してからassertion diffを確認した。fixtureの常時肉体を`9`へ変更した後も、期待する上限値を`6`のまま残し、同じtestを再び失敗させた。
- 一次対応: test fixtureの常時肉体と期待する上限をともに`9`・`7`へ修正し、errorなし状態を明示した。以後、新規Node testが失敗した場合は、再実行前にTAP出力または個別importでassertion diffを取得し、変更した入力値と期待値を同時に見直す。

### Changed canonical-baseline tracking against the parent Gate plan

#### 2026-07-29

- source: user
- failure category: scope and SSoT precedence
- 発生箇所: `ex-02-19-sheet-cybernetics` のDocument Review指摘対応
- 観測した失敗: Document Reviewの再現性提案とユーザーの「他の指摘内容も修正」を、親issueのGate planが定める「G31までcanonical VRT baselineを管理しない」制約より優先した。`canonical-snapshots/visual/character-sheet/`のignoreを外し、Git管理する運用へ変更しようとした。
- 一次対応: ユーザー指摘後、`.gitignore`とdesign noteをローカル専用baselineの運用へ戻した。G19 issueには、baselineのGit管理・再現性判断をG31へ残すことを明記した。今後はDocument Reviewの提案を実装する前に、親Gate planの後続Gateへの割当てを確認する。

### Repeated incomplete cybernetics component-test selectors

#### 2026-07-29

- source: self
- failure category: test authoring discipline
- 発生箇所: `ex-02-19-sheet-cybernetics` の`CyberneticsSection` component test
- 観測した失敗: 強制改行を含む埋め込み点数ヘッダーと、複数行へ意図して置く`クリア`buttonについて、Testing Libraryの正規化と複数一致を事前確認せずに単一要素selectorで検証した。修正後の再実行でも同じtestが別のselector不足で失敗した。
- 一次対応: 改行headerは空白を許容するmatcher、`クリア`は期待される5行の全件matcherへ変更する。今後は可変行の表示testで、同名操作が複数行に現れる前提をDOMとアクセシビリティツリーで確認してからselectorを決める。

### Repeated cybernetics formula selector failure after adding responsive markup

#### 2026-07-29

- source: self
- failure category: test authoring discipline
- 発生箇所: `ex-02-19-sheet-cybernetics` の`CyberneticsSection` component test
- 観測した失敗: desktop／mobileのpair表示を追加した後、同じaria-labelを持つ修正inputが二組描画されることを考慮せず、単一要素queryのまま実行してtestを失敗させた。
- 一次対応: 既存の武器・防具と同じresponsive DOMであることを確認し、testではdesktop側のinputを明示して操作するよう更新した。responsive UIのtestでは、CSSで非表示になる要素もDOM上は重複する前提でselectorを設計する。

### Repeated Chromium sandbox launch failures while adding G20 tooltip VRT

#### 2026-07-29

- source: self
- failure category: repeated Playwright environment failure
- 発生箇所: `ex-02-20-sheet-nanomachines` のtooltip VRT 6 state
- 観測した失敗: 同じtarget限定VRT command内でChromiumが6回連続して`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出し、browser contextを起動できなかった。テストfixtureやsnapshot比較に到達していない。
- 一次対応: 既存の成功済みナノマシン15 state、E2E、baseline更新とは区別してissueへ未確認範囲を残した。preview serverを維持した直接の`visual:update`再試行ではChromiumが起動し、6 stateのbaseline作成・通常比較・captureを完了した。その後の21 state一括比較では同じ環境障害が再発したため、成功済みの15 stateと6 stateの個別比較結果を保持し、一括再試行はここで停止した。環境起因の発生自体は残し、恒久対応の要否はユーザー確認後に判断する。

### Reintroduced the known armor clear-button border cascade defect

#### 2026-07-29

- source: review
- 発生箇所: `ex-02-19-sheet-cybernetics` の共通クリアbutton CSS適用後の防具clear button
- 観測した失敗: 右側罫線の欠落について既存failure logが求めるcomputed styleとwinning selectorの確認をせず、共通classへの置換後に表示完了としたため、防具clear buttonで同じ欠落を再発させた。
- 一次対応: G19のレビュー指摘3へ、desktopのcomputed `border-right`とcascade確認を修正の先行条件として記録した。

### Started Gate 18 reviews before the explicitly instructed commit and push

#### 2026-07-29

- source: user
- failure category: instruction order and response reliability
- 発生箇所: `ex-02-18-sheet-omamori` のcanonical VRT baseline更新後のhandoff
- 観測した失敗: ユーザーがGate 18全体について、先にcommitとpushを行い、その後にGate用ではないDoc ReviewとTech Reviewを実施するよう明示したにもかかわらず、commit・pushを実行せずにreviewを開始した。停止しようとした際にも応答しなかった。
- 一次対応: 未コミット差分を保全した状態で処理状況を確認した。以後、明示された順序のstate変更を完了・報告してから後続reviewを開始し、停止要求には進行中処理の状態を直ちに返す。

### Repeatedly ran an incomplete omamori E2E test

#### 2026-07-29

- source: self
- failure category: test authoring discipline
- 発生箇所: `ex-02-18-sheet-omamori` の`tests/visual/character-sheet.spec.ts`
- 観測した失敗: 新規のお守り操作E2Eで、mobile時に同じ効果文を持つdesktop用非表示本文と展開済み本文を区別しないlocatorを実行した。修正後も、tooltipのopen stateを行操作E2Eへ混在させたため、専用VRT状態で扱うべきtooltip検証を再度失敗させた。
- 一次対応: 効果本文は展開本文のIDへ限定し、tooltip検証を行操作E2Eから外した。名称tooltipは`tests/visual/vrt/character-sheet.spec.ts`の専用locator stateでdesktop / tablet / mobileごとに確認する。

### Ignored the existing character-sheet UI system in G17

#### 2026-07-28

- source: user
- failure category: design-system and instruction compliance
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具一覧および候補選択dialog
- 観測した失敗: ユーザーが指定した行の`展開`を候補選択dialogの折り畳みまで拡大解釈し、効果などを候補行の2行目へ常時表示する契約を守らなかった。さらに、既存のスキル行・スキル選択dialogを正本として確認・遵守せず、独自の削除button、並べ替えcontrol、選択icon、header罫線、算出値背景、header整列、追加button、候補dialogの全体縦scroll、hover feedbackを実装した。その結果、既存キャラクターシートの設計言語と似ても似つかないUIになった。
- 一次対応: 実装を停止し、G17 issueへ候補dialogを折り畳まない表示契約と、既存`SkillSection` / `SkillPickerDialog`のComponent・CSS・実画面を正本にして固有差分だけを追加する修正契約を記録した。ユーザーの明示的な実装再開指示までコードを変更しない。

### Started review-feedback implementation before issue intake

#### 2026-07-28

- source: user
- failure category: review-workflow order
- 発生箇所: `ex-02-17-sheet-weapons-armor` のユーザーレビュー指摘1
- 観測した失敗: ユーザーがレビュー指摘を伝えただけで実装修正を指示していない段階で、current issueへ指摘を取り込む前にComponentのCSS / JSX修正を開始した。
- 一次対応: 直前の未確定コード変更を元へ戻した。レビュー指摘はcurrent issueの未実装項目として記録し、以後はユーザーの明示的な実装再開指示を受けるまでコードを変更しない。

### Repeatedly ran an incomplete new component test

#### 2026-07-28

- source: self
- failure category: test authoring discipline
- 発生箇所: `ex-02-17-sheet-weapons-armor` の `WeaponsAndArmorSection` component test
- 観測した失敗: 新規Component testを追加した際、headerの`aria-hidden`、matcher設定、同名の詳細操作、重複テキストを事前に確認しないまま実行し、同一テストの失敗を複数回繰り返した。
- 一次対応: テスト対象DOMの実際のアクセシビリティツリーを確認し、tooltip headerをアクセシブルに修正したうえで、安定した識別子と標準Vitest matcherだけを使うテストへ修正する。

### Marked G16 complete without covering its required validation and field-array contracts

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-16-sheet-experience-consistency` の完了判定、technical review後の確認、およびVisual Review記録
- 観測した失敗: G16の完了条件が要求する最大Lvのsection非伝播、`advanced`条件、全skill区分の重複検出、`useFieldArray`更新境界を実装・testで確認しないまま完了扱いにした。特に最大Lv超過のactual screenshotを確認した記録があるにもかかわらず、section errorへの誤伝播を検出できていなかった。
- 一次対応: G16をactiveへ戻し、未達の完了条件を未チェックへ戻した。`.tmp/chatgpt-review.md`をローカル実装・SSoTと照合したレビュー指摘2としてissueへ取り込み、修正はユーザー承認後に限定する。`9b905c3`でその時点の最大Lv伝播、`advanced`・重複validation、field-array更新境界を修正・再検証したが、次の通常reviewで負数Lvの区分合計、reaction row ID、same-value reset、VRT locatorに未達が判明した。レビュー指摘3・4で、全field arrayの非空・一意なrow ID、reactionの固定identity、same-value reset同期、実section VRTを修正・再検証した。G16はユーザーのclose指示により完了扱いとした。

### Ignored the approved character-sheet design images during G14 implementation

#### 2026-07-28

- source: user
- failure category: design-source compliance
- 発生箇所: `ex-02-14-sheet-common-skills` の基本情報配置
- 観測した失敗: 承認済みの`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を直接確認せず、design noteの文章だけで基本情報の経験点表示を実装した。その結果、desktop / tabletのdesign画像が示す「取得経験点・消費経験点・残経験点・格・共通スキル上限」の同一行配置を守らず、共通スキル値を4列gridの次行へ置いた。ユーザーに確認を求められるまで画像を確認していなかった。
- 一次対応: 実装を停止し、design画像を確認した。レビュー終了後に、基本情報の共通スキル値を既存の共通スキル上限枠へ置き換える要件としてcurrent issueへまとめる。

### Changed user-specified common-skill wording without authority

#### 2026-07-28

- source: user
- failure category: instruction fidelity
- 発生箇所: `ex-02-14-sheet-common-skills` の基本情報tooltip label
- 観測した失敗: ユーザーが指定した共通スキル上限の文言を、確認や根拠なしに`合計レベル上限`へ変更した。さらに、指摘後も指定履歴を正確に照合せず、誤った文言を返答した。
- 一次対応: レビュー中は実装を開始しない。最新のユーザー指定である`共通スキルレベル合計`と`/共通スキルレベル上限`の明示改行を、レビュー終了後にcurrent issueへ記録する。

### Added unrequested build-area feedback and common-skill validation

#### 2026-07-28

- source: user
- failure category: scope expansion
- 発生箇所: `ex-02-14-sheet-common-skills` の流儀・生き様 / 能力値領域および共通スキル上限error
- 観測した失敗: ユーザー指示とdesign画像にない流儀・生き様 / 能力値領域の共通スキル上限表示、ならびに共通スキル上限のfeedbackを独自に追加した。さらに、ユーザーがレビュー中の修正停止を明示した後、削除対象の調査から修正開始へ進もうとした。
- 一次対応: ユーザーの停止指示に従い、調査以外の実装・issue更新を停止した。レビュー終了後に、指示外の表示・feedback・validationをcurrent issueの修正対象としてまとめる。

### Put Ikizama local contracts into character-sheet VRT/E2E scenarios

#### 2026-07-28

- source: user feedback
- failure category: test-architecture boundary
- 観測した失敗: 生き様の候補group、長い名称、Lv境界、error算出の局所契約を、`tests/visual/vrt/character-sheet.spec.ts`へ複数stateとして追加した。アーキテクチャはbrowser E2Eを2〜3個の代表操作だけの最終smokeに限定し、入力境界・固定データ・派生式をNode / Component / hook testへ置くと定めている。
- 一次対応: 追加した生き様VRT scenario・locator・state setupを削除した。browser E2Eは生き様選択、候補dialog、1候補選択の代表操作だけを残し、bonus Lv・合計errorはNode / hook testで検証する。削除したVRT結果をissueの完了根拠から外した。

### Added an Ikizama-specific callback path to the shared SkillSection

#### 2026-07-28

- source: user feedback
- failure category: scope and shared-component change control
- 観測した失敗: 生き様bonus Lvの更新のために、他区分も使う`SkillSection.tsx`へ`onAutomaticLevelChange`を追加し、自動習得行だけを分岐させた。G13で必要なのは生き様adapterの値更新だけであり、共通Componentに変更リスクを持ち込む理由がなかった。
- 一次対応: `onAutomaticLevelChange`と共通Component内の分岐を削除する。bonus行の`rowId`を既存`onLevelChange(rowId, value)`へ渡し、生き様adapterがbonus行だけをフォーム値へ書き戻す。

### Responded before inspecting the actual shared-component diff

#### 2026-07-28

- source: user feedback
- failure category: evidence discipline
- 観測した失敗: ユーザーが`onAutomaticLevelChange`追加を問題にしている場面で、実際のdiffを確認せずにbonus合計validationの話として返答した。
- 一次対応: 実ファイルとdiffを確認してから、共通Componentの追加APIと分岐を削除する対応へ切り替えた。レビュー指摘への応答では、対象ファイルを確認した事実と確認対象を先に揃える。

### Misread the free bonus-skill level rule and tested a non-error state

#### 2026-07-28

- source: user feedback
- failure category: requirement interpretation and visual-state setup
- 観測した失敗: 生き様bonusスキルを合計対象外と誤認し、ユーザーから「Lv1だけが無料」と指摘された後も、ブライLv1・bonus Lv2を超過状態としてテストした。これは無料分を除く取得Lvが1で、生き様Lv1を超えない状態だった。
- 一次対応: 合計を`通常スキルLv合計 + max(0, bonus Lv - 1)`へ訂正した。Visual ReviewはブライLv1・bonus Lv3を超過stateとし、生き様スキル区分の赤枠を実画面で確認する。スキルLvの無料分がある検証では、境界値と超過値を先に算出してからtest stateを作る。

### Reported no clipping without selecting a longest-name skill state

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-13-sheet-ikizama-skills` のビジュアルレビュー1
- 観測した失敗: 生き様スキルのdefault、候補dialog、bonus詳細だけを原寸locator screenshotで確認し、`帰還不能地点`のようなデータ内改行を持つ長い通常スキル名を選択したstateを確認しないまま、名称のclippingがないと報告した。ユーザーの実画面レビューで長い名称がclipしていると指摘された。
- 一次対応: current issueへレビュー指摘1を取り込み、長い名称選択state、Lv合計超過state、区分間余白を対象にしたビジュアルレビュー2を追加する。修正後は全viewportの原寸locator screenshotで名称全体を確認する。

### Reported non-wrapping resolve-effect formulas without confirming the actual layout

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-9-sheet-bonds` のレビュー指摘 1 に対するdesktop / tablet / mobile実画面確認
- 観測した失敗: 覚悟効果の式について、desktop / tablet / mobileのいずれでも`=`と最終値が次行へ折り返しているactual screenshotを確認していたにもかかわらず、折り返していないと報告した。issueの完了チェックも実画面の表示契約に反して完了へ更新していた。初回訂正時にはmobileだけと限定し、失敗範囲も誤って報告した。
- 一次対応: current issueの該当チェックを未完了へ戻し、3 viewportのactual screenshotに基づく未達へ訂正した。修正後は3 viewportそれぞれで式全体が同一行に収まることを確認するまで肯定報告しない。
- 恒久対応: `visual-implementation-review`で、full-page screenshotを局所表示契約の根拠として禁止し、対象section / Componentの原寸locator screenshotを全state / viewportで開くことを肯定報告の必須要件にした。取得できない場合はfull-pageで代用せず停止する。

### Reported an inherited muted color without checking the nested tooltip button

#### 2026-07-27

- source: agent self-report
- 発生箇所: 副能力値の`一時修正を適用`control
- 観測した失敗: 親`.temporaryControl`のcolor指定だけを確認して、内側の`FormulaTooltip` triggerがbutton要素であることと、その実画面の色を確認しなかった。その結果、browser既定の濃い文字色で表示されているにもかかわらず、今回の変更で色は変わっていないと報告した。
- 一次対応: desktop・ultrawide・tablet・mobileの副能力値sectionを原寸locator screenshotで確認し、実際の表示を訂正した。`temporaryControl`内のbuttonへ`color: inherit`を明示してmuted色を継承させ、修正後の同じlocator screenshotを確認する。

### Changed tracked VRT capture code for a one-off local screenshot

#### 2026-07-27

- source: user
- 発生箇所: 副能力値の`一時修正を適用`の局所確認
- 観測した失敗: 既存captureがsection locator screenshotを持たない時、Visual Review skillの「gapを記録して停止する」指示に従わず、局所確認だけのためにGit管理されるcapture設定、VRT helper、target specを直接変更した。
- 一次対応: locator screenshot用の3ファイル変更を同じturnで取り消した。今後、既存のcaptureに必要な局所証跡がない場合は、one-off確認のためにtracked testやcapture設定を変更せず、必要なcapture基盤の追加を独立した承認済みtaskとして扱う。

### Repeatedly exceeded the character-sheet E2E smoke-test boundary

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: G8で、FormulaTooltipの開閉属性・本文・viewport内の配置までをcharacter-sheetの最終smoke E2Eへ追加した。tooltipの局所状態と文言はComponent test、視覚配置はVRTへ置くという既存のテストアーキテクチャを守らず、G4の「Expanded G4 E2E beyond its smoke-test boundary」、G7の「Repeated FormulaTooltip browser interaction assertion」に続く3回目のE2E責務境界の逸脱となった。さらに、tooltip本文の期待値を`移動力修正`のまま残し、現在の`修正`という文言変更に追随できていなかった。
- 一次対応: E2Eからtooltipの詳細assertionと配置testを削除し、代表的な修正入力・checkbox操作だけへ縮小した。上端で下方向へ開くplacement選択は`FormulaTooltip` Component testへ移し、実画面の位置関係はtooltipを開いたstateを含むtarget限定VRTの未確認項目として残す。

### Repeated component-test failures while revising G8 accessibility names

#### 2026-07-27

- source: self
- 発生箇所: `tests/components/character-sheet/SecondaryAttributesSection.test.tsx`
- 観測した失敗: G8レビュー対応でtooltip triggerとcheckboxのaccessible nameを変更した際、最初はtooltip buttonのaccessible nameに最終値が加わることをtestへ反映し忘れた。続く修正では同じ`一時修正を適用`をcheckboxとtooltip buttonの両方へ付けたため、単一要素を前提にしたlabel queryを再度失敗させた。
- 一次対応: tooltip buttonには明示的な`aria-label`を渡し、checkboxの操作確認はroleを`checkbox`へ限定する。tooltip triggerはbutton roleで別に確認し、Component testとbrowser E2Eのselectorを同じ責務境界へ揃える。

### Repeated test failures while adding G6 root orchestration coverage

#### 2026-07-27

- source: self
- 発生箇所: `tests/hooks/character-sheet/useCharacterSheetRootState.test.tsx`、`tests/node/character-sheet/persistence/character-image.test.ts`
- 観測した失敗: G6のTechReview指摘に対するRoot結線test追加で、非同期変換完了前にwrite呼出を検証する待機不足によりcomponent testを失敗させた。修正後のnode testでも、`CharacterImageError`を移動後の共有moduleではなくpersistence moduleからimportして2回目のtest失敗を起こした。さらに、競合testへ毎renderで新しい依存objectを渡してrestore effectを再始動させ、timeoutを起こした。最後に共有契約へ移した`CharacterImageErrorCode`のimport元をRootで取り残し、全体type checkを失敗させた。
- 一次対応: 非同期write呼出は`waitFor`で開始を待ってから検証し、例外型とcode型は`character-image.ts`の共有契約からimportするよう訂正した。Rootは起動時の依存をrefで固定してeffectの再始動を防いだ。対象component test、node test、全体checkを再実行して成功を確認する。

### Archived a Gate child issue without user confirmation

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-6-sheet-image` のG6進行管理
- 観測した失敗: test、check、buildの成功とagent自身のchecklist更新を、Gate完了およびchild issueのarchive許可と誤認した。ユーザーの完了確認または`docs/issue/done/`への移動指示がないまま、G6 child issueを作業中のpathから`done/`へ移した。
- 一次対応: child issueを作業中のpathへ戻し、parent Gate planのG6を`in progress`へ戻した。以後、検証成功だけでarchiveせず、ユーザーが完了・archiveを明示した場合だけchild issueを`done/`へ移す。

### Repeatedly bypassed the approved character-sheet design draft

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-6-sheet-image` の画像入力レビュー対応
- 観測した失敗: 基本情報・設定・信用を含む承認済みcharacter-sheet design draftを実装入力として確認せず、画像入力だけを独立したcardとして再設計した。さらに、実装結果の個別screenshotをdesign判断に使い、未承認の配置をdesign notesへ確定事項として記録した。既存failure logの「Ignored the approved character-sheet design draft during G4 implementation」と同じ判断ミスを繰り返した。
- 一次対応: G6を作業中へ戻し、review節を破棄して、design draftが定めるdesktop・tablet・mobileのprofile / setting / image / creditの位置関係を子issueの直接契約として再構成する。ユーザー承認までsource codeを変更しない。

### Repeated a component test before checking the available matcher setup

#### 2026-07-27

- source: self
- 発生箇所: `tests/components/character-sheet/ProfileSection.test.tsx`
- 観測した失敗: loading中のdisabled状態を確認するtestで、このrepositoryに導入されていないjest-domの`toBeDisabled` matcherを使った。全体testと対象component testで同じmatcher不足による失敗を2回確認した。
- 一次対応: repositoryで利用可能なChai matcherへ切り替え、HTMLButtonElement / HTMLInputElementの`disabled` propertyを直接確認する。

### Repeated the full check before resolving all image-gate static analysis findings

#### 2026-07-27

- source: self
- 発生箇所: `ex-02-6-sheet-image`の`src/character-sheet/components/ProfileSection.tsx`、関連testとimport整列
- 観測した失敗: 画像Gateの初回`npm run check`で型エラー3件を確認・修正した後、全体checkを再実行してa11y lintとBiome整列・formatの残件により2回目も失敗させた。drag and drop領域をstaticな`div`へ置いたことがa11y lintの主因だった。
- 一次対応: drop領域をfile pickerを開けるnative `button`へ変更し、対象ファイルへBiomeのfixを適用する。画像のdrop・button操作は同じhandlerへ渡す。

### Repeated a TypeScript check failure while renaming dictionary keys

#### 2026-07-27

- source: self
- 発生箇所: `src/character-sheet/dictionary.ts`と`src/character-sheet/components/ProfileSection.tsx`
- 観測した失敗: `sections`から`terms`への辞書構造のリネーム時に、最初は同名キーのうち誤った側を変更し、次は辞書の`credit`とフォーム値の`credit`を同一scopeで衝突させた。同一作業中のTypeScript checkが2回失敗した。
- 一次対応: リネーム対象を`gameDomain`配下へ限定し、辞書由来の参照は`creditTerms`としてフォーム値と明確に区別する。変更後に型検査、build、関連Component testを実行する。

### Retried a browser interaction before Astro client hydration completed

#### 2026-07-25

- source: self
- 発生箇所: `ex-02-5-sheet-dialogs`の`tests/visual/character-sheet.spec.ts`
- 観測した失敗: `page.goto()`直後にReact Island内の確認dialog openerをclickしたため、client hydration前のclickがstate更新へ届かず、dialogが見つからないPlaywright失敗を繰り返した。入力値の保持確認もhydration前の入力では安定しなかった。
- 一次対応: dialogを開くユーザー操作を短い`expect(...).toPass()`で再試行し、client側の操作が有効になった後に確認を開始するようtestを修正した。test-onlyのhydration stateやDOM属性は追加していない。

### Configured Vitest without the React TSX transform

#### 2026-07-25

- source: validation
- 発生箇所: `ex-02-4-sheet-profile`の`tests/components/character-sheet/ProfileSection.test.tsx`
- 観測した失敗: Vitest 4へAstroの既存TypeScript設定だけを渡し、TSXを変換できなかった。`esbuild.jsx`を後から設定してもVitest 4のOXC変換に無視され、同じ`Unexpected JSX expression`で再失敗した。
- 一次対応: React Vite pluginを明示dependencyとして追加し、Vitest configから接続する。Component / hook testを実行してから設定を確定する。

### Used keyboard event injection for button activation in E2E

#### 2026-07-25

- source: validation
- 発生箇所: `ex-02-4-sheet-profile`の`tests/visual/character-sheet.spec.ts`
- 観測した失敗: focused buttonへの`page.keyboard.press()`で開閉を確認しており、実行環境でbutton clickへ結び付かず、2件のE2Eがtimeoutした。G4 E2Eの最終smokeに不要なkeyboard操作の詳細を持ち込んでいた。
- 一次対応: E2Eはbutton clickによる代表操作だけに縮小し、キーボードと局所stateの詳細はComponent testの責務へ戻した。

### Expanded G4 E2E beyond its smoke-test boundary and ignored the test-free instruction

#### 2026-07-25

- source: review
- 発生箇所: `ex-02-4-sheet-profile`の`tests/visual/character-sheet.spec.ts`
- 観測した失敗: E2Eへ信用入力4項目の正規化、境界値、派生計算、CSS、read-only DOM属性を持ち込み、architectureが定める最終smokeの範囲を越えた。さらに、ユーザーがテストを変更・追加・実行しないよう明示した後にもtest fileを変更した。Container / PresenterとRHF adapter hookを分けた検証境界を使わず、E2Eで仕様を網羅しようとした。
- 一次対応: review-to-issueでG4 issueへE2E縮小、Zod schema、Component / hook test toolingの選定をレビュー指摘として記録し、ユーザー承認までsource codeとtest fileを変更しない。

### Used one document listener per open FormulaTooltip for outside-tap dismissal

#### 2026-07-25

- source: user
- 発生箇所: `FormulaTooltip`のmobile閉鎖処理
- 観測した失敗: mobileの外側タップを検出するため、開いている各Tooltipが`document.addEventListener`を登録する設計にした。Tooltipが複数あれば同じdocumentへlistenerが増え、局所UI状態に対して広すぎるイベント境界だった。
- 一次対応: document listenerを削除し、touch環境でだけ表示する透明なdismiss layerをTooltip自身の外側に置いた。数値に近いabsolute配置を維持し、layerのタップで閉じる。

### Repeated an accessibility lint failure while wiring FormulaTooltip hover behavior

#### 2026-07-25

- source: self
- 発生箇所: `FormulaTooltip`のhover領域
- 観測した失敗: hoverを維持するためのstatic要素へevent handlerを置き、a11y lintを実行後にARIA roleだけを足して同じlint失敗を2回繰り返した。要素の入れ子とpointer移動を先に整理せず、lint出力への局所的な対応を試みた。
- 一次対応: Tooltipをtrigger buttonの子要素へ移し、hover handlerもbuttonへ限定した。これによりTooltip上へのpointer移動もbuttonの領域内に保ち、static要素へのhandlerを不要にした。

### Misinterpreted an icon-alignment correction as container-spacing work

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の設定トグル
- 観測した失敗: ユーザーが指摘したのは`設定`文字列に対するトグルアイコンの縦ずれだったが、agentはトグル全体のmarginとpaddingを詰める修正を行った。対象要素を画面上で分離して確認せず、アイコンの光学位置とコンテナ余白を混同した。
- 一次対応: トグルのmargin・paddingを元へ戻し、矢印アイコン自体へ相対位置の上方向補正を加えた。

### Left the setting toggle vertically detached from its profile fields

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の基本情報レイアウト
- 観測した失敗: profile gridの直後に配置する設定トグルへ不要な上marginと大きい縦paddingを残し、直前の入力行から下へずれた表示にした。
- 一次対応: 設定コンテナの上marginを除き、トグルの縦paddingを`--space-1`へ縮めて入力群直後の操作として揃えた。

### Applied derived-value background to its label despite the requested boundary

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の信用表示スタイル調整
- 観測した失敗: ユーザーが自動算出「数値」の見た目だけを入力欄から区別するよう求めたのに、agentはラベルを含む算出セル全体へ白背景を適用した。表示上の対象範囲を要素単位で確認せず、ラベルまで入力欄のように見せた。
- 一次対応: 背景・角丸・余白を`.metricValue`だけへ移し、ラベルは入力欄と同じ信用カード背景へ戻した。

### Misread the approved profile field arrangement during G4 adjustment

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の基本情報レイアウト調整
- 観測した失敗: ユーザーが指定した「PC名・PL名を1行目、二つ名を2行目左半分、年齢・性別を2行目右半分の内側」という構成を、年齢・性別を独立した下段として実装した。ユーザーの文言とdesign draftの構成を実装前に正確に照合しなかった。
- 一次対応: profile gridを2列とし、年齢・性別を右半分の入れ子gridへ移した。UI配置の修正時も、指定された行・列・入れ子をそのままDOM構造へ対応付けてから実装する。

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

### Repeated an E2E invocation while the preview server occupied its port

#### 2026-07-24

- source: self
- 発生箇所: `ex-02-4-sheet-profile`のPlaywright最終確認
- 観測した失敗: `playwright.e2e.config.ts`が`reuseExistingServer: false`で自身のpreview serverを起動する契約を確認せず、すでに4321でpreviewを起動した状態で同じE2Eを実行した。workerの同種失敗に続き、port使用中でE2Eが開始できない失敗を繰り返した。
- 一次対応: Techレビュー完了後に自分で起動したpreviewだけを停止し、`npm run build`後にE2E configへserver起動を任せて再実行した。以後、Playwright configの`webServer`と既存previewの共存可否を確認してから実行する。

### Used a custom Playwright capture instead of the visual capture workflow

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-3-sheet-section-frame`の実装後画面確認
- 観測した失敗: 既存の`visual:capture`で対象viewportのactual snapshotを取得すべきところ、一時HTML用の個別Playwright capture scriptを先に作成・実行した。実装結果のactual screenshotを既存workflowで扱うべき位置づけを誤った。
- 一次対応: 個別captureは中止し、`npm run visual:capture -- --grep '@vrt.*@character-sheet(?:\\s|$)'`でdesktop、tablet、mobileのactual snapshotを取得した。以後、実装結果の画面確認は、対象を絞った既存`visual:capture`を使う。

### Repeated a focus-style assertion with an unstable focus-visible setup

#### 2026-07-24

- source: self
- 発生箇所: `ex-02-3-sheet-section-frame`のPlaywright focus確認
- 観測した失敗: Techレビュー後に追加したfocus ringのbrowser testで、programmatic focusの後に`:focus-visible`が適用されると仮定し、同じ`box-shadow: none`失敗を2回繰り返した。Playwrightのfocus modalityとCSS selectorの関係を確認せず、keyboard操作の検証方法を十分に切り分けていなかった。
- 一次対応: frame内で切れないfocus ringを`:focus`で明示し、ユーザー操作としてのEnter / Space・focus保持を既存browser testで確認する。focusの見た目を自動検証する場合は、最初にselectorが実際のbrowser focus modalityで適用されることを確認する。

### Test-only hydration state was added to production code

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-1-sheet-runtime`の`CharacterSheetContainer`と`tests/visual/character-sheet.spec.ts`
- 観測した失敗: `client:load`のhydrateをE2Eで観測するためだけに、画面機能に不要な`isHydrated` stateと非表示DOM属性を製品コードへ追加した。G1にはユーザーが操作できる機能がなく、内部実装を露出する検証は適切でないにもかかわらず、完了条件もそのテストに依存させた。
- 一次対応: `isHydrated`、属性、専用E2E testを削除し、G1の完了条件を検証専用実装を追加しないことへ修正した。以後、E2Eはユーザーが観測・操作できる振る舞いだけを対象にし、内部のhydrateやstateを観測するための製品コードは追加しない。

### Parallel Playwright capture exhausted the Chromium sandbox

#### 2026-07-24

- source: self
- 発生箇所: `character-sheet` design draftの既存capture一括更新
- 観測した失敗: 独立したPlaywright Chromium起動を9本並列実行し、2本がsandbox hostの`Operation not permitted`で起動直後に終了した。直後のsandbox内逐次再試行も同じ制約で失敗した。prototypeまたはcapture scriptの失敗として扱うべきではない実行競合・sandbox制約を作った。
- 一次対応: 失敗したcaptureは並列実行を避け、sandbox外の承認済み逐次実行で再生成した。複数のローカルcaptureを更新する際は、Chromiumを同時起動せず、必要時は最初から承認済みのcapture commandを使う。

### Character-sheet Headerのbreakpoint表示条件を誤った

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`の`CharacterSheetHeader.astro`
- 観測した失敗: desktop・mobileのサイトメニューボタンを追加する際、mobile専用検索操作もdesktop・tabletで表示するCSSにしてHeader gridの暗黙行を発生させ、内部要素が上へずれるデグレを作った。あわせて、Headerの大きなgrid gapでメニューボタンとタイトルロゴの間隔を広げすぎた。
- 一次対応: mobile検索操作をmobile breakpointだけに限定し、Header gridの暗黙行を解消した。desktop・tabletのタイトルロゴを2.5remへ縮め、メニューボタンとの間隔を`--space-3`へ縮めた。

### Character-sheetのサイトメニュー表示範囲を誤って拡大した

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`のcharacter-sheet専用layout
- 観測した失敗: tabletのみで表示する指定だったサイトメニューを、desktopにも表示する実装・検証として扱った。
- 一次対応: 専用layoutのmenu railをtabletのmedia query内だけで表示するようにし、desktop・tablet・mobileの表示条件をbrowser testとcaptureで確認した。

### Generated a requirements-driven design draft before updating the requirements source of truth

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-web-character-sheet`のdesktop design draft再作成
- 観測した失敗: ユーザーが、Git管理外の要件ドラフトにある画面項目・初期枠数・操作規則を、現行要件と矛盾しない範囲で要求正本へ先に取り込むよう求めていたにもかかわらず、agentは正本を更新せずに一時HTMLとcaptureを作り直した。そのため、要求正本を唯一の入力にするべき後続のdesign作業の順序を再び逸脱した。
- 一次対応: 一時draftの更新を停止し、`.tmp/character-sheet-requirements.md`を項目カタログとして照合して、`docs/requirements/character-sheet.md`へ不足する表示項目・初期枠数・可変行・操作規則を正本優先で追加する。正本のユーザー確認後にだけ、その文書を入力にdesign draftを再作成する。

### Used raster image generation instead of the requested HTML design draft

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-web-character-sheet`のdesktop初期画面design draft作成
- 観測した失敗: ユーザーが画面draftの作成を指示した際、対話用にHTMLを作成してローカルcaptureで確認する既存の作業方法を確認せず、raster画像生成を実行した。生成画像をGit管理・design正本・VRT baselineにはしていないが、ユーザーが期待した確認可能なHTML draftではなかった。
- 一次対応: 生成画像はpreview扱いとして採用せず、`.tmp/design/character-sheet/index.html`とcapture scriptを作成し、desktop `1440x1200`のlocal captureへ切り替えた。今後、対話用の画面draftでは、画像生成を先行させず、ユーザーが指定するHTML / local captureの方法を確認する。

### Repeated direct Playwright listing bypassed the VRT script

#### 2026-07-23

- source: self
- 発生箇所: PR #68 第2回Technical Reviewのtarget filter検証
- 観測した失敗: `npx playwright test --config playwright.config.ts --list`を2回実行し、VRT専用の`tests/visual/vrt`指定を持つ`npm run visual:test`を経由しなかった。そのため無関係なtest fileも読み込み、Node ESMのJSON import attribute errorでtest listを作れなかった。
- 一次対応: `npm run visual:test -- --list --grep ...`へ切り替え、`@items`が`items-*`を含む21件に一致することを確認した。VRT scriptの対象directoryと既定configを手作業で再現せず、package scriptから検証する。

### Over-scoped hero layout test follow-up after PR review

#### 2026-07-23

- source: user
- 発生箇所: `ex-03-hero-layout-stability` のPR #66 第2回レビュー取り込み
- 観測した失敗: 画像request保留を使う回帰testが実際の`ImageBlock`領域予約不備を検出した後に、document座標比較、生き様detailの重複scenario、全幅表示prop分離までを同じcurrent issueの必須対応として扱った。全表示箇所の寸法属性確認と代表的な回帰testがすでにあるため、後続の提案は検証価値より複雑性が大きい可能性を十分に評価していなかった。
- 一次対応: 第2回レビュー指摘は実装せず、ユーザーの方針確認を待つ。テスト追加時は、実際に発見した不具合を再発防止する最小ケースと、全箇所を網羅する静的契約確認を分け、同一契約の複数scenarioをデフォルトで増やさない。

### Misread the PageToc confirmation page heading instruction

#### 2026-07-23

- source: user
- 発生箇所: `ex-01-page-navigation-links` の `/-local/page-navigation` 確認ページ
- 観測した失敗: ユーザーの「見出しなくて良い」を、本文の`h1`も不要という意味に誤解した。本来は、PageTocに表示される`h2`以下の見出しを置かないという意図だった。
- 一次対応: `h1`を復元し、確認ページは`h1`のみ、PageToc項目となる`h2`以下なしの構成へ修正した。

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

### Used `gh` after the repository workflow prohibited it

#### 2026-07-22

- source: user
- 発生箇所: `31-0-ikizama-index-data` のpush後に既存PRを確認する操作
- 観測した失敗: リポジトリのGitHub操作ではconnectorを使うべきというユーザー指示に反して、既存PRの確認に`gh pr list`を実行した。
- 一次対応: `gh`を以後のPR確認・レビューに使わず、GitHub connectorだけで確認する。実行済みの`gh`は読み取り専用であり、GitHub上の状態変更は行っていない。

### Conflated one JSON output with one Excel sheet

#### 2026-07-21

- source: user
- 発生箇所: `30-0-ryugi-detail-data` の変換仕様草案
- 観測した失敗: ユーザーの「1jsonにまとめる」という出力形式の決定を、Excel入力を1シートへ統合する指示と誤読した。既存の流儀別シートを所属の判断根拠として使う明示指示がないまま、`流儀ID`列の追加と単一シートへの移行を仕様へ記述した。
- 一次対応: 草案はレビューで止め、コード・Excel・issueを変更していない。以後、入力構造と生成物構造に関する指示は別々に復唱し、入力変更を伴う提案を仕様へ反映する前に明示承認を確認する。

### PR title missed the issue-slug rule again

#### 2026-07-19

- source: user
- 発生箇所: `44-search-modal-ui` のPR #49作成
- 観測した失敗: `create-pr` が定めるissue slugのみのPRタイトルではなく、`feat: search panel UI`としてPRを作成した。ユーザー指摘後にタイトルを`44-search-modal-ui`へ修正した。
- 一次対応: PR #49のタイトルをissue slugへ更新した。以後、PR作成またはmetadata修正時は、connector呼び出し前にcurrent issueのslugをタイトル値として照合する。

### PR reviewer used `gh` despite connector-only workflow

#### 2026-07-15

- source: user
- 発生箇所: `28-2-common-skills-page` の PR #45 初回レビューにおけるdocument reviewer
- 観測した失敗: PR metadata・diff・discussionの確認でGitHub connectorを使うべきところ、reviewerが禁止されている`gh`コマンドを1回実行した。ユーザー指摘後、connectorだけでmetadata・diff・issue comments・inline threads・reviewsを再確認した。
- 一次対応: reviewerへ`gh`禁止を即時共有し、以後のPR reviewとリモート確認をGitHub connectorだけに限定した。

### PR title did not follow the issue-slug rule

#### 2026-07-14

- source: user
- 発生箇所: `28-0-common-skills-data` のPR #43作成
- 観測した失敗: PRタイトルを`28-0: 共通スキルデータ基盤`として作成した。しかしGit操作規約と`create-pr`は、既定のPRタイトルをissue slugのみの`28-0-common-skills-data`と定めている。
- 一次対応: PR #43のタイトルを`28-0-common-skills-data`へ更新した。以後、PR作成前にissue slugをそのままタイトルへ使うことを確認する。

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

### Commit message language did not follow repository convention

#### 2026-07-12

- source: user
- 発生箇所: `24-2-scenario-play-page` のサイトメニュー順序変更commit
- 観測した失敗: 直近の英語コミットメッセージ形式を確認せず、日本語のcommit messageを作成した。
- 一次対応: ユーザー許可のsoft resetで当該commitを取り消し、同一差分へ英語のcommit messageを付けて作り直す。

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

### v1.0 Google Docs export format was incorrect

#### 2026-07-11

- source: user
- 発生箇所: `.agents/skills/drive-to-raw-sync/SKILL.md` と `v1.0/` の初回ローカル同期
- 観測した失敗: スタイル付きGoogle Docsである `v1.0/` 配下の資料を、Markdown exportではなく `text/plain` exportで `.md` 化した。これによりGoogle Docs上のスタイル情報をMarkdownへ変換できなかった。
- 一次対応: `contents/` はMarkdownソースをそのまま扱うため `text/plain` exportを維持し、`v1.0/` は `text/markdown` exportへ分離した。誤った形式で作成したローカルv1.0ファイルは、正しい形式で再同期するまで参照に使わない。

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

### Mobile horizontal overflow missed after UI implementation

#### 2026-07-06

- 発生箇所: `14-mobile-page-toc` の `MobilePageToc.astro` / `BaseLayout.astro`
- 観測した失敗: 実装後のPlaywright確認で開閉挙動とスクリーンショットは確認したが、document全体の横方向overflowを数値確認しておらず、mobile PageTocのgrid item自動最小幅により右側余白が崩れた状態を見落とした。
- 一次対応: `MobilePageToc`、`desktop-layout`、`site-main` に `min-width: 0` / `width: 100%` を追加し、390px viewportで `documentElement.scrollWidth` が390pxに収まることを確認した。

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

### Repeated validation failure in one implementation task

#### 2026-07-22

- source: agent self-report
- 発生箇所: `33-2-items-index-page` の`tests/visual/items-index.spec.ts`追加後の`npm run check`
- 観測した失敗: 初回に`HTMLElement`へのtable cell参照とtest閉じ括弧のTypeScriptエラーが発生し、修正後の再実行ではBiomeの整形不一致、Visual Review記録追加後にはMarkdown表の整形不一致が発生した。Markdown表を手動整形した再実行でも同じ整形不一致が残り、同一タスクでvalidation failureを複数回発生させた。
- 一次対応: Visual testを追加する際は、Playwright callbackのDOM型を事前に確認し、`npm run check`が示す整形差分を`apply_patch`で反映してから再実行する。

### Hero image dimension inventory was reported too late

#### 2026-07-23

- source: user
- 発生箇所: `ex-03-hero-layout-stability` のissueレビュー
- 観測した失敗: hero画像の寸法を固定する案を提示する前に、全hero素材の実寸一覧を確認・報告しなかった。そのため、アイテムheroの統一後に流儀hero 3枚が`1671x941`のまま残ることを後から伝え、ユーザーに画像サイズの差異を先に報告すべきだったと指摘された。
- 一次対応: 通常heroを`1672x941`へ統一することをissueの入力契約に明記した。以後、画像寸法・データ形式・asset配置を設計判断の根拠に使う前に、対象全件を一覧化し、差異を先に報告する。

### Repeated Playwright Chromium sandbox launch failure

#### 2026-07-24

- source: agent self-report
- 発生箇所: `ex-02-web-character-sheet` の全VRT実行とdesktop/tablet baseline更新
- 観測した失敗: `npm run visual:test`、`npm run visual:update`、targetを分割した`npx playwright test`で、Chromiumが`FATAL:content/browser/sandbox_host_linux.cc:41`と`shutdown: Operation not permitted`を出して起動に失敗した。同一作業で複数回再現し、更新後のVRT比較を完了できなかった。
- 一次対応: baseline更新と比較を区別して記録し、Chromiumが起動できた時点で書き込まれたdesktop/tablet snapshotは未コミットのまま保持した。以後、このsandbox条件ではPlaywrightの成功を前提にせず、実行可否と未検証範囲を明示して報告する。

### Repeated Playwright locator ambiguity

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: `getByLabel("プライマリ流儀")`がselectだけでなく`プライマリ流儀Lv`のnumber inputにも部分一致し、strict mode violationで対象Visual testを複数回失敗させた。実行出力が完了行を省略する条件を成功と誤認し、失敗artifactを先に確認しなかった。
- 一次対応: selectのlocatorを`{ exact: true }`へ変更し、Visual test後は終了出力だけでなく`test-results/.last-run.json`も確認する。

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

### Repeated VRT capture invocation error

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の対象限定Visual Review
- 観測した失敗: `character-sheet` VRTにtagがないことを確認せずtag grepを渡して`No tests found`にし、その後も`visual:capture` script内の`--update-snapshots`との引数順を確認せずspec pathを渡してPlaywright option parse errorにした。同一Visual Reviewでcapture commandを2回失敗させた。
- 一次対応: `tests/visual/vrt/character-sheet.spec.ts`のscenario名をgrep対象として、既存`visual:capture` scriptへ`--grep character-sheet`だけを渡す。package scriptの固定引数がある場合は、追加引数がどのoptionに結び付くかを先に確認する。

### Repeated FormulaTooltip browser interaction assertion

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の成長点Tooltip browser test
- 観測した失敗: FormulaTooltipはpointer hoverで開くため、Playwrightのclickがhover直後の開状態を再度toggleして閉じることを確認せず、tooltipを待つtestを失敗させた。続くkeyboard操作の試行でもbrowser実行条件でtooltipを開けず、同じ確認を2回失敗させた。
- 一次対応: mouseの実際の表示契約に合わせ、target buttonへ`hover()`した後のtooltip可視性と位置を確認するtestへ置き換えた。Tooltipのkeyboard開閉を確認する場合は、hoverと独立した操作状態を先に設計・検証する。

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

### Repeated flaky section-frame browser test during Review 4

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` のレビュー指摘4後の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: 変更対象外の縁section frame開閉testが全体実行と単独再実行で連続して失敗し、click後も`aria-expanded`が`true`のままとなった。プロフィール入力testは単独再実行で通過した。
- 一次対応: Review 4のBuildSection・number input変更を原因とみなしてframe実装を変更せず、browser smokeの当該1件を未確認として報告する。frameの操作同期は別scopeで扱う。

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

### Inherited no-wrap style clipped a formula tooltip

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の能力値ポイント・成長点tooltip
- 観測した失敗: labelと算出値を一まとまりとして折り返さないために`attributeMetaItem`へ`white-space: nowrap`を追加したが、tooltip本文がその子孫であることを確認しなかった。その結果、長いformula本文もnowrapとなり、tooltip背景の幅を超えて全文を読めなくなった。
- 一次対応: `FormulaTooltip`のtooltip本文へ`white-space: normal`を明示し、trigger周辺のnowrapを継承しないようにした。tooltip本文は既存の`overflow-wrap: anywhere`で幅内に折り返す。

### Reported desktop tooltip review without checking trigger anchoring

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の能力値table `常時修正`・`一時修正` tooltip
- 観測した失敗: `常時修正`・`一時修正`のtooltip triggerだけをgrid cell幅いっぱいのblock要素に変更した結果、tooltipの右端基準がラベル文字列ではなくcell全体となった。desktopでtooltipが意図しない位置に現れ、hover時にずれて見える表示を残したにもかかわらず、agentは表示切れだけを確認して「実画面で確認済み」と報告した。
- 一次対応: 見出しtooltipのrootとbuttonのcell全幅指定を撤去し、他のlabelと同じ文字列幅のtriggerへ戻す。以後、tooltipの実画面確認では表示切れだけでなく、triggerとの相対位置、open前後の周辺レイアウト、同種の既存tooltipとの差も確認する。

### Archived G9 while visual acceptance remained unverified

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-9-sheet-bonds` のGate完了・child issueの`done/`移動
- 観測した失敗: G9 child issueにはresponsive表示、層別確認、Visual Reviewの未完了チェックが残り、後続レビューでもactual screenshotによる確認未実施を記録していた。それにもかかわらず親Gate planを`done`とし、child issueを`done/`へ移動した。さらに初期完了条件と後続レビューの覚悟効果表示契約が同一issue内で矛盾したまま残った。
- 一次対応: `.tmp/chatgpt-review.md`をSSoTと現行実装へ照合し、G10のレビュー指摘1へout-of-scopeとして記録した。G9の受入確認、表示契約、削除callbackはG31統合確認へTODOとして振り分け、G10では実装・完了扱いを変更しない。

### Repeated validation failures while implementing review 2

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-10-sheet-attack-reaction` の`BondsSection` clear icon変更
- 観測した失敗: 最初のComponent testで、消しゴムSVGをclear buttonではなくdelete buttonへ配置し、利用できない`toHaveTextContent` matcherも追加した。修正後の`npm run check`では、同じJSX箇所のBiome整形違反を再度出した。さらに`lucide-react`への切替後も同じ属性インデントを手動で崩し、整形違反を繰り返した。
- 一次対応: 条件分岐の両buttonを再読してiconの所属を確認し、既存test環境で提供済みのDOM APIだけを使う。JSX属性は手動で合わせず、対象fileへBiome formatterを直接適用してから、Component test・`npm run check`を再実行する。

### Repeated G11 noncombat browser-test failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-11-sheet-noncombat` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: 非戦闘技能の初期折りたたみbrowser testを、1回目はCSS generated contentがbuttonのaccessible nameへ混ざることを見落として失敗させ、2回目は`.noncombatRow`の`display: grid`がHTMLの`hidden`属性を上書きすることを見落として失敗させた。
- 一次対応: 折りたたみ記号を`aria-hidden`の実DOM要素へ移し、`.noncombatRow[hidden] { display: none; }`を明示した。以後、CSS generated contentを操作名へ使わず、`hidden`を使う表示状態ではcomponent CSSとのdisplay競合をbrowser testで先に確認する。

### Ignored the approved noncombat responsive layout

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の`ChecksSection`実装
- 観測した失敗: `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を実装入力として確認していたにもかかわらず、非戦闘技能を全viewport共通の5列gridとして実装した。design画像が指定するdesktop / tabletの3列とmobileの2列の情報密度を守らず、Visual Review前に未達を検出できなかった。
- 一次対応: current issueへ3列／2列の表示契約と未達を記録した。修正ではdesign画像を直接比較し、各viewportの非戦闘技能を要素単位のactual screenshotで確認するまで完了報告しない。

### Exceeded the G11 character-sheet final-smoke E2E boundary

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: G11の最終smoke E2Eへ、開閉の`aria-expanded`属性とhidden状態の確認を追加した。これは領域表示と2〜3個の代表操作だけに限定する`docs/architectures/character-sheet.md`の責務境界を越え、Component testと重複する局所UI・DOM属性の検証である。
- 一次対応: current issueへE2Eの縮小方針を記録した。開閉状態・hidden・tooltipはComponent testへ、計算はNode testへ置き、E2Eは代表的なbrowser操作だけに戻す。

### Repeated VRT state-preparation failures before client hydration

#### 2026-07-28

- source: self
- 発生箇所: `ex-02-11-sheet-noncombat` の `tests/visual/vrt/character-sheet.spec.ts`
- 観測した失敗: locator screenshot captureの初回実行で、非戦闘技能を開くclickとheader tooltipのhoverをclient hydration完了前に一度だけ実行した。tablet / mobileを中心に同じ状態準備が6件失敗し、`脅迫を得意技能にする`がhiddenのまま、またはtooltipが存在しない状態でtimeoutした。
- 一次対応: open stateは可視になるまでの短い`expect(...).toPass()`内で、閉じている場合だけclickする。tooltip stateもhoverとvisible確認を同じ再試行境界へ置く。VRTのstate準備はこの範囲に留め、最終smoke E2Eへ局所UIの再試行を持ち込まない。

### Used a fixed-width noncombat row after the layout no longer had room

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能3列／2列responsive表示
- 観測した失敗: desktop / tabletを3列、mobileを2列へ変更した後も、得意技能、技能、対応能力、修正、常時／一時を一つの横行へ保持した。その結果、技能名の大きな折り返し、常時／一時のoverflow、2桁の修正値のclipを残した。各cardの利用可能幅と内容の最小幅を設計段階で見積もらず、列数だけを正本へ合わせた。
- 一次対応: 列ヘッダーと行内の対応能力値を削除し、対応能力別の小見出しと二段cardへ組み替える。各viewportの実画面で技能名、判定数、符号付き2桁修正を確認するまで完了報告しない。

### Reported noncombat tooltip line breaks without verifying CSS whitespace handling

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の`非戦闘技能` tooltip
- 観測した失敗: tooltip文字列へ改行文字を追加しただけで、`.content`の`white-space: normal`が改行を空白として処理することを見落とした。temporary captureを開いたにもかかわらず、改行表示を確認したとissueへ誤って記録した。
- 一次対応: `FormulaTooltip`へ必要なtooltipだけ`white-space: pre-line`で改行を保持するoptionを追加し、非戦闘技能tooltipへ適用した。改行の有無を表示契約とするtooltipでは、text contentではなくactual screenshotで段落境界を確認してから報告する。

### Let card-local checkbox styling diverge from the character sheet standard

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の得意技能checkbox
- 観測した失敗: 非戦闘技能card用にcheckboxの寸法を個別指定した一方、縁sectionは別の`accent-color`指定を持つ状態を見落とした。そのため同じcharacter sheet内のcheckboxが異なる色・寸法で描画された。
- 一次対応: checkboxの基本寸法、accent color、marginを`CharacterSheetFormPresenter`のform scopeへ移し、section CSSには個別のgrid配置だけを残した。checkboxを新設するUIでは、component CSSへ基本styleを複製せずform scopeの共通styleを使う。

### Replaced a native number-input control without design authority

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の修正number input
- 観測した失敗: 符号付き2桁を狭いinputに収めようとして、既存character sheetのnumber inputにはないspinner非表示styleを追加した。ユーザーは既存実装と異なるデザインを許可しておらず、この変更は要求された幅調整の代替になっていなかった。
- 一次対応: spinner非表示styleを撤去し、既存inputの見た目とpaddingを維持した。サイズ要件とmobile 2列／1行の物理的な幅不足は、別デザインを仮定せずissueへ未決定として記録する。

### Claimed to compact the check-count output without accounting for the shared style selector

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能判定数output
- 観測した失敗: 非戦闘技能CSSへ判定数の高さ・padding・文字サイズを記述したが、`CharacterSheetFormPresenter`のform共通`character-sheet-number-value` selectorのspecificityに負けていた。mobile captureで判定数だけ標準サイズのまま残ったにもかかわらず、card全体を縮小したかのように作業を進めた。
- 一次対応: `noncombatRows`／`noncombatCollapsedRows`を含むselectorで判定数outputへcompactな幅、高さ、padding、文字サイズを明示し、共通styleより優先させる。共有styleを局所overrideする場合は、capture前にcomputed styleまたはactual screenshotで各値が適用済みか確認する。

### Changed check-count padding based on inference instead of an actual clip result

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` のmobile判定数output
- 観測した失敗: 左右paddingと枠幅のトレードオフを実画面で確認しないまま変更し、判定数がclipする状態をユーザーが先に発見した。数値の最小幅を推定しただけで、実際のfont metrics、padding、spinnerとの組み合わせを確認していなかった。
- 一次対応: 既存paddingのclipを実画面で確認した後にだけ、左右paddingを縮める変更を行った。寸法を変更する反復では、各変更後のactual screenshotを開き、次の変更はその結果が得られてから行う。

### Left visible skill names outside GameDomain across G10 and G11

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-10-sheet-attack-reaction` と `ex-02-11-sheet-noncombat` の技能名・リアクション名のowner
- 観測した失敗: GameDomainへゲーム用語を集約する方針があるにもかかわらず、攻撃技能名・リアクション名を`characterSheet.checks`へ、非戦闘技能名をmaster dataへ追加した。前の2 Gateで表示名とID・対応能力・順序を分離して棚卸ししなかった。
- 一次対応: 可視の攻撃技能、リアクション、非戦闘技能名を`gameDomain.terms`へ移し、master dataとformにはID・順序・対応能力だけを残す。新しいゲーム用語を追加するGateでは、表示名、識別子、ゲーム計算データのownerをissue review時に分けて確認する。

### Repeated G9 tooltip capture failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-11-sheet-noncombat` のG9 `bond-resolved` Visual Review capture
- 観測した失敗: `覚悟`tooltipをhoverで開いたあとにsection locatorを先に撮影したため、tooltip locatorの撮影時にはopen stateが失われた。原因確認前にclickで開く実装へ変更し、tooltipがhover専用であるためdesktop / tablet / mobileで再度失敗させた。
- 一次対応: tooltipの既存hover契約を維持し、open stateを保ったままtooltip locatorをsection locatorより先に撮影する順序へ戻す。tooltip stateを含むcaptureでは、triggerのinteraction契約と複数locatorの撮影順を先に確認する。

### Reported tooltip indicator alignment as accepted without the user's visual confirmation

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` のレビュー指摘 6 / `FormulaTooltip`
- 観測した失敗: section locator screenshotを確認し、absolute positioningを共通flex配置へ置き換えた後に、indicatorが各文言の中央に揃ったと報告した。しかしユーザーがpreviewを確認すると、なお微小な上下ずれが見えると指摘した。コンポーネント側に閉じた修正であることと、視覚的な受入可否を混同した。
- 一次対応: current issueの「揃った」という肯定記録を訂正し、G31のコンテンツレビューで違和感が再現した場合に限って、個別labelではなく共通`FormulaTooltip`を再調整するTODOへ移した。tooltipのような微小配置は、actual screenshotだけで受入とせず、ユーザーのpreview確認を待つ。

### Repeated G12 primary-ryugi browser-operation timeouts

#### 2026-07-28

- source: self
- 発生箇所: `ex-02-12-sheet-primary-skills` のprimary ryugi select操作とVisual Review capture
- 観測した失敗: Playwrightの実ブラウザでプライマリ流儀または生き様のselect変更を行うと、変更後のフォーム再描画を待つ操作がtimeoutした。同じ失敗を原因確定前に複数回繰り返し、G12のlocator captureも完了できなかった。
- 一次対応: 一時的な切り分け変更はすべて戻し、dev serverを既定portで再起動した。今後は既存form更新経路の最小再現を先に作り、再描画を伴わないdialog操作と区別してから、G12 UIまたはform stateへ修正を加える。

### Attempted to substitute an ad hoc browser script for the VRT capture path

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のVisual Review
- 観測した失敗: test-owned locator screenshotが必要なVisual Reviewで、`npm run visual:capture`の経路を使わず、独自の`.tmp` Playwright scriptでfull-page screenshotを撮ろうとした。これは局所表示契約の確認根拠にならず、capture基盤が不足する場合は記録して停止するというskillの規約にも反していた。
- 一次対応: 独自scriptは削除し、正規の`visual:capture`を対象tagへ限定して実行した。fixtureのselect操作timeoutによりlocator screenshotを取得できなかったため、issueのVisual Reviewへ未確認として記録し、代替screenshotは使わない。

### Omitted G12 validation feedback and nested skill folding

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のプライマリ流儀スキル
- 観測した失敗: 要件にある最大レベル超過と流儀レベル対スキル合計の赤枠フィードバック、およびプライマリ流儀スキル区分の独立した折りたたみを実装せず、ユーザーの表示確認で欠落が判明した。
- 一次対応: 最大レベルを入力とhookの両方で上限化し、既存超過値の行、流儀枠、スキル区分に`aria-invalid`と赤枠を追加した。スキル区分も初期展開の独立開閉にし、局所Component / hook / logic testへ追加した。

### Repeated multiline-name component-test matcher failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` の`PrimarySkillPickerDialog` Component test
- 観測した失敗: 改行を含む候補名の表示確認で、通常text matcherと空白正規化したaccessible nameを順に使い、同じtestを2回失敗させた。Testing Libraryのbutton accessible nameが改行を保持することを先に確認していなかった。
- 一次対応: 改行を許容する正規表現でbuttonを取得し、`textContent`で元の改行を確認するテストへ修正した。

### Misread the mobile expanded-detail row order

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のmobile展開詳細
- 観測した失敗: ユーザーが指定した「コスト・使用制限」「技能・取得制限」「効果」の3行構成を、後続指摘の一部だけを取り違えて「コスト」「技能・使用制限」「取得制限」「効果」へ変更した。
- 一次対応: requirementsとcurrent issueを正しい3行構成へ訂正した。実装の訂正はユーザーの明示指示を待つ。

### Repeated G12 Component-test assertion mistakes

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` の重複スキルvalidation Component test
- 観測した失敗: 未導入のTesting Library matcherを使い、続く修正でもReactがbooleanの`data-*`属性を`"true"`として出力することを確認せず空文字列を期待したため、同じテストを2回失敗させた。
- 一次対応: 追加matcherに依存せず、DOMの`disabled`プロパティと属性の実際の文字列値を確認するテストへ統一した。新しいattribute assertionを書く前に、React出力の値を確認する。

### Repeated G12 shared-component refactor test failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` のshared `SkillSection`抽出
- 観測した失敗: 初回はautomatic行へ不要な`legend`を追加し既存の名称表示契約を壊した。続く訂正では新設した`ariaLabel` Propsをdestructureせず、section Component test全件を失敗させた。
- 一次対応: automatic行はform入力がないため`legend`を出さず、section見出しとaccessible nameを別Propsで明示した。shared Componentを抽出する場合は、既存Component testを最初の型検査前に通し、追加したPropsの宣言・destructure・利用を同時に確認する。

### Started a character-sheet browser check before client hydration

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-13-sheet-ikizama-skills` の生き様通常スキル最低0行確認
- 観測した失敗: dev serverへ遷移直後に生き様selectを1回だけ変更し、React Islandのhydrate完了後にselect値が初期値へ戻る状態を、削除buttonが表示されない実装不備と誤って切り分けた。
- 一次対応: form再描画を伴う実ブラウザ操作では、対象sectionの表示状態が更新済みになるまで同じ操作と可視確認を短い再試行境界へ置く。今回も生き様選択済みを確認してから、通常行を2行、1行、0行へ順に削除し、bonus Lvだけが残ることを確認した。

### Archived or closed a Gate while its child issue remained incomplete

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-12-sheet-primary-skills` のGate完了・child issue archive
- 観測した失敗: parent Gate planを`done`としchild issueを`docs/issue/done/`へ移動したが、child issue本体の完了条件、チェックポイント、Visual Reviewに未チェックが残っていた。G6での無許可archive、G9でのvisual acceptance未確認archiveに続く、完了根拠をchild issueへ反映しないままcloseする再発である。
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

### G16 maximum-level VRT fixture also caused a total-limit error

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-16-sheet-experience-consistency` のその他流儀スキル最大Lv超過VRT
- 観測した失敗: 最大Lv超過だけを確認すべきfixtureで、その他流儀Lvを`1`のままスキルLvを`9`にしたため、区分合計超過も同時に発生した。section errorの否定assertionがdesktop / tablet / mobileで失敗したが、実装の最大Lv伝播不備と誤認し得る状態だった。
- 一次対応: fixtureでその他流儀Lvを`9`へ設定し、区分合計を上限内にしてからスキルLv`9`を入力する状態へ訂正した。対象4 state・3 viewportを`visual:capture`で再実行し、12件通過後にactual screenshotを開いて確認した。

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

### Repaired the formula layout without preserving paired-value semantics

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具の性能値表示
- 観測した失敗: 指摘4の「計算式で表現する」を、性能列内で攻撃力・ガード値または防御力・ダメージ軽減を縦に並べた2本の式として解釈した。ユーザー指定の`元値／元値 + 修正値／修正値 = 最終値／最終値`というペアの1本の式、元値のread-only枠、未算出時の`-`表示を満たしていなかった。
- 一次対応: G17のレビュー指摘5へ単一式・枠・`-`フォールバック・mobile改行の契約を記録した。式の構造を変更する時は、演算子の前後だけでなく、`／`で結ぶ値ペアと表示状態をComponent構造へ直接対応させる。

### Applied requested table dividers to header rows and unrelated columns

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのheader・候補dialog
- 観測した失敗: ユーザー指定の列罫線を、data行のスキル名称／Lv入力、武器・防具名称／信用という限定された境界ではなく、header行、候補dialog header、他の全列境界へ広げた。また、G17 headerの指定列の左寄せと、防具clear buttonの折り返し時の固定高・中央配置を満たしていなかった。
- 一次対応: G17のレビュー指摘6へ罫線の対象範囲、header左寄せ、clear buttonの寸法・配置を記録した。table罫線の指示では、対象state（header / data行 / 候補行）と対象列境界をCSS selectorへ一対一で対応させる。

### Removed existing data-row dividers while correcting header dividers

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのdata行
- 観測した失敗: header行から罫線を外す訂正で、data行の既存の全列境界も削除し、名称／Lv入力と名称／信用だけを残す実装へ狭めた。ユーザー指定はheaderのみ罫線なし、data行は全列境界を維持することであった。
- 一次対応: G17のレビュー指摘7へheaderとdata行の罫線を分離する契約を記録した。table CSSの変更では、headerとdata行のselectorが重ならないこと、既存の境界を削除していないことを差分で確認する。

### Fixed only one of the two requested derived-value boxes

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式の元値・最終値
- 観測した失敗: ユーザーが「算出値」を固定幅にするよう求めた際、最終値だけを対象にし、同じread-only算出値である元値を可変幅のまま残した。
- 一次対応: G17のレビュー指摘9へ元値・最終値の両方を同一固定幅にする契約を記録した。複数の同種表示を含む指示では、対象要素を列挙してからCSS selectorとgrid列へ対応させる。

### Fixed individual widths without correcting the formula alignment

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式
- 観測した失敗: 算出値枠を固定幅へそろえる修正で、性能列全体へ伸びる計算式のlayoutを残した。ユーザーは枠内の値ではなく、計算式全体を左寄せにするよう求めていた。
- 一次対応: G17のレビュー指摘10へ、内容幅の式全体を性能列の左端へ置く契約を記録した。個別要素の幅と親layoutのalignmentを別々に確認する。

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

### Kept a button's minimum width wider than its mobile grid column

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: mobileのclear button列を`2.75rem`にしたまま、button自身の`min-width: 3rem`を残したため、明確な横overflowを起こした。button高も性能inputより大きかった。
- 一次対応: G17のレビュー指摘17へ、desktopとmobileのbutton寸法、mobile列幅、input高との整合を記録した。固定幅controlでは、min-widthと親grid列を同じviewportごとに照合する。

### Reduced the button without accounting for its three-character label

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile防具clear button
- 観測した失敗: overflowを直すためbuttonを縮めた後、mobile共通ruleによって「クリア」の文字を`.6875rem`へ上書きし、buttonの幅も列に明示的に合わせなかった。そのため、右端が描画されていないように見える状態になった。
- 一次対応: G17のレビュー指摘18へ、列幅いっぱいのbutton、`min-width: 0`、既定の`.625rem`ラベルを記録した。controlを縮小する時は、実ラベルの文字数・font-size・borderを含めた内容幅と、親列への確実な収まりを確認する。

### Treated a cross-viewport button defect as mobile-only

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: 右側が表示されない問題をmobileだけのものと決めつけ、`width: 100%`を追加した。desktopの同じbuttonの表示を直さず、mobileのbuttonも不要に列幅いっぱいになった。
- 一次対応: G17のレビュー指摘19へ、desktop／mobile両方の明示button幅、最大幅、中央配置を記録した。viewport限定の修正をする前に、同じComponentの全breakpointで共通の表示契約を確認する。

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

### Repeated armor-clear E2E assertion failures during G17 review response

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具クリアE2E
- 観測した失敗: 自前previewとE2E設定のweb serverを同時に起動してport競合にした後、クリア後に名称が未選択へ変わることとdesktop / mobileで同名inputが2つ存在することを考慮せず、同じ防具修正input assertionを連続して失敗させた。
- 一次対応: E2Eでは設定が起動するserverだけを使い、クリア後の未選択labelで2つのinput数と各値を明示して確認する。

### Repeated G17 VRT picker-locator failures after accessibility-name changes

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-17-sheet-weapons-armor` のtarget限定Visual Review
- 観測した失敗: 武器pickerのaccessible nameを行番号付きへ変更した後、旧完全一致locatorを使ってcaptureを失敗させた。続く正規表現では詳細・削除buttonまで一致することを確認せず、9 stateを再び失敗させた。
- 一次対応: picker buttonだけに一致する`/^武器\\d+：武器を選択$/`を使い、VRT再実行前にPlaywright error contextの候補一覧でlocatorの対象を確認する。

### Repeated E2E assertions based on an unverified rendered state

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-19-sheet-cybernetics` のサイバネE2E
- 観測した失敗: 非戦闘技能の修正inputをサイバネsection内にあるものとして参照し、次に非戦闘技能が閉じている状態でも入力が描画されると仮定した。さらに、選択済み`その他`行の削除button数を、未選択の削除行と同じ名前で数えたため、同じE2Eを連続して失敗させた。
- 一次対応: error contextのaccessibility treeで実際の描画範囲とbutton名を確認し、非戦闘技能を開いてから修正inputを検証する。可変行では選択済みと未選択のaccessible nameを区別し、操作前後の行数をその状態ごとにassertする。非戦闘技能inputはuncontrolledのため、form値の再設定はsectionを閉じて開き直した描画で確認する。

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

### Recorded local VRT snapshots as if they were Git-managed baselines

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-21-sheet-drugs` のVRT baseline更新・review報告
- 観測した失敗: 親Gate planがG31までcanonical VRT snapshotをlocal専用としてGit管理しないと定めているにもかかわらず、G21 issueとdesign notesを「canonical baseline更新」とだけ記録し、review時にGit管理すべきbaselineとして扱われる余地を残した。
- 一次対応: G21 issueとdesign notesへ、target限定のlocal canonical snapshot更新とG31までの非Git管理を明記した。VRTの記録・レビューでは、snapshotのlocal更新とGit管理の可否を親Gate planへ照合して分けて記録する。
