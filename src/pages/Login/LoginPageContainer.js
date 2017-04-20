import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers, login } from './actions';
import LoginPage from './LoginPage';

class LoginPageContainer extends Component {
  componentWillMount() {
    this.props.fetchUsers();
  }
  render() {
    return <LoginPage {...this.props} />
  }
  componentDidMount() {
    this.checkIfRedirect();
  }

  componentDidUpdate() {
    this.checkIfRedirect();
  }

  checkIfRedirect() {
    const from = this.props.location && this.props.location.state && this.props.location.state.from;
    const path = from ? this.props.location.state.from : '/';
    if (this.props.loggedInUser.username) this.props.history.push(path);
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(fetchUsers()),
    login: (user) => dispatch(login(user))
  };
}

const mapStateToProps = (state) => {
  return {
    users: state.getIn(['login', 'users']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageContainer);
