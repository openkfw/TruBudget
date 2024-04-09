import React from "react";

import Upload from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";

import strings from "../../localizeStrings";

import "./RestoreBackupButton.scss";

const RestoreBackupButton = ({ restoreBackup }) => {
  return (
    <Button className="backup-button" variant="contained" id="upload" color="primary" data-test="restore-backup">
      <Upload className="small-icon" />
      {strings.navigation.restore}
      <input
        id="uploadBackup"
        type="file"
        className="upload-input"
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
