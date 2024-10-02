import React, { Component } from "react";
import { connect } from "react-redux";

import config from "../../config";
import { appInsights } from "../../telemetry";
import {
  checkEmailService,
  initLanguage,
  loginLoading,
  loginWithToken,
  sendForgotPasswordEmail,
  setLanguage,
  storeEmail
} from "../Login/actions";
import { setValidEmailAddressInput } from "../Navbar/actions";

import ForgotPassword from "./ForgotPassword";

class ForgotPasswordContainer extends Component {
  componentDidMount() {
    this.props.initLanguage();
    this.checkIfRedirect();
    // window.injectedEnv exists when deploying via docker and nginx
    // process.env exists when using node.js
    if (window?.injectedEnv?.REACT_APP_EMAIL_SERVICE_ENABLED === "true" || config.email.isEnabled) {
      this.props.checkEmailService();
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
    return <ForgotPassword {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initLanguage: () => dispatch(initLanguage()),
    storeEmail: (email) => dispatch(storeEmail(email)),
    loginWithToken: (token) => dispatch(loginWithToken(token)),
    setLoginLoading: (showLoading) => dispatch(loginLoading(showLoading)),
    setLanguage: (language) => dispatch(setLanguage(language)),
    checkEmailService: () => dispatch(checkEmailService(false)),
    sendForgotPasswordEmail: (email, url, language) => dispatch(sendForgotPasswordEmail(email, url, language)),
    setValidEmailAddressInput: (valid) => dispatch(setValidEmailAddressInput(valid))
  };
};

const mapStateToProps = (state) => {
  return {
    userId: state.getIn(["login", "id"]),
    email: state.getIn(["login", "email"]),
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    language: state.getIn(["login", "language"]),
    loading: state.getIn(["login", "loading"]),
    emailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    isEmailAddressInputValid: state.getIn(["navbar", "isEmailAddressInputValid"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordContainer);
