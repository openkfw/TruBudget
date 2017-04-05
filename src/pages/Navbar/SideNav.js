import React from 'react';
import Drawer from 'material-ui/Drawer'

const SideNav = ({ showSidebar, onToggleSidebar }) => (
  <Drawer
    docked={false}
    width={200}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
  </Drawer>
);

export default SideNav
