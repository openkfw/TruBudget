import React, { Component } from "react";
import { connect } from "react-redux";
import {
  storePassword,
  storeUsername,
  loginWithCredentials,
  logout,
  storeEnvironment,
  setLanguage,
  getEnvironment,
  initLanguage,
  checkEmailService
} from "./actions";
import LoginPage from "./LoginPage";

class LoginPageContainer extends Component {
  componentDidMount() {
    this.props.initLanguage();
    this.props.getEnvironment();
    this.checkIfRedirect();
    if (process.env.EMAIL_SERVICE_ENABLED) {
      this.props.checkEmailService();
    }
  }

  componentDidUpdate() {
    this.checkIfRedirect();
  }

  checkIfRedirect() {
    const from = this.props.location && this.props.location.state && this.props.location.state.from;
    const path = from ? this.props.location.state.from : "/";

    if (this.props.jwt) this.props.history.push(path);
  }

  render() {
    return <LoginPage {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    initLanguage: () => dispatch(initLanguage()),
    storeUsername: username => dispatch(storeUsername(username)),
    storePassword: password => dispatch(storePassword(password)),
    logout: () => dispatch(logout()),
    loginWithCredentials: (username, password) => dispatch(loginWithCredentials(username, password)),
    storeEnvironment: environment => dispatch(storeEnvironment(environment)),
    getEnvironment: () => dispatch(getEnvironment()),
    setLanguage: language => dispatch(setLanguage(language)),
    checkEmailService: () => dispatch(checkEmailService())
  };
};

const mapStateToProps = state => {
  return {
    username: state.getIn(["login", "username"]),
    jwt: state.getIn(["login", "jwt"]),
    password: state.getIn(["login", "password"]),
    loginPasswordError: state.getIn(["login", "loginPasswordError"]),
    loginActivationError: state.getIn(["login", "loginActivationError"]),
    environment: state.getIn(["login", "environment"]),
    language: state.getIn(["login", "language"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
