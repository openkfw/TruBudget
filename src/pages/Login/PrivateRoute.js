import React from 'react'
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
} from 'react-router'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={props => (
      rest.loggedInUser.username ? (
        <Component {...props} />
      ) : (
          <Redirect to={{
            pathname: '/login',
            state: { from: props.location }
          }} />
        )
    )} />
  )
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state.getIn(['login', 'loggedInUser']),
  }
}

export default connect(mapStateToProps)(PrivateRoute);
