import React from "react";

import Icon from "@material-ui/icons/Group";
import colors from "../../colors";
import IconButton from "material-ui/IconButton/IconButton";

const UsersIcon = ({ history }) => (
  <IconButton disabled={false} onClick={() => history.push("/users")}>
    <Icon color={colors.lightColor} />
  </IconButton>
);

export default UsersIcon;
