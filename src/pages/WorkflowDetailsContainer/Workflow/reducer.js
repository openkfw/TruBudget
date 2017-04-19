import { fromJS } from 'immutable';


import { FETCH_WORKFLOW_ITEMS_SUCCESS, SHOW_WORKFLOW_DIALOG } from './actions';

const defaultState =  fromJS({
  workflowItems: [],
  showWorkflow: false
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_WORKFLOW_ITEMS_SUCCESS:
      return state.set('workflowItems', action.workflowItems);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('showWorkflow', action.show)
    default:
      return state
  }
}
