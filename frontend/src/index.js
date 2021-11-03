import amber from "@material-ui/core/colors/amber";
import red from "@material-ui/core/colors/deepOrange";
import grey from "@material-ui/core/colors/grey";
import blue from "@material-ui/core/colors/indigo";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { ConnectedRouter } from "connected-react-router/immutable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch, withRouter } from "react-router";
import "./logging/console";
import withInitialLoading from "./pages/Loading/withInitialLoading";
import LoginPageContainer from "./pages/Login/LoginPageContainer";
import PrivateRoute from "./pages/Login/PrivateRoute";
import Main from "./pages/Main/Main";
import LiveNotificationContainer from "./pages/Notifications/LiveNotificationContainer";
import configureStore from "./store";

// setup dayjs
// if you need to add time to your charts you have to add a dayjs adapter
// see: https://github.com/chartjs/Chart.js/pull/5960
dayjs.extend(relativeTime);

const history = createBrowserHistory();

export const store = configureStore(history);

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500]
    },
    secondary: red,
    error: red,
    warning: {
      main: amber[800]
    },
    info: blue,
    grey: {
      light: grey[100],
      main: grey[400],
      dark: grey[600]
    },
    tonalOffset: 0.6
  },
  typography: {}
});

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider theme={muiTheme}>
            <Route component={LiveNotificationContainer} />
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
