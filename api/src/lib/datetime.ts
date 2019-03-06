export function toUnixTimestamp(timestamp: Date | string | number): number {
  const ts = new Date(timestamp);
  return Math.floor(ts.getTime() / 1000);
}

export function toUnixTimestampStr(timestamp: Date | string | number): string {
  return `${toUnixTimestamp(timestamp)}`;
}

export function currentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function currentUnixTimestampStr(): string {
  return `${currentUnixTimestamp()}`;
}
