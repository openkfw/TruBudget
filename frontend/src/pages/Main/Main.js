import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import ConfirmationContainer from "../Confirmation/ConfirmationContainer";
import NotFound from "../Error/NotFound";
import withInitialLoading from "../Loading/withInitialLoading";
import { initLanguage } from "../Login/actions";
import NavbarContainer from "../Navbar/NavbarContainer";
import NodesContainer from "../Nodes/NodesContainer";
import NotificationPageContainer from "../Notifications/NotificationPageContainer";
import StatusContainer from "../Status/StatusContainer";
import OverviewContainer from "../Overview/OverviewContainer";
import SubProjectContainer from "../SubProjects/SubProjectContainer";
import UserManagementContainer from "../Users/UserManagementContainer";
import WorkflowContainer from "../Workflows/WorkflowContainer";
import Footer from "./Footer";
import Placeholder from "./Placeholder";

const Main = props => {
  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "linear-gradient(135deg, #5a9bbe 0%,#1b618c 100%)",
        minHeight: "100vh",
        overflow: "scroll"
      }}
    >
      <div
        style={{
          backgroundImage: 'url("/navbar_back5edit.jpeg")',
          backgroundSize: "cover",
          position: "absolute",
          height: "auto",
          width: "100%",
          top: 0,
          left: 0,
          minHeight: "100%",
          clipPath: "polygon(0 0,100% 0,100% 100%,0 70%)"
        }}
      />
      <div style={{ width: "100%" }}>
        <Route component={NavbarContainer} />
      </div>
      <div className="container" style={{ marginTop: "48px" }}>
        <Route component={ConfirmationContainer} />
        <Switch>
          <Route exact path="/" component={Placeholder} />
          <Route exact path="/projects/:project/:subproject" component={withInitialLoading(WorkflowContainer)} />
          <Route exact path="/projects" component={withInitialLoading(OverviewContainer)} />
          <Route exact path="/projects/:project" component={withInitialLoading(SubProjectContainer)} />
          <Route exact path="/notifications" component={withInitialLoading(NotificationPageContainer)} />
          <Route exact path="/users" component={UserManagementContainer} />
          <Route exact path="/nodes" component={NodesContainer} />
          <Route exact path="/status" component={StatusContainer} />
          <Route component={NotFound} />
        </Switch>
        <Route component={Footer} />
      </div>
    </div>
  );
};

class MainContainer extends Component {
  componentDidMount() {
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
