import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";

import strings from "../../localizeStrings";
import { hideSubProjectInfo } from "./actions";

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

const SubProjectInfo = ({ subProjects, idForInfo, isSubProjectInfoShown, hideSubProjectInfo }) => {
  const subProjectForInfo = subProjects.find(item => item.data.id === idForInfo);
  console.log(subProjectForInfo);
  return (
    <Dialog open={isSubProjectInfoShown} style={styles.dialog} onClose={hideSubProjectInfo}>
      <DialogTitle data-test="workflowInfoDialog">Info</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <List>
          <ListItem>
            <ListItemText data-test="workflowitemInfoDisplayName" primary={""} secondary={"Test"} />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={hideSubProjectInfo}>{strings.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubProjectInfo;
