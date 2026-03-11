import en from "@/data/locale/en.json";

/**
 * Union type of all valid locale keys, derived from the English locale file.
 * This ensures compile-time safety when using t() or say() — typos and
 * missing keys are caught by TypeScript.
 */
export type LocaleKey = keyof typeof en;

/**
 * A complete locale file must have exactly the same keys as English.
 * Use this type when adding new locale files to ensure nothing is missed.
 */
export type LocaleFile = Record<LocaleKey, string>;

/** Translation function signature — used in component props that accept `t`. */
export type TranslateFn = (key: LocaleKey) => string;
