import React, { Component } from 'react';

import { connect } from 'react-redux';
import DetailWorkflowView from './WorkflowCreation/DetailWorkflowView'
import ProjectDetailsContainer from './ProjectState/ProjectDetailsContainer'
import SubProject from './SubProject/WorkflowListContainer'
class DetailviewContainer extends Component {


  render() {
      return (
        <div>
        <ProjectDetailsContainer {...this.props}/>
        <SubProject {...this.props}/>
        </div>

    )
  }
}

export default DetailviewContainer;
