import React, { Component } from 'react';

import SubProjectsContainer from './SubProjects/SubProjectsContainer'

class ProjectDetailsContainer extends Component {
  render() {
    return (
      <div>
        <SubProjectsContainer {...this.props} />
      </div>
    )
  }
}

export default ProjectDetailsContainer;
