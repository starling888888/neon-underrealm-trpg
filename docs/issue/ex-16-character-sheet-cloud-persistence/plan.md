# ex-16-character-sheet-cloud-persistence Gate plan

## 親issue

- `docs/issue/ex-16-character-sheet-cloud-persistence.md`

## Gate一覧

| Gate | 状態    | 依存Gate   | 子issue                                            | 概要                                                                             |
| ---- | ------- | ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| G1   | done    | なし       | ex-16-1-workspace-foundation — GitHub Issue #212   |                                                                                  |
| G2   | done    | G1         | ex-16-2-backend-infrastructure — GitHub Issue #214 |                                                                                  |
| G3   | done    | G1, G2     | ex-16-3-google-authentication — GitHub Issue #216  |                                                                                  |
| G4   | done    | G1, G2, G3 | ex-16-4-cloud-persistence-api — GitHub Issue #218  |                                                                                  |
| G5   | done    | G1, G3, G4 | ex-16-5-cloud-persistence-ui — GitHub Issue #220   |                                                                                  |
| G6   | planned | G5         | `docs/issue/ex-16-6-firebase-authentication.md`    | Firebase Authenticationへ置換し、永続認証状態とFirebase ID Token検証へ移行する。 |
