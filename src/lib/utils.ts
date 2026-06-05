import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateLicenseKey() {
  // VZ-XXXX-XXXX-XXXX-XXXX
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const blocks = Array.from({ length: 4 }, () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join(""),
  );
  return `VZ-${blocks.join("-")}`;
}
