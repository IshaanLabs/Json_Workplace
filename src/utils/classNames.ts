import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names, resolving conflicts with tailwind-merge.
 * Based on the shadcn/ui cn() pattern.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
