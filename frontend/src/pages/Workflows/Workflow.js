import React from "react";

import ContentAdd from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";

import { canCreateWorkflowItems } from "../../permissions";

import WorkflowTable from "./WorkflowTable";

const Workflow = (props) => {
  const subprojectStatus = props.status;
  const allowedToCreateWorkflows = canCreateWorkflowItems(props.allowedIntents) && !props.isRoot;
  const createDisabled = props.workflowSortEnabled
    ? props.workflowSortEnabled
    : !allowedToCreateWorkflows || subprojectStatus === "closed";
  return (
    <div
      style={{
        width: "100%",
        position: "relative"
      }}
    >
      <Card>{props.isDataLoading ? <div /> : <WorkflowTable {...props} />}</Card>
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
        <Fab
          disabled={createDisabled}
          data-test="createWorkflowitem"
          color="primary"
          onClick={() => props.showCreateDialog()}
          style={{
            position: "relative"
          }}
        >
          <ContentAdd />
        </Fab>
        <Fab
          id="subproject-history-button"
          data-test="subproject-history-button"
          size="small"
          disabled={props.workflowSortEnabled}
          onClick={props.openHistory}
          color="default"
          style={{
            position: "relative",
            marginTop: "8px",
            zIndex: 2
          }}
        >
          <HistoryIcon />
        </Fab>
      </div>
    </div>
  );
};

export default Workflow;
