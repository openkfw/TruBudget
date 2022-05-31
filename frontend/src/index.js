import amber from "@mui/material/colors/amber";
import red from "@mui/material/colors/deepOrange";
import grey from "@mui/material/colors/grey";
import blue from "@mui/material/colors/indigo";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { ConnectedRouter } from "connected-react-router/immutable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import { createRoot } from "react-dom/client";
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

const muiTheme = createTheme({
  palette: {
    primary: blue,
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
    tag: {
      main: blue[400],
      selected: blue[900]
    },
    tonalOffset: 0.6
  },
  typography: {},
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "standard"
      }
    },
    MuiSelect: {
      defaultProps: {
        variant: "standard"
      }
    },
    MuiInputLabel: {
      defaultProps: {
        variant: "standard"
      }
    }
  }
});

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
              <Route component={LiveNotificationContainer} />
              <Switch>
                <Route key={1} exact path="/login" render={withRouter(withInitialLoading(LoginPageContainer))} />
                <PrivateRoute component={Main} />
              </Switch>
            </ThemeProvider>
          </StyledEngineProvider>
        </ConnectedRouter>
      </Provider>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<Root />);
