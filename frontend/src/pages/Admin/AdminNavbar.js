import React from 'react';
import AppBar from 'material-ui/AppBar';
import LogoutIcon from '../Navbar/LogoutIcon';
import strings from '../../localizeStrings';

const AdminNavbar = ({ productionActive, history, logoutAdmin }) => {
  const textColor = productionActive ? '#f0ebe6' : '#f44336'
  const navbarTitle = productionActive ? strings.adminDashboard.title : `${strings.adminDashboard.title} (Test)`
  return (
    <AppBar showMenuIconButton={false} style={{ backgroundColor: 'transparent', boxShadow: 'transparent' }} titleStyle={{ color: textColor }}
      title={navbarTitle} iconElementRight={<LogoutIcon history={history} logout={logoutAdmin} />} />
  )
}
export default AdminNavbar;
