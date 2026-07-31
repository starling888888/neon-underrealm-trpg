// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import CharacterSheetLoadingOverlay from "../../../src/character-sheet/components/CharacterSheetLoadingOverlay";
import CharacterImageErrorDialog from "../../../src/character-sheet/components/dialogs/CharacterImageErrorDialog";

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    close: {
      configurable: true,
      value() {
        this.open = false;
      },
    },
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
  });
});

afterEach(cleanup);

describe("CharacterImageErrorDialog", () => {
  it("maps an image error code inside the dedicated dialog component", () => {
    render(
      <CharacterImageErrorDialog
        closeButtonRef={createRef<HTMLButtonElement>()}
        errorCode="storage"
        onRequestClose={() => {}}
        returnFocusRef={createRef<HTMLButtonElement>()}
      />,
    );

    expect(screen.getByRole("dialog")).not.toBeNull();
    expect(
      screen.getByText("画像を保存できませんでした。もう一度お試しください。"),
    ).not.toBeNull();
  });
});

describe("CharacterSheetLoadingOverlay", () => {
  it("renders the caller-provided operation label without image-specific copy", () => {
    render(<CharacterSheetLoadingOverlay isOpen label="保存しています" />);

    expect(
      screen.getByRole("status", { name: "保存しています" }),
    ).not.toBeNull();
  });
});
