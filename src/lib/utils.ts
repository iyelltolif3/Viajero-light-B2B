import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformObjectToSnakeCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformObjectToSnakeCase(item));
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      toSnakeCase(key),
      typeof value === 'object' ? transformObjectToSnakeCase(value) : value,
    ])
  );
}

export function transformObjectToCamelCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformObjectToCamelCase(item));
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      toCamelCase(key),
      typeof value === 'object' ? transformObjectToCamelCase(value) : value,
    ])
  );
}
