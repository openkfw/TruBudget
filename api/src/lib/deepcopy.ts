function deepcopy(x: any): any {
  if (x === undefined) return undefined;
  return JSON.parse(JSON.stringify(x));
}

export default deepcopy;
