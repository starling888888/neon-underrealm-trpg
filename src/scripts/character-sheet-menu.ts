type CharacterSheetMenuElements = {
  drawer: HTMLElement;
  panel: HTMLElement;
  openButtons: NodeListOf<HTMLButtonElement>;
  closeButtons: NodeListOf<HTMLButtonElement>;
  focusableElements: () => HTMLElement[];
};

const tabletMediaQuery = "(width >= 48rem) and (width < 80rem)";
const layoutOverlayChangeEvent = "layout-overlay-change";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getElements(): CharacterSheetMenuElements | null {
  const drawer = document.getElementById("character-sheet-site-menu-drawer");
  const panel = drawer?.querySelector<HTMLElement>(
    ".character-sheet-menu-panel",
  );
  const openButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-character-sheet-menu-open]",
  );

  if (!drawer || !panel || !openButtons.length) {
    return null;
  }

  return {
    drawer,
    panel,
    openButtons,
    closeButtons: drawer.querySelectorAll<HTMLButtonElement>(
      "[data-character-sheet-menu-close]",
    ),
    focusableElements: () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("tabindex") !== "-1" &&
          element.offsetParent !== null,
      ),
  };
}

function setOpen(elements: CharacterSheetMenuElements, isOpen: boolean): void {
  elements.drawer.hidden = !isOpen;
  elements.openButtons.forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
  document.body.classList.toggle("character-sheet-menu-open", isOpen);

  if (isOpen) {
    const [firstFocusable] = elements.focusableElements();
    firstFocusable?.focus();
    return;
  }

  elements.openButtons.forEach((button) => {
    if (button.offsetParent !== null) {
      button.focus();
    }
  });
}

function handleTabKey(
  event: KeyboardEvent,
  elements: CharacterSheetMenuElements,
): void {
  if (event.key !== "Tab" || elements.drawer.hidden) {
    return;
  }

  const focusableElements = elements.focusableElements();

  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

export function setupCharacterSheetMenu(): void {
  const elements = getElements();

  if (!elements) {
    return;
  }

  elements.openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setOpen(elements, elements.drawer.hasAttribute("hidden"));
    });
  });

  elements.closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setOpen(elements, false);
    });
  });

  elements.drawer.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(elements, false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.drawer.hidden) {
      setOpen(elements, false);
      return;
    }

    handleTabKey(event, elements);
  });

  window.matchMedia(tabletMediaQuery).addEventListener("change", (event) => {
    if (event.matches && !elements.drawer.hidden) {
      setOpen(elements, false);
    }
  });

  window.addEventListener(layoutOverlayChangeEvent, (event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as { source?: string; isOpen?: boolean };

    if (
      detail.source === "search" &&
      detail.isOpen &&
      !elements.drawer.hidden
    ) {
      setOpen(elements, false);
    }
  });
}
