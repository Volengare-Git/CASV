import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FR_DAYS   = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const FR_MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

/** "Dimanche 2 mai 2027" or short = true → "2 mai 2027" */
export function formatEventDate(isoDate: string, short = false): string {
  const d = new Date(isoDate + "T12:00:00"); // noon avoids any UTC shift
  const day   = d.getDate();
  const month = FR_MONTHS[d.getMonth()];
  const year  = d.getFullYear();
  return short ? `${day} ${month} ${year}` : `${FR_DAYS[d.getDay()]} ${day} ${month} ${year}`;
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
