# 機能固有Agent Failureアーカイブ

このファイルは、ユーザー指示によりactive failure logから退避した、特定機能の挙動・表示・データに関するuser / review由来のfailureを保持する。

ここへの移動は恒久対応済みを示さず、`done`でも`no-action`でもない。将来の同種観測が少ないためactive auditから分けるだけであり、原文と一次対応を残す。

workflow、承認、review運用、検証手順、権限、Git操作に関するfailureは、このアーカイブへ移さずactive failure logで扱う。

## 機能固有アーカイブ

### Added a tooltip accessory despite the user excluding tooltip work

#### 2026-07-30

- source: user
- failure category: instruction fidelity and scope control
- 発生箇所: `レビュー指摘 7` の`CharacterSheetSectionFrame`と非戦闘技能header
- 観測した失敗: ユーザーが文字サイズ差とtooltipを今回の確認対象から外すよう明示したにもかかわらず、既存tooltipを保持するための`headingAccessory` APIとCSSを追加した。対象外の表現を実装へ持ち込み、指示の優先順位を誤った。
- 一次対応: `headingAccessory`のAPI・CSS・非戦闘技能headerでの利用を削除し、レビュー指摘7の対応方針とチェックリストを最新指示へ整合した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Ignored the existing character-sheet UI system in G17

#### 2026-07-28

- source: user
- failure category: design-system and instruction compliance
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具一覧および候補選択dialog
- 観測した失敗: ユーザーが指定した行の`展開`を候補選択dialogの折り畳みまで拡大解釈し、効果などを候補行の2行目へ常時表示する契約を守らなかった。さらに、既存のスキル行・スキル選択dialogを正本として確認・遵守せず、独自の削除button、並べ替えcontrol、選択icon、header罫線、算出値背景、header整列、追加button、候補dialogの全体縦scroll、hover feedbackを実装した。その結果、既存キャラクターシートの設計言語と似ても似つかないUIになった。
- 一次対応: 実装を停止し、G17 issueへ候補dialogを折り畳まない表示契約と、既存`SkillSection` / `SkillPickerDialog`のComponent・CSS・実画面を正本にして固有差分だけを追加する修正契約を記録した。ユーザーの明示的な実装再開指示までコードを変更しない。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Marked G16 complete without covering its required validation and field-array contracts

#### 2026-07-28

- source: review
- 発生箇所: `ex-02-16-sheet-experience-consistency` の完了判定、technical review後の確認、およびVisual Review記録
- 観測した失敗: G16の完了条件が要求する最大Lvのsection非伝播、`advanced`条件、全skill区分の重複検出、`useFieldArray`更新境界を実装・testで確認しないまま完了扱いにした。特に最大Lv超過のactual screenshotを確認した記録があるにもかかわらず、section errorへの誤伝播を検出できていなかった。
- 一次対応: G16をactiveへ戻し、未達の完了条件を未チェックへ戻した。`.tmp/chatgpt-review.md`をローカル実装・SSoTと照合したレビュー指摘2としてissueへ取り込み、修正はユーザー承認後に限定する。`9b905c3`でその時点の最大Lv伝播、`advanced`・重複validation、field-array更新境界を修正・再検証したが、次の通常reviewで負数Lvの区分合計、reaction row ID、same-value reset、VRT locatorに未達が判明した。レビュー指摘3・4で、全field arrayの非空・一意なrow ID、reactionの固定identity、same-value reset同期、実section VRTを修正・再検証した。G16はユーザーのclose指示により完了扱いとした。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Changed user-specified common-skill wording without authority

#### 2026-07-28

- source: user
- failure category: instruction fidelity
- 発生箇所: `ex-02-14-sheet-common-skills` の基本情報tooltip label
- 観測した失敗: ユーザーが指定した共通スキル上限の文言を、確認や根拠なしに`合計レベル上限`へ変更した。さらに、指摘後も指定履歴を正確に照合せず、誤った文言を返答した。
- 一次対応: レビュー中は実装を開始しない。最新のユーザー指定である`共通スキルレベル合計`と`/共通スキルレベル上限`の明示改行を、レビュー終了後にcurrent issueへ記録する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Added unrequested build-area feedback and common-skill validation

#### 2026-07-28

- source: user
- failure category: scope expansion
- 発生箇所: `ex-02-14-sheet-common-skills` の流儀・生き様 / 能力値領域および共通スキル上限error
- 観測した失敗: ユーザー指示とdesign画像にない流儀・生き様 / 能力値領域の共通スキル上限表示、ならびに共通スキル上限のfeedbackを独自に追加した。さらに、ユーザーがレビュー中の修正停止を明示した後、削除対象の調査から修正開始へ進もうとした。
- 一次対応: ユーザーの停止指示に従い、調査以外の実装・issue更新を停止した。レビュー終了後に、指示外の表示・feedback・validationをcurrent issueの修正対象としてまとめる。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Added an Ikizama-specific callback path to the shared SkillSection

#### 2026-07-28

- source: user feedback
- failure category: scope and shared-component change control
- 観測した失敗: 生き様bonus Lvの更新のために、他区分も使う`SkillSection.tsx`へ`onAutomaticLevelChange`を追加し、自動習得行だけを分岐させた。G13で必要なのは生き様adapterの値更新だけであり、共通Componentに変更リスクを持ち込む理由がなかった。
- 一次対応: `onAutomaticLevelChange`と共通Component内の分岐を削除する。bonus行の`rowId`を既存`onLevelChange(rowId, value)`へ渡し、生き様adapterがbonus行だけをフォーム値へ書き戻す。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Misread the free bonus-skill level rule and tested a non-error state

#### 2026-07-28

