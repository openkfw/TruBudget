function deepcopy(x: any): any {
  return JSON.parse(JSON.stringify(x));
}

export default deepcopy;
