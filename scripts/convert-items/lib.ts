import { assertItemsJson } from "../../src/lib/schemas/conversion/item";
import type { ItemsData, ItemsJson } from "../../src/lib/types/item";
import { writeGeneratedJson } from "../convert-skills/write-generated-json";
import { convertArmors } from "./armors";
import { convertCybernetics } from "./cybernetics";
import { convertDrugs } from "./drugs";
import { convertNanomachines } from "./nanomachines";
import { convertOmamori } from "./omamori";
import { readItemSheet } from "./shared";
import { convertWeapons } from "./weapons";

export interface ConvertItemsOptions {
  inputPath: string;
  outputPath: string;
  now?: Date;
}

export async function convertItems(
  options: ConvertItemsOptions,
): Promise<ItemsJson> {
  const [
    weaponsRows,
    armorsRows,
    omamoriRows,
    cyberneticsRows,
    nanomachinesRows,
    drugsRows,
  ] = await Promise.all([
    readItemSheet(options.inputPath, "weapons"),
    readItemSheet(options.inputPath, "armors"),
    readItemSheet(options.inputPath, "omamori"),
    readItemSheet(options.inputPath, "cybernetics"),
    readItemSheet(options.inputPath, "nanomachines"),
    readItemSheet(options.inputPath, "drugs"),
  ]);
  const data: ItemsData = {
    weapons: convertWeapons(weaponsRows),
    armors: convertArmors(armorsRows),
    omamori: convertOmamori(omamoriRows),
    cybernetics: convertCybernetics(cyberneticsRows),
    nanomachines: convertNanomachines(nanomachinesRows),
    drugs: convertDrugs(drugsRows),
  };

  return writeGeneratedJson<ItemsData, ItemsJson>({
    outputPath: options.outputPath,
    dataName: "items",
    data,
    now: options.now,
    assertJson: assertItemsJson,
  });
}
