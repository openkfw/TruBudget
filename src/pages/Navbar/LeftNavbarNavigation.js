import React from 'react';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import IconButton from 'material-ui/IconButton';

import colors from '../../colors'

const LeftNavbarNavigation = ({onToggleSidebar}) => {
  return (
    <div>
      <IconButton onTouchTap={onToggleSidebar}>
        <MenuIcon color={colors.lightColor}/>
      </IconButton>
    </div>
  )
}

export default LeftNavbarNavigation;
