import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
} from 'react-router'
import { checkToken } from './actions';

class PrivateRoute extends Component {

  componentWillMount() {

  }


  render() {
    const { component: Component, ...rest } = this.props;
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
    checkToken: () => dispatch(checkToken())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