- source: user feedback
- failure category: requirement interpretation and visual-state setup
- 観測した失敗: 生き様bonusスキルを合計対象外と誤認し、ユーザーから「Lv1だけが無料」と指摘された後も、ブライLv1・bonus Lv2を超過状態としてテストした。これは無料分を除く取得Lvが1で、生き様Lv1を超えない状態だった。
- 一次対応: 合計を`通常スキルLv合計 + max(0, bonus Lv - 1)`へ訂正した。Visual ReviewはブライLv1・bonus Lv3を超過stateとし、生き様スキル区分の赤枠を実画面で確認する。スキルLvの無料分がある検証では、境界値と超過値を先に算出してからtest stateを作る。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Reported no clipping without selecting a longest-name skill state

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-13-sheet-ikizama-skills` のビジュアルレビュー1
- 観測した失敗: 生き様スキルのdefault、候補dialog、bonus詳細だけを原寸locator screenshotで確認し、`帰還不能地点`のようなデータ内改行を持つ長い通常スキル名を選択したstateを確認しないまま、名称のclippingがないと報告した。ユーザーの実画面レビューで長い名称がclipしていると指摘された。
- 一次対応: current issueへレビュー指摘1を取り込み、長い名称選択state、Lv合計超過state、区分間余白を対象にしたビジュアルレビュー2を追加する。修正後は全viewportの原寸locator screenshotで名称全体を確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Reported an inherited muted color without checking the nested tooltip button

#### 2026-07-27

- source: agent self-report
- 発生箇所: 副能力値の`一時修正を適用`control
- 観測した失敗: 親`.temporaryControl`のcolor指定だけを確認して、内側の`FormulaTooltip` triggerがbutton要素であることと、その実画面の色を確認しなかった。その結果、browser既定の濃い文字色で表示されているにもかかわらず、今回の変更で色は変わっていないと報告した。
- 一次対応: desktop・ultrawide・tablet・mobileの副能力値sectionを原寸locator screenshotで確認し、実際の表示を訂正した。`temporaryControl`内のbuttonへ`color: inherit`を明示してmuted色を継承させ、修正後の同じlocator screenshotを確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeatedly exceeded the character-sheet E2E smoke-test boundary

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: G8で、FormulaTooltipの開閉属性・本文・viewport内の配置までをcharacter-sheetの最終smoke E2Eへ追加した。tooltipの局所状態と文言はComponent test、視覚配置はVRTへ置くという既存のテストアーキテクチャを守らず、G4の「Expanded G4 E2E beyond its smoke-test boundary」、G7の「Repeated FormulaTooltip browser interaction assertion」に続く3回目のE2E責務境界の逸脱となった。さらに、tooltip本文の期待値を`移動力修正`のまま残し、現在の`修正`という文言変更に追随できていなかった。
- 一次対応: E2Eからtooltipの詳細assertionと配置testを削除し、代表的な修正入力・checkbox操作だけへ縮小した。上端で下方向へ開くplacement選択は`FormulaTooltip` Component testへ移し、実画面の位置関係はtooltipを開いたstateを含むtarget限定VRTの未確認項目として残す。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Misread the approved profile field arrangement during G4 adjustment

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の基本情報レイアウト調整
- 観測した失敗: ユーザーが指定した「PC名・PL名を1行目、二つ名を2行目左半分、年齢・性別を2行目右半分の内側」という構成を、年齢・性別を独立した下段として実装した。ユーザーの文言とdesign draftの構成を実装前に正確に照合しなかった。
- 一次対応: profile gridを2列とし、年齢・性別を右半分の入れ子gridへ移した。UI配置の修正時も、指定された行・列・入れ子をそのままDOM構造へ対応付けてから実装する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Generated a requirements-driven design draft before updating the requirements source of truth

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-web-character-sheet`のdesktop design draft再作成
- 観測した失敗: ユーザーが、Git管理外の要件ドラフトにある画面項目・初期枠数・操作規則を、現行要件と矛盾しない範囲で要求正本へ先に取り込むよう求めていたにもかかわらず、agentは正本を更新せずに一時HTMLとcaptureを作り直した。そのため、要求正本を唯一の入力にするべき後続のdesign作業の順序を再び逸脱した。
- 一次対応: 一時draftの更新を停止し、`.tmp/character-sheet-requirements.md`を項目カタログとして照合して、`docs/requirements/character-sheet.md`へ不足する表示項目・初期枠数・可変行・操作規則を正本優先で追加する。正本のユーザー確認後にだけ、その文書を入力にdesign draftを再作成する。

- archive reason: ユーザー指定の分類（びみょいけどarchive）
- moved: 2026-08-05

### Misread the PageToc confirmation page heading instruction

#### 2026-07-23

- source: user
- 発生箇所: `ex-01-page-navigation-links` の `/-local/page-navigation` 確認ページ
- 観測した失敗: ユーザーの「見出しなくて良い」を、本文の`h1`も不要という意味に誤解した。本来は、PageTocに表示される`h2`以下の見出しを置かないという意図だった。
- 一次対応: `h1`を復元し、確認ページは`h1`のみ、PageToc項目となる`h2`以下なしの構成へ修正した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### MDX emphasis and PageToc preview verification were incomplete

#### 2026-07-12

- source: user
- 発生箇所: `21-2-world-page` の`/world`実装とVisual Review
- 観測した失敗: `**〈仕事人〉**`をMDX本文へそのまま書いたため、出力でMarkdown記法の`**`が可視化された。また、build後の処理でPageTocを生成するページにもかかわらず、`npm run dev`でVisual Review用captureを行い、`npm run preview`による確認をしていなかった。
- 一次対応: 強調箇所をMDXで確実に解釈される`<strong>〈仕事人〉</strong>`へ置き換え、world visual testに生成済みPageTocの検証を追加する。build後に`npm run preview`を起動してdesktop / mobile captureを取り直し、そのactualだけを正本化の材料にする。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Visual verification gap after UI-affecting change

