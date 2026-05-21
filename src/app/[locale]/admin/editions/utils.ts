/** Returns YYYY-MM-DD of the first Sunday of May for a given year */
export function firstSundayOfMay(year: number): string {
  const may1 = new Date(year, 4, 1);
  const dow = may1.getDay(); // 0=Sunday
  const daysToAdd = dow === 0 ? 0 : 7 - dow;
  const d = new Date(year, 4, 1 + daysToAdd);
  return d.toISOString().slice(0, 10);
}
