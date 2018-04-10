export const FETCH_UPDATES = "FETCH_UPDATES";
export const FETCH_UPDATES_SUCCESS = "FETCH_UPDATES_SUCCESS";

export const fetchUpdates = (user) => {
  return {
    type: FETCH_UPDATES,
    user
  }
}
