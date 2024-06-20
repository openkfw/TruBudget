import React, { Component } from "react";
import { connect } from "react-redux";

import { appInsights } from "../../telemetry";
import { initLanguage, loginLoading, loginWithToken, setLanguage } from "../Login/actions";

import ResetPassword from "./ResetPassword";

class ResetPasswordContainer extends Component {
  componentDidMount() {
    this.props.initLanguage();
    this.checkIfRedirect();
    this.checkResetPasswordUrl();
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

  checkResetPasswordUrl() {
    const userId = new URLSearchParams(this.props.location.search).get("id");
    const token = new URLSearchParams(this.props.location.search).get("resetToken");
    if (!userId || !token) {
      setTimeout(() => this.props.router.navigate("/login"));
    }
  }

  render() {
    return <ResetPassword {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initLanguage: () => dispatch(initLanguage()),
    loginWithToken: (token) => dispatch(loginWithToken(token)),
    setLoginLoading: (showLoading) => dispatch(loginLoading(showLoading)),
    setLanguage: (language) => dispatch(setLanguage(language))
    // createNewPassword: () => dispatch(createNewPassword(userId, newPassword))
  };
};

const mapStateToProps = (state) => {
  return {
    userId: state.getIn(["login", "id"]),
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    language: state.getIn(["login", "language"]),
    loading: state.getIn(["login", "loading"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordContainer);
