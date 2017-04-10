import { fromJS } from 'immutable';

import { SHOW_NEXT } from './actions';

const defaultState =  fromJS({
  showNext: false
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SHOW_NEXT:
        console.log('Show Next')
        return state.set('showNext', !state.get('showNext'));
    default:
      return state
  }
}
