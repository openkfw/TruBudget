import { fromJS } from "immutable";

import {
  SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT,
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE,
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS,
  RESET_WORKFLOWITEM_HISTORY
} from "./actions";
import { CLOSE_WORKFLOWITEM_DETAILS } from "../actions";
import { LOGOUT } from "../../Login/actions";

const historyPageSize = 30;

const initialState = fromJS({
  historyItems: [],
  totalHistoryItemCount: 0,
  historyPageSize: historyPageSize,
  currentHistoryPage: 0,
  lastHistoryPage: 1,
  isHistoryLoading: false
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE:
      return state.set("isHistoryLoading", true);

    case SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT:
      return state.merge({
        totalHistoryItemCount: action.totalHistoryItemsCount,
        lastHistoryPage: action.lastHistoryPage
      });

    case FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: state.get("historyItems").concat(fromJS(action.events).reverse()),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });
    case RESET_WORKFLOWITEM_HISTORY:
    case CLOSE_WORKFLOWITEM_DETAILS:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
}
