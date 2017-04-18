import { fromJS } from 'immutable';


import { FETCH_STREAM_ITEMS_SUCCESS, SHOW_WORKFLOW_DIALOG,SUBPROJECT_NAME } from './actions';

const defaultState =  fromJS({
  streamItems: [],
  subProjectName:'',
  workflowDialogVisible: false,
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_STREAM_ITEMS_SUCCESS:
      return state.set('streamItems', action.streamItems);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    case SUBPROJECT_NAME:
      return state.set('subProjectName', action.name);
    default:
      return state
  }
}
