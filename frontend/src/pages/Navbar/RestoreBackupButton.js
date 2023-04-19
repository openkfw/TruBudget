import React from "react";

import Upload from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";

import strings from "../../localizeStrings";

const styles = {
  button: {
    margin: (theme) => theme.spacing(1)
  },
  leftIcon: {
    marginRight: (theme) => theme.spacing(1)
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
};

const RestoreBackupButton = ({ restoreBackup }) => {
  return (
    <Button variant="contained" id="upload" color="primary" sx={styles.button} data-test="restore-backup">
      <Upload sx={{ ...styles.leftIcon, ...styles.iconSmall }} />
      {strings.navigation.restore}
      <input
        id="uploadBackup"
        type="file"
        style={styles.uploadInput}
        onChange={(event) => {
          if (event.target.files) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
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

export default RestoreBackupButton;
