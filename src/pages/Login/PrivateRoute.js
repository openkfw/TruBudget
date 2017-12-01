import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
} from 'react-router'
import { forceLogin } from './actions';

class PrivateRoute extends Component {

  componentWillMount() {
    this.props.forceLogin();
  }

  render() {
    const { component: Component, ...rest } = this.props;
    console.log('render')
    console.log(rest.loggedIn)
    return (
      <Route { ...rest } render={
        props => (
          rest.loggedIn ? (
            <Component {...props} />
          ) : (
              <Redirect to={{
                pathname: '/login',
                state: { from: props.location }
              }} />
            )
        )
      } />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.getIn(['login', 'loggedIn']),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    forceLogin: () => dispatch(forceLogin())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
