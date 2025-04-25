import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to merge Tailwind CSS classes with clsx for conditional classes.
 * Resolves conflicts between Tailwind classes.
 * 
 * @param inputs - A list of class values (strings, arrays, objects) to be merged.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
