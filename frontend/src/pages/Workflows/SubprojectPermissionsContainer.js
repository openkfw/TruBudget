import React, { Component } from 'react';
import { connect } from 'react-redux';
import PermissionsScreen from '../Common/Permissions/PermissionsScreen';
import { fetchSubProjectPermissions, hideSubProjectPermissions, grantSubProjectPermission } from './actions';
import withInitialLoading from '../Loading/withInitialLoading';
import { toJS } from '../../helper';
import { fetchUser } from '../Login/actions';

class SubProjectPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchSubProjectPermissions(this.props.projectId, this.props.subProjectId, true);
      this.props.fetchUser();
    }
  }

  grantPermission = (_, permission, user) => {
    this.props.grantPermission(this.props.projectId, this.props.subProjectId, permission, user)
  }

  render() {
    return <PermissionsScreen
      {...this.props}
      grantPermission={this.grantPermission} />
  }
}

const mapStateToProps = (state) => {
  return {
    permissions: state.getIn(['workflow', 'permissions']),
    user: state.getIn(['login', 'user']),
    show: state.getIn(['workflow', 'showSubProjectPermissions']),
    id: state.getIn(['workflow', 'id']),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: () => dispatch(hideSubProjectPermissions()),
    grantPermission: (pId, sId, permission, user) => dispatch(grantSubProjectPermission(pId, sId, permission, user, true)),
    fetchSubProjectPermissions: (pId, sId, showLoading) => dispatch(fetchSubProjectPermissions(pId, sId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectPermissionsContainer)))
