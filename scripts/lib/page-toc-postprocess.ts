import { createHash } from "node:crypto";
import type { DefaultTreeAdapterMap } from "parse5";
import { parse, parseFragment, serialize } from "parse5";

type ChildNode = DefaultTreeAdapterMap["childNode"];
type Document = DefaultTreeAdapterMap["document"];
type Element = DefaultTreeAdapterMap["element"];
type ParentNode = DefaultTreeAdapterMap["parentNode"];
type TextNode = DefaultTreeAdapterMap["textNode"];

export interface PageTocItem {
  depth: 2 | 3;
  id: string;
  text: string;
}

export interface PageTocProcessResult {
  html: string;
  processed: boolean;
  tocItems: PageTocItem[];
  warnings: string[];
}

const ASCII_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const HEADING_TAGS = new Set(["h2", "h3"]);

export function processPageTocHtml(html: string): PageTocProcessResult {
  const document = parse(html);
  const slots = findElements(
    document,
    (element) =>
      hasAttr(element, "data-page-toc-slot") &&
      hasAttrValue(element, "data-page-toc-enabled", "true"),
  );

  if (slots.length === 0) {
    return {
      html,
      processed: false,
      tocItems: [],
      warnings: [],
    };
  }

  const content = findElement(document, (element) =>
    hasAttr(element, "data-page-content"),
  );
  const warnings: string[] = [];

  if (!content) {
    return {
      html,
      processed: false,
      tocItems: [],
      warnings: ["PageToc markers were incomplete."],
    };
  }

  const headings = findElements(content, (element) => {
    return (
      HEADING_TAGS.has(element.tagName) && !hasAttr(element, "data-toc-exclude")
    );
  });
  const tocItems = collectTocItems(headings, warnings);

  if (tocItems.length <= 1) {
    for (const slot of slots) {
      setAttr(slot, "hidden", "");
      setAttr(slot, "data-page-toc-empty", "true");
      replaceChildren(findTocContentElement(slot) ?? slot, []);
    }

    return {
      html: serialize(document),
      processed: true,
      tocItems,
      warnings,
    };
  }

  for (const slot of slots) {
    removeAttr(slot, "hidden");
    removeAttr(slot, "data-page-toc-empty");
    replaceChildren(
      findTocContentElement(slot) ?? slot,
      renderTocNodes(tocItems),
    );
  }

  return {
    html: serialize(document),
    processed: true,
    tocItems,
    warnings,
  };
}

export function createHeadingId(depth: 2 | 3, text: string): string {
  const hashInput = `${depth}|${normalizeHeadingText(text)}`;
  const shortHash = createHash("sha256")
    .update(hashInput)
    .digest("hex")
    .slice(0, 8);
  return `h-${shortHash}`;
}

export function normalizeHeadingText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function collectTocItems(
  headings: Element[],
  warnings: string[],
): PageTocItem[] {
  const usedIds = new Map<string, string>();
  const items: PageTocItem[] = [];

  for (const heading of headings) {
    const depth = Number(heading.tagName.slice(1)) as 2 | 3;
    const text = normalizeHeadingText(getVisibleText(heading));

    if (!text) {
      continue;
    }

    const id = resolveHeadingId(heading, depth, text, warnings);
    const previousText = usedIds.get(id);

    if (previousText) {
      throw new Error(
        `Duplicate PageToc heading id "${id}" generated for "${previousText}" and "${text}". Use data-anchor-id to disambiguate.`,
      );
    }

    usedIds.set(id, text);
    items.push({ depth, id, text });
  }

  return items;
}

function resolveHeadingId(
  heading: Element,
  depth: 2 | 3,
  text: string,
  warnings: string[],
): string {
  const explicitId = getAttr(heading, "data-anchor-id");

  if (explicitId) {
    assertAsciiId(explicitId, "data-anchor-id");
    setAttr(heading, "id", explicitId);
    return explicitId;
  }

  const existingId = getAttr(heading, "id");

  if (existingId) {
    if (!isAsciiId(existingId)) {
      const generatedId = createHeadingId(depth, text);
      warnings.push(
        `Replaced non-ASCII heading id "${existingId}" with "${generatedId}".`,
      );
      setAttr(heading, "id", generatedId);
      return generatedId;
    }

    return existingId;
  }

  const generatedId = createHeadingId(depth, text);
  setAttr(heading, "id", generatedId);
  return generatedId;
}

function assertAsciiId(value: string, label: string): void {
  if (!isAsciiId(value)) {
    throw new Error(
      `Invalid PageToc ${label} "${value}". Use ASCII lower kebab-case.`,
    );
  }
}

function isAsciiId(value: string): boolean {
  return ASCII_ID_PATTERN.test(value);
}

function renderTocNodes(items: PageTocItem[]): ChildNode[] {
  const listItems = items
    .map((item) => {
      const className =
        item.depth === 3
          ? "page-toc-item page-toc-item-depth-3"
          : "page-toc-item";
      return `<li class="${className}"><a class="page-toc-link" href="#${item.id}">${escapeHtml(
        item.text,
      )}</a></li>`;
    })
    .join("");
  const fragment = parseFragment(`<ol class="page-toc-list">${listItems}</ol>`);
  return fragment.childNodes;
}

function findTocContentElement(slot: Element): Element | undefined {
  return findElement(slot, (element) =>
    hasAttr(element, "data-page-toc-content"),
  );
}

function findElement(
  node: ParentNode | ChildNode,
  predicate: (element: Element) => boolean,
): Element | undefined {
  if (isElement(node) && predicate(node)) {
    return node;
  }

  if (!hasChildren(node)) {
    return undefined;
  }

  for (const child of node.childNodes) {
    const found = findElement(child, predicate);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function findElements(
  node: ParentNode | ChildNode,
  predicate: (element: Element) => boolean,
): Element[] {
  const results: Element[] = [];

  if (isElement(node) && predicate(node)) {
    results.push(node);
  }

  if (!hasChildren(node)) {
    return results;
  }

  for (const child of node.childNodes) {
    results.push(...findElements(child, predicate));
  }

  return results;
}

function replaceChildren(parent: Element, children: ChildNode[]): void {
  parent.childNodes = children;

  for (const child of children) {
    child.parentNode = parent;
  }
}

function getVisibleText(element: Element): string {
  return element.childNodes.map((node) => getNodeText(node)).join("");
}

function getNodeText(node: ChildNode): string {
  if (isTextNode(node)) {
    return node.value;
  }

  if (hasChildren(node)) {
    return node.childNodes.map((child) => getNodeText(child)).join("");
  }

  return "";
}

function hasChildren(node: ParentNode | ChildNode): node is ParentNode {
  return "childNodes" in node;
}

function isElement(node: ParentNode | ChildNode): node is Element {
  return "tagName" in node;
}

function isTextNode(node: ChildNode): node is TextNode {
  return node.nodeName === "#text";
}

function hasAttr(element: Element, name: string): boolean {
  return element.attrs.some((attr) => attr.name === name);
}

function hasAttrValue(element: Element, name: string, value: string): boolean {
  return getAttr(element, name) === value;
}

function getAttr(element: Element, name: string): string | undefined {
  return element.attrs.find((attr) => attr.name === name)?.value;
}

function setAttr(element: Element, name: string, value: string): void {
  const attr = element.attrs.find((item) => item.name === name);

  if (attr) {
    attr.value = value;
    return;
  }

  element.attrs.push({ name, value });
}

function removeAttr(element: Element, name: string): void {
  element.attrs = element.attrs.filter((attr) => attr.name !== name);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function parsePageTocDocument(html: string): Document {
  return parse(html);
}
