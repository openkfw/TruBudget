export const SHOW_NEXT = 'SHOW_NEXT';

export function showNext() {
  console.log('Show Next gets executed')
  return {
    type: SHOW_NEXT,
  }
}
