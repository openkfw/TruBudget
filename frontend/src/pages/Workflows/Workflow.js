import React from "react";

import Card from "@material-ui/core/Card";
import Fab from "@material-ui/core/Fab";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";

import WorkflowTable from "./WorkflowTable";
import { canCreateWorkflowItems } from "../../permissions";

const Workflow = props => {
  const subprojectStatus = props.status;
  const allowedToCreateWorkflows = canCreateWorkflowItems(props.allowedIntents);
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
      <Card>
        <WorkflowTable {...props} />
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
        <Fab
          disabled={createDisabled}
          id="createWorkflowItem"
          color="primary"
          onClick={() => props.showCreateDialog()}
          style={{
            position: "relative"
          }}
        >
          <ContentAdd />
        </Fab>
        <Fab
          size="small"
          disabled={props.workflowSortEnabled}
          onClick={() => props.openHistory(props.projectId, props.subProjectId, props.offset, props.limit)}
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
