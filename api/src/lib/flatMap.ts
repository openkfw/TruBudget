function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, x) => acc.concat(x), []);
}

export default flatten;
