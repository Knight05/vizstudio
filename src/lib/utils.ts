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
  // VZ-XXXX-XXXX-XXXX-XXXX - crypto-strength randomness (these are credentials).
  // Web Crypto is available in Node 19+ and all browsers. The alphabet has 32
  // chars, which divides 256 evenly, so `byte % 32` is unbiased.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const blocks: string[] = [];
  for (let i = 0; i < 4; i++) {
    let block = "";
    for (let j = 0; j < 4; j++) block += chars[bytes[i * 4 + j] % 32];
    blocks.push(block);
  }
  return `VZ-${blocks.join("-")}`;
}
