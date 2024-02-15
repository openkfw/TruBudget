import React, { Component } from "react";
import { connect } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import { TourAppProvider } from "../../context/tour";
import ScrollTop from "../Common/ScrollTop";
import ConfirmationContainer from "../Confirmation/ConfirmationContainer";
import NotFound from "../Error/NotFound";
import withInitialLoading from "../Loading/withInitialLoading";
import { initLanguage } from "../Login/actions";
import NavbarContainer from "../Navbar/NavbarContainer";
import NodesContainer from "../Nodes/NodesContainer";
import NotificationPageContainer from "../Notifications/NotificationPageContainer";
import OverviewContainer from "../Overview/OverviewContainer";
import StatusContainer from "../Status/StatusContainer";
import SubProjectContainer from "../SubProjects/SubProjectContainer";
import UserManagementContainer from "../Users/UserManagementContainer";
import WorkflowContainer from "../Workflows/WorkflowContainer";

import Footer from "./Footer";
import TourWrapper from "./TourWrapper";

const SubprojectElement = withInitialLoading(WorkflowContainer);
const ProjectsElement = withInitialLoading(OverviewContainer);
const ProjectElement = withInitialLoading(SubProjectContainer);
const NotificationsElement = withInitialLoading(NotificationPageContainer);

const Main = (props) => {
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
          height: "auto",
          width: "100%",
          top: 0,
          left: 0,
          minHeight: "100%",
          clipPath: "polygon(0 0,100% 0,100% 100%,0 70%)"
        }}
      />
      <div style={{ width: "100%" }}>
        <NavbarContainer />
      </div>
      <div className="container" style={{ marginTop: "48px" }}>
        <TourAppProvider>
          <TourWrapper />
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
        </TourAppProvider>
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
