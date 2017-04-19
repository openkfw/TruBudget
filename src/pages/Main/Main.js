import React from 'react';
import { Route, Switch } from 'react-router'

import NavbarContainer from '../Navbar/NavbarContainer';
import OverviewContainer from '../Overview/OverviewContainer';
import NotFound from '../NotFound/NotFound';
import ProjectDetailsContainer from '../ProjectDetails/ProjectDetailsContainer';
import DashboardContainer from '../Dashboard/DashboardContainer';
import WorkflowDetailsContainer from '../WorkflowDetailsContainer/WorkflowDetailsContainer'
import NotificationPageContainer from '../Notifications/NotificationPageContainer';
import LiveNotificationContainer from '../Notifications/LiveNotificationContainer'
const Main = (props) => {
  return (
    <div>
      <Route component={NavbarContainer} />
      <Route component={LiveNotificationContainer} />
      <Switch>
        <Route exact path="/" component={OverviewContainer} />
        <Route exact path="/details/:project" component={ProjectDetailsContainer} />
        <Route exact path="/details/:project/:subproject" component={WorkflowDetailsContainer} />
        <Route exact path="/dashboard" component={DashboardContainer} />
        <Route exact path="/notifications" component={NotificationPageContainer} />
        <Route component={NotFound} />
      </Switch>

    </div>
  )
}

export default Main;
