import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { connect } from "react-redux";

import NavbarContainer from "../Navbar/NavbarContainer";
import UserManagementContainer from "../Users/UserManagementContainer";

import OverviewContainer from "../Overview/OverviewContainer";
import NotFound from "../Error/NotFound";
import SubProjectContainer from "../SubProjects/SubProjectContainer";
import DashboardContainer from "../Dashboard/DashboardContainer";
import WorkflowContainer from "../Workflows/WorkflowContainer";
import NotificationPageContainer from "../Notifications/NotificationPageContainer";
import Placeholder from "./Placeholder";
import Footer from "./Footer";
import withInitialLoading from "../Loading/withInitialLoading";
import { initLanguage } from "../Login/actions";
import LiveNotificationContainer from "../Notifications/LiveNotificationContainer";

const Main = props => {
  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "linear-gradient(135deg, #5a9bbe 0%,#1b618c 100%)",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          backgroundImage: 'url("/navbar_back5edit.jpeg")',
          backgroundSize: "cover",
          position: "absolute",
          height: "70vh",
          width: "100%",
          clipPath: "polygon(0 0,100% 0,100% 100%,0 70%)"
        }}
      />
      <div style={{ width: "100%" }}>
        <Route component={NavbarContainer} />
      </div>
      <div className="container" style={{ marginTop: "48px" }}>
        <Route component={LiveNotificationContainer} />
        <Switch>
          <Route exact path="/" component={Placeholder} />
          <Route exact path="/projects/:project/:subproject" component={withInitialLoading(WorkflowContainer)} />
          <Route exact path="/projects" component={withInitialLoading(OverviewContainer)} />
          <Route exact path="/projects/:project" component={withInitialLoading(SubProjectContainer)} />
          <Route exact path="/network" component={DashboardContainer} />
          <Route exact path="/notifications" component={withInitialLoading(NotificationPageContainer)} />
          <Route exact path="/users" component={UserManagementContainer} />
          <Route component={NotFound} />
        </Switch>
        <Route component={Footer} />
      </div>
    </div>
  );
};

class MainContainer extends Component {
  componentWillMount() {
    this.props.initLanguage();
  }
  render() {
    return <Main />;
  }
}
const mapDispatchToProps = dispatch => {
  return {
    initLanguage: () => dispatch(initLanguage())
  };
};
export default connect(null, mapDispatchToProps)(MainContainer);
