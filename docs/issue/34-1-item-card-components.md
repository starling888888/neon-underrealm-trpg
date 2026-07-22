# 34-1-item-card-components

## 目的

アイテム種別ごとのCard Componentを整備し、通常のデータ表示とMDXから渡す凡例表示の両方に使える表示契約を定義する。既存の`SkillCard`も同じCard API・fallback方針へリファクタし、アイテムカードと一貫した可読性を持たせる。

## 背景

`docs/plan.md` の`34-1-item-card-components`は、武器、防具、お守り、サイバネ、ナノマシン、ドラッグを個別Card Componentとして整備し、`SkillCard`を含めたカードデザインと凡例用Propsを統一するタスクである。

凡例では`①2`のような表示用の文字列を数値項目へ渡す必要があるため、各Cardの数値的なPropsは`number`だけに制限せず、`string | number`を受け付ける。生成JSONの型・schemaは変更せず、Componentの表示用Propsだけを広げる。

`null`の値は意味を持つ未設定値として扱う。効果や詳細説明などの文章項目は`null`なら空文字列で表示し、値・分類・制限などの文章以外の項目は`-`へフォールバックする。空文字列と`undefined`も、同じ表示規則で扱う。対象フィールドはこのissueの表示契約に固定する。

関連する要件・設計・追跡項目は以下を参照する。

- `docs/requirements/data-display.md` のFR-04、FR-04-01〜04
- `docs/out-of-scope.md` の凡例専用Component禁止、および汎用`ItemCard`への統合禁止
- `docs/plan.md` の`34-1-item-card-components`
- `docs/TODO.md` のAstro Component contract test基盤、およびダミー`/data/items/weapons`ページの後続対応
- `docs/design/data-cards/` のCard共通表現
- `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

- `WeaponCard.astro`、`ArmorCard.astro`、`OmamoriCard.astro`、`CyberneticCard.astro`、`NanomachineCard.astro`、`DrugCard.astro`を`src/components/data/`に追加する。
- `SkillCard`と6種の実在アイテムデータを並べて確認するローカルカタログページ`/-local/data-cards`を追加する。公開ページ・データ一覧ページは追加しない。
- 各Cardが対応する`src/lib/types/item.ts`のアイテムデータを通常表示でき、MDXから凡例用の静的Propsを渡しても表示できるよう、各Component内のProps契約を定義する。
- 表示上数値となるPropsは、未設定値を含めて`string | number | null | undefined`を受け付ける。`SkillCard`の`maxLevel`を含め、既存`SkillCard`の数値的Propsも同じ方針へリファクタする。`null`、空文字列、`undefined`は、後述のフィールド分類に従って表示する。
- 各Cardに`anchorId`を渡せるようにし、実在データの`id`を個別アンカーとしてそのまま利用できる構造にする。
- 効果の文章Propsは`null`、空文字列、`undefined`で空文字列を表示する。対象は全Cardの`effect`とする。現在非表示の`SkillCard.summary`は表示・fallback処理の対象外とし、既存TODOどおり非表示を維持する。`ArmorCard.restriction`を含むその他の表示値は`-`へfallbackする。
- `SkillCard`の`cost`、`proficiency`、`acquisitionRestriction`、`usageRestriction`、`target`、`range`と、Item Cardの名称・効果・詳細文章以外の表示Propsは、`null`、空文字列、`undefined`で`-`を表示する。名称は通常データ・凡例データとも必須とする。
- `SkillCard`を含むCardのデザインを統一する。横幅は`CardContainer`のgrid配置を継承し、本文が短い場合の基準はトランプに近い`aspect-ratio: 5 / 7`とする。本文量が基準高さを超える場合は、内容に応じて縦へ伸長し、切り詰めない。現在の`SkillCard`の既定最低高さを、この比率より過度に縦長にしない。
- `docs/design/data-cards/`をCard表示のdesign targetとし、各種別の項目配置、共通表現、`5 / 7`の基準比率、可変高さ、凡例表示を記録する。正本画像はレビュー済み実装から後続作業でcanonicalizeする。
- 上記の`null`表示規則を`docs/requirements/data-display.md`へ明文化し、issueと実装の表示契約を一致させる。

## 初期スコープ外

- `SkillLegend`、`ItemLegend`などの凡例専用Componentは作成しない。
- 全アイテム種別を単一の汎用`ItemCard`へ統合しない。共通helperや共通CSSの再利用は許容する。
- 公開するアイテム一覧・種別別ページ、MDX本文、検索、フィルタ、ソート、ページネーション、詳細ページ遷移を実装しない。
- Excel、`.raw/`、変換スクリプト、生成JSON、schema、データ取得層の契約を変更しない。
- Header、Footer、SiteMenu、PageToc、`public/images/data/items/`の個別画像表示を変更しない。
- 新規npm package、クライアント側状態管理、DB、認証、SSR、CMSを追加しない。
- `docs/TODO.md`のComponent contract test基盤とダミーitemsページの置換は後続タスクへ残す。

## 完了条件

- [x] 6種の個別Item Card Componentが通常データと凡例用静的Propsの両方を表示できる。
- [x] `SkillCard`を含む全対象Cardの数値的Propsが`string | number`を受け付け、`①2`などの凡例用表記をそのまま表示できる。
- [x] 全Cardの`effect`は、`null`、空文字列、`undefined`で空文字列となる。現在非表示の`SkillCard.summary`は表示しない。その他の表示値は`-`へfallbackする。
- [x] `SkillCard`の`cost`、`proficiency`、`acquisitionRestriction`、`usageRestriction`、`target`、`range`と、Item Cardの名称・効果・詳細文章以外の表示Propsは、`null`、空文字列、`undefined`で`-`となる。
- [x] 実在データの`id`を利用できる個別アンカーIDを各Cardに付与できる。
- [x] Cardの横幅は`CardContainer`のgridを継承し、短い本文では`aspect-ratio: 5 / 7`を基準とする。長文ではその高さから自然に伸長し、本文を切り詰めない。`SkillCard`の既定最低高さはこの基準より過度に縦長でない。
- [x] `SkillCard`と各Item Cardが、`docs/design/data-cards/`の共通表現と矛盾しない。
- [x] 関連TODOを確認し、このissueでは扱わない理由が記録されている。
- [x] `npm run check`が通る。
- [x] `npm run build`が通る。

## チェックポイント

- [x] `docs/design/data-cards/design-desktop.png`、`design-mobile.png`、`notes.md`が、レビュー済み実装からcanonicalizeされ、`5 / 7`の基準比率・可変高さを含む参照正本として記録されている。
- [x] 既存の`SkillCard`利用箇所とローカル確認ページが壊れていない。
- [x] 空文字列を表示する文章項目と`-`を表示する値項目を、通常データと凡例データで混同していない。
- [x] CardContainerは各Cardの表示仕様を重複して実装していない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] ユーザーの未追跡`public/images/data/items/`を変更・削除していない。

## 想定変更ファイル

- `src/components/data/SkillCard.astro`
- `src/components/data/WeaponCard.astro`
- `src/components/data/ArmorCard.astro`
- `src/components/data/OmamoriCard.astro`
- `src/components/data/CyberneticCard.astro`
- `src/components/data/NanomachineCard.astro`
- `src/components/data/DrugCard.astro`
- `src/components/data/`配下のCard共通helperまたは共通style（必要な場合のみ）
- `docs/design/data-cards/notes.md`
- `docs/design/data-cards/design-desktop.png`
- `docs/design/data-cards/design-mobile.png`
- `docs/requirements/data-display.md`

## レビュー観点

- 6種のCardを個別Componentのまま保ちつつ、通常表示と凡例表示のProps契約が各種別で十分に読みやすいか。
- 数値的Propsの`string | number`受け入れが、実データの数値型や生成JSONのschemaを不用意に広げていないか。
- 全Cardの`effect`を空文字列にし、`SkillCard.summary`は引き続き非表示、`ArmorCard.restriction`を含むその他の未設定表示値は`-`にする区別が明確か。
- `SkillCard`の最低高さ縮小と、短文時の`aspect-ratio: 5 / 7`・可変高さが、desktop 3列 / mobile 2列の可読性を損なわないか。
- `docs/design/data-cards/`へCard designを統合し、レビュー済み実装から正本画像をcanonicalizeする方針が適切か。
- TODOのComponent contract test基盤を今回のCard実装へ含めず、後続検討に残すことが適切か。

## 備考

- `docs/design/items/`はアイテムトップページのdesignであり、Cardを初期スコープ外としている。Card表示のdesign正本は`docs/design/data-cards/`に統合し、正本画像は後続でcanonicalizeする。
- `docs/TODO.md`の`/data/items/weapons`ダミーMDXの置換は、武器ページ実装タスクで扱う。このComponent-only taskでは変更しない。
- issue作成時点で、`public/images/data/items/`は未追跡である。ユーザーの既存作業として扱い、本issueで操作しない。

## レビュー指摘 1

### 指摘事項

- `ArmorCard.restriction`の未設定表示が、issue・requirements・design notesの「空文字列」記載と、実装およびユーザーの明示指示「装備制限は`-`にフォールバックして」の間で矛盾している。
- `SkillCard`のDOM変更後も、検索モーダルVisual Testが旧来の直接子selectorを参照している。

### 判定

- source: local-pr-review
- `ArmorCard.restriction`: valid（文書整合性）。実装はユーザー明示指示どおり`-`を表示しており、コード不具合ではない。issue、requirements、design notesの空文字列記載が古い。
- 検索モーダルVisual Test: valid。 `npx playwright test tests/visual/search-modal.spec.ts`で、`#<id> > .skill-card-header > span.skill-card-name`が0件となることを確認した。
- 同コマンドのPagefind検索結果1件の失敗は、今回のDOM変更との因果を確認できないためdoubtfulとして扱い、対応対象に含めない。
- local validation: `ArmorCard.astro`は`displayValue(restriction)`を用い、ユーザー明示指示と一致する。検索モーダルdesktop testは上記selector不一致で失敗した。

