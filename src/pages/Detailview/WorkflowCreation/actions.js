export const SUBPROJECT_NAME = 'SUBPROJECT_NAME';


export function storeStreamName(name) {
  return {
    type: SUBPROJECT_NAME,
    name: name
  }
}
