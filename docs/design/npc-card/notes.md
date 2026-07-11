# npc-card

## Mode

- design fix
- 承認済みの`NpcCard`実装を、ユーザー指示によりdesign正本として採用した。

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
  - カードは横長1列とし、左に人物画像領域、右に二つ名と名前と説明を置く。
  - これは世界観本文の人物紹介であり、プロフィール画面、一覧検索画面、ゲーム用ステータスカードにはしない。
- layout direction:
  - 各カードは内容に応じた標準サイズとし、viewportの幅や高さを埋めるために引き伸ばさない。
  - desktop / mobileとも横長カード1列とし、ページ全体のfull-page画像にはしない。
  - 人物画像領域は左固定の`4:5`とする。正方形ではなく、わずかに縦長の人物向け比率である。
  - 画像領域には当面、共通のシンプルな人物アイコンだけを置く。個別NPC画像を描かない。
- typography direction:
  - 二つ名がある場合は、`<ruby>` / `<rt>` の二つ名を名前と異なる控えめな青緑寄りの文字色で、名前の直前に続ける。斜体にはしない。
  - 二つ名がない場合は、余白用の欄やダミーを作らず、名前から表示する。
  - 名前はカード内でもっとも識別しやすい文字とし、説明は本文と同程度の読みやすい密度にする。
- color / accent usage:
  - 二つ名だけには、名前と区別できる控えめな青緑寄りの文字色を使う。リンクやfocusの状態色と誤認しない程度に彩度と明度を抑え、カードを色やneonで強く分類しない。
  - 人物アイコンはtext mutedとsurface mutedの範囲で扱い、カード本文より目立たせない。

## Existing design constraints

- `global-styles` の白寄り背景、暗めの文字色、低彩度border、控えめな青緑accent、system font、実務的な情報密度を維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageToc、MobilePageTocの構造を変更しない。正本画像は既存site layoutを含むが、これらはNpcCard taskで再設計しない。
- `NpcCard` はMDX内の静的propsで使う本文Componentであり、データ一覧用の汎用カード、検索結果、フィルタUIにはしない。
- 人物アイコンは装飾であり、名前と説明と同じアクセシブルな名前を重複して持たせない。

## Out of scope

- 個別NPCの肖像、顔写真、生成画像、`public/assets/images/npc/` への画像配置
- Excel、JSON、schema、取得層、一覧ページ、詳細ページ、カード一覧Component
- NPCの能力値、GM専用情報、エネミーデータ、シナリオ情報
- 検索、フィルタ、並べ替え、ページネーション、カードクリック時の詳細遷移
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- shadow、強いneon glow、gradient、黒背景主体のcyberpunk UI

## Comparison points for implementation

- desktop / mobileともカードが横長で、人物アイコン、二つ名と名前、説明の順が視認できる。
- 画像領域が左の`4:5`を保ち、個別NPC画像を使わず共通人物アイコンになっている。
- 二つ名はある場合だけルビ付きの控えめな青緑寄りの文字色で名前の直前に続き、斜体にしない。二つ名がない場合は名前から始まる。
- desktop / mobileの横長1列で、説明の可読性、画像比率、余白、横overflowを確認できる。
- カードは内容に応じた標準サイズであり、画面高や列高を埋めるために不自然に伸びない。
- borderと余白で本文カードとして区別でき、shadowや派手な色で別サイトのUIに見えない。
- reviewが必要な差分:
  - mobileの横長カードで、説明が読みにくい、切れる、横overflowする。
  - 画像領域が正方形や極端な縦長へ変わり、人物紹介としてのバランスを失う。
  - 個別NPC画像、データ機能、詳細導線、検索UIが混入する。

## Generation source

- prototype or generator source: `.tmp/design/npc-card/prototype.html` と `.tmp/design/npc-card/capture.mjs` を作成し、Playwrightでcaptureした。
- source branch / commit when applicable: `21-2-world-page` / `fc79074`
- route when applicable: `/-local/npc-cards/`
- viewport: desktop `1440x1200`、mobile `390x900`。いずれもviewport captureでありfull-pageではない。
- prototype path / prompt summary / capture notes:
  - `.tmp/design/npc-card/prototype.html` は、共通のシンプルな人物アイコン、二つ名と名前、説明だけを持つ独立したHTML / CSS prototypeである。実サイトのComponentやrouteを読み込まない。
  - `.tmp/design/npc-card/capture.mjs` を `node .tmp/design/npc-card/capture.mjs` で実行し、以下のinitial draftを作成した。
    - `design-desktop.png`
    - `design-mobile.png`
  - initial draftはactual implementation screenshotではない。`/world` 実装のVisual Reviewやdesign正本化は行っていない。
  - `tests/visual/npc-card.spec.ts` が、`/-local/npc-cards/` のactual screenshotを以下へ出力した。
    - `test-results/visual/npc-card-desktop.png`
    - `test-results/visual/npc-card-mobile.png`

## Canonicalization rationale

- user approval: `actualを正本としてコピーしてあげて`（2026-07-12）。
- `design-desktop.png` と `design-mobile.png` は、`test-results/visual/npc-card-desktop.png` と `test-results/visual/npc-card-mobile.png` から、ユーザー承認後に置き換えたactual implementation screenshotである。
- initial draftとの差分は、既存Header、Footer、desktop SiteMenu、mobile Header操作枠、カタログ見出し、実際のpage gutterを含む点である。`NpcCard`本体の横長1列、左側4:5人物領域、二つ名のruby / 文字色、shadowなしの方針は維持している。
- 今後のVisual Reviewでは、`docs/design/npc-card/design-desktop.png` と `design-mobile.png` をNpcCardの比較基準とする。

## Open questions

- なし。横長1列と左側`4:5`人物画像領域をNpcCardのdesign正本とする。
