import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNodeInformation } from './actions';
import Dashboard from './Dashboard';

class DashboardContainer extends Component {
  componentWillMount() {
    this.props.fetchNodeInformation();
  }
  render() {
    return <Dashboard {...this.props}/>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNodeInformation: () => dispatch(fetchNodeInformation())
  };
}

const mapStateToProps = (state) => {
  const nodeInformation = state.getIn(['dashboard','nodeInformation'])
  return {
    nodeInformation: nodeInformation.toObject ? nodeInformation.toObject() : nodeInformation
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
