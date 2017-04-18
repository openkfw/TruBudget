import React from 'react';
import { Route, Switch } from 'react-router'

import NavbarContainer from '../Navbar/NavbarContainer';
import OverviewContainer from '../Overview/OverviewContainer';
import NotFound from '../NotFound/NotFound';
import DetailviewContainer from '../Detailview/DetailviewContainer';
import DashboardContainer from '../Dashboard/DashboardContainer';
import Notifications from '../Notifications/Notifications';

const Main = (props) => {
  return (
    <div>
      <Route component={NavbarContainer} />
      <Switch>
        <Route exact path="/" component={OverviewContainer} />
        <Route exact path="/details/:flow" component={DetailviewContainer} />
        <Route exact path="/dashboard" component={DashboardContainer} />
        <Route exact path="/notifications" component={Notifications} />
        <Route component={NotFound} />
      </Switch>
    </div>
  )
}

export default Main;
