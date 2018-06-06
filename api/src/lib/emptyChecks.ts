export function isEmpty<T>(value: T | null | undefined): value is null | undefined {
  if (value === undefined || value === null) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return !isEmpty(value);
}
