import { fromJS } from 'immutable';
import { FETCH_NODE_PERMISSIONS_SUCCESS, SHOW_ROLES_DIALOG, HIDE_ROLES_DIALOG, ROLE_NAME, ROLE_ORGANIZATION, ROLE_READ_PERMISSION, ROLE_WRITE_PERMISSION, ROLE_ADMIN_PERMISSION, SHOW_USERS_DIALOG, HIDE_USERS_DIALOG, USER_NAME, USER_FULL_NAME, USER_PASSWORD, USER_AVATAR, USER_ROLE, SHOW_ADMIN_LOGIN, HIDE_ADMIN_LOGIN, ADMIN_USERNAME, ADMIN_PASSWORD, ROLE_NAME_ERROR, ORGANIZATION_ERROR, USERNAME_ERROR, FULLNAME_ERROR, PASSWORD_ERROR, ROLE_NOT_FOUND_ERROR } from './actions';

const defaultState = fromJS({
  nodePermissions: [],
  rolesDialogShown: false,
  usersDialogShown: false,
  adminLoginShown: true,
  showRoleNameError: false,
  showOrganizationError: false,
  showUsernameError: false,
  showFullNameError: false,
  showPasswordError: false,
  showRoleNotFoundError: false,
  adminCredentials: {
    username: '',
    password: '',
  },
  roleToAdd: {
    name: '',
    organization: '',
    readPermissionSelected: true,
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
      return state.set('nodePermissions', fromJS(action.permissions));
    case SHOW_ROLES_DIALOG:
      return state.set('rolesDialogShown', true);
    case HIDE_ROLES_DIALOG:
      return state.merge({
        roleToAdd: defaultState.getIn(['roleToAdd']),
        rolesDialogShown: false,
        showRoleNameError: false,
        showOrganizationError: false,
      });
    case SHOW_USERS_DIALOG:
      return state.set('usersDialogShown', true);
    case HIDE_USERS_DIALOG:
      return state.merge({
        userToAdd: defaultState.getIn(['userToAdd']),
        usersDialogShown: false,
        showUsernameError: false,
        showFullNameError: false,
        showPasswordError: false,
        showRoleNotFoundError: false,
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
    case SHOW_ADMIN_LOGIN:
      return state.set('adminLoginShown', true);
    case HIDE_ADMIN_LOGIN:
      return state.merge({
        adminCredentials: defaultState.getIn(['adminCredentials']),
        adminLoginShown: false
      });
    case ADMIN_USERNAME:
      return state.setIn(['adminCredentials', 'username'], action.username);
    case ADMIN_PASSWORD:
      return state.setIn(['adminCredentials', 'password'], action.password);
    case ROLE_NAME_ERROR:
      return state.set('showRoleNameError', true);
    case ORGANIZATION_ERROR:
      return state.set('showOrganizationError', true);
    case USERNAME_ERROR:
      return state.set('showUsernameError', true);
    case FULLNAME_ERROR:
      return state.set('showFullNameError', true);
    case PASSWORD_ERROR:
      return state.set('showPasswordError', true);
    case ROLE_NOT_FOUND_ERROR:
      return state.set('showRoleNotFoundError', true);
    default:
      return state
  }
}
