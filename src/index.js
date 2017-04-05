import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';

import Main from './pages/Main/Main';

import configureStore from './store';

const initialState = {};
const store = configureStore(initialState, browserHistory);

class App extends Component {
  render() {
    return (
      <Provider store = {store}>
        <Main />
      </Provider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);