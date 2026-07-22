import { z } from "zod";
import { createNameHash } from "../utils/hash";

export const ITEM_DATA_NAME = "items";

const requiredText = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), "Value must be trimmed.")
  .refine((value) => !value.includes("\r"), "Line breaks must use LF.");
const optionalText = z
  .string()
  .refine((value) => value === value.trim(), "Value must be trimmed.")
  .refine((value) => !value.includes("\r"), "Line breaks must use LF.")
  .nullable();
const nonNegativeInteger = z.number().int().nonnegative();

export const WeaponGroupSchema = z.enum([
  "normal",
  "cybernetics",
  "nanomachines",
]);
export const WeaponKindSchema = z.enum(["近接", "射撃", "特殊"]);
export const WeaponCheckSchema = z.enum([
  "喧嘩",
  "暗殺",
  "発砲",
  "格闘",
  "干渉",
  "格闘/干渉",
]);
export const WeaponCheckKeySchema = z.enum([
  "kenka",
  "ansatsu",
  "happou",
  "kakutou",
  "kanshou",
  "kakutou_kanshou",
]);
export const CyberneticPartSchema = z.enum(["頭", "胴体", "腕", "足", "任意"]);
export const CyberneticPartKeySchema = z.enum([
  "head",
  "torso",
  "arm",
  "leg",
  "any",
]);
export const DrugTimingSchema = z.enum(["SU", "INI", "CU", "SP"]);

export type WeaponGroup = z.infer<typeof WeaponGroupSchema>;
export type WeaponKind = z.infer<typeof WeaponKindSchema>;
export type WeaponCheck = z.infer<typeof WeaponCheckSchema>;
export type WeaponCheckKey = z.infer<typeof WeaponCheckKeySchema>;
export type CyberneticPart = z.infer<typeof CyberneticPartSchema>;
export type CyberneticPartKey = z.infer<typeof CyberneticPartKeySchema>;
export type DrugTiming = z.infer<typeof DrugTimingSchema>;

export const WEAPON_CHECK_KEYS = {
  喧嘩: "kenka",
  暗殺: "ansatsu",
  発砲: "happou",
  格闘: "kakutou",
  干渉: "kanshou",
  "格闘/干渉": "kakutou_kanshou",
} as const satisfies Record<WeaponCheck, WeaponCheckKey>;

export const CYBERNETIC_PART_KEYS = {
  頭: "head",
  胴体: "torso",
  腕: "arm",
  足: "leg",
  任意: "any",
} as const satisfies Record<CyberneticPart, CyberneticPartKey>;

export const ItemSchema = z
  .object({
    id: requiredText,
    name: requiredText,
    credit: nonNegativeInteger.nullable(),
    sourceOrder: z.number().int().positive(),
  })
  .strict();

export const WeaponSchema = ItemSchema.extend({
  group: WeaponGroupSchema,
  range: z.union([nonNegativeInteger, z.literal("シーン")]),
  kind: WeaponKindSchema,
  check: WeaponCheckSchema,
  attack: z.union([nonNegativeInteger, z.literal("特殊")]).nullable(),
  guard: z.union([nonNegativeInteger, z.literal("特殊")]).nullable(),
  ammo: nonNegativeInteger.nullable(),
  effect: optionalText,
}).strict();

export const ArmorSchema = ItemSchema.extend({
  defense: nonNegativeInteger,
  damageReduction: z.union([nonNegativeInteger, z.literal("特殊")]).nullable(),
  restriction: optionalText,
  effect: optionalText,
}).strict();

export const OmamoriSchema = ItemSchema.extend({
  effect: requiredText,
}).strict();

export const CyberneticSchema = ItemSchema.extend({
  part: CyberneticPartSchema,
  implantPoints: nonNegativeInteger,
  effect: requiredText,
}).strict();

export const NanomachineSchema = ItemSchema.extend({
  implantPoints: nonNegativeInteger,
  activationMentalCost: nonNegativeInteger,
  effect: requiredText,
}).strict();

