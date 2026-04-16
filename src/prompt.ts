export function parseConfirmAnswer(answer: string, defaultYes: boolean): boolean {
  const a = answer.trim().toLowerCase();
  if (a === "") return defaultYes;
  if (a === "y" || a === "yes") return true;
  if (a === "n" || a === "no") return false;
  return defaultYes;
}
