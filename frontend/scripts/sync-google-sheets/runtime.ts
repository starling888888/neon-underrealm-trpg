import { loadEnvFile } from "node:process";
import { google } from "googleapis";
import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { type GoogleDriveClient, syncGoogleSheets } from "./lib";

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

export interface RunGoogleSheetsSyncOptions {
  error?: (message: string) => void;
  log?: (message: string) => void;
  outputRoot?: string;
}

export async function runGoogleSheetsSync(
  options: RunGoogleSheetsSyncOptions = {},
): Promise<number> {
  const log = options.log ?? console.log;
  const error = options.error ?? console.error;

  try {
    loadEnvFile(frontendPath(".env"));
    const drive = createGoogleDriveClient({
      email: requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replaceAll(
        "\\n",
        "\n",
      ),
    });
    const result = await syncGoogleSheets({
      drive,
      outputRoot: options.outputRoot ?? repositoryPath(".raw"),
      rootFolderId: requiredEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID"),
    });

    log(`Exported ${result.exportedFiles.length} spreadsheet(s).`);
    for (const failure of result.errors) {
      error(`[sync error] ${failure.subject}: ${failure.message}`);
    }
    if (result.errors.length > 0) {
      error(`Completed with ${result.errors.length} error(s).`);
      return 1;
    }
    return 0;
  } catch (caughtError) {
    error(
      `Google Spreadsheet sync failed: ${caughtError instanceof Error ? caughtError.message : caughtError}`,
    );
    return 1;
  }
}

function createGoogleDriveClient(credentials: {
  email: string;
  key: string;
}): GoogleDriveClient {
  const auth = new google.auth.JWT({
    email: credentials.email,
    key: credentials.key,
    scopes: [DRIVE_READONLY_SCOPE],
  });
  const drive = google.drive({ auth, version: "v3" });

  return {
    async export(params, options) {
      const response = await drive.files.export(params, options);
      return { data: response.data as ArrayBuffer };
    },
    async list(params) {
      const response = await drive.files.list(params);
      return {
        data: {
          files: response.data.files,
          nextPageToken: response.data.nextPageToken,
        },
      };
    },
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in frontend/.env.`);
  }
  return value;
}
