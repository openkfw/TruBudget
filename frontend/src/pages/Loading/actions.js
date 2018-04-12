export const FETCH_USER = "FETCH_USER";
export const SHOW_LOADING_INDICATOR = 'SHOW_LOADING_INDICATOR';
export const HIDE_LOADING_INDICATOR = 'HIDE_LOADING_INDICATOR';
export const CANCEL_DEBOUNCE = 'CANCEL_DEBOUNCE';

export function fetchUserWithToken(showLoading = false) {
  return {
    type: FETCH_USER,
    showLoading
  }
}
export function showLoadingIndicator() {
  console.log("show");
  return {
    type: SHOW_LOADING_INDICATOR,
    meta: {
      debounce: {
        time: 300
      }
    }
  }
}

export function cancelDebounce() {
  console.log("cancel");
  return {
    type: CANCEL_DEBOUNCE,
    meta: {
      debounce: {
        cancel: true,
        key: SHOW_LOADING_INDICATOR
      }
    }
  }
}

export function hideLoadingIndicator() {
  console.log("hide");
  return {
    type: HIDE_LOADING_INDICATOR,
  }
}