#### 2026-07-05

- 発生箇所: `09-base-layout` の `src/pages/mdx-test.mdx` frontmatter layout変更
- 観測した失敗: MDXページのLayout適用方法を本文内Componentからfrontmatter `layout` 指定へ変更した後、`npm run check` と `npm run build` は実行したが、MDXページで実際にLayoutが表示されているかVisual確認を再実行しないまま報告した。
- 一次対応: `/mdx-test/` を対象にVisual captureを再実行し、MDXページで共通Layoutが表示されていることを確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Text labels treated as icon implementation

#### 2026-07-05

- 発生箇所: `10-header-footer` の Footerリンク実装
- 観測した失敗: issueとdesign notesで「アイコンリンク」として扱うべきGitHub / X / Discordリンクを、`GH` / `X` / `DC` の文字ラベルで実装し、ユーザーからアイコンライブラリを使った実装へ修正するよう指摘された。
- 一次対応: `simple-icons` を追加し、FooterリンクをGitHub / X / DiscordのブランドSVGアイコン表示へ変更した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Mobile horizontal overflow missed after UI implementation

#### 2026-07-06

- 発生箇所: `14-mobile-page-toc` の `MobilePageToc.astro` / `BaseLayout.astro`
- 観測した失敗: 実装後のPlaywright確認で開閉挙動とスクリーンショットは確認したが、document全体の横方向overflowを数値確認しておらず、mobile PageTocのgrid item自動最小幅により右側余白が崩れた状態を見落とした。
- 一次対応: `MobilePageToc`、`desktop-layout`、`site-main` に `min-width: 0` / `width: 100%` を追加し、390px viewportで `documentElement.scrollWidth` が390pxに収まることを確認した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Excessive CSS added during targeted UI fix

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにする修正で、必要な位置指定を超えて背景色、border、box-shadow、負margin、paddingを追加し、既存本文面と異なる背景ブロックを発生させた。
- 一次対応: stickyに必要な `position` / `top` / `z-index` だけを残し、追加した背景色、border、box-shadow、負margin、paddingを削除した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Sticky heading transparent background missed

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにした際、背景を透過のままにしていたため、スクロール中の本文がH1背面に重なって読みにくくなる状態を見落とした。
- 一次対応: sticky heading rowに白背景を追加して上端の透過を防ぎ、通常H1位置を崩しにくい範囲で上paddingと同量の負marginを使ってsticky時の上余白と目次triggerの縦位置を調整した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated validation failure in one implementation task

#### 2026-07-11

- 発生箇所: `20-2-introduction-page` のVisual Reviewテスト追加後の `npm run check`
- 観測した失敗: 使用できないPlaywright matcherによるTypeScriptエラー、同じテストファイルのBiome整形不一致、リスト項目の一部を完全一致テキストとして探したPlaywright assertionの3件により、同一タスク内で検証失敗を繰り返した。
- 一次対応: matcherをこのプロジェクトのPlaywright型定義で利用可能なlocator評価へ置き換え、Visual Review前のテスト編集後にBiome formatを実行する。本文の一部は親要素に対する部分一致で確認する。修正後に `npm run check`、`npm run build`、対象Visual testを再実行する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated validation failure in one implementation task

#### 2026-07-22

- source: agent self-report
- 発生箇所: `33-2-items-index-page` の`tests/visual/items-index.spec.ts`追加後の`npm run check`
- 観測した失敗: 初回に`HTMLElement`へのtable cell参照とtest閉じ括弧のTypeScriptエラーが発生し、修正後の再実行ではBiomeの整形不一致、Visual Review記録追加後にはMarkdown表の整形不一致が発生した。Markdown表を手動整形した再実行でも同じ整形不一致が残り、同一タスクでvalidation failureを複数回発生させた。
- 一次対応: Visual testを追加する際は、Playwright callbackのDOM型を事前に確認し、`npm run check`が示す整形差分を`apply_patch`で反映してから再実行する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Hero image dimension inventory was reported too late

#### 2026-07-23

