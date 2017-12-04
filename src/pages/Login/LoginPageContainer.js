import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers, login, storePassword, storeUsername, loginWithCredentails, logout, showLoginError, storeEnvironment, setLanguage, checkToken } from './actions';
import LoginPage from './LoginPage';
import LoadingContainer from '../Loading/LoadingContainer';


class LoginPageContainer extends Component {
  componentWillMount() {
   // this.props.storeDefaultEnvironment();
    this.props.checkToken();
  }

  render() {
    const { tokenPresent } = this.props;
    return (
      tokenPresent ? (
        <LoadingContainer {...this.props} />) :
        (<LoginPage {...this.props} />)
    )
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

    if (this.props.loggedIn) this.props.history.push(path);
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
    setLanguage: (language) => dispatch(setLanguage(language)),
    checkToken: () => dispatch(checkToken()),
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
    language: state.getIn(['login', 'language']),
    loggedIn: state.getIn(['login', 'loggedIn']),
    tokenPresent: state.getIn(['login', 'tokenPresent']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
