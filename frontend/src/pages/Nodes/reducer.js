import { fromJS } from "immutable";

import { FETCH_NODES_SUCCESS } from "./actions";

const defaultState = fromJS({
  nodes: [],
  tabIndex: 0
});

export default function nodeDashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODES_SUCCESS:
      return state.set("nodes", action.nodes);
    default:
      return state;
  }
}
