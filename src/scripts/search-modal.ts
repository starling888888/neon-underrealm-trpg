type SearchElements = {
  panel: HTMLElement;
  scrim: HTMLButtonElement;
  desktopInput: HTMLInputElement;
  mobileInput: HTMLInputElement;
  mobileToggle: HTMLButtonElement;
  mobileForm: HTMLFormElement;
  resultsStatus: HTMLParagraphElement;
  resultsList: HTMLOListElement;
};

type PagefindSubResult = {
  excerpt: string;
  url: string;
  title: string;
  plain_excerpt: string;
};

type PagefindResultData = {
  excerpt: string;
  url: string;
  meta: Record<string, string | undefined>;
  plain_excerpt: string;
  sub_results: PagefindSubResult[];
};

type PagefindSearchResult = {
  data: () => Promise<PagefindResultData>;
};

type PagefindSearchResponse = {
  results: PagefindSearchResult[];
};

type PagefindApi = {
  options: (options: {
    bundlePath: string;
    highlightParam: string;
  }) => Promise<void> | void;
  init: () => Promise<void> | void;
  debouncedSearch: (term: string) => Promise<PagefindSearchResponse | null>;
};

type SearchResultItem = {
  excerptHtml: string;
  pageTitle: string;
  sectionTitle: string | null;
  typeLabel: string;
  url: string;
};

type OverlayChangeDetail = {
  source: "mobile-menu" | "mobile-page-toc" | "search";
  isOpen: boolean;
};

const layoutOverlayChangeEvent = "layout-overlay-change";
const initializedAttribute = "data-search-initialized";
const mobileMediaQuery = "(width < 48rem)";
const searchHighlightParam = "highlight";
const oneCharacterSearchPattern = /^[ぁ-ゖゝゞァ-ヺヽヾーA-Za-z]$/u;
let pagefindPromise: Promise<PagefindApi> | undefined;
let searchRequestId = 0;

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
  const mobileForm = document.querySelector<HTMLFormElement>(
    "[data-search-mobile-form]",
  );
  const resultsStatus = document.querySelector<HTMLParagraphElement>(
    "[data-search-results-status]",
  );
  const resultsList = document.querySelector<HTMLOListElement>(
    "[data-search-results-list]",
  );

  if (
    !panel ||
    !scrim ||
    !desktopInput ||
    !mobileInput ||
    !mobileToggle ||
    !mobileForm ||
    !resultsStatus ||
    !resultsList
  ) {
    return null;
  }

  return {
    panel,
    scrim,
    desktopInput,
    mobileInput,
    mobileToggle,
    mobileForm,
    resultsStatus,
    resultsList,
  };
}

function getBasePath(): string {
  const basePath = import.meta.env.BASE_URL;
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function getPagefindPath(): string {
  return `${getBasePath()}pagefind/`;
}

async function loadPagefind(): Promise<PagefindApi> {
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      const bundlePath = getPagefindPath();
      const pagefind = (await import(
        /* @vite-ignore */ `${bundlePath}pagefind.js`
      )) as PagefindApi;

      await pagefind.options({
        bundlePath,
        highlightParam: searchHighlightParam,
      });
      await pagefind.init();
      return pagefind;
    })();
  }

  return pagefindPromise;
}

function preloadPagefind(): void {
  void loadPagefind().catch(() => {
    // Search input reports a loading failure only when the user enters a query.
  });
}

