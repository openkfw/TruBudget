import React, { Component } from 'react';

import { Tabs, Tab } from 'material-ui/Tabs';

import RolesContainer from './RolesContainer';
import UsersContainer from './UsersContainer';
import NodeInfosContainer from './NodeInfosContainer';

import strings from '../../localizeStrings';

class AdminDashboardTabs extends Component {

  componentWillMount() {
    this.props.fetchNodeInformation();
    this.props.fetchUsers();
    this.props.fetchRoles();

  }

  render() {
    return (
      <Tabs>
        <Tab label={strings.adminDashboard.roles}>
          <RolesContainer {...this.props} />
        </Tab>
        <Tab label={strings.adminDashboard.users}>
          <UsersContainer {...this.props} />
        </Tab>
        <Tab label={strings.adminDashboard.nodes}>
          <NodeInfosContainer {...this.props} />
        </Tab>
      </Tabs>
    )
  }

}



export default AdminDashboardTabs;
