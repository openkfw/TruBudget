import { fromJS } from 'immutable';


import { FETCH_STREAM_ITEMS_SUCCESS, SHOW_WORKFLOW_DIALOG,SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_PURPOSE } from './actions';

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
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', action.amount);
    case SUBPROJECT_PURPOSE:
      return state.set('ubProjectPurpose', action.purpose);
    default:
      return state
  }
}
