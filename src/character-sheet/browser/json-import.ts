type JsonFile = Pick<File, "text">;

/** Reads the user-selected JSON file through a replaceable browser boundary. */
export async function readCharacterSheetJsonFile(
  file: JsonFile,
): Promise<string> {
  return file.text();
}
