import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const parties = [
  { id: "apc", name: "All Progressives Congress", color: "#1B4F72" },
  { id: "pdp", name: "People Democratic Party", color: "#27AE60" },
  { id: "ndc", name: "Nigeria Democratic Congress", color: "#E74C3C" },
] as const;
