import React, { Component } from 'react';

import { connect } from 'react-redux';
import ProjectDetailsCard from './ProjectDetailsCard'
class ProjectDetailsContainer extends Component {
  render() {
      return <ProjectDetailsCard {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return undefined
}

const mapStateToProps = (state) => {
  return undefined
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDetailsContainer);
