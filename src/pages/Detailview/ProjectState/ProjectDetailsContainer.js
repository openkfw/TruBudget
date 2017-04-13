import React, { Component } from 'react';

import { connect } from 'react-redux';
import ProjectDetailsCard from './ProjectDetailsCard'
class ProjectDetailsContainer extends Component {

  componentWillMount() {
    console.log('Mounting')
  }

  render() {
    console.log('Rendering ProjectDetails')
      return <ProjectDetailsCard {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {

  return {

  };
}

const mapStateToProps = (state) => {

  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDetailsContainer);
