import { fromJS } from 'immutable';

import { FETCH_STREAMS_SUCCESS, SHOW_WORKFLOW_DIALOG, PROJECT_NAME } from './actions';

const defaultState = fromJS({
  streams: [],
  workflowDialogVisible: false,
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_STREAMS_SUCCESS:
      return state.set('streams', action.streams);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    case PROJECT_NAME:
      return state.set('projectName', action.name);
    default:
      return state
  }
}
