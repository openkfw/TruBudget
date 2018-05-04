import React from "react";
import Dialog from "material-ui/Dialog";

import Divider from "material-ui/Divider";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import _ from "lodash";
import { toAmountString, statusMapping } from "../../helper";
import DocumentOverview from "../Documents/DocumentOverview";
import strings from "../../localizeStrings";

const styles = {
  textfield: {
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
  }
};

const getWorkflowItem = (workflowItems, showWorkflowDetails, showDetailsItemId) => {
  let workflowItem = {
    key: "",
    data: []
  };

  if (showWorkflowDetails) {
    workflowItem = workflowItems.find(workflow => workflow.txid === showDetailsItemId);
  }

  return workflowItem;
};
const removeNewLines = text => {
  let formattedText = "";
  if (!_.isEmpty(text)) {
    formattedText = text.replace(/\n/g, " ");
  }
  return formattedText;
};

const WorkflowDetails = ({
  workflowItems,
  subProjectDetails,
  showWorkflowDetails,
  showDetailsItemId,
  hideWorkflowDetails,
  users,
  validateDocument,
  validatedDocuments
}) => {
  const actions = [<FlatButton label={strings.common.close} onTouchTap={hideWorkflowDetails} />];

  const workflowItem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);
  const status = workflowItem.status;
  const trimmedComment = removeNewLines(workflowItem.description);
  return (
    <Dialog
      autoScrollBodyContent={true}
      open={showWorkflowDetails}
      actions={actions}
      title={workflowItem.displayName}
      modal={false}
      style={styles.dialog}
    >
      <div>
        {strings.common.budget}:
        <TextField
          id={strings.common.budget}
          disabled={true}
          hintText={toAmountString(workflowItem.amount, workflowItem.currency)}
          style={styles.textfield}
          underlineShow={false}
        />
        <Divider />
        {strings.common.comment}:
        <TextField
          id={strings.common.comment}
          disabled={true}
          multiLine={true}
          hintText={trimmedComment}
          style={styles.textfield}
          underlineShow={false}
        />
        <Divider />
        {strings.workflow.workflow_documents}:
        <DocumentOverview
          id={strings.workflow.workflow_documents}
          documents={workflowItem.documents}
          validateDocument={validateDocument}
          validatedDocuments={validatedDocuments}
        />
        <Divider />
        {strings.common.status}:
        <TextField
          id={strings.common.status}
          disabled={true}
          hintText={statusMapping(status)}
          style={styles.textfield}
          underlineShow={false}
        />
        <Divider />
      </div>
    </Dialog>
  );
};

export default WorkflowDetails;
