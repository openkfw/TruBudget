import React from "react";
import { arrayMoveImmutable } from "array-move";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

import strings from "../../localizeStrings";

import WorkflowDetails from "./WorkflowDetails";
import WorkflowEmptyState from "./WorkflowEmptyState";
import WorkflowitemSearch from "./WorkflowitemSearch";
import WorkflowList from "./WorkflowList";

const WorkflowTableHeader = (props) => {
  return (
    <Card>
      <CardHeader title={strings.workflow.workflow_table_title} />
      <Grid container>
        <Grid xs={12} md={12}>
          <WorkflowitemSearch {...props} />
        </Grid>
      </Grid>

      <CardContent>
        <div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "6",
                justifyContent: "space-between"
              }}
            >
              <div style={{ width: "8%", paddingLeft: "4px" }} />
              <div style={{ width: "25%" }}>
                <Typography variant="body1">{strings.workflow.workflow_type_workflow}</Typography>
              </div>
              <div style={{ width: "25%" }}>
                <Typography variant="body1">{strings.common.budget}</Typography>
              </div>
              <div style={{ width: "22%" }}>
                <Typography variant="body1">{strings.workflow.assignee}</Typography>
              </div>
              <div style={{ width: "10%" }}>
                <Typography variant="body1">{strings.common.tag}</Typography>
              </div>
              <div style={{ width: "10%", textAlign: "center" }}>
                <Typography variant="body1">{strings.common.actions}</Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const createWorkflowItems = ({ workflowItems, ...props }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const items = arrayMoveImmutable(workflowItems, oldIndex, newIndex);
    props.updateWorkflowOrderOnState(items);
  };

  return workflowItems?.length > 0 ? (
    <WorkflowList lockAxis={"y"} workflowItems={workflowItems} onSortEnd={onSortEnd} {...props} />
  ) : (
    <div style={{ backgroundColor: "#f3f3f3" }}>
      <WorkflowEmptyState />
    </div>
  );
};

// Not sure about the Name
const WorkflowTable = (props) => {
  const { showDetailsItem, filteredWorkflowitems } = props;
  const workflowItems = filteredWorkflowitems;

  return (
    <div data-test="workflowitem-table" style={{ paddingBottom: "8px" }}>
      <WorkflowTableHeader {...props} />
      {createWorkflowItems({ ...props, workflowItems })}
      {showDetailsItem && <WorkflowDetails workflowitem={showDetailsItem} {...props} />}
    </div>
  );
};

export default WorkflowTable;
