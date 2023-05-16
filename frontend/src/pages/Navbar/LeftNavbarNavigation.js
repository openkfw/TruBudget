import React from "react";

import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const LeftNavbarNavigation = ({ toggleSidebar }) => {
  return (
    <div>
      <IconButton aria-label="open menu" onClick={toggleSidebar} data-test="openSideNavbar" size="large">
        <MenuIcon color="primary" />
      </IconButton>
    </div>
  );
};

export default LeftNavbarNavigation;
