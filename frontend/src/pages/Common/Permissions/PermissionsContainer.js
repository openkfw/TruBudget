import React, { Component } from 'react';
import { connect } from 'react-redux';
import PermissionsScreen from './PermissionsScreen';
import { toJS } from '../../../helper';
import withInitialLoading from '../../Loading/withInitialLoading';
import { hideProjectPermissions, grantPermission } from '../../SubProjects/actions';

class PermissionsContainer extends Component {
  render() {
    return <PermissionsScreen {...this.props} />
  }
}

const mapStateToProps = (state) => {
  return {
    permissions: state.getIn(['detailview', 'permissions']),
    user: state.getIn(['login', 'user']),
    show: state.getIn(['detailview', 'permissionDialogShown']),
    id: state.getIn(['detailview', 'id']),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: () => dispatch(hideProjectPermissions()),
    onCancel: () => dispatch(hideProjectPermissions()),
    grantPermission: (projectId, permission, user) => dispatch(grantPermission(projectId, permission, user, true))
  }
}


PermissionsContainer.defaultProps = {
  show: false,
  onSubmit: () => alert("On submit callback not set"),
  onCancel: () => alert("On cancel callback not set")
}

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(PermissionsContainer)))
