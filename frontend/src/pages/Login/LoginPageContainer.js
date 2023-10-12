import React, { Component } from "react";
import { connect } from "react-redux";

import config from "./../../config";
import {
  checkEmailService,
  checkExportService,
  initLanguage,
  loginWithCredentials,
  loginWithToken,
  logout,
  setLanguage,
  storePassword,
  storeUsername
} from "./actions";
import LoginPage from "./LoginPage";

class LoginPageContainer extends Component {
  componentDidMount() {
    this.props.initLanguage();
    this.checkIfRedirect();
    // window.injectedEnv exists when deploying via docker and nginx
    // process.env exists when using node.js
    if (window?.injectedEnv?.REACT_APP_EMAIL_SERVICE_ENABLED === "true" || config.email.isEnabled) {
      this.props.checkEmailService();
    }
    if (window?.injectedEnv?.REACT_APP_EXPORT_SERVICE_ENABLED === "true" || config.export.isEnabled) {
      this.props.checkExportService();
    }
  }

  componentDidUpdate() {
    this.checkIfRedirect();
  }

  checkIfRedirect() {
    const from =
      this.props.router.location && this.props.router.location.state && this.props.router.location.state.from;
    const path = from ? this.props.router.location.state.from : "/";
    const token = new URLSearchParams(this.props.location.search).get("token");
    if (token) {
      this.props.loginWithToken(token);
    }
    if (this.props.isUserLoggedIn) {
      this.props.router.navigate(path);
    }
  }

  render() {
    return <LoginPage {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initLanguage: () => dispatch(initLanguage()),
    storeUsername: (username) => dispatch(storeUsername(username)),
    storePassword: (password) => dispatch(storePassword(password)),
    logout: () => dispatch(logout()),
    loginWithCredentials: (username, password) => dispatch(loginWithCredentials(username, password)),
    loginWithToken: (token) => dispatch(loginWithToken(token)),
    setLanguage: (language) => dispatch(setLanguage(language)),
    checkEmailService: () => dispatch(checkEmailService(false)),
    checkExportService: () => dispatch(checkExportService(false))
  };
};

const mapStateToProps = (state) => {
  return {
    username: state.getIn(["login", "username"]),
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    password: state.getIn(["login", "password"]),
    language: state.getIn(["login", "language"]),
    loginError: state.getIn(["login", "loginError"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
