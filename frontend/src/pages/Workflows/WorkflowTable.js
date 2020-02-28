import React from "react";
import arrayMove from "array-move";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";

import WorkflowDetails from "./WorkflowDetails";
import WorkflowList from "./WorkflowList";
import strings from "../../localizeStrings";

import WorkflowEmptyState from "./WorkflowEmptyState";

const style = {
  paddingLeft: "0px"
};

const createTableHeader = props => (
  <Card>
    <CardHeader title={strings.workflow.workflow_table_title} />
    <CardContent style={style}>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: "50px", justifyContent: "space-between" }}>
          <div style={{ width: "8%", paddingLeft: "4px" }} />
          <div style={{ width: "25%" }}>
            <Typography variant="body1">{strings.workflow.workflow_type_workflow}</Typography>
          </div>
          <div style={{ width: "25%" }}>
            <Typography variant="body1">{strings.common.budget}</Typography>
          </div>
          <div style={{ width: "25%" }}>
            <Typography variant="body1">{strings.common.assignee}</Typography>
          </div>
          <div style={{ width: "15%", textAlign: "center" }}>
            <Typography variant="body1">{strings.common.actions}</Typography>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const createWorkflowItems = ({ workflowItems, ...props }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    workflowItems = arrayMove(workflowItems, oldIndex, newIndex);
    props.updateWorkflowOrderOnState(workflowItems);
  };

  return workflowItems.length > 0 ? (
    <WorkflowList lockAxis={"y"} workflowItems={workflowItems} onSortEnd={onSortEnd} {...props} />
  ) : (
    <div style={{ backgroundColor: "#f3f3f3" }}>
      <WorkflowEmptyState />
    </div>
  );
};

// Not sure about the Name
const WorkflowTable = props => {
  return (
    <div data-test="workflowitem-table" style={{ paddingBottom: "8px" }}>
      {createTableHeader(props)}
      {createWorkflowItems(props)}
      {<WorkflowDetails {...props} />}
    </div>
  );
};

export default WorkflowTable;
