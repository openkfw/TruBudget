export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';


export function fetchStreamItems(pathName) {
  console.log('Fetch Stream Items gets executed ' + pathName)
  return {
    type: FETCH_STREAM_ITEMS,
    pathName:pathName
  }
}
