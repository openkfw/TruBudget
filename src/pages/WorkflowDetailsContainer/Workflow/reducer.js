import { fromJS } from 'immutable';


import { FETCH_WORKFLOW_ITEMS_SUCCESS } from './actions';

const defaultState =  fromJS({
  workflowItems: [],

});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_WORKFLOW_ITEMS_SUCCESS:
      return state.set('workflowItems', action.workflowItems);
    default:
      return state
  }
}
