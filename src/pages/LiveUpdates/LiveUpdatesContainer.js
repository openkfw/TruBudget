import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers } from '../Login/actions';
import { fetchPeers, fetchStreamNames } from '../Navbar/actions';
import { fetchNotifications } from '../Notifications/actions';
import { fetchProjects } from '../Overview/actions';
import { fetchNodeInformation } from '../Dashboard/actions';
import { fetchProjectDetails } from '../ProjectDetails/SubProjects/actions';

class LiveUpdates extends Component {
  constructor(props) {
    super(props);

    this.timer = undefined;
  }
  componentDidMount() {
    this.startLiveUpdates();
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {
    this.stopLiveUpdates();
  }

  startLiveUpdates() {
    if (this.timer === undefined) {
      this.timer = setInterval(() => this.update(), 5000);
    }
  }

  stopLiveUpdates() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  update() {
    this.props.fetchUsers();
    this.props.fetchPeers();
    this.props.fetchNotifications(this.props.loggedInUser.id);
    this.props.fetchStreamNames();
    this.props.fetchProjects();
    this.props.fetchNodeInformation();
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(fetchUsers()),
    fetchPeers: () => dispatch(fetchPeers()),
    fetchNotifications:(user) => dispatch(fetchNotifications(user)),
    fetchStreamNames: () => dispatch(fetchStreamNames()),
    fetchProjects: () => dispatch(fetchProjects()),
    fetchNodeInformation: () => dispatch(fetchNodeInformation()),
    fetchProjectDetails: (project) => dispatch(fetchProjectDetails(project)),
  };
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state.getIn(['login', 'loggedInUser']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveUpdates);
