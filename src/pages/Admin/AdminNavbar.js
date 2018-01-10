import React from 'react';
import AppBar from 'material-ui/AppBar';
import LogoutIcon from '../Navbar/LogoutIcon';
import strings from '../../localizeStrings';

const AdminNavbar = (props) => (
    <AppBar showMenuIconButton={ false } style={ { backgroundColor: 'transparent', boxShadow: 'transparent' } } title={ strings.adminDashboard.title } iconElementRight={ <LogoutIcon history={ props.history } logout={ props.logout } /> } />
)
export default AdminNavbar;