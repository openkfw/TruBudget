import { Typography } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { formatString } from "../../helper";
import strings from "../../localizeStrings";

const styles = {
  infoArea: {
    display: "flex",
    flexDirection: "row",
    margin: "10px"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  }
};

const EnableUserDialog = props => {
  const { classes, editId } = props;
  const dialogText = formatString(strings.users.enable_userId_confirm, editId);

  return (
    <div className={classes.infoArea}>
      <InfoIcon className={classes.infoIcon} />
      <Typography variant="body2">{dialogText}</Typography>
    </div>
  );
};

export default withStyles(styles)(EnableUserDialog);
