import React from 'react';
import Drawer from 'material-ui/Drawer'

import SideNavCard from './SideNavCard'

const SideNav = (props) => {
  const {
    showSidebar,
    onToggleSidebar,
    ...rest
  } = props;
  return <Drawer
    docked={false}
    width={300}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
    <SideNavCard {...rest} />
  </Drawer>
};

export default SideNav
