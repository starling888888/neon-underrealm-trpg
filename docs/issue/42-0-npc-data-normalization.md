# 42-0-npc-data-normalization

## 目的

Google Driveを正本として同期したNPC Excelを公開用JSONへ変換し、`/world`のNPC紹介を生成JSONと個別画像を参照する`NpcCard`表示へ移行する。

NPCカードにはセリフを説明の上に薄い文字色の斜体で表示する。個別画像はカードごとに左または右へ置けるようにし、同じグループ内では先頭カードを左に固定して以降を左右交互に並べる。

## 背景

`21-2-world-page`では、NPC紹介を世界観本文内の静的`NpcCard`として実装した。`docs/plan.md`の`42-0-npc-data-normalization`と関連TODOでは、個別画像、Excel / JSON管理、`/world`の生成JSON参照への移行を後続タスクとしている。

`docs/conversion/npcs.md`は、Google Driveの`data/npcs`を同期した`.raw/data/npcs.xlsx`の実シートを基に、先行して作成した変換仕様である。入力は`npcs`シートの7列・11件であり、`グループ`は空欄を許可する任意の1行テキストとする。

関連資料:

- `docs/requirements/data-display.md`
- `docs/requirements/components.md`
- `docs/requirements/assets-seo.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`の`42-0-npc-data-normalization`
- `docs/TODO.md`の「各NPCの個別画像をpublic assetsへ配置する」と「NPCをExcelとJSONで管理する」
- `docs/conversion/npcs.md`
- `.raw/contents/world.md`
- `docs/design/npc-card/`
- `docs/design/world/`

## 対象範囲

- `.raw/data/npcs.xlsx`をローカル作業入力として使い、`docs/conversion/npcs.md`に従うNPC変換処理を追加する。
- `scripts/convert-npcs/`、`src/lib/schemas/npcs.ts`、`src/lib/data/npcs.ts`、`data/generated/npcs.json`、変換用npm script、最小fixtureとNode testを追加する。
- 生成JSONの各NPCは、`group`、`id`、`name`、`epithet`、`quote`、`description`、`sourceOrder`を持つ。
- `NpcCard`を、生成JSONのNPCデータ、個別画像、画像位置`left` / `right`を受け取れるComponentへ更新する。
- `/world`には生成JSONの11件すべてを入力順・グループ順で表示し、`sanjai`と`touryou`を含む可視本文・構成を`.raw/contents/world.md`へ同じtaskで反映する。
- セリフを説明の直前に、本文より薄い文字色と斜体で表示する。セリフ自体を見出し・引用ブロック・操作要素にはしない。
- 各グループのNPCは生成JSONの入力順で表示し、グループ内の0番目を`left`、以降を`right`、`left`と交互にする。グループ間で交互順を持ち越さない。
- `id`と同名の`.webp`が個別画像として存在すれば表示し、存在しない場合は`no_image.webp`を表示する。画像にはNPC名を用いた適切な`alt`を設定し、静的配信時のbase pathを考慮する。
- 個別画像の公開配置は、計画とTODOに従い`public/images/npc/`へ統一する。既存の未追跡`public/images/npc/`にあるユーザー提供画像を必要な範囲で利用する。
- `NpcCard`と`/world`の既存design正本を保持したまま、個別画像、左右配置、セリフの表示を確認するdesign initial draftを`design-image-generation`で作成する。

## 初期スコープ外

- NPC一覧・詳細ページ、検索、フィルタ、並べ替え、ページネーション、カードからの詳細遷移
- NPCの能力値、GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文
- ExcelまたはJSONをブラウザ上で編集・変換する機能、CMS、DB、API、SSR、認証
- CI/CD上でのExcel変換、Excel本体のGit管理
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- shadow、強いneon glow、gradient、黒背景主体のcyberpunk UI
- user approvalなしのdesign正本化

## 完了条件