### 対応方針

- ユーザー明示指示に合わせて、`restriction`のfallbackを`-`とする表示契約へissue・requirements・design notesを統一する。
- 検索モーダルVisual Testのselectorを現在の`SkillCard` DOM階層に対応させ、対象testを通す。
- Pagefind検索結果の失敗は、今回の指摘対応後に再確認し、再現時だけ別途切り分ける。

### 対応完了チェックリスト

- [x] `ArmorCard.restriction`の表示契約を`-`へ文書統一する。
- [x] 検索モーダルVisual Testのselectorを更新する。
- [x] `npx playwright test tests/visual/search-modal.spec.ts`の対象selector回帰が解消することを確認する。
- [x] `npm run check`が通る。
- [x] `npm run build`が通る。

## レビュー指摘 2

### 指摘事項

- `docs/agent-failure-log.md`へ追加したfailure entryのsourceが、定義済みの`self`ではなく`agent self-report`になっている。

### 判定

- source: local-pr-review
- classification: valid
- local validation: failure logのsource種別は`user`、`self`、`review`、`unknown`に限定されている。今回のentryは作業中の自己観測であり、`self`が適切である。

### 対応方針

- failure entryのsourceを`self`へ修正し、Markdown formatterを実行する。

### 対応完了チェックリスト

- [x] failure entryのsourceを`self`へ修正する。
- [x] `npm run format:md`が通る。
