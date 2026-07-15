type MobilePageTocElements = {
  root: HTMLElement;
  trigger: HTMLButtonElement;
  panel: HTMLElement;
};

const initializedAttribute = "data-mobile-page-toc-initialized";
const layoutOverlayChangeEvent = "layout-overlay-change";
const mobilePageHeadingHeightVariable = "--mobile-page-heading-height";

function syncMobilePageHeadingHeight(): void {
  const heading = document.querySelector<HTMLElement>(
    "[data-mobile-page-heading]",
  );

  if (!heading) {
    document.documentElement.style.removeProperty(
      mobilePageHeadingHeightVariable,
    );
    return;
  }

  const updateHeight = () => {
    document.documentElement.style.setProperty(
      mobilePageHeadingHeightVariable,
      `${Math.ceil(heading.getBoundingClientRect().height)}px`,
    );
  };

  new ResizeObserver(updateHeight).observe(heading);
  updateHeight();
}

function setOpen(elements: MobilePageTocElements, isOpen: boolean): void {
  elements.panel.hidden = !isOpen;
  elements.root.classList.toggle("is-open", isOpen);
  elements.trigger.setAttribute("aria-expanded", String(isOpen));
  elements.trigger.setAttribute(
    "aria-label",
    isOpen ? "このページの目次を閉じる" : "このページの目次を開く",
  );
  window.dispatchEvent(new Event(layoutOverlayChangeEvent));
}

function closeAllExcept(currentRoot?: HTMLElement): void {
  document
    .querySelectorAll<HTMLElement>("[data-mobile-page-toc]")
    .forEach((root) => {
      if (currentRoot && root === currentRoot) {
        return;
      }

      const trigger = root.querySelector<HTMLButtonElement>(
        "[data-mobile-page-toc-trigger]",
      );
      const panel = root.querySelector<HTMLElement>(
        "[data-mobile-page-toc-panel]",
      );

      if (trigger && panel) {
        setOpen({ root, trigger, panel }, false);
      }
    });
}

function createElements(root: HTMLElement): MobilePageTocElements | null {
  const trigger = root.querySelector<HTMLButtonElement>(
    "[data-mobile-page-toc-trigger]",
  );
  const panel = root.querySelector<HTMLElement>("[data-mobile-page-toc-panel]");

  if (!trigger || !panel) {
    return null;
  }

  return { root, trigger, panel };
}

export function setupMobilePageToc(): void {
  syncMobilePageHeadingHeight();

  document
    .querySelectorAll<HTMLElement>("[data-mobile-page-toc]")
    .forEach((root) => {
      if (root.hasAttribute(initializedAttribute)) {
        return;
      }

      const elements = createElements(root);

      if (!elements) {
        return;
      }

      root.setAttribute(initializedAttribute, "true");

      elements.trigger.addEventListener("click", () => {
        const shouldOpen = elements.panel.hidden === true;
        closeAllExcept(root);
        setOpen(elements, shouldOpen);
      });

      elements.panel.addEventListener("click", (event) => {
        const target = event.target;

        if (target instanceof Element && target.closest("a[href]")) {
          setOpen(elements, false);
        }
      });
    });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-mobile-menu-open]")
    ) {
      closeAllExcept();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeAllExcept();
  });

  window
    .matchMedia("(min-width: 64rem)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        closeAllExcept();
      }
    });
}