- source: user
- 発生箇所: `ex-03-hero-layout-stability` のissueレビュー
- 観測した失敗: hero画像の寸法を固定する案を提示する前に、全hero素材の実寸一覧を確認・報告しなかった。そのため、アイテムheroの統一後に流儀hero 3枚が`1671x941`のまま残ることを後から伝え、ユーザーに画像サイズの差異を先に報告すべきだったと指摘された。
- 一次対応: 通常heroを`1672x941`へ統一することをissueの入力契約に明記した。以後、画像寸法・データ形式・asset配置を設計判断の根拠に使う前に、対象全件を一覧化し、差異を先に報告する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated FormulaTooltip browser interaction assertion

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` の成長点Tooltip browser test
- 観測した失敗: FormulaTooltipはpointer hoverで開くため、Playwrightのclickがhover直後の開状態を再度toggleして閉じることを確認せず、tooltipを待つtestを失敗させた。続くkeyboard操作の試行でもbrowser実行条件でtooltipを開けず、同じ確認を2回失敗させた。
- 一次対応: mouseの実際の表示契約に合わせ、target buttonへ`hover()`した後のtooltip可視性と位置を確認するtestへ置き換えた。Tooltipのkeyboard開閉を確認する場合は、hoverと独立した操作状態を先に設計・検証する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated flaky section-frame browser test during Review 4

#### 2026-07-27

- source: agent self-report
- 発生箇所: `ex-02-7-sheet-build` のレビュー指摘4後の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: 変更対象外の縁section frame開閉testが全体実行と単独再実行で連続して失敗し、click後も`aria-expanded`が`true`のままとなった。プロフィール入力testは単独再実行で通過した。
- 一次対応: Review 4のBuildSection・number input変更を原因とみなしてframe実装を変更せず、browser smokeの当該1件を未確認として報告する。frameの操作同期は別scopeで扱う。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated G11 noncombat browser-test failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-11-sheet-noncombat` の `tests/visual/character-sheet.spec.ts`
- 観測した失敗: 非戦闘技能の初期折りたたみbrowser testを、1回目はCSS generated contentがbuttonのaccessible nameへ混ざることを見落として失敗させ、2回目は`.noncombatRow`の`display: grid`がHTMLの`hidden`属性を上書きすることを見落として失敗させた。
- 一次対応: 折りたたみ記号を`aria-hidden`の実DOM要素へ移し、`.noncombatRow[hidden] { display: none; }`を明示した。以後、CSS generated contentを操作名へ使わず、`hidden`を使う表示状態ではcomponent CSSとのdisplay競合をbrowser testで先に確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Reported noncombat tooltip line breaks without verifying CSS whitespace handling

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の`非戦闘技能` tooltip
- 観測した失敗: tooltip文字列へ改行文字を追加しただけで、`.content`の`white-space: normal`が改行を空白として処理することを見落とした。temporary captureを開いたにもかかわらず、改行表示を確認したとissueへ誤って記録した。
- 一次対応: `FormulaTooltip`へ必要なtooltipだけ`white-space: pre-line`で改行を保持するoptionを追加し、非戦闘技能tooltipへ適用した。改行の有無を表示契約とするtooltipでは、text contentではなくactual screenshotで段落境界を確認してから報告する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Left visible skill names outside GameDomain across G10 and G11

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-10-sheet-attack-reaction` と `ex-02-11-sheet-noncombat` の技能名・リアクション名のowner
- 観測した失敗: GameDomainへゲーム用語を集約する方針があるにもかかわらず、攻撃技能名・リアクション名を`characterSheet.checks`へ、非戦闘技能名をmaster dataへ追加した。前の2 Gateで表示名とID・対応能力・順序を分離して棚卸ししなかった。
- 一次対応: 可視の攻撃技能、リアクション、非戦闘技能名を`gameDomain.terms`へ移し、master dataとformにはID・順序・対応能力だけを残す。新しいゲーム用語を追加するGateでは、表示名、識別子、ゲーム計算データのownerをissue review時に分けて確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated G9 tooltip capture failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-11-sheet-noncombat` のG9 `bond-resolved` Visual Review capture
- 観測した失敗: `覚悟`tooltipをhoverで開いたあとにsection locatorを先に撮影したため、tooltip locatorの撮影時にはopen stateが失われた。原因確認前にclickで開く実装へ変更し、tooltipがhover専用であるためdesktop / tablet / mobileで再度失敗させた。
- 一次対応: tooltipの既存hover契約を維持し、open stateを保ったままtooltip locatorをsection locatorより先に撮影する順序へ戻す。tooltip stateを含むcaptureでは、triggerのinteraction契約と複数locatorの撮影順を先に確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated G12 shared-component refactor test failures

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-12-sheet-primary-skills` のshared `SkillSection`抽出
- 観測した失敗: 初回はautomatic行へ不要な`legend`を追加し既存の名称表示契約を壊した。続く訂正では新設した`ariaLabel` Propsをdestructureせず、section Component test全件を失敗させた。
- 一次対応: automatic行はform入力がないため`legend`を出さず、section見出しとaccessible nameを別Propsで明示した。shared Componentを抽出する場合は、既存Component testを最初の型検査前に通し、追加したPropsの宣言・destructure・利用を同時に確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Started a character-sheet browser check before client hydration

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-13-sheet-ikizama-skills` の生き様通常スキル最低0行確認
- 観測した失敗: dev serverへ遷移直後に生き様selectを1回だけ変更し、React Islandのhydrate完了後にselect値が初期値へ戻る状態を、削除buttonが表示されない実装不備と誤って切り分けた。
- 一次対応: form再描画を伴う実ブラウザ操作では、対象sectionの表示状態が更新済みになるまで同じ操作と可視確認を短い再試行境界へ置く。今回も生き様選択済みを確認してから、通常行を2行、1行、0行へ順に削除し、bonus Lvだけが残ることを確認した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### G16 maximum-level VRT fixture also caused a total-limit error

#### 2026-07-28

