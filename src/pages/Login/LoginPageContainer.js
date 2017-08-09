import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers, login, storePassword, storeUsername, loginWithCredentails, logout, storeLoginErrorMessage, showLoginError, storeEnvironment } from './actions';
import LoginPage from './LoginPage';



class LoginPageContainer extends Component {
  componentWillMount() {
    this.props.storeDefaultEnvironment();
  }

  render() {
    return <LoginPage {...this.props} />
  }
  componentDidMount() {
    this.checkIfRedirect();
  }

  componentDidUpdate() {
    this.checkIfRedirect();
  }

  checkIfRedirect() {
    const from = this.props.location && this.props.location.state && this.props.location.state.from;
    const path = from ? this.props.location.state.from : '/';
    if (this.props.loggedInUser.username) this.props.history.push(path);
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(fetchUsers()),
    login: (user) => dispatch(login(user)),
    storeUsername: (username) => dispatch(storeUsername(username)),
    storePassword: (password) => dispatch(storePassword(password)),
    logout: () => dispatch(logout()),
    loginWithCredentails: (username, password) => dispatch(loginWithCredentails(username, password)),
    showLoginError: () => dispatch(showLoginError(true)),
    hideLoginError: () => dispatch(showLoginError(false)),
    storeEnvironment: (environment) => dispatch(storeEnvironment(environment)),
    storeDefaultEnvironment: () => dispatch(storeEnvironment('Test')),
  };
}

const mapStateToProps = (state) => {
  return {
    users: state.getIn(['login', 'users']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    username: state.getIn(['login', 'username']),
    password: state.getIn(['login', 'password']),
    loginUnsuccessful: state.getIn(['login', 'loginUnsuccessful']),
    environment: state.getIn(['login', 'environment']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
