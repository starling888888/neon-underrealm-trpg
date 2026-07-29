// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ClearButton from "../../../src/character-sheet/components/ClearButton";
import DeleteButton from "../../../src/character-sheet/components/DeleteButton";

afterEach(cleanup);

describe("character-sheet action buttons", () => {
  it("keeps clear actions icon-only while exposing their accessible name and callback", () => {
    const onClick = vi.fn();

    render(<ClearButton ariaLabel="縁1をクリア" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "縁1をクリア" });
    expect(button.dataset.characterSheetAction).toBe("clear");
    expect(button.querySelector("svg")).not.toBeNull();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders delete actions as disabled icon-only controls when requested", () => {
    const onClick = vi.fn();

    render(
      <DeleteButton ariaLabel="画像をクリア" disabled onClick={onClick} />,
    );

    const button = screen.getByRole("button", { name: "画像をクリア" });
    expect(button.dataset.characterSheetAction).toBe("delete");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button).toHaveProperty("disabled", true);

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("accepts a warning color for category deletion without adding a button fill", () => {
    render(
      <DeleteButton ariaLabel="専用アイテムカテゴリを削除" color="warning" />,
    );

    const button = screen.getByRole("button", {
      name: "専用アイテムカテゴリを削除",
    });
    expect(button.className).toContain("warning");
    expect(button.className).toContain("delete");
  });
});
