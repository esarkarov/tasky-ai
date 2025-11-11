export function toTitleCase(value: string) {
  if (!value) return '';

  return value[0]?.toUpperCase() + value.slice(1);
}

export function truncateString(value: string, maxLength: number) {
  if (!value) return '';

  if (value.length > maxLength) {
    return `${value.slice(0, maxLength - 1)}...`;
  }

  return value;
}

export function generateID(): string {
  return Math.random().toString(36).slice(8) + Date.now().toString(36);
}
