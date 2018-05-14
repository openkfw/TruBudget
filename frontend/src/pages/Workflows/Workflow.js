import React from "react";
import Card from "material-ui/Card";
import Button from "material-ui/Button";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";
import SortIcon from "@material-ui/icons/LowPriority";
import DoneIcon from "@material-ui/icons/Check";

import WorkflowTable from "./WorkflowTable";
import WorkflowCreation from "./WorkflowCreation";
import ChangeLog from "../Notifications/ChangeLog";
import { ACMECorpGrey, ACMECorpDarkBlue, ACMECorpLightgreen } from "../../colors.js";
import strings from "../../localizeStrings";
import { canCreateWorkflowItems } from "../../permissions";

const enableWorkflowSort = (props, allowedToSort) => (
  <Button
    disabled={!allowedToSort}
    onClick={() => props.enableWorkflowSort()}
    style={{
      position: "relative",
      marginTop: "8px",
      zIndex: 2
    }}
    icon={<SortIcon color={!allowedToSort ? ACMECorpGrey : ACMECorpDarkBlue} />}
  >
    {strings.workflow.workflow_enable_sort}
  </Button>
);

const submitSort = (props, allowedToSort) => (
  <Button
    disabled={!allowedToSort}
    onClick={() => props.postWorkflowSort(props.location.pathname.split("/")[3], props.workflowItems)}
    variant="fab"
    style={{
      position: "relative",
      marginTop: "8px",
      zIndex: 2
    }}
    icon={<DoneIcon color={ACMECorpDarkBlue} />}
  >
    {strings.workflow.worfkfow_disable_sort}
  </Button>
);

const Workflow = props => {
  const allowedToCreateWorkflows = canCreateWorkflowItems(props.allowedIntents);
  return (
    <div
      style={{
        width: "100%",
        position: "relative"
      }}
    >
      <Card>
        {/* TODO: <div
          style={{
            display: "flex",
            position: "absolute",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            top: "51px",
            left: "3px",
            opacity: "0.7",
            zIndex: 10
          }}
        >
          {!props.workflowSortEnabled
            ? enableWorkflowSort(props, allowedToCreateWorkflows)
            : submitSort(props, allowedToCreateWorkflows)}
        </div> */}
        <WorkflowTable {...props} />
        {/* <ChangeLog {...props} />*/}
        <div>
          <WorkflowCreation {...props} />
        </div>
      </Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          alignItems: "center",
          top: "16px",
          right: "-26px",
          zIndex: 10
        }}
      >
        {/* Button is disabled either if the user is not allowed to edit or the user is in "sort" mode */}
        <Button
          disabled={props.workflowSortEnabled ? props.workflowSortEnabled : !allowedToCreateWorkflows}
          color="primary"
          onClick={() => props.openWorkflowDialog(false)}
          variant="fab"
          style={{
            position: "relative"
          }}
        >
          <ContentAdd />
        </Button>
        <Button
          mini={true}
          disabled={props.workflowSortEnabled}
          onClick={() => props.openHistory()}
          color="default"
          variant="fab"
          style={{
            position: "relative",
            marginTop: "8px",
            zIndex: 2
          }}
        >
          <HistoryIcon />
        </Button>
      </div>
    </div>
  );
};

export default Workflow;
