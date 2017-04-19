import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux'
import injectTapEventPlugin from "react-tap-event-plugin";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import createHistory from 'history/createBrowserHistory'

import {
  ACMECorpLightgrey,
  ACMECorpGrey,
  ACMECorpDarkgrey,
  ACMECorpLightgreen,
  ACMECorpGreen,
  ACMECorpBlueGreen,
  ACMECorpLightblue,
  ACMECorpBlue,
  ACMECorpDarkBlue
} from './colors'

import Main from './pages/Main/Main';
import configureStore from './store';

const history = createHistory()

const initialState = {};
const store = configureStore(initialState, history);

injectTapEventPlugin();

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: ACMECorpLightgreen,
    primary2Color: ACMECorpBlue,
    primary3Color: ACMECorpLightgrey,
    accent1Color: ACMECorpGreen,
    accent2Color: ACMECorpLightblue,
    accent3Color: ACMECorpGrey,
    alternateTextColor: ACMECorpLightgrey,
  },
});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider muiTheme={muiTheme}>
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
