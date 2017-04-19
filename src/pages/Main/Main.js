import React from 'react';
import { Route, Switch } from 'react-router';

import NavbarContainer from '../Navbar/NavbarContainer';
import OverviewContainer from '../Overview/OverviewContainer';
import NotFound from '../NotFound/NotFound';
import ProjectDetailsContainer from '../ProjectDetails/ProjectDetailsContainer';
import DashboardContainer from '../Dashboard/DashboardContainer';
import WorkflowDetailsContainer from '../WorkflowDetailsContainer/WorkflowDetailsContainer'
import NotificationPageContainer from '../Notifications/NotificationPageContainer';
import Placeholder from './Placeholder';

const Main = (props) => {
  return (
    <div>
      <Route component={NavbarContainer} />
      <Switch>
        <Route exact path="/" component={Placeholder} />
        <Route exact path="/project" component={OverviewContainer} />
        <Route exact path="/project/:project" component={ProjectDetailsContainer} />
        <Route exact path="/project/:project/:subproject" component={WorkflowDetailsContainer} />
        <Route exact path="/dashboard" component={DashboardContainer} />
        <Route exact path="/notifications" component={NotificationPageContainer} />
        <Route component={NotFound} />
      </Switch>
    </div>
  )
}

export default Main;
