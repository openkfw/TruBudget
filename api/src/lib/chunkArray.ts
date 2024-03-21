export function chunkArray<T>(items: T[], size: number | string): T[][] {
  // TODO see what happens if size parameter is 0 ?
  const chunkSize = typeof size === "string" ? parseInt(size) : size;
  const chunks: Array<T[]> = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}