function normalizeSearchResultUrl(url: string): string | null {
  const basePath = getBasePath();

  try {
    const target = new URL(url, new URL(basePath, window.location.origin));

    if (target.origin !== window.location.origin) {
      return null;
    }

    if (!target.pathname.startsWith(basePath)) {
      target.pathname = `${basePath}${target.pathname.replace(/^\/+/, "")}`;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}

function renderStatus(elements: SearchElements, message: string): void {
  elements.panel.removeAttribute("data-search-has-results");
  elements.resultsList.hidden = true;
  elements.resultsList.replaceChildren();
  elements.resultsStatus.hidden = false;
  elements.resultsStatus.textContent = message;
}

function createTextElement(
  tagName: "p" | "span" | "strong",
  className: string,
  text: string,
): HTMLElement {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createExcerptElement(excerptHtml: string): HTMLParagraphElement {
  const excerpt = document.createElement("p");
  excerpt.className = "search-result-excerpt";
  // Pagefind encodes the excerpt content before inserting its own <mark> tags.
  excerpt.innerHTML = excerptHtml;
  return excerpt;
}

function renderResults(
  elements: SearchElements,
  results: SearchResultItem[],
): void {
  elements.resultsStatus.hidden = true;
  elements.panel.setAttribute("data-search-has-results", "true");
  elements.resultsList.replaceChildren();

  for (const result of results) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    const meta = document.createElement("span");

    link.className = "search-result-link";
    link.href = result.url;
    meta.className = "search-result-meta";
    meta.append(
      createTextElement("span", "search-result-type", result.typeLabel),
      createTextElement("span", "search-result-page-title", result.pageTitle),
    );
    link.append(
      meta,
      createTextElement("strong", "search-result-title", result.pageTitle),
    );

    if (result.sectionTitle) {
      link.append(
        createTextElement("span", "search-result-section", result.sectionTitle),
      );
    }

    link.append(createExcerptElement(result.excerptHtml));
    listItem.append(link);
    elements.resultsList.append(listItem);
  }

  elements.resultsList.hidden = false;
}

function collectSearchResultItems(
  results: PagefindSearchResult[],
): Promise<SearchResultItem[]> {
  const items: SearchResultItem[] = [];

  return Promise.all(results.map((result) => result.data())).then((pages) => {
    for (const page of pages) {
      const pageTitle = page.meta.title?.trim() || "無題のページ";
      const typeLabel = page.meta.type?.trim() || "本文";
      const subResults =
        page.sub_results.length > 0
          ? page.sub_results
          : [
              {
                excerpt: page.excerpt,
                url: page.url,
                title: pageTitle,
                plain_excerpt: page.plain_excerpt,
              },
            ];

      for (const subResult of subResults) {
        const url = normalizeSearchResultUrl(subResult.url);

        if (!url) {
          continue;
        }

        const sectionTitle = subResult.title.trim();
        items.push({
          url,
          pageTitle,
          sectionTitle: sectionTitle === pageTitle ? null : sectionTitle,
          typeLabel,
          excerptHtml: subResult.excerpt.trim(),
        });
      }
    }

    return items;
  });
}

async function search(elements: SearchElements, term: string): Promise<void> {
  const requestId = ++searchRequestId;
  const query = term.trim().normalize("NFKC");
  const compactQuery = query.replace(/\s/gu, "");

  if (!query) {
    renderStatus(elements, "キーワードを入力すると検索結果を表示します。");
    return;
  }

  if (oneCharacterSearchPattern.test(compactQuery)) {
    renderStatus(
      elements,
      "ひらがな、カタカナ、英字は2文字以上で入力してください。",
    );
    return;
  }

  renderStatus(elements, "検索しています…");

  try {
    const pagefind = await loadPagefind();
    const response = await pagefind.debouncedSearch(query);

    if (requestId !== searchRequestId || response === null) {
      return;
    }

    const items = await collectSearchResultItems(response.results);

    if (requestId !== searchRequestId) {
      return;
    }

    if (items.length === 0) {
      renderStatus(elements, "一致する検索結果はありません。");
      return;
    }

    renderResults(elements, items);
  } catch {
    if (requestId === searchRequestId) {
      renderStatus(
        elements,
        "検索indexを読み込めませんでした。時間をおいて再度お試しください。",
      );
    }
  }
}

function synchronizeInputs(
  elements: SearchElements,
  source: HTMLInputElement,
): void {
  const value = source.value;
  elements.desktopInput.value = value;
  elements.mobileInput.value = value;
  void search(elements, value);
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
  document.body.classList.toggle("search-open", isOpen);
  dispatchOverlayChange(isOpen);

  if (!shouldFocus) {
    return;
  }

  if (isOpen) {
    preloadPagefind();
    (isMobile ? elements.mobileInput : elements.desktopInput).focus();
    return;
  }

  if (isMobile) {
    elements.mobileToggle.focus();
    return;
  }

  elements.desktopInput.blur();
}

export function setupSearchHighlight(): void {
  if (!new URLSearchParams(window.location.search).has(searchHighlightParam)) {
    return;
  }

  void import(
    /* @vite-ignore */ `${getPagefindPath()}pagefind-highlight.js`
  ).then(({ default: PagefindHighlight }) => {
    new PagefindHighlight({
      highlightParam: searchHighlightParam,
      markContext: "[data-pagefind-body]",
      addStyles: false,
    });
  });
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
    if (!window.matchMedia(mobileMediaQuery).matches) {
      setOpen(elements, true, false);
      preloadPagefind();
    }
  });

  elements.desktopInput.addEventListener("input", () => {
    synchronizeInputs(elements, elements.desktopInput);
  });

  elements.mobileInput.addEventListener("input", () => {
    synchronizeInputs(elements, elements.mobileInput);
  });

  elements.mobileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    synchronizeInputs(elements, elements.mobileInput);
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
