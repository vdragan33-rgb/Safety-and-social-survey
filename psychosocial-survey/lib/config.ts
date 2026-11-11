/** Server-side only. The survey round that is currently open for answers. */
export const SURVEY_YEAR: number =
  Number(process.env.SURVEY_YEAR) || new Date().getFullYear();
