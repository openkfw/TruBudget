import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router/immutable";
import { Route, Switch, withRouter } from "react-router";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { createBrowserHistory } from "history";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import red from "@material-ui/core/colors/deepOrange";
import blue from "@material-ui/core/colors/indigo";
import grey from "@material-ui/core/colors/grey";
import amber from "@material-ui/core/colors/amber";

import Main from "./pages/Main/Main";
import LoginPageContainer from "./pages/Login/LoginPageContainer";
import PrivateRoute from "./pages/Login/PrivateRoute";

import configureStore from "./store";
import withInitialLoading from "./pages/Loading/withInitialLoading";

// setup dayjs
// if you need to add time to your charts you have to add a dayjs adapter
// see: https://github.com/chartjs/Chart.js/pull/5960
dayjs.extend(relativeTime);

const history = createBrowserHistory();

const store = configureStore(history);

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500]
    },
    secondary: red,
    error: red,
    warning: amber,
    info: blue,
    grey: {
      main: grey[100]
    },
    tonalOffset: 0.6
  },
  typography: {
    useNextVariants: true
  }
});

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider theme={muiTheme}>
            <Switch>
              <Route key={1} exact path="/login" render={withRouter(withInitialLoading(LoginPageContainer))} />
              <PrivateRoute component={Main} />
            </Switch>
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("root"));
