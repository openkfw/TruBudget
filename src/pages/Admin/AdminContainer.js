import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNodePermissions, showRolesDialog, hideRolesDialog } from './actions';
import Admin from './Admin';


class AdminContainer extends Component {
  componentWillMount() {
    this.props.fetchNodePermissions();
  }

  render() {
    return (
      <Admin {...this.props}/>
    )
  }

}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNodePermissions: () => dispatch(fetchNodePermissions()),
    showRolesDialog: () => dispatch(showRolesDialog()),
    hideRolesDialog: () => dispatch(hideRolesDialog()),
  };
}



const mapStateToProps = (state) => {
  return {
    connectedToAdminNode: state.getIn(['admin', 'connectedToAdminNode']),
    rolesDialogShown: state.getIn(['admin', 'rolesDialogShown']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminContainer);
