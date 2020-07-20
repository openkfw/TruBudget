export const FETCH_USER = "FETCH_USER";
export const SHOW_LOADING_INDICATOR = "SHOW_LOADING_INDICATOR";
export const HIDE_LOADING_INDICATOR = "HIDE_LOADING_INDICATOR";
export const CANCEL_DEBOUNCE = "CANCEL_DEBOUNCE";

export function fetchUserWithToken(showLoading = false) {
  return {
    type: FETCH_USER,
    showLoading
  };
}
export function showLoadingIndicator() {
  return {
    type: SHOW_LOADING_INDICATOR
  };
}

export function cancelDebounce() {
  return {
    type: CANCEL_DEBOUNCE,
    meta: {
      debounce: {
        cancel: true,
        key: SHOW_LOADING_INDICATOR
      }
    }
  };
}

export function hideLoadingIndicator() {
  return {
    type: HIDE_LOADING_INDICATOR
  };
}
