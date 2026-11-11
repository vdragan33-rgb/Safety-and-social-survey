/** Minimum number of responses before any group result is shown. */
export const MIN_GROUP = 5;

export const LANGS = ["pt", "en"] as const;
export type Lang = (typeof LANGS)[number];
