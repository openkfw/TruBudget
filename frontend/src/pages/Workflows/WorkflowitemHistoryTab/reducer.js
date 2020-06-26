import { fromJS } from "immutable";
import { CLOSE_WORKFLOWITEM_DETAILS } from "../actions";
import {
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE,
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS,
  FETCH_FIRST_WORKFLOWITEM_HISTORY_PAGE,
  FETCH_FIRST_WORKFLOWITEM_HISTORY_PAGE_SUCCESS,
  SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT,
  HIDE_HISTORY
} from "./actions";

const historyPageSize = 30;

const defaultState = fromJS({
  historyItems: [],
  totalHistoryItemCount: 0,
  historyPageSize: historyPageSize,
  currentHistoryPage: 0,
  lastHistoryPage: 1,
  isHistoryLoading: false
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT:
      return state.merge({
        totalHistoryItemCount: action.totalHistoryItemsCount,
        lastHistoryPage: action.lastHistoryPage
      });

    case FETCH_FIRST_WORKFLOWITEM_HISTORY_PAGE:
    case FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE:
      return state.set("isHistoryLoading", true);

    case FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: state.get("historyItems").concat(fromJS(action.events).reverse()),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });

    case FETCH_FIRST_WORKFLOWITEM_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: fromJS(action.events).reverse(),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });

    case CLOSE_WORKFLOWITEM_DETAILS:
    case HIDE_HISTORY:
      return defaultState;
    default:
      return state;
  }
}