export const DrugSchema = ItemSchema.extend({
  timing: DrugTimingSchema,
  setQuantity: nonNegativeInteger,
  badTripIntensity: nonNegativeInteger,
  effect: requiredText,
}).strict();

export const WeaponsByGroupSchema = z.partialRecord(
  WeaponGroupSchema,
  z.partialRecord(WeaponCheckKeySchema, z.array(WeaponSchema)),
);
export const CyberneticsByPartSchema = z.partialRecord(
  CyberneticPartKeySchema,
  z.array(CyberneticSchema),
);

export const ItemsDataSchema = z
  .object({
    weapons: WeaponsByGroupSchema,
    armors: z.array(ArmorSchema),
    omamori: z.array(OmamoriSchema),
    cybernetics: CyberneticsByPartSchema,
    nanomachines: z.array(NanomachineSchema),
    drugs: z.array(DrugSchema),
  })
  .strict();

export const ItemsJsonSchema = z
  .object({
    dataName: z.literal(ITEM_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: ItemsDataSchema,
  })
  .strict();

export type Item = z.infer<typeof ItemSchema>;
export type Weapon = z.infer<typeof WeaponSchema>;
export type Armor = z.infer<typeof ArmorSchema>;
export type Omamori = z.infer<typeof OmamoriSchema>;
export type Cybernetic = z.infer<typeof CyberneticSchema>;
export type Nanomachine = z.infer<typeof NanomachineSchema>;
export type Drug = z.infer<typeof DrugSchema>;
export type WeaponsByGroup = z.infer<typeof WeaponsByGroupSchema>;
export type CyberneticsByPart = z.infer<typeof CyberneticsByPartSchema>;
export type ItemsData = z.infer<typeof ItemsDataSchema>;
export type ItemsJson = z.infer<typeof ItemsJsonSchema>;

export function createWeaponCheckKey(check: WeaponCheck): WeaponCheckKey {
  return WEAPON_CHECK_KEYS[check];
}

export function createCyberneticPartKey(
  part: CyberneticPart,
): CyberneticPartKey {
  return CYBERNETIC_PART_KEYS[part];
}

export function createWeaponId({
  group,
  check,
  name,
}: {
  group: WeaponGroup;
  check: WeaponCheck;
  name: string;
}): string {
  return `item-weapon-${group}-${createWeaponCheckKey(check)}-${createNameHash(name)}`;
}

export function createArmorId(name: string): string {
  return `item-armor-${createNameHash(name)}`;
}

export function createOmamoriId(name: string): string {
  return `item-omamori-${createNameHash(name)}`;
}

export function createCyberneticId({
  part,
  name,
}: {
  part: CyberneticPart;
  name: string;
}): string {
  return `item-cybernetics-${createCyberneticPartKey(part)}-${createNameHash(name)}`;
}

export function createNanomachineId(name: string): string {
  return `item-nanomachine-${createNameHash(name)}`;
}

export function createDrugId({
  timing,
  name,
}: {
  timing: DrugTiming;
  name: string;
}): string {
  return `item-drug-${timing.toLowerCase()}-${createNameHash(name)}`;
}

export function assertItemsJson(value: unknown): asserts value is ItemsJson {
  const result = ItemsJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));

  assertItemsData(result.data.data);
}

