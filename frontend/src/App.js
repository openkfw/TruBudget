import React from "react";
import { Provider } from "react-redux";
import { Route, Switch, withRouter } from "react-router";
// import { HistoryRouter as Router } from "redux-first-history/rr6";
import { Router } from "react-router-dom";
import dayjs from "dayjs";
import * as isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import * as relativeTime from "dayjs/plugin/relativeTime";

import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";

import "./logging/console";

import withInitialLoading from "./pages/Loading/withInitialLoading";
import LoginPageContainer from "./pages/Login/LoginPageContainer";
import PrivateRoute from "./pages/Login/PrivateRoute";
import Main from "./pages/Main/Main";
import LiveNotificationContainer from "./pages/Notifications/LiveNotificationContainer";
import { muiTheme } from "./themes/theme";
import { history, store } from "./store";

dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);

export default function App() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={muiTheme}>
            <Route component={LiveNotificationContainer} />
            <Switch>
              <Route key={1} exact path="/login" render={withRouter(withInitialLoading(LoginPageContainer))} />
              <PrivateRoute component={Main} />
            </Switch>
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>
    </Provider>
  );
}
