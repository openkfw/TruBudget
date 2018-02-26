import React from 'react';
import { Route, Switch } from 'react-router';

import NavbarContainer from '../Navbar/NavbarContainer';
import OverviewContainer from '../Overview/OverviewContainer';
import NotFound from '../NotFound/NotFound';
import SubProjectsContainer from '../SubProjects/SubProjectsContainer';
import DashboardContainer from '../Dashboard/DashboardContainer';
import WorkflowContainer from '../Workflows/WorkflowContainer'
import NotificationPageContainer from '../Notifications/NotificationPageContainer';
import LiveNotificationContainer from '../Notifications/LiveNotificationContainer'
import Placeholder from './Placeholder';
import LiveUpdates from '../LiveUpdates/LiveUpdatesContainer';
import Footer from './Footer';
import withInitialLoading from '../Loading/withInitialLoading';


const Main = (props) => {
  return (
    <div style={{
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
      backgroundImage: 'url("/navbar_back3.jpg")',
      backgroundSize: 'cover',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%' }}>
        <Route component={NavbarContainer} />
      </div>
      <div className="container">
        <Route component={LiveNotificationContainer} />
        <Route component={LiveUpdates} />
        <Switch>
          <Route exact path="/" component={Placeholder} />
          <Route exact path="/projects" component={withInitialLoading(OverviewContainer)} />
          <Route exact path="/projects/:project" component={withInitialLoading(SubProjectsContainer)} />
          <Route exact path="/projects/:project/:subproject" component={withInitialLoading(WorkflowContainer)} />
          <Route exact path="/network" component={DashboardContainer} />
          <Route exact path="/notifications" component={NotificationPageContainer} />
          <Route component={NotFound} />
        </Switch>
        <Route component={Footer} />
      </div>
    </div>
  )
}

export default Main;
