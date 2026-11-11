import type { ReactNode } from "react";

/**
 * Renders both languages; CSS shows the one matching <html data-ui="...">.
 * Works in server and client components, so switching language needs no reload.
 */
export function T({ pt, en }: { pt: ReactNode; en: ReactNode }) {
  return (
    <>
      <span lang="pt">{pt}</span>
      <span lang="en">{en}</span>
    </>
  );
}
