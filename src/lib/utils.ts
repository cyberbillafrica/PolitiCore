export { cn } from "cn";

export { parties } from "@/lib/constants";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}
