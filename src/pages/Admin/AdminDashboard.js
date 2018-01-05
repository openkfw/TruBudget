import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
import RolesTable from './RolesTable';
import UsersTable from './UsersTable';
import NodeInfosTable from './NodeInfosTable';
import AdminLoginDialog from './AdminLoginDialog';
import { isAdminNode } from '../../helper';
import NotificationsSnackbar from '../Notifications/NotificationsSnackbar';

const styles = {
  backgroundImage: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    backgroundImage: 'url("/navbar_back3.jpg")',
    backgroundSize: 'cover',
    alignItems: 'center',
    minHeight: '900px'
  },
  tabsContainer: {
    width: '60%',
    marginTop: '50px'
  },
  snackbarStyle: {
    backgroundColor: 'red',
    color: 'white'
  }
};


const AdminDashBoard = (props) => {
  const {loggedIn, nodePermissions, loggedInUser} = props;
  const connectedToAdminNode = isAdminNode(nodePermissions);

  return (
    <div style={ styles.backgroundImage }>
      { !(loggedIn && connectedToAdminNode > -1 && loggedInUser.role.admin) ? (
        <AdminLoginDialog {...props}/> ) : (
        <div style={ styles.tabsContainer }>
          <Tabs>
            <Tab label="Roles">
              <RolesTable {...props} />
            </Tab>
            <Tab label="Users">
              <UsersTable {...props} />
            </Tab>
            <Tab label="Nodes">
              <NodeInfosTable {...props}/>
            </Tab>
          </Tabs>
          />
          <NotificationsSnackbar {...props}/>
        </div>
        ) }
    </div>
  )
}
export default AdminDashBoard;