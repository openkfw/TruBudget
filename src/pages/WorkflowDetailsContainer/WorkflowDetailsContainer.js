import React, { Component } from 'react';

import WorkflowContainer from './Workflow/WorkflowContainer'

class WorkflowDetailsContainer extends Component {
  render() {
    return (
      <div>
        <WorkflowContainer {...this.props} />
      </div>
    )
  }
}

export default WorkflowDetailsContainer;
