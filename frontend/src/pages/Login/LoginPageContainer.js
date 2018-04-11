import React, { Component } from 'react';
import { connect } from 'react-redux';
import { storePassword, storeUsername, loginWithCredentails, logout, showLoginError, storeEnvironment, setLanguage, getEnvironment } from './actions';
import LoginPage from './LoginPage';
//import { fetchNodePermissions } from '../Admin/actions';
//import { fetchUserWithToken } from '../Loading/actions';

class LoginPageContainer extends Component {
  componentWillMount() {
    this.props.getEnvironment();

    // this.props.fetchNodePermissions();

    // if (!_.isEmpty(this.props.jwt)) {
    //   this.props.fetchUserWithToken(true)
    // }
  }

  render() {
    return (
      <LoginPage {...this.props} />
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

    if (this.props.jwt) this.props.history.push(path);
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    storeUsername: (username) => dispatch(storeUsername(username)),
    storePassword: (password) => dispatch(storePassword(password)),
    logout: () => dispatch(logout()),
    loginWithCredentails: (username, password) => dispatch(loginWithCredentails(username, password)),
    showLoginError: () => dispatch(showLoginError(true)),
    hideLoginError: () => dispatch(showLoginError(false)),
    storeEnvironment: (environment) => dispatch(storeEnvironment(environment)),
    getEnvironment: () => dispatch(getEnvironment()),
    setLanguage: (language) => dispatch(setLanguage(language)),
    //fetchNodePermissions: () => dispatch(fetchNodePermissions()),
    //fetchUserWithToken: (showLoading) => dispatch(fetchUserWithToken(showLoading))
  };
}

const mapStateToProps = (state) => {
  return {
    username: state.getIn(['login', 'username']),
    jwt: state.getIn(['login', 'jwt']),
    password: state.getIn(['login', 'password']),
    loginUnsuccessful: state.getIn(['login', 'loginUnsuccessful']),
    environment: state.getIn(['login', 'environment']),
    language: state.getIn(['login', 'language']),
    //nodePermissions: state.getIn(['adminDashboard', 'nodePermissions']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
