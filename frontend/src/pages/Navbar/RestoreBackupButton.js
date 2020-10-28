import React from "react";
import Button from "@material-ui/core/Button";
import Upload from "@material-ui/icons/CloudUpload";
import { withStyles } from "@material-ui/core/styles";
import strings from "../../localizeStrings";

const styles = theme => ({
  button: {
    margin: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  iconSmall: {
    fontSize: 20
  },
  uploadInput: {
    cursor: "pointer",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: "100%",
    opacity: 0
  }
});

const RestoreBackupButton = ({ restoreBackup, classes }) => {
  return (
    <Button variant="contained" id="upload" color="primary" className={classes.button} data-test="restore-backup">
      <Upload className={`${classes.leftIcon} ${classes.iconSmall}`} />
      {strings.navigation.restore}
      <input
        id="uploadBackup"
        type="file"
        className={classes.uploadInput}
        onChange={event => {
          if (event.target.files) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = e => {
              if (e.target.result !== undefined) {
                restoreBackup(e.target.result);
              }
            };
            reader.readAsArrayBuffer(file);
            event.target.value = null;
          }
        }}
      />
    </Button>
  );
};

export default withStyles(styles)(RestoreBackupButton);
