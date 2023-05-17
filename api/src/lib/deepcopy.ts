function deepcopy<T>(x: T): T {
  if (x === undefined) return undefined as unknown as T;
  return JSON.parse(JSON.stringify(x)) as T;
}

export default deepcopy;
