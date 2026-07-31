import { mkdir, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const GOOGLE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
export const GOOGLE_SPREADSHEET_MIME_TYPE =
  "application/vnd.google-apps.spreadsheet";
export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

interface DriveFile {
  id?: string | null;
  mimeType?: string | null;
  name?: string | null;
}

interface DriveListResponse {
  data: {
    files?: DriveFile[] | null;
    nextPageToken?: string | null;
  };
}

interface DriveExportResponse {
  data: ArrayBuffer | ArrayBufferView | string;
}

export interface GoogleDriveClient {
  list(params: {
    fields: string;
    orderBy: string;
    pageSize: number;
    pageToken?: string;
    q: string;
  }): Promise<DriveListResponse>;
  export(
    params: { fileId: string; mimeType: string },
    options: { responseType: "arraybuffer" },
  ): Promise<DriveExportResponse>;
}

export interface SyncFailure {
  message: string;
  subject: string;
}

export interface SyncGoogleSheetsOptions {
  drive: GoogleDriveClient;
  outputRoot: string;
  rootFolderId: string;
}

export interface SyncGoogleSheetsResult {
  errors: SyncFailure[];
  exportedFiles: string[];
}

export async function syncGoogleSheets(
  options: SyncGoogleSheetsOptions,
): Promise<SyncGoogleSheetsResult> {
  const outputRoot = resolve(options.outputRoot);
  const errors: SyncFailure[] = [];
  const exportedFiles: string[] = [];
  const reservedDirectories = new Map<string, string>();
  const reservedFiles = new Map<string, string>();

  await visitFolder(options.rootFolderId, [], true);

  return { errors, exportedFiles };

  async function visitFolder(
    folderId: string,
    relativeDirectory: string[],
    isRoot: boolean,
  ): Promise<void> {
    let files: DriveFile[];

    try {
      files = await listFolder(folderId);
    } catch (error) {
      if (isRoot) {
        throw error;
      }
      recordFailure(folderId, error);
      return;
    }

    for (const file of files) {
      if (!file.id || !file.name || !file.mimeType) {
        recordFailure(
          file.id ?? file.name ?? folderId,
          new Error("Drive item is missing id, name, or MIME type."),
        );
        continue;
      }

      if (file.mimeType === GOOGLE_FOLDER_MIME_TYPE) {
        const directoryName = toSafeSegment(file.name);
        if (!directoryName) {
          recordFailure(file.name, new Error("Drive folder name is unsafe."));
          continue;
        }

        const nextDirectory = [...relativeDirectory, directoryName];
        const outputDirectory = resolveOutputPath(nextDirectory);
        if (!outputDirectory) {
          recordFailure(file.name, new Error("Output path escapes .raw/."));
          continue;
        }
        if (!reservePath(reservedDirectories, outputDirectory, file.id)) {
          recordFailure(
            file.name,
            new Error("Another Drive folder resolves to the same output path."),
          );
          continue;
        }

        await visitFolder(file.id, nextDirectory, false);
        continue;
      }

      if (file.mimeType !== GOOGLE_SPREADSHEET_MIME_TYPE) {
        continue;
      }

      const spreadsheetName = toSafeSpreadsheetName(file.name);
      if (!spreadsheetName) {
        recordFailure(file.name, new Error("Spreadsheet name is unsafe."));
        continue;
      }

      const outputPath = resolveOutputPath([
        ...relativeDirectory,
        spreadsheetName,
      ]);
      if (!outputPath) {
        recordFailure(file.name, new Error("Output path escapes .raw/."));
        continue;
      }
      if (!reservePath(reservedFiles, outputPath, file.id)) {
        recordFailure(
          file.name,
          new Error(
            "Another Drive spreadsheet resolves to the same output path.",
          ),
        );
        continue;
      }

      try {
        const response = await options.drive.export(
          { fileId: file.id, mimeType: XLSX_MIME_TYPE },
          { responseType: "arraybuffer" },
        );
        await mkdir(resolve(outputPath, ".."), { recursive: true });
        await writeFile(outputPath, toBuffer(response.data));
        exportedFiles.push(outputPath);
      } catch (error) {
        recordFailure(file.name, error);
      }
    }
  }

  async function listFolder(folderId: string): Promise<DriveFile[]> {
    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const response = await options.drive.list({
        fields: "nextPageToken,files(id,mimeType,name)",
        orderBy: "name",
        pageSize: 1000,
        pageToken,
        q: `'${escapeDriveQueryLiteral(folderId)}' in parents and trashed = false`,
      });
      files.push(...(response.data.files ?? []));
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return files;
  }

  function resolveOutputPath(parts: string[]): string | null {
    const candidate = resolve(outputRoot, ...parts);
    const outputRelativePath = relative(outputRoot, candidate);
    if (
      outputRelativePath === "" ||
      outputRelativePath === ".." ||
      outputRelativePath.startsWith(`..${sep}`) ||
      isAbsolute(outputRelativePath)
    ) {
      return null;
    }
    return candidate;
  }

  function recordFailure(subject: string, error: unknown): void {
    errors.push({ message: formatError(error), subject });
  }
}

function escapeDriveQueryLiteral(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function reservePath(
  reservedPaths: Map<string, string>,
  outputPath: string,
  driveFileId: string,
): boolean {
  const existingId = reservedPaths.get(outputPath);
  if (existingId && existingId !== driveFileId) {
    return false;
  }
  reservedPaths.set(outputPath, driveFileId);
  return true;
}

function toSafeSpreadsheetName(name: string): string | null {
  const withoutExtension = name.replace(/\.xlsx$/iu, "");
  const segment = toSafeSegment(withoutExtension);
  return segment ? `${segment}.xlsx` : null;
}

function toSafeSegment(name: string): string | null {
  const normalized = name.normalize("NFC").trim();
  if (!normalized || normalized === "." || normalized === "..") {
    return null;
  }

  const safeName = normalized
    .replaceAll(/[<>:"/\\|?*]/gu, "-")
    .replaceAll(/\p{Cc}/gu, "-")
    .replaceAll(/\s+/gu, " ");
  return safeName && safeName !== "." && safeName !== ".." ? safeName : null;
}

function toBuffer(data: ArrayBuffer | ArrayBufferView | string): Buffer {
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
