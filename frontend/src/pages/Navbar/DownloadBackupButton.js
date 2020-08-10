import React from "react";

import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Backup from "@material-ui/icons/CloudDownload";
import classNames from "classnames";

import strings from "../../localizeStrings";

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  }
});

const DownloadBackupButton = ({ createBackup, classes }) => {
  return (
    <Button
      variant="contained"
      id="upload"
      color="primary"
      className={classes.button}
      onClick={() => {
        createBackup();
      }}
    >
      <Backup className={classNames(classes.leftIcon, classes.iconSmall)} />
      {strings.common.download}
    </Button>
  );
};

export default withStyles(styles)(DownloadBackupButton);
