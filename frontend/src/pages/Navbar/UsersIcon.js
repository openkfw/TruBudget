import React from "react";

import Icon from "material-ui/svg-icons/social/group";
import colors from "../../colors";
import IconButton from "material-ui/IconButton/IconButton";

const UsersIcon = ({ history }) => (
  <IconButton disabled={false} onClick={() => history.push("/users")}>
    <Icon color={colors.lightColor} />
  </IconButton>
);

export default UsersIcon;