- source: agent self-report
- 発生箇所: `ex-02-16-sheet-experience-consistency` のその他流儀スキル最大Lv超過VRT
- 観測した失敗: 最大Lv超過だけを確認すべきfixtureで、その他流儀Lvを`1`のままスキルLvを`9`にしたため、区分合計超過も同時に発生した。section errorの否定assertionがdesktop / tablet / mobileで失敗したが、実装の最大Lv伝播不備と誤認し得る状態だった。
- 一次対応: fixtureでその他流儀Lvを`9`へ設定し、区分合計を上限内にしてからスキルLv`9`を入力する状態へ訂正した。対象4 state・3 viewportを`visual:capture`で再実行し、12件通過後にactual screenshotを開いて確認した。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated armor-clear E2E assertion failures during G17 review response

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具クリアE2E
- 観測した失敗: 自前previewとE2E設定のweb serverを同時に起動してport競合にした後、クリア後に名称が未選択へ変わることとdesktop / mobileで同名inputが2つ存在することを考慮せず、同じ防具修正input assertionを連続して失敗させた。
- 一次対応: E2Eでは設定が起動するserverだけを使い、クリア後の未選択labelで2つのinput数と各値を明示して確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated G17 VRT picker-locator failures after accessibility-name changes

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-17-sheet-weapons-armor` のtarget限定Visual Review
- 観測した失敗: 武器pickerのaccessible nameを行番号付きへ変更した後、旧完全一致locatorを使ってcaptureを失敗させた。続く正規表現では詳細・削除buttonまで一致することを確認せず、9 stateを再び失敗させた。
- 一次対応: picker buttonだけに一致する`/^武器\\d+：武器を選択$/`を使い、VRT再実行前にPlaywright error contextの候補一覧でlocatorの対象を確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated E2E assertions based on an unverified rendered state

#### 2026-07-29

- source: agent self-report
- 発生箇所: `ex-02-19-sheet-cybernetics` のサイバネE2E
- 観測した失敗: 非戦闘技能の修正inputをサイバネsection内にあるものとして参照し、次に非戦闘技能が閉じている状態でも入力が描画されると仮定した。さらに、選択済み`その他`行の削除button数を、未選択の削除行と同じ名前で数えたため、同じE2Eを連続して失敗させた。
- 一次対応: error contextのaccessibility treeで実際の描画範囲とbutton名を確認し、非戦闘技能を開いてから修正inputを検証する。可変行では選択済みと未選択のaccessible nameを区別し、操作前後の行数をその状態ごとにassertする。非戦闘技能inputはuncontrolledのため、form値の再設定はsectionを閉じて開き直した描画で確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Omitted a derived credit value when composing profile props

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-22-sheet-special-items-integration` の`useProfileSectionProps`
- 観測した失敗: アイテム信用の合計は`creditSummary.change`へ渡していたが、`ProfileSection`が表示する`spentCredit`をpropsへ返していなかった。そのため、小銭は選択済みアイテムを差し引いた値になる一方、消費信用の表示だけ既定値`0`に留まった。
- 一次対応: `spentCredit`をProfile section propsへ明示的に返し、お守り選択後に消費信用`2`が表示されるE2Eとpresenter hook testを追加した。派生値を別sectionへ渡す場合は、計算結果だけでなく表示に使う元値もprops契約へ含まれることを確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeatedly misread the target of a dialog-header review

#### 2026-07-30

- source: user
- 発生箇所: `ex-02-web-character-sheet` の選択dialog column header review intake
- 観測した失敗: ユーザーが選択dialog内の`名称`、`最大Lv`、`コスト`、`使用制限`などの列headerを指摘したにもかかわらず、dialog titleとして解釈し、その後も列headerとtitleを往復して要件を取り違えた。
- 一次対応: Review 9を候補表の列headerだけを対象とする契約へ訂正した。UIの「header」指摘では、対象の可視文言とDOM要素を先に対応付けてからissueへ記録し、実装対象外のtitleや本文を明示する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Reported a CSS-only dialog-header fix without inspecting the rendered labels

#### 2026-07-30

- source: user
- 発生箇所: `ex-02-web-character-sheet` のpicker列header修正報告
- 観測した失敗: `tableHeader`の親へfallbackを追加しただけで、実際の`名称`、`最大Lv`、`コスト`、`使用制限`のlabel要素へstyleが適用されることを画面で確認せず、修正済みと報告した。ユーザー画面では未修正だった。
- 一次対応: `tableHeader`と直下の列labelへ同じfont size・font weightを明示する。CSSの親継承に依存する表示修正は、実際の対象要素のcomputed styleまたはactual screenshotを確認してから完了報告する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Repeated browser-test locator mistakes while adding a restored cybernetic error state

#### 2026-07-30

- source: agent self-report
- 発生箇所: `ex-02-24-sheet-persistence` のサイバネ部位不一致E2E / VRT
- 観測した失敗: VRTで候補groupの見出しを経由するlocatorが解決できず、続くE2Eでは`/^頭：.+$/`がpicker、詳細、clear buttonの3要素へ一致してstrict mode違反になった。
- 一次対応: `data/generated/items.json`とpicker Componentを確認し、テストで選ぶ既知の腕サイバネ`ガードアーム`と、対応するpicker buttonの完全一致accessible nameを使った。新規の復元state testは、候補選択と最終assertionの両方で実際のDOM上の一意なrole / nameを確認してから全viewportへ展開する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Left selected drugs visually indistinguishable from zero-set items

#### 2026-07-31

- source: user
- failure category: character-sheet input / derived-value consistency
- 発生箇所: `ex-02-31-sheet-integration` のドラッグ選択と信用表示
- 観測した失敗: ドラッグを選択しても初期所持セット数が`0`だったため、消費信用が変わらず、他アイテムと異なり選択済み状態が信用表示へ反映されないように見えた。初回対応では選択時の補正とinput同期を加えたが、行生成時の既定値を`1`にするだけで済む仕様に対して不要に複雑だった。
- 一次対応: 初期3行と追加行の所持セット数を`1`とし、選択時補正とinput同期を取り除いた。hookで行生成値・消費信用・小銭、previewで実際の選択後表示を確認する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Omitted timing from the shared skill candidate dialog

#### 2026-07-31

- source: user
- failure category: character-sheet master-data display completeness
- 発生箇所: `ex-02-31-sheet-integration` の`SkillPickerDialog`
- 観測した失敗: スキル行と要件がタイミングを表示する一方、4種のスキル候補dialogを共有する候補表からタイミング列が欠落していた。
- 一次対応: shared candidate headerとrowへ、最大Lvとコストの間にタイミング列を追加した。全dialog・viewportのactual screenshotを原寸で確認し、Component testでheaderと読み上げ用labelを固定する。

