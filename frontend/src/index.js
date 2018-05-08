import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { Route, Switch } from "react-router";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
//import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
//import getMuiTheme from "material-ui/styles/getMuiTheme";
import createHistory from "history/createBrowserHistory";

import { ACMECorpLightgrey, ACMECorpGrey, ACMECorpLightgreen, ACMECorpGreen, ACMECorpLightblue, ACMECorpBlue } from "./colors";
import red from "material-ui/colors/red";
import blue from "material-ui/colors/blue";

import Main from "./pages/Main/Main";
import LoginPageContainer from "./pages/Login/LoginPageContainer";
import PrivateRoute from "./pages/Login/PrivateRoute";

import configureStore from "./store";
import withInitialLoading from "./pages/Loading/withInitialLoading";

const history = createHistory();

const initialState = {};
const store = configureStore(initialState, history);

const muiTheme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: red
  }
});

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider theme={muiTheme}>
            <Switch>
              <Route key={1} exact path="/login" component={withInitialLoading(LoginPageContainer)} />
              <PrivateRoute component={Main} />
            </Switch>
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("root"));
