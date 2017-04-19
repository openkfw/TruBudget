export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const FETCH_NOTIFICATIONS_SUCCESS = 'FETCH_NOTIFICATIONS_SUCCESS';
export const SHOW_SNACKBAR = 'SHOW_SNACKBAR';
export const SNACKBAR_MESSAGE = 'SNACKBAR_MESSAGE';

export function showSnackBar(show) {
  return {
    type: SHOW_SNACKBAR,
    show: show

  }
}
export function storeSnackBarMessage(message){
  return{
    type: SNACKBAR_MESSAGE,
    message: message
  }
}
export function fetchNotifications(user) {
  return {
    type: FETCH_NOTIFICATIONS,
    user
  }
}
