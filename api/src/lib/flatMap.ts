// TODO remove unused function and this whole file with it
function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, x) => acc.concat(x), []);
}

export default flatten;
