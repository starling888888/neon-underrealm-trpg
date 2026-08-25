// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CharacterSheetAuthentication from "../../../src/character-sheet/components/CharacterSheetAuthentication";
import type { Authentication } from "../../../src/character-sheet/auth/types";

afterEach(cleanup);
const auth = (
  status: Authentication["status"],
  sessionKey = status === "signed-in" ? "uid" : null,
): Authentication => ({
  getIdToken: async () => null,
  onLogin: async () => {},
  onLogout: async () => {},
  sessionKey,
  status,
});
describe("CharacterSheetAuthentication", () => {
  for (const [status, label] of [
    ["initializing", "ログイン状態を確認しています。"],
    ["signed-out", "Googleでログイン"],
    ["signing-in", "ログイン中…"],
    ["signed-in", "ログアウト"],
    ["error", "Googleでログイン"],
  ] as const) {
    it(`renders ${status} state`, () => {
      render(<CharacterSheetAuthentication authentication={auth(status)} />);
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    });
  }
  it("keeps the logout action for an authenticated error state", () => {
    render(
      <CharacterSheetAuthentication authentication={auth("error", "uid")} />,
    );
    expect(screen.getByRole("button", { name: "ログアウト" })).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