- archive reason: ユーザー指定の分類（archive）
- moved: 2026-08-05

### Bond target and relation inputs remounted on every character

#### 2026-07-30

- source: user
- failure category: user-observed input lock
- 発生箇所: `ex-02-26-sheet-json-export` のpreview中に確認された縁セクション
- 観測した失敗: ユーザーが縁の「対象」と「関係」へ入力できないと報告した。`useBondsSectionProps`は各inputの`onChange`で`useFieldArray.update()`を呼ぶため、React Hook Formが行をunmount / remountし、キー入力ごとにfocusを失う。`isResolved`、画面上の「覚悟」が選択済みなら意図的にdisabledになる別契約もあるが、今回の原因ではなかった。G26のJSON出力差分は入力更新を持たず、この挙動を変更していない。
- 一次対応: previewを停止し、先の覚悟による入力ロックという誤った切り分けを訂正した。ユーザーの明示指示後、`update()`ではなく対象fieldへの`setValue()`を使う実装修正と、連続キー入力後の値・focusを確認するComponent testを追加し、`fcefd86 fix: preserve bond input focus`としてcommitした。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Omitted bond-limit errors and styled the wrong mobile control

#### 2026-07-30

- source: user
- 発生箇所: `ex-02-25-sheet-error-summary` のerror集約とtablet / mobile操作pane
- 観測した失敗: 縁の入力済み件数が結べる縁の上限を超える既存errorを集約ViewModelへ渡さず、error時の`danger` classを右下menu buttonではなくヘルプbuttonへ付与した。ユーザーのdev server確認で発見された。
- 一次対応: 縁上限超過をerror集約と既存の局所error表示へ統一し、`danger` classをmenu buttonへ移す。Node / Component testへ両条件を追加し、E2E・VRT実装前のユーザー確認をやり直す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Implemented a Container layout exception without reconciling the architecture SSoT

#### 2026-07-30

- source: review
- failure category: scope and SSoT precedence
- 発生箇所: `ex-02-23-sheet-action-pane`の`CharacterSheetActionPane`配置
- 観測した失敗: 子issueがarchitecture正本を適用対象として列挙していたにもかかわらず、`CharacterSheetContainer`直下をForm Presenterとroot dialogに限定する契約と矛盾するActionPane直下配置を実装・完了扱いにした。
- 一次対応: PR #69 Review 6の有効指摘としてG23 issueへ記録した。ユーザー判断により、ActionPaneをForm Presenterへ移さず、form外のroot-level表示Componentとしてarchitecture正本へ明記して境界を整合させた。関連するbrowser E2Eとtarget VRTを確認した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のreview指摘として保管
- moved: 2026-08-05

### Reintroduced the known armor clear-button border cascade defect

#### 2026-07-29

- source: review
- 発生箇所: `ex-02-19-sheet-cybernetics` の共通クリアbutton CSS適用後の防具clear button
- 観測した失敗: 右側罫線の欠落について既存failure logが求めるcomputed styleとwinning selectorの確認をせず、共通classへの置換後に表示完了としたため、防具clear buttonで同じ欠落を再発させた。
- 一次対応: G19のレビュー指摘3へ、desktopのcomputed `border-right`とcascade確認を修正の先行条件として記録した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のreview指摘として保管
- moved: 2026-08-05

### Used one document listener per open FormulaTooltip for outside-tap dismissal

#### 2026-07-25

