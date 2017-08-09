import React from 'react';
import IconButton from 'material-ui/IconButton';
import PowerIcon from 'material-ui/svg-icons/action/power-settings-new';

import colors from '../../colors'

const LogoutIcon = ({ history, logout }) => {
  return (
    <IconButton
      tooltip="Logout"
      onTouchTap={() => {
        logout();
        history.push('/login');
      }}>
      <PowerIcon color={colors.lightColor} />
    </IconButton>
  )
}

export default LogoutIcon;
