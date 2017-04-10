import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyRouterMiddleware, Router } from 'react-router';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import injectTapEventPlugin from "react-tap-event-plugin";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createHistory from 'history/createBrowserHistory'


import Main from './pages/Main/Main';
import configureStore from './store';

const history = createHistory()

const initialState = {};
const store = configureStore(initialState, history);

injectTapEventPlugin();

class App extends Component {
  render() {
    return (
      <Provider store = {store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider>
            <Main />
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);