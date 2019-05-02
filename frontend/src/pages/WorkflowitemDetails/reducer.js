import { fromJS } from "immutable";

import { FETCH_WORKFLOWITEM_HISTORY, FETCH_WORKFLOWITEM_HISTORY_SUCCESS } from "./actions";
import { WORKFLOWITEM_DETAILS_CLEANUP_STATE } from "../Workflows/actions";

const initialLimit = 30;

const initialState = fromJS({
  offset: -initialLimit,
  limit: initialLimit,
  events: [],
  nEventsTotal: 0,
  hasMore: true,
  isLoading: false
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_WORKFLOWITEM_HISTORY:
      return state.set("isLoading", true);

    case FETCH_WORKFLOWITEM_HISTORY_SUCCESS:
      return state
        .set("offset", action.offset)
        .set("limit", action.limit)
        .updateIn(["events"], events => events.push(...action.events.map(event => fromJS(event)).reverse()))
        .set("nEventsTotal", action.historyItemsCount)
        .set("hasMore", action.hasMore)
        .set("isLoading", false);

    case WORKFLOWITEM_DETAILS_CLEANUP_STATE:
      return initialState;

    default:
      return state;
  }
}
