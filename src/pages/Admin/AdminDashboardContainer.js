import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNodePermissions, showRolesDialog, hideRolesDialog, addRole, showUsersDialog, hideUsersDialog, setRoleName, setRoleOrganization, setRoleReadPermission, setRoleWritePermission, setRoleAdminPermission, setUsername, setUserFullName, setUserPassword, setUserAvatar, loginAdminUser, setUserRole, addUser, showAdminLogin, hideAdminLogin, setAdminUsername, setAdminPassword } from './actions';
import { fetchUsers, fetchRoles } from '../Login/actions';
import { fetchNodeInformation } from '../Dashboard/actions';
import AdminDashboard from './AdminDashboard';


class AdminDashboardContainer extends Component {
  componentWillMount() {
    this.props.fetchNodePermissions();
    this.props.fetchUsers();
    this.props.fetchRoles();
    this.props.fetchNodeInformation();
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
    loginAdminUser: (username, password) => dispatch(loginAdminUser(username, password))

  };
}


const mapStateToProps = (state) => {
  const nodeInformation = state.getIn(['dashboard', 'nodeInformation'])
  return {
    connectedToAdminNode: state.getIn(['adminDashboard', 'connectedToAdminNode']),
    rolesDialogShown: state.getIn(['adminDashboard', 'rolesDialogShown']),
    usersDialogShown: state.getIn(['adminDashboard', 'usersDialogShown']),
    roleToAdd: state.getIn(['adminDashboard', 'roleToAdd']),
    userToAdd: state.getIn(['adminDashboard', 'userToAdd']),
    users: state.getIn(['login', 'users']).toJS(),
    roles: state.getIn(['login', 'roles']).toJS(),
    adminLoginShown: state.getIn(['adminDashboard', 'adminLoginShown']),
    adminCredentials: state.getIn(['adminDashboard', 'adminCredentials']),
    adminLoggedIn: state.getIn(['adminDashboard', 'adminLoggedIn']),
    adminLoginFailed: state.getIn(['adminDashboard', 'adminLoginFailed']),
    nodeInformation: nodeInformation.toObject ? nodeInformation.toObject() : nodeInformation
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboardContainer);
