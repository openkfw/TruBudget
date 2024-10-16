// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(value: any): boolean {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
    return true;
  }

  return false;
}
