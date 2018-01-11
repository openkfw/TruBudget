import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNodePermissions, showRolesDialog, hideRolesDialog, addRole, showUsersDialog, hideUsersDialog, setRoleName, setRoleOrganization, setRoleReadPermission, setRoleWritePermission, setRoleAdminPermission, setUsername, setUserFullName, setUserPassword, setUserAvatar, setUserRole, addUser, showAdminLogin, hideAdminLogin, setAdminUsername, setAdminPassword, showRoleNameError, showOrganizationError, isRoleNameError, isOrganizationError, isUsernameError, isFullNameError, isRoleNotFoundError, isPasswordError } from './actions';
import { fetchUsers, fetchRoles, login, logout } from '../Login/actions';
import { fetchNodeInformation } from '../Dashboard/actions';
import AdminDashboard from './AdminDashboard';
import { showSnackBar, SHOW_SNACKBAR, storeSnackBarMessage } from '../Notifications/actions';



class AdminDashboardContainer extends Component {
  componentWillMount() {
    this.props.fetchNodePermissions();
    this.props.fetchUsers();
    this.props.fetchRoles();
    this.props.fetchNodeInformation();
  }
  componentWillUnmount() {
    this.props.hideAdminLogin()
  }

  render() {
    return (
      <AdminDashboard {...this.props}/>
    )
  }

}


const mapDispatchToProps = (dispatch) => {
  return {
    fetchNodePermissions: () => dispatch(fetchNodePermissions()),
    showRolesDialog: () => dispatch(showRolesDialog()),
    hideRolesDialog: () => dispatch(hideRolesDialog()),
    showUsersDialog: () => dispatch(showUsersDialog()),
    hideUsersDialog: () => dispatch(hideUsersDialog()),
    setRoleName: (name) => dispatch(setRoleName(name)),
    setRoleOrganization: (organization) => dispatch(setRoleOrganization(organization)),
    setRoleReadPermission: (read) => dispatch(setRoleReadPermission(read)),
    setRoleWritePermission: (write) => dispatch(setRoleWritePermission(write)),
    setRoleAdminPermission: (admin) => dispatch(setRoleAdminPermission(admin)),
    fetchUsers: () => dispatch(fetchUsers()),
    fetchRoles: () => dispatch(fetchRoles()),
    setUsername: (username) => dispatch(setUsername(username)),
    setUserFullName: (fullName) => dispatch(setUserFullName(fullName)),
    setUserPassword: (password) => dispatch(setUserPassword(password)),
    setUserAvatar: (avatar) => dispatch(setUserAvatar(avatar)),
    setUserRole: (role) => dispatch(setUserRole(role)),
    addUser: (username, fullName, avatar, password, role) => dispatch(addUser(username, fullName, avatar, password, role)),
    addRole: (name, organization, read, write, admin) => dispatch(addRole(name, organization, read, write, admin)),
    fetchNodeInformation: () => dispatch(fetchNodeInformation()),
    hideAdminLogin: () => dispatch(hideAdminLogin()),
    showAdminLogin: () => dispatch(showAdminLogin()),
    setAdminUsername: (username) => dispatch(setAdminUsername(username)),
    setAdminPassword: (password) => dispatch(setAdminPassword(password)),
    isRoleNameError: (roleNameError) => dispatch(isRoleNameError(roleNameError)),
    isOrganizationError: (organizationError) => dispatch(isOrganizationError(organizationError)),
    isUsernameError: (usernameError) => dispatch(isUsernameError(usernameError)),
    isFullNameError: (fullNameError) => dispatch(isFullNameError(fullNameError)),
    isPasswordError: (passwordError) => dispatch(isPasswordError(passwordError)),
    isRoleNotFoundError: (roleNotFoundError) => dispatch(isRoleNotFoundError(roleNotFoundError)),
    login: (user) => dispatch(login(user)),
    openSnackBar: () => dispatch(showSnackBar(true)),
    closeSnackBar: () => dispatch(showSnackBar(false)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    logout: () => dispatch(logout()),
  }
}

const mapStateToProps = (state) => {
  const nodeInformation = state.getIn(['dashboard', 'nodeInformation'])
  return {
    nodePermissions: state.getIn(['adminDashboard', 'nodePermissions']),
    rolesDialogShown: state.getIn(['adminDashboard', 'rolesDialogShown']),
    usersDialogShown: state.getIn(['adminDashboard', 'usersDialogShown']),
    roleToAdd: state.getIn(['adminDashboard', 'roleToAdd']),
    userToAdd: state.getIn(['adminDashboard', 'userToAdd']),
    users: state.getIn(['login', 'users']).toJS(),
    roles: state.getIn(['login', 'roles']).toJS(),
    adminLoginShown: state.getIn(['adminDashboard', 'adminLoginShown']),
    adminCredentials: state.getIn(['adminDashboard', 'adminCredentials']),
    showRoleNameError: state.getIn(['adminDashboard', 'showRoleNameError']),
    showOrganizationError: state.getIn(['adminDashboard', 'showOrganizationError']),
    showUsernameError: state.getIn(['adminDashboard', 'showUsernameError']),
    showFullNameError: state.getIn(['adminDashboard', 'showFullNameError']),
    showPasswordError: state.getIn(['adminDashboard', 'showPasswordError']),
    showRoleNotFoundError: state.getIn(['adminDashboard', 'showRoleNotFoundError']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    loggedIn: state.getIn(['login', 'loggedIn']),
    loginUnsuccessful: state.getIn(['login', 'loginUnsuccessful']),
    showSnackBar: state.getIn(['notifications', 'showSnackBar']),
    snackBarMessage: state.getIn(['notifications', 'snackBarMessage']),
    snackBarMessageIsError: state.getIn(['notifications', 'snackBarMessageIsError']),
    nodeInformation: nodeInformation.toObject ? nodeInformation.toObject() : nodeInformation
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboardContainer);
