import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  showUsersDialog, hideUsersDialog, setUsername, setUserFullName,
  setUserPassword, setUserAvatar, setUserRole, addUser, isUsernameError, isFullNameError, isRoleNotFoundError, isPasswordError
} from './actions';
import UsersTable from './UsersTable';


class UsersContainer extends Component {

  render() {
    return (
      <div>
        <UsersTable {...this.props} />
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    showUsersDialog: () => dispatch(showUsersDialog()),
    hideUsersDialog: () => dispatch(hideUsersDialog()),
    setUsername: (username) => dispatch(setUsername(username)),
    setUserFullName: (fullName) => dispatch(setUserFullName(fullName)),
    setUserPassword: (password) => dispatch(setUserPassword(password)),
    setUserAvatar: (avatar) => dispatch(setUserAvatar(avatar)),
    setUserRole: (role) => dispatch(setUserRole(role)),
    addUser: (username, fullName, avatar, password, role) => dispatch(addUser(username, fullName, avatar, password, role)),
    isUsernameError: (usernameError) => dispatch(isUsernameError(usernameError)),
    isFullNameError: (fullNameError) => dispatch(isFullNameError(fullNameError)),
    isPasswordError: (passwordError) => dispatch(isPasswordError(passwordError)),
    isRoleNotFoundError: (roleNotFoundError) => dispatch(isRoleNotFoundError(roleNotFoundError)),
  }
}

const mapStateToProps = (state) => {
  return {
    usersDialogShown: state.getIn(['adminDashboard', 'usersDialogShown']),
    userToAdd: state.getIn(['adminDashboard', 'userToAdd']),
    showUsernameError: state.getIn(['adminDashboard', 'showUsernameError']),
    showFullNameError: state.getIn(['adminDashboard', 'showFullNameError']),
    showPasswordError: state.getIn(['adminDashboard', 'showPasswordError']),
    showRoleNotFoundError: state.getIn(['adminDashboard', 'showRoleNotFoundError']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer);