export function assertItemsData(data: ItemsData): void {
  const ids = new Set<string>();
  const hashes = new Map<string, string>();
  const namesByNamespace = new Set<string>();
  const weapons = flattenWeapons(data.weapons);
  const cybernetics = flattenCybernetics(data.cybernetics);

  assertConsecutiveSourceOrders(weapons, "Weapons");
  assertConsecutiveSourceOrders(data.armors, "Armors");
  assertConsecutiveSourceOrders(data.omamori, "Omamori");
  assertConsecutiveSourceOrders(cybernetics, "Cybernetics");
  assertConsecutiveSourceOrders(data.nanomachines, "Nanomachines");
  assertConsecutiveSourceOrders(data.drugs, "Drugs");

  for (const [group, checks] of Object.entries(data.weapons) as Array<
    [WeaponGroup, Partial<Record<WeaponCheckKey, Weapon[]>>]
  >) {
    for (const [checkKey, values] of Object.entries(checks) as Array<
      [WeaponCheckKey, Weapon[]]
    >) {
      for (const weapon of values) {
        if (weapon.group !== group) {
          throw new Error(
            `Weapon "${weapon.id}" must be grouped under "${weapon.group}".`,
          );
        }
        if (createWeaponCheckKey(weapon.check) !== checkKey) {
          throw new Error(
            `Weapon "${weapon.id}" must be grouped under its check key.`,
          );
        }
        assertItemIdentity({
          item: weapon,
          expectedId: createWeaponId(weapon),
          namespace: `weapon:${group}:${checkKey}`,
          ids,
          hashes,
          namesByNamespace,
        });
      }
    }
  }

  for (const armor of data.armors) {
    assertItemIdentity({
      item: armor,
      expectedId: createArmorId(armor.name),
      namespace: "armor",
      ids,
      hashes,
      namesByNamespace,
    });
  }
  for (const item of data.omamori) {
    assertItemIdentity({
      item,
      expectedId: createOmamoriId(item.name),
      namespace: "omamori",
      ids,
      hashes,
      namesByNamespace,
    });
  }
  for (const [partKey, values] of Object.entries(data.cybernetics) as Array<
    [CyberneticPartKey, Cybernetic[]]
  >) {
    for (const item of values) {
      if (createCyberneticPartKey(item.part) !== partKey) {
        throw new Error(
          `Cybernetic "${item.id}" must be grouped under its part key.`,
        );
      }
      assertItemIdentity({
        item,
        expectedId: createCyberneticId(item),
        namespace: "cybernetics",
        ids,
        hashes,
        namesByNamespace,
      });
    }
  }
  for (const item of data.nanomachines) {
    assertItemIdentity({
      item,
      expectedId: createNanomachineId(item.name),
      namespace: "nanomachine",
      ids,
      hashes,
      namesByNamespace,
    });
  }
  for (const item of data.drugs) {
    assertItemIdentity({
      item,
      expectedId: createDrugId(item),
      namespace: "drug",
      ids,
      hashes,
      namesByNamespace,
    });
  }
}

function flattenWeapons(weapons: WeaponsByGroup): Weapon[] {
  return Object.values(weapons).flatMap((checks) =>
    checks ? Object.values(checks).flatMap((values) => values ?? []) : [],
  );
}

function flattenCybernetics(cybernetics: CyberneticsByPart): Cybernetic[] {
  return Object.values(cybernetics).flatMap((values) => values ?? []);
}

function assertConsecutiveSourceOrders(items: Item[], label: string): void {
  const sourceOrders = items
    .map((item) => item.sourceOrder)
    .sort((left, right) => left - right);
  sourceOrders.forEach((sourceOrder, index) => {
    if (sourceOrder !== index + 1) {
      throw new Error(`${label} sourceOrder values must be consecutive.`);
    }
  });
}

function assertItemIdentity({
  item,
  expectedId,
  namespace,
  ids,
  hashes,
  namesByNamespace,
}: {
  item: Item;
  expectedId: string;
  namespace: string;
  ids: Set<string>;
  hashes: Map<string, string>;
  namesByNamespace: Set<string>;
}): void {
  if (item.id !== expectedId) {
    throw new Error(`Item id "${item.id}" does not match its contract.`);
  }
  if (ids.has(item.id)) throw new Error(`Duplicate item id "${item.id}".`);

  const namespaceName = `${namespace}:${item.name}`;
  if (namesByNamespace.has(namespaceName)) {
    throw new Error(
      `Duplicate item name "${item.name}" in namespace "${namespace}".`,
    );
  }

  const nameHash = createNameHash(item.name);
  const hashedName = hashes.get(nameHash);
  if (hashedName !== undefined && hashedName !== item.name) {
    throw new Error(
      `Item name hash collision for "${hashedName}" and "${item.name}".`,
    );
  }

  ids.add(item.id);
  namesByNamespace.add(namespaceName);
  hashes.set(nameHash, item.name);
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}
