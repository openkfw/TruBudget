import React, { Component } from 'react';

import { connect } from 'react-redux';
import ProjectState from './ProjectState'
class ProjectStateContainer extends Component {
  render() {
      return <ProjectState {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectStateContainer);
