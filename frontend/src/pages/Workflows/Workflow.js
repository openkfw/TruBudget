import React from "react";

import ContentAdd from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import { Tooltip } from "@mui/material";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";

import strings from "../../localizeStrings";
import { canCreateWorkflowItems } from "../../permissions";

import WorkflowTable from "./WorkflowTable";

const Workflow = (props) => {
  const subprojectStatus = props.status;
  const allowedToCreateWorkflows = canCreateWorkflowItems(props.allowedIntents) && !props.isRoot;
  const createDisabled = props.workflowSortEnabled
    ? props.workflowSortEnabled
    : !allowedToCreateWorkflows || subprojectStatus === "closed";

  let createWorkflowButtonTitle;
  // user is allowed to create workflow
  if (allowedToCreateWorkflows) {
    if (props.projectStatus === "closed") {
      createWorkflowButtonTitle = strings.eventTypes.subproject_closed;
    } else if (props.workflowSortEnabled) {
      createWorkflowButtonTitle = strings.workflow.exit_sort_mode;
    } else {
      // default value when adding is allowed
      createWorkflowButtonTitle = strings.workflow.add_item;
    }

    // user is not allowed to create workflow
  } else {
    createWorkflowButtonTitle = strings.common.no_permissions;
  }

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
        <Tooltip title={createWorkflowButtonTitle}>
          <span>
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
          </span>
        </Tooltip>
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
