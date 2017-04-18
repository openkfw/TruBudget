import React, { Component } from 'react';

import ProjectStateContainer from './ProjectState/ProjectStateContainer'
import SubProjectsContainer from './SubProjects/SubProjectsContainer'

class ProjectDetailsContainer extends Component {
  render() {
    return (
      <div>
        <ProjectStateContainer {...this.props} />
        <SubProjectsContainer {...this.props} />
      </div>
    )
  }
}

export default ProjectDetailsContainer;
