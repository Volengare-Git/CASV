import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * "Dimanche 2 mai 2027" (FR) / "Sunday, May 2, 2027" (EN)
 * short=true → "2 mai 2027" / "May 2, 2027"
 * locale defaults to "fr" for backward compatibility.
 */
export function formatEventDate(isoDate: string, short = false, locale = "fr"): string {
  const d = new Date(isoDate + "T12:00:00"); // noon avoids any UTC shift
  const options: Intl.DateTimeFormatOptions = short
    ? { day: "numeric", month: "long", year: "numeric" }
    : { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const formatted = new Intl.DateTimeFormat(locale, options).format(d);
  // Capitalise first letter (Intl returns lowercase weekday in French)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Returns the age (in completed years) of someone born on birthDate,
 * as of checkDate.
 */
export function ageAtDate(birthDate: Date, checkDate: Date): number {
  let age = checkDate.getFullYear() - birthDate.getFullYear();
  const m = checkDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && checkDate.getDate() < birthDate.getDate())) age--;
  return age;
}

export function computeIsOpen(edition: {
  is_registration_open: boolean | null;
  registration_opens_at: string;
  registration_closes_at: string;
}): boolean {
  if (edition.is_registration_open === true) return true;
  if (edition.is_registration_open === false) return false;
  const now = new Date();
  return (
    now >= new Date(edition.registration_opens_at) &&
    now <= new Date(edition.registration_closes_at)
  );
}
