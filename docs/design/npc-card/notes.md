# npc-card

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT npc-card default <viewport>`
- route: `/-local/npc-cards/`
- state: default
- snapshots:
  - desktop `1440x1200`: `npc-card-default-desktop.png`
  - tablet `820x1180`: `npc-card-default-tablet.png`
  - mobile `390x900`: `npc-card-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- `42-0-npc-data-normalization`の承認済み実装を、ユーザー指示によりdesign正本として採用する。

## Target

- page / component: `/world` のNPC紹介で使う静的 `NpcCard` と、そのローカル確認用カタログ
- route: `/-local/npc-cards/`
- viewport:
  - desktop: `1440x1200`。既存site layout内の横長カード1列を確認する。
  - mobile: `390x900`。既存Header内の横長カード1列を確認する。
- states:
  - desktop landscape card, 1 column
  - mobile landscape card, 1 column
- design images:
  - `design-desktop.png`
  - `design-mobile.png`

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/done/phase-3/21-2-world-page.md`（historical source）
- `docs/requirements/pages.md`
- `docs/requirements/components.md`
- `docs/requirements/data-display.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`

## Design direction

- visual direction:
  - 白から薄灰の本文面に、低彩度borderで区切るフラットなカードとする。shadow、強いglow、gradientは使わない。
  - カードは横長1列とし、個別NPC画像と二つ名、名前、セリフ、説明を置く。
  - これは世界観本文の人物紹介であり、プロフィール画面、一覧検索画面、ゲーム用ステータスカードにはしない。
- layout direction:
  - 各カードは内容に応じた標準サイズとし、viewportの幅や高さを埋めるために引き伸ばさない。
  - desktop / mobileとも横長カード1列とし、ページ全体のfull-page画像にはしない。
  - 人物画像領域は`4:5`とする。正方形ではなく、わずかに縦長の人物向け比率である。
  - 各グループの先頭カードは画像を左に置き、以降は右、左と交互に置く。グループをまたいで順序は持ち越さない。
  - `id`と同名の個別画像を表示し、存在しない場合は`no_image.webp`を表示する。
- typography direction:
  - 二つ名がある場合は、`<ruby>` / `<rt>` の二つ名を名前と異なる控えめな青緑寄りの文字色で、名前の直前に続ける。斜体にはしない。
  - 二つ名がない場合は、余白用の欄やダミーを作らず、名前から表示する。
  - 名前はカード内でもっとも識別しやすい文字とし、セリフは説明の直前に薄い文字色の斜体で表示する。説明は本文と同程度の読みやすい密度にする。
- color / accent usage:
  - 二つ名だけには、名前と区別できる控えめな青緑寄りの文字色を使う。リンクやfocusの状態色と誤認しない程度に彩度と明度を抑え、カードを色やneonで強く分類しない。
  - セリフにはtext mutedを使い、個別画像や二つ名以外を色やneonで強く分類しない。

## Existing design constraints

- `global-styles` の白寄り背景、暗めの文字色、低彩度border、控えめな青緑accent、system font、実務的な情報密度を維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocの構造を変更しない。正本画像は既存site layoutを含むが、これらはNpcCard taskで再設計しない。
- `NpcCard` は`/world`の世界観本文に使う表示Componentであり、検索結果、フィルタUIにはしない。
- 個別画像にはNPC名を用いた代替テキストを付ける。

## Out of scope

- NPCの能力値、一覧ページ、詳細ページ、GM専用情報、エネミーデータ、シナリオ情報
- 検索、フィルタ、並べ替え、ページネーション、カードクリック時の詳細遷移
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- shadow、強いneon glow、gradient、黒背景主体のcyberpunk UI

## Comparison points for implementation

- desktop / mobileともカードが横長で、個別NPC画像、二つ名と名前、セリフ、説明の順が視認できる。
- 画像領域が`4:5`を保ち、各グループ内で先頭左・以降左右交互になっている。
- 二つ名はある場合だけルビ付きの控えめな青緑寄りの文字色で名前の直前に続き、斜体にしない。二つ名がない場合は名前から始まる。
- desktop / mobileの横長1列で、説明の可読性、画像比率、余白、横overflowを確認できる。
- カードは内容に応じた標準サイズであり、画面高や列高を埋めるために不自然に伸びない。
- borderと余白で本文カードとして区別でき、shadowや派手な色で別サイトのUIに見えない。
- reviewが必要な差分:
  - mobileの横長カードで、説明が読みにくい、切れる、横overflowする。
  - 画像領域が正方形や極端な縦長へ変わり、人物紹介としてのバランスを失う。
  - 個別画像の代替テキスト、fallback、左右交互の順序が崩れる。

## Generation source

- prototype or generator source: build後の`/-local/npc-cards/`のactual implementation screenshot。
- route when applicable: `/-local/npc-cards/`
- viewport: desktop `1440x1200`、mobile `390x900`。いずれもviewport captureでありfull-pageではない。
- prototype path / prompt summary / capture notes:
  - `tests/visual/npc-card.spec.ts` が、`/-local/npc-cards/` のactual screenshotを以下へ出力する。
    - `test-results/visual/npc-card-desktop.png`
    - `test-results/visual/npc-card-mobile.png`

## Canonicalization rationale

- user approval: `デザイン正本化。ワールドガイドとローカル用のNPCカード用ページ。`（2026-07-22）。
- `design-desktop.png` と `design-mobile.png` は、`test-results/visual/npc-card-desktop.png` と `test-results/visual/npc-card-mobile.png`から、ユーザー承認後に置き換えたactual implementation screenshotである。
- 旧正本との差分は、個別NPC画像、セリフ、グループごとの左右交互配置である。横長1列、`4:5`画像領域、二つ名のruby / 文字色、shadowなしの方針は維持する。
- 今後のVisual Reviewでは、`docs/design/npc-card/design-desktop.png` と `design-mobile.png` をNpcCardの比較基準とする。

## Open questions

- mobileでも左右交互を維持する。実ユーザーから読みにくさの指摘が出た場合は、画像位置の統一を別taskで検討する。
