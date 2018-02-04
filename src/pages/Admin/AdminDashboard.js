import React from 'react';


import AdminLoginDialog from './AdminLoginDialog';
import { isAdminNode } from '../../helper';
import NotificationsSnackbar from '../Notifications/NotificationsSnackbar';
import AdminNavbar from './AdminNavbar';
import AdminDashboardTabs from './AdminDashboardTabs';

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
  }
};


const AdminDashBoard = (props) => {
  const { adminLoggedIn, nodePermissions, loggedInAdminUser } = props;
  const connectedToAdminNode = isAdminNode(nodePermissions);
  return (
    <div style={styles.backgroundImage}>
      <AdminNavbar {...props} />
      {!(adminLoggedIn && connectedToAdminNode > -1 && loggedInAdminUser.adminUser) ? (
        <AdminLoginDialog {...props} />) : (
          <div style={styles.tabsContainer}>
            <AdminDashboardTabs {...props} />
            <NotificationsSnackbar {...props} />
          </div>

        )}
    </div>
  )
}
export default AdminDashBoard;
