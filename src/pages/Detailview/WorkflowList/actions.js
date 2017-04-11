export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';


export function fetchStremItems() {
  console.log('Fetch Stream Items gets executed')
  return {
    type: FETCH_STREAM_ITEMS,
  }
}
