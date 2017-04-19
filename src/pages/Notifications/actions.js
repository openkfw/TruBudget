export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const FETCH_NOTIFICATIONS_SUCCESS = 'FETCH_NOTIFICATIONS_SUCCESS';

export function fetchNotifications(user) {
  return {
    type: FETCH_NOTIFICATIONS,
    user
  }
}
