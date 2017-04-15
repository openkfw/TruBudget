import { fromJS } from 'immutable';

import { FETCH_STREAM_ITEMS_SUCCESS, SHOW_WORKFLOW_DIALOG } from './actions';

const defaultState =  fromJS({
  streamItems: [],
  workflowDialogVisible: false,
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_STREAM_ITEMS_SUCCESS:
      return state.set('streamItems', action.streamItems);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    default:
      return state
  }
}
