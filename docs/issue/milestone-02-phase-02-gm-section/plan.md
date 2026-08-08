# milestone-02-phase-02-gm-section Gate plan

## 親issue

- `docs/issue/milestone-02-phase-02-gm-section.md`

## Gate一覧

| Gate | 状態    | 依存Gate | 子issue                                                                    | 概要                                                                              |
| ---- | ------- | -------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| G1   | done    | なし     | milestone-02-phase-02-gm-section-g01-gm-guide — GitHub Issue #194          | —                                                                                 |
| G2   | planned | G1       | `docs/issue/milestone-02-phase-02-gm-section-g02-enemies.md`               | `/enemies/`でエネミー種別を説明し、ボスと三下・徒党の詳細ページへ案内する。       |
| G3   | planned | G2       | `docs/issue/milestone-02-phase-02-gm-section-g03-enemy-bosses.md`          | `/enemies/bosses/`でボスのデータの読み方、表示Component、外道スキルを完成させる。 |
| G4   | planned | G3       | `docs/issue/milestone-02-phase-02-gm-section-g04-enemy-sanshita.md`        | `/enemies/sanshita/`で三下・徒党のデータの読み方と表示Componentを完成させる。     |
| G5   | planned | G4       | `docs/issue/milestone-02-phase-02-gm-section-g05-sample-scenarios.md`      | `/sample-scenarios/`で公開済みサンプルシナリオの一覧を完成させる。                |
| G6   | planned | G5       | `docs/issue/milestone-02-phase-02-gm-section-g06-first-sample-scenario.md` | `/sample-scenarios/{scenario-slug}/`で最初のサンプルシナリオ1本を完成させる。     |
| G7   | planned | G6       | `docs/issue/milestone-02-phase-02-gm-section-g07-final-review.md`          | 公開対象全体の最終確認、必要なVRT更新、親branchの公開準備を完了させる。           |

状態は`planned`、`in progress`、`done`を使う。

## 運用

- 各Gateの着手時に、最新の親branchから対応する子branchを作成する。子branch名は子issueのslugと一致させる。
- 子branchのPRは親branchをbaseとし、直接`main`へmergeしない。
- G1からG6までの途中成果を公開しない。G7で公開対象の最終確認を完了した後に、親branchから`main`への最終PRを作成する。
- G3の子issueと子branchは、機龍、悪魔ボス、外道スキルの入力がG1完了後に提供されてから作成する。
- Gateの詳細な目的、範囲、完了条件、参照正本、実装判断は、着手時に作成する子issueだけへ記録する。
- G5では`/sample-scenarios/`の一覧構造を完成させるが、完成済みシナリオがG6まで存在しないため、G6で最初の一覧項目を追加するまで同routeをサイトメニューへ表示しない。
- G7では最終表示を人間確認した後、全VRT targetのcanonical screenshot更新を作業に含める。途中Gateではcanonical screenshotを更新しない。
