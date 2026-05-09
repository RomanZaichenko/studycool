import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertHtmlToText(html: string): string {
  const regex = /<[^>]+>/g;
  return html.replace(regex, "");
}