- [ ] `.raw/data/npcs.xlsx`の`npcs`シートを、`docs/conversion/npcs.md`どおりに`data/generated/npcs.json`へ変換できる
- [ ] schema、取得層、変換script、生成JSON、最小fixture、Node test、明示実行npm scriptを追加している
- [ ] 生成JSONはID・名称の対応、入力順、二つ名とルビの組み合わせ、空欄を許可する`group`を検証する
- [ ] CI/CDと通常のsite buildはExcel本体なしで、生成済みJSONから成功する
- [ ] `/world`のNPC紹介が生成JSONを参照し、グループ内の入力順を維持して表示する
- [ ] `/world`が生成JSONの11件すべてを表示し、`sanjai`と`touryou`を含む`.raw/contents/world.md`と整合している
- [ ] `NpcCard`がセリフを説明の上に薄い文字色の斜体で表示する
- [ ] `NpcCard`が`left` / `right`の画像位置を表示でき、各グループは先頭左・以降左右交互になる
- [ ] 同IDの個別`.webp`がないNPCは`no_image.webp`へフォールバックし、画像altとbase pathを確認している
- [ ] 関連TODOを本issueで扱うこと、または扱わない理由が記録されている
- [ ] design initial draftの対象・参照正本・非正本状態が記録され、ユーザーのUI確認後にのみ最終採用を判断する
- [ ] `/world`と`/-local/npc-cards/`のdesktop / mobile actual screenshotを取得してVisual Reviewを行い、個別画像、fallback、左右交互、セリフ、横overflowを確認している
- [ ] `npm run check`、`npm run build`、関連Node testが通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開で個別画像とfallback画像が壊れない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する`docs/TODO.md`項目と矛盾していない
- [ ] `.raw/contents/world.md`、`docs/conversion/npcs.md`、関連する`docs/design/`との差分を解消またはユーザー確認事項として記録している
- [ ] 空欄`group`のNPCは見出しを出さない独立したカード群として入力順で表示し、その群でも先頭左から左右交互になる
- [ ] 既存design正本を、ユーザー承認なしにactual screenshotで置き換えていない
- [ ] ユーザーの未コミット変更と未追跡画像を破壊していない

## 想定変更ファイル

- `docs/conversion/npcs.md`
- `docs/issue/42-0-npc-data-normalization.md`
- `scripts/convert-npcs/main.ts`
- `scripts/convert-npcs/lib.ts`
- `src/lib/schemas/npcs.ts`
- `src/lib/data/npcs.ts`
- `data/generated/npcs.json`
- `src/components/_common/NpcCard.astro`
- `src/pages/world.mdx`
- `tests/node/npcs.test.ts`
- `package.json`
- `public/images/npc/`
- `docs/design/npc-card/`のreview用initial draft artifacts
- 必要に応じて`docs/design/world/`のreview用initial draft artifacts

## レビュー観点

- Excelの11件をすべて表示する方針に対して、`sanjai`と`touryou`を含む`.raw/contents/world.md`の可視構成と、グループごとの左右交互配置が適切か。
- `public/images/npc/`を公開配置として採用し、既存の未追跡画像を必要な範囲で利用してよいか。
- グループ内の先頭左・以降左右交互、セリフを説明の上へ薄い斜体で置くUIが、NPC紹介本文として適切か。
- `docs/design/npc-card/`の既存正本は共通アイコン・左固定を前提とするため、initial draftで左右配置と個別画像を確認した後に、どのdesign画像を最終採用するか。
- 関連TODOの2件を本issueで回収してよいか。

## 備考

- design前提条件: 実装前に`design-image-generation`のinitial draft modeを実行する。既存の`design-desktop.png`と`design-mobile.png`は承認済み正本のため上書きせず、左右交互配置と個別画像を含むdesktop / mobileのreview用draftを明示的な別ファイル名で作成する。draftはユーザーのUI確認と最終採用判断までdesign正本ではない。
- `group`は任意文字列であり、空欄を許可する。画面側は空欄グループを表示する場合の見出し扱いをdesign draftと実装時に確認する。
- 画像の選択は表示層の責務とし、Excelおよび生成JSONへ公開URLや画像パスを持ち込まない。
- このissueは、ユーザー承認後もdesign initial draftの生成とその確認を先に行う。design確認で得た最終採用可否が未確定のまま、UI実装またはdesign正本化を進めない。
- ユーザー指示により、Excelの11件を`/world`へ公開する。`sanjai`と`touryou`を含む本文・所属見出しを`.raw/contents/world.md`へ反映し、生成JSONと可視構成を一致させる。
