import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import NavbarContainer from '../Navbar/NavbarContainer';

const Main = () => {
  return (
    <MuiThemeProvider>
        <NavbarContainer />
    </MuiThemeProvider>
  )
}

export default Main;
