import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers, login, storePassword, storeUsername, loginWithCredentails, logout, showLoginError, storeEnvironment, setLanguage, checkToken } from './actions';
import Admin from './Admin';


class AdminContainer extends Component {
  componentWillMount() {

  }

  render() {
   return(
       <Admin {...this.props}/>
   )
  }
 
}

const mapDispatchToProps = (dispatch) => {
  return {

  };
}

const mapStateToProps = (state) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminContainer);
