import React from "react";

import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";

import WorkflowTable from "./WorkflowTable";
import WorkflowCreation from "./WorkflowCreation";
import WorkflowEdit from "./WorkflowEdit";
import { canCreateWorkflowItems } from "../../permissions";

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
        <WorkflowTable {...props} />
        <div>
          <WorkflowCreation {...props} />
          <WorkflowEdit {...props} />
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
          onClick={() => props.showCreateDialog()}
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
          onClick={() => props.openHistory(props.projectId, props.subProjectId)}
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
