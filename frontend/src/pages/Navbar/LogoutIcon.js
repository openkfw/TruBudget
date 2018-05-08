import React from "react";
import IconButton from "material-ui/IconButton";
import PowerIcon from "@material-ui/icons/PowerSettingsNew";

import colors from "../../colors";
import strings from "../../localizeStrings";

const LogoutIcon = ({ history, logout }) => {
  return (
    <IconButton
      tooltip={strings.navigation.logout}
      onTouchTap={() => {
        logout();
        history.push("/login");
      }}
    >
      <PowerIcon color={colors.lightColor} />
    </IconButton>
  );
};

export default LogoutIcon;
