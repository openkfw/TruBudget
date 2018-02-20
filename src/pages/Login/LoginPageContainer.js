import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { fetchUsers, login, storePassword, storeUsername, loginWithCredentails, logout, showLoginError, storeEnvironment, setLanguage, getEnvironment } from './actions';
import LoginPage from './LoginPage';
import ProgressIndicatorContainer from '../Loading/ProgressIndicatorContainer';
import { fetchNodePermissions } from '../Admin/actions';

class LoginPageContainer extends Component {
  componentWillMount() {
    this.props.getEnvironment();
    this.props.fetchNodePermissions();
  }

  render() {
    return (
      !_.isEmpty(this.props.jwt) ? (
        <ProgressIndicatorContainer {...this.props} />) :
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
    getEnvironment: () => dispatch(getEnvironment()),
    setLanguage: (language) => dispatch(setLanguage(language)),
    fetchNodePermissions: () => dispatch(fetchNodePermissions()),
  };
}

const mapStateToProps = (state) => {
  return {
    users: state.getIn(['login', 'users']),
    username: state.getIn(['login', 'username']),
    loggedInUser: state.getIn(['login', 'loggedInUser']).toJS(),
    jwt: state.getIn(['login', 'jwt']),
    password: state.getIn(['login', 'password']),
    loginUnsuccessful: state.getIn(['login', 'loginUnsuccessful']),
    environment: state.getIn(['login', 'environment']),
    language: state.getIn(['login', 'language']),
    loggedIn: state.getIn(['login', 'loggedIn']),
    nodePermissions: state.getIn(['adminDashboard', 'nodePermissions']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
