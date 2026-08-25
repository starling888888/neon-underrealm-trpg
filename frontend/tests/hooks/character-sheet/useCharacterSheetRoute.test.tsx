// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import useCharacterSheetRoute from "../../../src/character-sheet/hooks/useCharacterSheetRoute";

const initialPath = "/neon-underrealm-trpg/character-sheet/";

afterEach(() => window.history.replaceState(null, "", initialPath));

describe("useCharacterSheetRoute", () => {
  it("reads the remote character identity from the query parameter", () => {
    window.history.replaceState(null, "", `${initialPath}?character=remote-a`);

    const { result } = renderHook(() => useCharacterSheetRoute());

    expect(result.current.remoteCharacterId).toBe("remote-a");
  });

  it("updates only the query parameter while preserving the deployment subpath", () => {
    const { result } = renderHook(() => useCharacterSheetRoute());

    act(() => result.current.navigate("remote-a"));

    expect(result.current.remoteCharacterId).toBe("remote-a");
    expect(window.location.pathname).toBe(
      "/neon-underrealm-trpg/character-sheet/",
    );
    expect(window.location.search).toBe("?character=remote-a");

    act(() => result.current.navigate(null));

    expect(result.current.remoteCharacterId).toBeNull();
    expect(window.location.pathname).toBe(
      "/neon-underrealm-trpg/character-sheet/",
    );
    expect(window.location.search).toBe("");
  });

  it("follows browser history navigation", () => {
    const { result } = renderHook(() => useCharacterSheetRoute());
    window.history.pushState(null, "", `${initialPath}?character=remote-b`);

    act(() => window.dispatchEvent(new PopStateEvent("popstate")));

    expect(result.current.remoteCharacterId).toBe("remote-b");
  });
});
