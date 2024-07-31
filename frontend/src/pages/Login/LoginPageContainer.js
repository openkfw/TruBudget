import React, { Component } from "react";
import { connect } from "react-redux";

import { appInsights } from "../../telemetry";

import config from "./../../config";
import {
  checkEmailService,
  checkExportService,
  initLanguage,
  loginLoading,
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
    this.setAuthenticatedUser(this.props.userId);
  }

  checkIfRedirect() {
    const from =
      this.props.router.location && this.props.router.location.state && this.props.router.location.state.from;
    const path = from ? this.props.router.location.state.from : "/";
    const token = new URLSearchParams(this.props.location.search).get("token");
    if (token) {
      this.props.setLoginLoading(true);
      this.props.loginWithToken(token);
    }
    if (this.props.isUserLoggedIn) {
      this.props.setLoginLoading(false);
      setTimeout(() => this.props.router.navigate(path));
    }
  }

  setAuthenticatedUser(signInId) {
    if (!signInId) {
      return;
    }
    const validatedId = signInId.replace(/[,;=| ]+/g, "_");
    if (!Object.is(appInsights, null)) {
      appInsights.setAuthenticatedUserContext(validatedId, undefined, true);
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
    setLoginLoading: (showLoading) => dispatch(loginLoading(showLoading)),
    setLanguage: (language) => dispatch(setLanguage(language)),
    checkEmailService: () => dispatch(checkEmailService(false)),
    checkExportService: () => dispatch(checkExportService(false))
  };
};

const mapStateToProps = (state) => {
  return {
    userId: state.getIn(["login", "id"]),
    username: state.getIn(["login", "username"]),
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    password: state.getIn(["login", "password"]),
    language: state.getIn(["login", "language"]),
    loginError: state.getIn(["login", "loginError"]),
    loading: state.getIn(["login", "loading"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
