type JsonDownloadDependencies = {
  createAnchor: () => HTMLAnchorElement;
  createObjectUrl: (blob: Blob) => string;
  revokeObjectUrl: (url: string) => void;
};

const defaultDependencies: JsonDownloadDependencies = {
  createAnchor: () => document.createElement("a"),
  createObjectUrl: (blob) => URL.createObjectURL(blob),
  revokeObjectUrl: (url) => URL.revokeObjectURL(url),
};

/** Triggers a browser-native JSON file save without retaining an object URL. */
export function downloadJsonFile(
  json: string,
  filename: string,
  dependencies: JsonDownloadDependencies = defaultDependencies,
): void {
  const url = dependencies.createObjectUrl(
    new Blob([json], { type: "application/json;charset=utf-8" }),
  );

  try {
    const anchor = dependencies.createAnchor();

    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    dependencies.revokeObjectUrl(url);
  }
}
