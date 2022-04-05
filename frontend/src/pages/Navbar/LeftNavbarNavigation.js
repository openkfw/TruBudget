import React from "react";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

const LeftNavbarNavigation = ({ toggleSidebar }) => {
  return (
    <div>
      <IconButton onClick={toggleSidebar} data-test="openSideNavbar" size="large">
        <MenuIcon color="primary" />
      </IconButton>
    </div>
  );
};

export default LeftNavbarNavigation;
