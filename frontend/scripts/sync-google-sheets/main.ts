import { runGoogleSheetsSync } from "./runtime";

process.exitCode = await runGoogleSheetsSync();
