import React, { Component } from 'react';

import { connect } from 'react-redux';
import SubProjectState from './SubProjectState'
class SubProjectStateContainer extends Component {
  render() {
      return <SubProjectState {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectStateContainer);
