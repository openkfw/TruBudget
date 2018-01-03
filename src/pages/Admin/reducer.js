import { fromJS } from 'immutable';
import { FETCH_NODE_PERMISSIONS_SUCCESS, SHOW_ROLES_DIALOG, HIDE_ROLES_DIALOG, ROLE_NAME, ROLE_ORGANIZATION, ROLE_READ_PERMISSION, ROLE_WRITE_PERMISSION, ROLE_ADMIN_PERMISSION, SHOW_USERS_DIALOG, HIDE_USERS_DIALOG, USER_NAME, USER_FULL_NAME, USER_PASSWORD, USER_AVATAR, USER_ROLE } from './actions';

const defaultState = fromJS({
  connectedToAdminNode: false,
  rolesDialogShown: false,
  usersDialogShown: false,
  roleToAdd: {
    name: '',
    organization: '',
    readPermissionSelected: false,
    writePermissionSelected: false,
    adminPermissionSelected: false,
  },
  userToAdd: {
    username: '',
    fullName: '',
    password: '',
    avatar: '/lego_avatar_male1.jpg',
    role: '',
  },

});


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODE_PERMISSIONS_SUCCESS:
      return state.set('connectedToAdminNode', fromJS(action.admin));
    case SHOW_ROLES_DIALOG:
      return state.set('rolesDialogShown', true);
    case HIDE_ROLES_DIALOG:
      return state.merge({
        roleToAdd: defaultState.getIn(['roleToAdd']),
        rolesDialogShown: false
      });
    case SHOW_USERS_DIALOG:
      return state.set('usersDialogShown', true);
    case HIDE_USERS_DIALOG:
      return state.merge({
        userToAdd: defaultState.getIn(['userToAdd']),
        usersDialogShown: false
      });
    case USER_NAME:
      return state.setIn(['userToAdd', 'username'], action.username);
    case USER_FULL_NAME:
      return state.setIn(['userToAdd', 'fullName'], action.fullName);
    case USER_PASSWORD:
      return state.setIn(['userToAdd', 'password'], action.password);
    case USER_AVATAR:
      return state.setIn(['userToAdd', 'avatar'], action.avatar);
    case USER_ROLE:
      return state.setIn(['userToAdd', 'role'], action.role);
    case ROLE_NAME:
      return state.setIn(['roleToAdd', 'name'], action.name);
    case ROLE_ORGANIZATION:
      return state.setIn(['roleToAdd', 'organization'], action.organization);
    case ROLE_READ_PERMISSION:
      return state.setIn(['roleToAdd', 'readPermissionSelected'], action.readPermissionSelected);
    case ROLE_WRITE_PERMISSION:
      return state.setIn(['roleToAdd', 'writePermissionSelected'], action.writePermissionSelected);
    case ROLE_ADMIN_PERMISSION:
      return state.setIn(['roleToAdd', 'adminPermissionSelected'], action.adminPermissionSelected);

    default:
      return state
  }
}
