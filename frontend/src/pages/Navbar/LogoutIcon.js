import React from "react";
import { useNavigate } from "react-router-dom";

import PowerIcon from "@mui/icons-material/PowerSettingsNew";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import strings from "../../localizeStrings";

const LogoutIcon = ({ logout }) => {
  const navigate = useNavigate();
  return (
    <Tooltip title={strings.navigation.logout}>
      <IconButton
        aria-label="logout"
        id="logoutbutton"
        data-test="navbar-logout-button"
        tooltip={strings.navigation.logout}
        onClick={() => {
          logout();
          navigate("/login");
        }}
        size="large"
      >
        <PowerIcon color="primary" />
      </IconButton>
    </Tooltip>
  );
};

export default LogoutIcon;
