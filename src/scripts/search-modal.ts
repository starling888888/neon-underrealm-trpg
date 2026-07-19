type SearchElements = {
  panel: HTMLElement;
  scrim: HTMLButtonElement;
  desktopInput: HTMLInputElement;
  mobileInput: HTMLInputElement;
  mobileToggle: HTMLButtonElement;
};

type OverlayChangeDetail = {
  source: "mobile-menu" | "mobile-page-toc" | "search";
  isOpen: boolean;
};

const layoutOverlayChangeEvent = "layout-overlay-change";
const initializedAttribute = "data-search-initialized";
const mobileMediaQuery = "(width < 48rem)";
let isRestoringDesktopFocus = false;

function getElements(): SearchElements | null {
  const panel = document.querySelector<HTMLElement>("[data-search-panel]");
  const scrim = document.querySelector<HTMLButtonElement>(
    "[data-search-scrim]",
  );
  const desktopInput = document.querySelector<HTMLInputElement>(
    "[data-search-desktop-input]",
  );
  const mobileInput = document.querySelector<HTMLInputElement>(
    "[data-search-mobile-input]",
  );
  const mobileToggle = document.querySelector<HTMLButtonElement>(
    "[data-search-mobile-toggle]",
  );

  if (!panel || !scrim || !desktopInput || !mobileInput || !mobileToggle) {
    return null;
  }

  return { panel, scrim, desktopInput, mobileInput, mobileToggle };
}

function dispatchOverlayChange(isOpen: boolean): void {
  window.dispatchEvent(
    new CustomEvent<OverlayChangeDetail>(layoutOverlayChangeEvent, {
      detail: { source: "search", isOpen },
    }),
  );
}

function setOpen(
  elements: SearchElements,
  isOpen: boolean,
  shouldFocus = true,
): void {
  const isMobile = window.matchMedia(mobileMediaQuery).matches;

  elements.panel.hidden = !isOpen;
  elements.scrim.hidden = !isOpen;
  elements.desktopInput.setAttribute("aria-expanded", String(isOpen));
  elements.mobileToggle.setAttribute("aria-expanded", String(isOpen));
  elements.mobileToggle.setAttribute(
    "aria-label",
    isOpen ? "検索を閉じる" : "検索を開く",
  );
  document.body.classList.toggle("search-open", isOpen && isMobile);
  dispatchOverlayChange(isOpen);

  if (!shouldFocus) {
    return;
  }

  if (isOpen) {
    (isMobile ? elements.mobileInput : elements.desktopInput).focus();
    return;
  }

  if (isMobile) {
    elements.mobileToggle.focus();
    return;
  }

  isRestoringDesktopFocus = true;
  elements.desktopInput.focus();
  isRestoringDesktopFocus = false;
}

function isOverlayOpening(event: Event): boolean {
  if (!(event instanceof CustomEvent)) {
    return false;
  }

  const detail = event.detail as OverlayChangeDetail | undefined;
  return detail?.source !== "search" && detail?.isOpen === true;
}

export function setupSearchModal(): void {
  const elements = getElements();

  if (!elements || elements.panel.hasAttribute(initializedAttribute)) {
    return;
  }

  elements.panel.setAttribute(initializedAttribute, "true");

  elements.desktopInput.addEventListener("focus", () => {
    if (
      !isRestoringDesktopFocus &&
      !window.matchMedia(mobileMediaQuery).matches
    ) {
      setOpen(elements, true, false);
    }
  });

  elements.mobileToggle.addEventListener("click", () => {
    setOpen(elements, elements.panel.hidden === true);
  });

  elements.scrim.addEventListener("click", () => {
    setOpen(elements, false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.panel.hidden) {
      setOpen(elements, false);
    }
  });

  window.addEventListener(layoutOverlayChangeEvent, (event) => {
    if (!elements.panel.hidden && isOverlayOpening(event)) {
      setOpen(elements, false, false);
    }
  });

  window.matchMedia("(width >= 48rem)").addEventListener("change", (event) => {
    if (event.matches && !elements.panel.hidden) {
      setOpen(elements, true, false);
    }
  });
}
