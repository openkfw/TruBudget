import React, { Component } from 'react';

import SubProjectStateContainer from './SubProjectState/SubProjectStateContainer'
import WorkflowContainer from './Workflow/WorkflowContainer'

class WorkflowDetailsContainer extends Component {
  render() {
    return (
      <div>
        <SubProjectStateContainer {...this.props} />
        <WorkflowContainer {...this.props} />
      </div>
    )
  }
}

export default WorkflowDetailsContainer;
