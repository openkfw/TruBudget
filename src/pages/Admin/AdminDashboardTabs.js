import React, { Component } from 'react';

import { Tabs, Tab } from 'material-ui/Tabs';

import RolesTable from './RolesTable';
import UsersTable from './UsersTable';
import NodeInfosTable from './NodeInfosTable';

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
                    <RolesTable {...this.props} />
                </Tab>
                <Tab label={strings.adminDashboard.users}>
                    <UsersTable {...this.props} />
                </Tab>
                <Tab label={strings.adminDashboard.nodes}>
                    <NodeInfosTable {...this.props} />
                </Tab>
            </Tabs>
        )
    }

}



export default AdminDashboardTabs;
