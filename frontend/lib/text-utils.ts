// Text normalization utilities with Turkish locale support

/**
 * Normalizes a word using Turkish locale rules
 * - Trims whitespace
 * - Converts to lowercase with Turkish locale
 * - Normalizes whitespace
 * - Handles dotted/undotted I variants consistently
 */
export function normalizeWord(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deduplicates an array of words using normalized comparison
 */
export function dedupeWords(words: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const word of words) {
    const normalized = normalizeWord(word);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(word); // Keep original casing for display
    }
  }

  return result;
}

/**
 * Validates if a word is suitable for graph operations
 */
export function isValidWord(word: string): boolean {
  const normalized = normalizeWord(word);
  return normalized.length >= 2 && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s-]+$/.test(normalized);
}

/**
 * Sanitizes input for database queries
 * Removes potentially dangerous characters while preserving Turkish characters
 */
export function sanitizeInput(input: string): string {
  return normalizeWord(input).replace(/[<>'"&;]/g, '');
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 20): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a word for display, handling various edge cases
 */
export function formatDisplayWord(word: string): string {
  if (!word) return '';

  // Capitalize first letter while preserving Turkish characters
  const normalized = normalizeWord(word);
  return normalized.charAt(0).toLocaleUpperCase('tr-TR') + normalized.slice(1);
}