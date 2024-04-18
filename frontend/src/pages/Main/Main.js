import React, { Component } from "react";
import { connect } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import ScrollTop from "../Common/ScrollTop";
import ConfirmationContainer from "../Confirmation/ConfirmationContainer";
import NotFound from "../Error/NotFound";
import withInitialLoading from "../Loading/withInitialLoading";
import { initLanguage } from "../Login/actions";
import Breadcrumbs from "../Navbar/Breadcrumbs";
import NavbarContainer from "../Navbar/NavbarContainer";
import NodesContainer from "../Nodes/NodesContainer";
import NotificationPageContainer from "../Notifications/NotificationPageContainer";
import OverviewContainer from "../Overview/OverviewContainer";
import StatusContainer from "../Status/StatusContainer";
import SubProjectContainer from "../SubProjects/SubProjectContainer";
import UserManagementContainer from "../Users/UserManagementContainer";
import WorkflowContainer from "../Workflows/WorkflowContainer";

import Footer from "./Footer";

import "./Main.scss";

const SubprojectElement = withInitialLoading(WorkflowContainer);
const ProjectsElement = withInitialLoading(OverviewContainer);
const ProjectElement = withInitialLoading(SubProjectContainer);
const NotificationsElement = withInitialLoading(NotificationPageContainer);

const Main = (props) => {
  return (
    <div className="main">
      <div className="main-image" />
      <div className="main-nav">
        <NavbarContainer />
        <Breadcrumbs />
      </div>
      <div className="main-container">
        <ConfirmationContainer />
        <Routes>
          <Route exact path="/" element={<Navigate to="/projects" replace />} />
          <Route exact path="/projects/:project/:subproject" element={<SubprojectElement />} />
          <Route exact path="/projects" element={<ProjectsElement />} />
          <Route exact path="/projects/:project" element={<ProjectElement />} />
          <Route exact path="/notifications" element={<NotificationsElement />} />
          <Route exact path="/users" element={<UserManagementContainer />} />
          <Route exact path="/nodes" element={<NodesContainer />} />
          <Route exact path="/status" element={<StatusContainer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ScrollTop window={props.window} />
        <Footer />
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

const mapDispatchToProps = (dispatch) => {
  return {
    initLanguage: () => dispatch(initLanguage())
  };
};

export default connect(null, mapDispatchToProps)(MainContainer);
