import { Component } from 'react';
import { connect } from 'react-redux';

import { fetchPeers, fetchStreamNames } from '../Navbar/actions';
import { fetchNotifications, fetchHistoryItems } from '../Notifications/actions';
import { fetchProjectDetails, fetchAllProjectDetails } from '../SubProjects/actions';
import { fetchWorkflowItems, fetchAllSubprojectDetails } from '../Workflows/actions';
import { fetchUpdates } from './actions';

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
    this.props.fetchUpdates(this.props.loggedInUser.id);
    switch (this.props.selectedSection) {
      case 'project':
        this.props.fetchAllProjectDetails(this.props.selectedId);
        break;
      case 'subProject':
        // Stop reloading of items, otherwise the users sort would be gone
        if (!this.props.workflowSortEnabled) {
          this.props.fetchAllSubprojectDetails(this.props.selectedId)
        }
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
    fetchPeers: () => dispatch(fetchPeers()),
    fetchNotifications: (user) => dispatch(fetchNotifications(user)),
    fetchStreamNames: () => dispatch(fetchStreamNames()),
    fetchProjectDetails: () => dispatch(fetchProjectDetails()),
    fetchHistoryItems: (project) => dispatch(fetchHistoryItems(project)),
    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),
    fetchUpdates: (user) => dispatch(fetchUpdates(user)),
    fetchAllProjectDetails: (project) => dispatch(fetchAllProjectDetails(project)),
    fetchAllSubprojectDetails: (project) => dispatch(fetchAllSubprojectDetails(project))
  };
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state.getIn(['login', 'loggedInUser']).toJS(),
    selectedId: state.getIn(['navbar', 'selectedId']),
    selectedSection: state.getIn(['navbar', 'selectedSection']),
    workflowSortEnabled: state.getIn(['workflow', 'workflowSortEnabled']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveUpdates);
