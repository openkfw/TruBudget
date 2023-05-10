import React from "react";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, redirectTo, isUserLoggedIn }) {
  return isUserLoggedIn ? children : <Navigate to={redirectTo} />;
}

const mapStateToProps = (state) => {
  return {
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"])
  };
};
const mapDispatchToProps = (_dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
