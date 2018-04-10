import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  showRolesDialog, hideRolesDialog, addRole, setRoleName, setRoleOrganization, setRoleReadPermission, setRoleWritePermission, setRoleAdminPermission,
  isRoleNameError, isOrganizationError
} from './actions';
import RolesTable from './RolesTable';


class RolesContainer extends Component {

  render() {
    return (
      <div>
        <RolesTable {...this.props} />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showRolesDialog: () => dispatch(showRolesDialog()),
    hideRolesDialog: () => dispatch(hideRolesDialog()),
    setRoleName: (name) => dispatch(setRoleName(name)),
    setRoleOrganization: (organization) => dispatch(setRoleOrganization(organization)),
    setRoleReadPermission: (read) => dispatch(setRoleReadPermission(read)),
    setRoleWritePermission: (write) => dispatch(setRoleWritePermission(write)),
    setRoleAdminPermission: (admin) => dispatch(setRoleAdminPermission(admin)),
    isRoleNameError: (roleNameError) => dispatch(isRoleNameError(roleNameError)),
    isOrganizationError: (organizationError) => dispatch(isOrganizationError(organizationError)),
    addRole: (name, organization, read, write, admin) => dispatch(addRole(name, organization, read, write, admin)),
  }
}

const mapStateToProps = (state) => {
  return {
    rolesDialogShown: state.getIn(['adminDashboard', 'rolesDialogShown']),
    roleToAdd: state.getIn(['adminDashboard', 'roleToAdd']),
    showRoleNameError: state.getIn(['adminDashboard', 'showRoleNameError']),
    showOrganizationError: state.getIn(['adminDashboard', 'showOrganizationError']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RolesContainer);
