import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Home from 'material-ui/svg-icons/action/home';
import RolesTable from './RolesTable';
import UsersTable from './UsersTable';
import NodeInfosTable from './NodeInfosTable';
import AdminLoginDialog from './AdminLoginDialog';
import { isAdminNode } from '../../helper';
import NotificationsSnackbar from '../Notifications/NotificationsSnackbar';
import strings from '../../localizeStrings';

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
  },
  actionButtonDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center'
  }
};


const AdminDashBoard = (props) => {
  const {loggedIn, nodePermissions, loggedInUser, history} = props;
  const connectedToAdminNode = isAdminNode(nodePermissions);

  return (
    <div style={ styles.backgroundImage }>
      { !(loggedIn && connectedToAdminNode > -1 && loggedInUser.role.admin) ? (
        <AdminLoginDialog {...props}/> ) : (
        <div style={ styles.tabsContainer }>
          <Tabs>
            <Tab label={ strings.adminDashboard.roles }>
              <RolesTable {...props} />
            </Tab>
            <Tab label={ strings.adminDashboard.users }>
              <UsersTable {...props} />
            </Tab>
            <Tab label={ strings.adminDashboard.nodes }>
              <NodeInfosTable {...props}/>
            </Tab>
          </Tabs>
          <div style={ styles.actionButtonDiv }>
            <FloatingActionButton onClick={ () => history.push('/') }>
              <Home />
            </FloatingActionButton>
          </div>
          <NotificationsSnackbar {...props}/>
        </div>
        ) }
    </div>
  )
}
export default AdminDashBoard;