import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNodePermissions, showRolesDialog, hideRolesDialog, showAdminLogin, hideAdminLogin, setAdminUsername, setAdminPassword } from './actions';
import { fetchUsers, fetchRoles, loginAdmin, logoutAdmin, logout } from '../Login/actions';
import { fetchNodeInformation } from '../Dashboard/actions';
import AdminDashboard from './AdminDashboard';
import { showSnackBar, storeSnackBarMessage } from '../Notifications/actions';



class AdminDashboardContainer extends Component {
  componentWillMount() {
    this.props.fetchNodePermissions();
    this.props.logoutRegularUser();
  }


  componentWillUnmount() {
    this.props.hideAdminLogin()
    this.props.logoutAdmin()
  }

  render() {
    return (
      <AdminDashboard {...this.props} />
    )
  }

}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNodePermissions: () => dispatch(fetchNodePermissions()),
    showRolesDialog: () => dispatch(showRolesDialog()),
    hideRolesDialog: () => dispatch(hideRolesDialog()),
    fetchUsers: () => dispatch(fetchUsers()),
    fetchRoles: () => dispatch(fetchRoles()),
    fetchNodeInformation: () => dispatch(fetchNodeInformation()),
    hideAdminLogin: () => dispatch(hideAdminLogin()),
    showAdminLogin: () => dispatch(showAdminLogin()),
    setAdminUsername: (username) => dispatch(setAdminUsername(username)),
    setAdminPassword: (password) => dispatch(setAdminPassword(password)),
    loginAdmin: (user) => dispatch(loginAdmin(user)),
    openSnackBar: () => dispatch(showSnackBar(true)),
    closeSnackBar: () => dispatch(showSnackBar(false)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    logoutAdmin: () => dispatch(logoutAdmin()),
    logoutRegularUser: () => dispatch(logout()),

  }
}

const mapStateToProps = (state) => {
  return {
    nodePermissions: state.getIn(['adminDashboard', 'nodePermissions']),
    usersDialogShown: state.getIn(['adminDashboard', 'usersDialogShown']),
    userToAdd: state.getIn(['adminDashboard', 'userToAdd']),
    users: state.getIn(['login', 'users']).toJS(),
    roles: state.getIn(['login', 'roles']).toJS(),
    adminLoginShown: state.getIn(['adminDashboard', 'adminLoginShown']),
    adminCredentials: state.getIn(['adminDashboard', 'adminCredentials']),
    loggedInAdminUser: state.getIn(['login', 'loggedInAdminUser']),
    adminLoggedIn: state.getIn(['login', 'adminLoggedIn']),
    adminLoginFailed: state.getIn(['login', 'adminLoginFailed']),
    showSnackBar: state.getIn(['notifications', 'showSnackBar']),
    snackBarMessage: state.getIn(['notifications', 'snackBarMessage']),
    snackBarMessageIsError: state.getIn(['notifications', 'snackBarMessageIsError']),
    nodeInformation: state.getIn(['dashboard', 'nodeInformation']).toJS()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboardContainer);
