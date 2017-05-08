import { Component } from 'react';
import { connect } from 'react-redux';

import { fetchUsers } from '../Login/actions';
import { fetchPeers, fetchStreamNames } from '../Navbar/actions';
import { fetchNotifications, fetchHistoryItems } from '../Notifications/actions';
import { fetchProjects } from '../Overview/actions';
import { fetchNodeInformation } from '../Dashboard/actions';
import { fetchProjectDetails } from '../ProjectDetails/SubProjects/actions';
import { fetchWorkflowItems } from '../WorkflowDetailsContainer/Workflow/actions';

class LiveUpdates extends Component {
  constructor(props) {
    super(props);

    this.timer = undefined;
  }
  componentDidMount() {
    this.startLiveUpdates();
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

    switch (this.props.selectedSection) {
      case 'project':
        this.props.fetchHistoryItems(this.props.selectedId);
        this.props.fetchProjectDetails(this.props.selectedId);
        break;
      case 'subProject':
        this.props.fetchHistoryItems(this.props.selectedId);
        this.props.fetchWorkflowItems(this.props.selectedId);
        break;
      default:
        break;
    }
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(fetchUsers()),
    fetchPeers: () => dispatch(fetchPeers()),
    fetchNotifications: (user) => dispatch(fetchNotifications(user)),
    fetchStreamNames: () => dispatch(fetchStreamNames()),
    fetchProjects: () => dispatch(fetchProjects()),
    fetchNodeInformation: () => dispatch(fetchNodeInformation()),
    fetchProjectDetails: (project) => dispatch(fetchProjectDetails(project)),
    fetchHistoryItems: (project) => dispatch(fetchHistoryItems(project)),
    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),
  };
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    selectedId: state.getIn(['navbar', 'selectedId']),
    selectedSection: state.getIn(['navbar', 'selectedSection']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveUpdates);
