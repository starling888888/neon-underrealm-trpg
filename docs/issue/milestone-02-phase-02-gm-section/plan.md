# milestone-02-phase-02-gm-section Gate plan

## 親issue

- `docs/issue/milestone-02-phase-02-gm-section.md`

## Gate一覧

| Gate | 状態    | 依存Gate | 子issue                                                             | 概要                                                                                    |
| ---- | ------- | -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| G1   | done    | なし     | milestone-02-phase-02-gm-section-g01-gm-guide — GitHub Issue #194   | —                                                                                       |
| G2   | planned | G1       | `docs/issue/milestone-02-phase-02-gm-section-g02-enemy-data.md`     | 提供後のエネミー入力を用い、4形式の読み方と表示Componentを完成させる。                  |
| G3   | planned | G2       | `docs/issue/milestone-02-phase-02-gm-section-g03-bosses.md`         | ボスデータの作り方と外道スキルの表示を完成させる。                                      |
| G4   | planned | G2       | `docs/issue/milestone-02-phase-02-gm-section-g04-sanshita.md`       | 三下・徒党データの作り方を完成させる。                                                  |
| G5   | planned | G1       | `docs/issue/milestone-02-phase-02-gm-section-g05-campaign-hooks.md` | キャンペーンフックページを完成させる。                                                  |
| G6   | planned | G1〜G5   | `docs/issue/milestone-02-phase-02-gm-section-g06-first-scenario.md` | サンプルシナリオ1本とGMセクション初回公開を完成させ、全canonical screenshotを更新する。 |

状態は`planned`、`in progress`、`done`を使う。

## 運用

- 各Gateの着手時に、最新の親branchから対応する子branchを作成する。子branch名は子issueのslugと一致させる。
- 子branchのPRは親branchをbaseとし、直接`main`へmergeしない。
- G1からG5までの途中成果を公開しない。G6完了後に、親branchから`main`への最終PRを作成する。
- G2の子issueと子branchは、機龍、悪魔ボス、外道スキルの入力がG1完了後に提供されてから作成する。
- Gateの詳細な目的、範囲、完了条件、参照正本、実装判断は、着手時に作成する子issueだけへ記録する。
- G6では最終表示を人間確認した後、全VRT targetのcanonical screenshot更新を作業に含める。途中Gateではcanonical screenshotを更新しない。
