type MobileMenuElements = {
  drawer: HTMLElement;
  panel: HTMLElement;
  openButton: HTMLButtonElement;
  closeButtons: NodeListOf<HTMLButtonElement>;
  focusableElements: () => HTMLElement[];
};

type OverlayChangeDetail = {
  source: "mobile-menu" | "mobile-page-toc" | "search";
  isOpen: boolean;
};

const layoutOverlayChangeEvent = "layout-overlay-change";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getElements(): MobileMenuElements | null {
  const drawer = document.getElementById("mobile-site-menu-drawer");
  const panel = drawer?.querySelector<HTMLElement>(".mobile-menu-panel");
  const openButton = document.querySelector<HTMLButtonElement>(
    "[data-mobile-menu-open]",
  );

  if (!drawer || !panel || !openButton) {
    return null;
  }

  return {
    drawer,
    panel,
    openButton,
    closeButtons: drawer.querySelectorAll<HTMLButtonElement>(
      "[data-mobile-menu-close]",
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

function setOpen(elements: MobileMenuElements, isOpen: boolean): void {
  elements.drawer.hidden = !isOpen;
  elements.openButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("mobile-menu-open", isOpen);
  window.dispatchEvent(
    new CustomEvent(layoutOverlayChangeEvent, {
      detail: { source: "mobile-menu", isOpen },
    }),
  );

  if (isOpen) {
    const [firstFocusable] = elements.focusableElements();
    firstFocusable?.focus();
    return;
  }

  elements.openButton.focus();
}

function handleTabKey(
  event: KeyboardEvent,
  elements: MobileMenuElements,
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
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

export function setupMobileMenu(): void {
  const elements = getElements();

  if (!elements) {
    return;
  }

  elements.openButton.addEventListener("click", () => {
    setOpen(elements, Boolean(elements.drawer.hidden));
  });

  elements.closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setOpen(elements, false);
    });
  });

  elements.drawer.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof HTMLAnchorElement) {
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

  window.matchMedia("(width >= 48rem)").addEventListener("change", (event) => {
    if (event.matches && !elements.drawer.hidden) {
      setOpen(elements, false);
    }
  });

  window.addEventListener(layoutOverlayChangeEvent, (event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as OverlayChangeDetail | undefined;

    if (
      detail?.source === "search" &&
      detail.isOpen &&
      !elements.drawer.hidden
    ) {
      setOpen(elements, false);
    }
  });
}
