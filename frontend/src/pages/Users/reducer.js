import { fromJS } from "immutable";

import { SWITCH_TABS } from "./actions";

const defaultState = fromJS({
  tabIndex: 0
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SWITCH_TABS:
      return state.set("tabIndex", action.index);
    default:
      return state;
  }
}
