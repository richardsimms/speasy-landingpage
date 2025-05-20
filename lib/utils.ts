import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) {
    return "00:00"
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function truncate(str: string, maxLength = 250, ellipsis = "… ") {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + ellipsis;
}
