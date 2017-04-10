import React from 'react';

import { Route, Switch } from 'react-router'

import NavbarContainer from '../Navbar/NavbarContainer';
import OverviewContainer from '../Overview/OverviewContainer';
import NotFound from '../NotFound/NotFound';

const Main = () => {
  return (
    <div>
        <NavbarContainer />
        <Switch>
          <Route exact path="/" component={OverviewContainer}/>
          <Route component={NotFound}/>
        </Switch>
    </div>
  )
}

export default Main;
