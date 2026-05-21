import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
