const mobileHeaderHiddenClass = "mobile-header-hidden";
const headerHiddenClass = "is-hidden";
const mobileMediaQuery = "(width < 48rem)";
const layoutOverlayChangeEvent = "layout-overlay-change";

function hasOpenLayoutOverlay(): boolean {
  const menuDrawer = document.getElementById("mobile-site-menu-drawer");

  if (menuDrawer && !menuDrawer.hidden) {
    return true;
  }

  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-mobile-page-toc-panel]"),
  ).some((panel) => !panel.hidden);
}

function setHeaderHidden(header: HTMLElement, isHidden: boolean): void {
  header.classList.toggle(headerHiddenClass, isHidden);
  document.body.classList.toggle(mobileHeaderHiddenClass, isHidden);
}

export function setupMobileHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-site-header]");

  if (!header) {
    return;
  }

  const mobileMedia = window.matchMedia(mobileMediaQuery);
  let previousScrollY = window.scrollY;
  let pendingAnimationFrame: number | undefined;

  const updateHeader = () => {
    pendingAnimationFrame = undefined;
    const currentScrollY = Math.max(window.scrollY, 0);

    if (!mobileMedia.matches) {
      setHeaderHidden(header, false);
      previousScrollY = currentScrollY;
      return;
    }

    if (currentScrollY <= 0 || hasOpenLayoutOverlay()) {
      setHeaderHidden(header, false);
    } else if (currentScrollY > previousScrollY) {
      setHeaderHidden(header, true);
    } else if (currentScrollY < previousScrollY) {
      setHeaderHidden(header, false);
    }

    previousScrollY = currentScrollY;
  };

  const requestUpdate = () => {
    if (pendingAnimationFrame !== undefined) {
      return;
    }

    pendingAnimationFrame = window.requestAnimationFrame(updateHeader);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener(layoutOverlayChangeEvent, requestUpdate);
  mobileMedia.addEventListener("change", requestUpdate);
  updateHeader();
}
