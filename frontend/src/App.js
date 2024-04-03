import React from "react";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router-dom";
import dayjs from "dayjs";
import * as isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import * as relativeTime from "dayjs/plugin/relativeTime";
import { HistoryRouter as Router } from "redux-first-history/rr6";

import { Experimental_CssVarsProvider as CssVarsProvider, StyledEngineProvider } from "@mui/material/styles";

import "./logging/console";

import withInitialLoading from "./pages/Loading/withInitialLoading";
import LoginPageContainer from "./pages/Login/LoginPageContainer";
import PrivateRoute from "./pages/Login/PrivateRoute";
import Main from "./pages/Main/Main";
import LiveNotificationContainer from "./pages/Notifications/LiveNotificationContainer";
import { muiTheme } from "./themes/theme";
import { withRouter } from "./wrappers/withRouter";
import { history, store } from "./store";

dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);
const LoginElement = withRouter(withInitialLoading(LoginPageContainer));

export default function App() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <StyledEngineProvider injectFirst>
          <CssVarsProvider theme={muiTheme}>
            <LiveNotificationContainer />
            <Routes>
              <Route key={1} exact path="/login" element={<LoginElement />} />
              <Route
                path="*"
                element={
                  <PrivateRoute redirectTo="/login">
                    <Main />
                  </PrivateRoute>
                }
              />
            </Routes>
          </CssVarsProvider>
        </StyledEngineProvider>
      </Router>
    </Provider>
  );
}
