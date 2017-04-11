import React, { Component } from 'react';

import { connect } from 'react-redux';
import DetailWorkflowView from './WorkflowCreation/DetailWorkflowView'
import FlowList from './WorkflowList/WorkflowListContainer'
class DetailviewContainer extends Component {


  render() {
      return (
        <div>
        <DetailWorkflowView/>
        <FlowList/>
        </div>

    )
  }
}

export default DetailviewContainer;
