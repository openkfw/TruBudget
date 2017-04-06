import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import NavbarContainer from '../Navbar/NavbarContainer';
import Overview from '../Overview/Overview';

const Main = () => {
  return (
    <div>
        <NavbarContainer />
        <Overview />
    </div>
  )
}

export default Main;
