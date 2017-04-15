import React, { Component } from 'react';

import { connect } from 'react-redux';
import ProjectDetailsCard from './ProjectDetailsCard'
class ProjectDetailsContainer extends Component {

  componentWillMount() {

  }

  render() {
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
