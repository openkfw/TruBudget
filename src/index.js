import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux'
import injectTapEventPlugin from "react-tap-event-plugin";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import createHistory from 'history/createBrowserHistory'

//import {blue900} from 'material-ui/styles/colors';
//import {blueGrey800} from 'material-ui/styles/colors';
import {ACMECorpLightgrey} from './colors'
import {ACMECorpGrey} from './colors'
import {ACMECorpDarkgrey} from './colors'
import {ACMECorpLightgreen} from './colors'
import {ACMECorpGreen} from './colors'
import {ACMECorpBlueGreen} from './colors'
import {ACMECorpLightblue} from './colors'
import {ACMECorpBlue} from './colors'
import {ACMECorpDarkBlue} from './colors'


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
