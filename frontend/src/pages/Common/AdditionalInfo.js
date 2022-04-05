import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import _isEmpty from "lodash/isEmpty";
import React from "react";

import strings from "../../localizeStrings";

const styles = {
  textfield: {
    width: "50%",
    right: -30
  },
  closeButton: {
    left: 650,
    position: "absolute",
    top: 20
  },
  avatarCard: {
    width: "45%",
    left: "35px"
  },
  dialog: {
    width: "95%"
  },
  paper: {
    width: "70%",
    marginTop: "10px"
  },
  dialogContent: {
    width: "500px"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
};

const AdditionalInfo = ({ resources, idForInfo, isAdditionalDataShown, hideAdditionalData }) => {
  const resourceForInfo = resources.find(item => item.data.id === idForInfo);
  return (
    <Dialog disableRestoreFocus open={isAdditionalDataShown} style={styles.dialog} onClose={hideAdditionalData}>
      <DialogTitle>{strings.common.additional_data}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        {resourceForInfo && !_isEmpty(resourceForInfo.data.additionalData) ? (
          <pre>{JSON.stringify(resourceForInfo.data.additionalData, null, `\t`)}</pre>
        ) : (
          <div>{strings.common.no_resources}</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={hideAdditionalData}>{strings.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalInfo;
