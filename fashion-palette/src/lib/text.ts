// Shared, side-effect-free text helpers.

// Feedback 08: a genuine short summary, distinct from the full description — not
// a long prefix of the same text (which reads as "repeated identical text").
export function summarize(text: string, max = 180): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop > 60) return slice.slice(0, lastStop + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 60 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}
