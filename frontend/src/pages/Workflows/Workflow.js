import React from "react";

import HistoryIcon from "@mui/icons-material/History";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";

import WorkflowTable from "./WorkflowTable";

import "./Workflow.scss";

const Workflow = (props) => {
  return (
    <div className="workflow-container">
      <Card>{props.isDataLoading ? <div /> : <WorkflowTable {...props} />}</Card>
      <div className="workflow-buttons">
        {/* Button is disabled either if the user is not allowed to edit or the user is in "sort" mode */}
        <Fab
          id="subproject-history-button"
          data-test="subproject-history-button"
          size="small"
          disabled={props.workflowSortEnabled}
          onClick={props.openHistory}
          color="default"
          className="history-fab"
        >
          <HistoryIcon />
        </Fab>
      </div>
    </div>
  );
};

export default Workflow;
