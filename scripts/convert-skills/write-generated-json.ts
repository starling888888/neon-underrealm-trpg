import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";

interface GeneratedJson<Data> {
  dataName: string;
  updatedAt: string;
  data: Data;
}

export interface WriteGeneratedJsonOptions<
  Data,
  Json extends GeneratedJson<Data>,
> {
  outputPath: string;
  dataName: Json["dataName"];
  data: Data;
  assertJson: (value: unknown) => asserts value is Json;
  now?: Date;
}

export async function writeGeneratedJson<
  Data,
  Json extends GeneratedJson<Data>,
>(options: WriteGeneratedJsonOptions<Data, Json>): Promise<Json> {
  const existing = await readExisting(options.outputPath, options.assertJson);
  const result = {
    dataName: options.dataName,
    updatedAt:
      existing && isDeepStrictEqual(existing.data, options.data)
        ? existing.updatedAt
        : formatDateTimeJst(options.now ?? new Date()),
    data: options.data,
  } as Json;

  options.assertJson(result);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

export function formatDateTimeJst(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(
    jst.getUTCDate(),
  )}T${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}:${pad(
    jst.getUTCSeconds(),
  )}+09:00`;
}

async function readExisting<Json>(
  outputPath: string,
  assertJson: (value: unknown) => asserts value is Json,
): Promise<Json | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(outputPath, "utf8"));
    assertJson(value);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