- source: user
- 発生箇所: `FormulaTooltip`のmobile閉鎖処理
- 観測した失敗: mobileの外側タップを検出するため、開いている各Tooltipが`document.addEventListener`を登録する設計にした。Tooltipが複数あれば同じdocumentへlistenerが増え、局所UI状態に対して広すぎるイベント境界だった。
- 一次対応: document listenerを削除し、touch環境でだけ表示する透明なdismiss layerをTooltip自身の外側に置いた。数値に近いabsolute配置を維持し、layerのタップで閉じる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Misinterpreted an icon-alignment correction as container-spacing work

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の設定トグル
- 観測した失敗: ユーザーが指摘したのは`設定`文字列に対するトグルアイコンの縦ずれだったが、agentはトグル全体のmarginとpaddingを詰める修正を行った。対象要素を画面上で分離して確認せず、アイコンの光学位置とコンテナ余白を混同した。
- 一次対応: トグルのmargin・paddingを元へ戻し、矢印アイコン自体へ相対位置の上方向補正を加えた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Left the setting toggle vertically detached from its profile fields

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の基本情報レイアウト
- 観測した失敗: profile gridの直後に配置する設定トグルへ不要な上marginと大きい縦paddingを残し、直前の入力行から下へずれた表示にした。
- 一次対応: 設定コンテナの上marginを除き、トグルの縦paddingを`--space-1`へ縮めて入力群直後の操作として揃えた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied derived-value background to its label despite the requested boundary

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の信用表示スタイル調整
- 観測した失敗: ユーザーが自動算出「数値」の見た目だけを入力欄から区別するよう求めたのに、agentはラベルを含む算出セル全体へ白背景を適用した。表示上の対象範囲を要素単位で確認せず、ラベルまで入力欄のように見せた。
- 一次対応: 背景・角丸・余白を`.metricValue`だけへ移し、ラベルは入力欄と同じ信用カード背景へ戻した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Character-sheet Headerのbreakpoint表示条件を誤った

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`の`CharacterSheetHeader.astro`
- 観測した失敗: desktop・mobileのサイトメニューボタンを追加する際、mobile専用検索操作もdesktop・tabletで表示するCSSにしてHeader gridの暗黙行を発生させ、内部要素が上へずれるデグレを作った。あわせて、Headerの大きなgrid gapでメニューボタンとタイトルロゴの間隔を広げすぎた。
- 一次対応: mobile検索操作をmobile breakpointだけに限定し、Header gridの暗黙行を解消した。desktop・tabletのタイトルロゴを2.5remへ縮め、メニューボタンとの間隔を`--space-3`へ縮めた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Character-sheetのサイトメニュー表示範囲を誤って拡大した

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`のcharacter-sheet専用layout
- 観測した失敗: tabletのみで表示する指定だったサイトメニューを、desktopにも表示する実装・検証として扱った。
- 一次対応: 専用layoutのmenu railをtabletのmedia query内だけで表示するようにし、desktop・tablet・mobileの表示条件をbrowser testとcaptureで確認した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Inherited no-wrap style clipped a formula tooltip

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の能力値ポイント・成長点tooltip
- 観測した失敗: labelと算出値を一まとまりとして折り返さないために`attributeMetaItem`へ`white-space: nowrap`を追加したが、tooltip本文がその子孫であることを確認しなかった。その結果、長いformula本文もnowrapとなり、tooltip背景の幅を超えて全文を読めなくなった。
- 一次対応: `FormulaTooltip`のtooltip本文へ`white-space: normal`を明示し、trigger周辺のnowrapを継承しないようにした。tooltip本文は既存の`overflow-wrap: anywhere`で幅内に折り返す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Ignored the approved noncombat responsive layout

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の`ChecksSection`実装
- 観測した失敗: `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を実装入力として確認していたにもかかわらず、非戦闘技能を全viewport共通の5列gridとして実装した。design画像が指定するdesktop / tabletの3列とmobileの2列の情報密度を守らず、Visual Review前に未達を検出できなかった。
- 一次対応: current issueへ3列／2列の表示契約と未達を記録した。修正ではdesign画像を直接比較し、各viewportの非戦闘技能を要素単位のactual screenshotで確認するまで完了報告しない。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Used a fixed-width noncombat row after the layout no longer had room

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能3列／2列responsive表示
- 観測した失敗: desktop / tabletを3列、mobileを2列へ変更した後も、得意技能、技能、対応能力、修正、常時／一時を一つの横行へ保持した。その結果、技能名の大きな折り返し、常時／一時のoverflow、2桁の修正値のclipを残した。各cardの利用可能幅と内容の最小幅を設計段階で見積もらず、列数だけを正本へ合わせた。
- 一次対応: 列ヘッダーと行内の対応能力値を削除し、対応能力別の小見出しと二段cardへ組み替える。各viewportの実画面で技能名、判定数、符号付き2桁修正を確認するまで完了報告しない。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Let card-local checkbox styling diverge from the character sheet standard

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の得意技能checkbox
- 観測した失敗: 非戦闘技能card用にcheckboxの寸法を個別指定した一方、縁sectionは別の`accent-color`指定を持つ状態を見落とした。そのため同じcharacter sheet内のcheckboxが異なる色・寸法で描画された。
- 一次対応: checkboxの基本寸法、accent color、marginを`CharacterSheetFormPresenter`のform scopeへ移し、section CSSには個別のgrid配置だけを残した。checkboxを新設するUIでは、component CSSへ基本styleを複製せずform scopeの共通styleを使う。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Claimed to compact the check-count output without accounting for the shared style selector

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能判定数output
- 観測した失敗: 非戦闘技能CSSへ判定数の高さ・padding・文字サイズを記述したが、`CharacterSheetFormPresenter`のform共通`character-sheet-number-value` selectorのspecificityに負けていた。mobile captureで判定数だけ標準サイズのまま残ったにもかかわらず、card全体を縮小したかのように作業を進めた。
- 一次対応: `noncombatRows`／`noncombatCollapsedRows`を含むselectorで判定数outputへcompactな幅、高さ、padding、文字サイズを明示し、共通styleより優先させる。共有styleを局所overrideする場合は、capture前にcomputed styleまたはactual screenshotで各値が適用済みか確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Changed check-count padding based on inference instead of an actual clip result

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` のmobile判定数output
- 観測した失敗: 左右paddingと枠幅のトレードオフを実画面で確認しないまま変更し、判定数がclipする状態をユーザーが先に発見した。数値の最小幅を推定しただけで、実際のfont metrics、padding、spinnerとの組み合わせを確認していなかった。
- 一次対応: 既存paddingのclipを実画面で確認した後にだけ、左右paddingを縮める変更を行った。寸法を変更する反復では、各変更後のactual screenshotを開き、次の変更はその結果が得られてから行う。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Omitted G12 validation feedback and nested skill folding

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のプライマリ流儀スキル
- 観測した失敗: 要件にある最大レベル超過と流儀レベル対スキル合計の赤枠フィードバック、およびプライマリ流儀スキル区分の独立した折りたたみを実装せず、ユーザーの表示確認で欠落が判明した。
- 一次対応: 最大レベルを入力とhookの両方で上限化し、既存超過値の行、流儀枠、スキル区分に`aria-invalid`と赤枠を追加した。スキル区分も初期展開の独立開閉にし、局所Component / hook / logic testへ追加した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Misread the mobile expanded-detail row order

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のmobile展開詳細
- 観測した失敗: ユーザーが指定した「コスト・使用制限」「技能・取得制限」「効果」の3行構成を、後続指摘の一部だけを取り違えて「コスト」「技能・使用制限」「取得制限」「効果」へ変更した。
- 一次対応: requirementsとcurrent issueを正しい3行構成へ訂正した。実装の訂正はユーザーの明示指示を待つ。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Repaired the formula layout without preserving paired-value semantics

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具の性能値表示
- 観測した失敗: 指摘4の「計算式で表現する」を、性能列内で攻撃力・ガード値または防御力・ダメージ軽減を縦に並べた2本の式として解釈した。ユーザー指定の`元値／元値 + 修正値／修正値 = 最終値／最終値`というペアの1本の式、元値のread-only枠、未算出時の`-`表示を満たしていなかった。
- 一次対応: G17のレビュー指摘5へ単一式・枠・`-`フォールバック・mobile改行の契約を記録した。式の構造を変更する時は、演算子の前後だけでなく、`／`で結ぶ値ペアと表示状態をComponent構造へ直接対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied requested table dividers to header rows and unrelated columns

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのheader・候補dialog
- 観測した失敗: ユーザー指定の列罫線を、data行のスキル名称／Lv入力、武器・防具名称／信用という限定された境界ではなく、header行、候補dialog header、他の全列境界へ広げた。また、G17 headerの指定列の左寄せと、防具clear buttonの折り返し時の固定高・中央配置を満たしていなかった。
- 一次対応: G17のレビュー指摘6へ罫線の対象範囲、header左寄せ、clear buttonの寸法・配置を記録した。table罫線の指示では、対象state（header / data行 / 候補行）と対象列境界をCSS selectorへ一対一で対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Removed existing data-row dividers while correcting header dividers

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのdata行
- 観測した失敗: header行から罫線を外す訂正で、data行の既存の全列境界も削除し、名称／Lv入力と名称／信用だけを残す実装へ狭めた。ユーザー指定はheaderのみ罫線なし、data行は全列境界を維持することであった。
- 一次対応: G17のレビュー指摘7へheaderとdata行の罫線を分離する契約を記録した。table CSSの変更では、headerとdata行のselectorが重ならないこと、既存の境界を削除していないことを差分で確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Fixed only one of the two requested derived-value boxes

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式の元値・最終値
- 観測した失敗: ユーザーが「算出値」を固定幅にするよう求めた際、最終値だけを対象にし、同じread-only算出値である元値を可変幅のまま残した。
- 一次対応: G17のレビュー指摘9へ元値・最終値の両方を同一固定幅にする契約を記録した。複数の同種表示を含む指示では、対象要素を列挙してからCSS selectorとgrid列へ対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Fixed individual widths without correcting the formula alignment

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式
- 観測した失敗: 算出値枠を固定幅へそろえる修正で、性能列全体へ伸びる計算式のlayoutを残した。ユーザーは枠内の値ではなく、計算式全体を左寄せにするよう求めていた。
- 一次対応: G17のレビュー指摘10へ、内容幅の式全体を性能列の左端へ置く契約を記録した。個別要素の幅と親layoutのalignmentを別々に確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Kept a button's minimum width wider than its mobile grid column

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: mobileのclear button列を`2.75rem`にしたまま、button自身の`min-width: 3rem`を残したため、明確な横overflowを起こした。button高も性能inputより大きかった。
- 一次対応: G17のレビュー指摘17へ、desktopとmobileのbutton寸法、mobile列幅、input高との整合を記録した。固定幅controlでは、min-widthと親grid列を同じviewportごとに照合する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Reduced the button without accounting for its three-character label

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile防具clear button
- 観測した失敗: overflowを直すためbuttonを縮めた後、mobile共通ruleによって「クリア」の文字を`.6875rem`へ上書きし、buttonの幅も列に明示的に合わせなかった。そのため、右端が描画されていないように見える状態になった。
- 一次対応: G17のレビュー指摘18へ、列幅いっぱいのbutton、`min-width: 0`、既定の`.625rem`ラベルを記録した。controlを縮小する時は、実ラベルの文字数・font-size・borderを含めた内容幅と、親列への確実な収まりを確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Treated a cross-viewport button defect as mobile-only

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: 右側が表示されない問題をmobileだけのものと決めつけ、`width: 100%`を追加した。desktopの同じbuttonの表示を直さず、mobileのbuttonも不要に列幅いっぱいになった。
- 一次対応: G17のレビュー指摘19へ、desktop／mobile両方の明示button幅、最大幅、中央配置を記録した。viewport限定の修正をする前に、同じComponentの全breakpointで共通の表示契約を確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Broke the Help dialog body scroll while correcting outer scroll

#### 2026-07-30

- source: user
- failure category: visual implementation verification
- 発生箇所: `ex-02-30-sheet-help` の`CharacterSheetDialog` shared CSS
- 観測した失敗: ヘルプdialogの外側scrollを抑える調整で、surfaceの最大高を誤って内側の高さへ計算し直した。その結果、本文領域が内容高まで広がり、本文自体をscrollできなくなったとユーザーから指摘された。
- 一次対応: surfaceには既存の最大高継承を戻し、native dialog側を`overflow: clip`として外側scrollだけを禁止した。実行時にdialogの`scrollTop`が`0`のまま、本文領域の`scrollTop`が移動できることを確認してから、ユーザーレビューへ戻す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied the example treatment to the calculated-value explanation

#### 2026-07-30

- source: user
- failure category: implementation accuracy
- 発生箇所: `ex-02-30-sheet-help` の`CharacterSheetHelpDialog`
- 観測した失敗: 「例」のCallout対応色を追加する際、直前にある「算出値」の説明paragraphへ`example` classを付与し、実際の例文へ付与しなかった。
- 一次対応: classを例文のparagraphへ移した。class追加時は、可視ラベルと同じparagraphであることをDOM上で確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05
