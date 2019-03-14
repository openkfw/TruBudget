import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
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

const SubProjectInfo = ({ subProjects, idForInfo, isSubProjectAdditionalDataShown, hideSubProjectAdditionalData }) => {
  const subProjectForInfo = subProjects.find(item => item.data.id === idForInfo);
  return (
    <Dialog open={isSubProjectAdditionalDataShown} style={styles.dialog} onClose={hideSubProjectAdditionalData}>
      <DialogTitle>Additional Data</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        {subProjectForInfo && !_isEmpty(subProjectForInfo.data.additionalData) ? (
          <pre>{JSON.stringify(subProjectForInfo.data.additionalData, null, `\t`)}</pre>
        ) : (
          "No fields are added to this Subproject"
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={hideSubProjectAdditionalData}>{strings.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubProjectInfo;
