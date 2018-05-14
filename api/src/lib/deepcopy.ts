function deepcopy(x: any): any {
  JSON.parse(JSON.stringify(x));
}

export default deepcopy;
