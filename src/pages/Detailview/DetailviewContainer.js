import React, { Component } from 'react';

import { connect } from 'react-redux';
import DetailWorkflowView from './WorkflowCreation/DetailWorkflowView'
import ProjectDetailsContainer from './ProjectState/ProjectDetailsContainer'
import FlowList from './WorkflowList/WorkflowListContainer'
class DetailviewContainer extends Component {


  render() {
      return (
        <div>
        <ProjectDetailsContainer/>
        <FlowList {...this.props}/>
        </div>

    )
  }
}

export default DetailviewContainer;
