type ClipboardDependencies = {
  writeText?: (text: string) => Promise<void>;
};

function getBrowserClipboardWriter(): (text: string) => Promise<void> {
  if (typeof navigator === "undefined" || navigator.clipboard === undefined) {
    throw new Error("Clipboard API is unavailable.");
  }

  return navigator.clipboard.writeText.bind(navigator.clipboard);
}

/** Writes a CCFOLIA JSON string through the browser Clipboard API. */
export async function writeTextToClipboard(
  text: string,
  dependencies: ClipboardDependencies = {},
): Promise<void> {
  const writeText = dependencies.writeText ?? getBrowserClipboardWriter();
  await writeText(text);
}
