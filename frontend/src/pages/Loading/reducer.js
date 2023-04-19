import { fromJS } from "immutable";

import { HIDE_LOADING_INDICATOR, SHOW_LOADING_INDICATOR } from "./actions";

const defaultState = fromJS({
  loadingVisible: false
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SHOW_LOADING_INDICATOR:
      return state.set("loadingVisible", true);
    case HIDE_LOADING_INDICATOR:
      return state.set("loadingVisible", false);

    default:
      return state;
  }
}
