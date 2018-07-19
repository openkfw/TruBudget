import { fromJS } from "immutable";

import {
  FETCH_GROUPS_SUCCESS,
  GROUP_ID,
  GROUP_NAME,
  ADD_INITIAL_USER,
  CREATE_GROUP_SUCCESS,
  SHOW_EDIT_DIALOG,
  HIDE_EDIT_DIALOG,
  REMOVE_INITIAL_USER
} from "./actions";

export const defaultState = fromJS({
  groups: [],
  editDialogShown: false,
  editId: "",
  groupToAdd: {
    groupId: "",
    name: "",
    groupUsers: []
  }
});

export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_GROUPS_SUCCESS:
      return state.set("groups", fromJS(action.groups));
    case GROUP_ID:
      return state.setIn(["groupToAdd", "groupId"], action.groupId);
    case GROUP_NAME:
      return state.setIn(["groupToAdd", "name"], action.name);
    case ADD_INITIAL_USER:
      return state.updateIn(["groupToAdd", "groupUsers"], users => [...users, action.userId]);
    case REMOVE_INITIAL_USER:
      // Offical way to delete something from an array with immutability https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns
      return state.updateIn(["groupToAdd", "groupUsers"], users => [
        ...users.slice(0, users.indexOf(action.userId)),
        ...users.slice(users.indexOf(action.userId) + 1)
      ]);
    case CREATE_GROUP_SUCCESS:
      return state.set("groupToAdd", defaultState.get("groupToAdd"));

    case SHOW_EDIT_DIALOG:
      return state.merge({
        editId: action.groupId,
        editDialogShown: true
      });
    case HIDE_EDIT_DIALOG:
      return state.merge({
        editId: defaultState.get("editId"),
        editDialogShown: false
      });
    default:
      return state;
  }
}
