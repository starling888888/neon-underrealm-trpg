# ex-16-character-sheet-cloud-persistence Gate plan

## 親issue

- `docs/issue/ex-16-character-sheet-cloud-persistence.md`

## Gate一覧

| Gate | 状態    | 依存Gate   | 子issue                                        | 概要                                                                                     |
| ---- | ------- | ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| G1   | planned | なし       | `docs/issue/ex-16-1-workspace-foundation.md`   | Workspace化、frontend移動、shared packageの境界、関連SSoTの基盤を整える。                |
| G2   | planned | G1         | `docs/issue/ex-16-2-backend-infrastructure.md` | Worker、D1、R2、Terraform、backendの独立CI/CD基盤を整える。                              |
| G3   | planned | G1, G2     | `docs/issue/ex-16-3-google-authentication.md`  | ユーザー作成済みGIS clientを入力に、login/logout、認証状態、ID Token検証の境界を整える。 |
| G4   | planned | G1, G2, G3 | `docs/issue/ex-16-4-cloud-persistence-api.md`  | Shared API contract、D1/R2 API、metadata、所有権を実装する。                             |
| G5   | planned | G1, G3, G4 | `docs/issue/ex-16-5-cloud-persistence-ui.md`   | design前提を満たし、選択、read-only、DB保存/削除を統合する。                             |
