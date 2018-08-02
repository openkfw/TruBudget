import React from "react";
import { arrayMove } from "react-sortable-hoc";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";
import SortIcon from "@material-ui/icons/Sort";
import DoneIcon from "@material-ui/icons/Check";
import Button from "@material-ui/core/Button";

import WorkflowDetails from "./WorkflowDetails";
import WorkflowList from "./WorkflowList";
import strings from "../../localizeStrings";

const style = {
  paddingLeft: "0px"
};

const createTableHeader = props => (
  <Card>
    <CardHeader title={strings.workflow.workflow_table_title} />
    <CardContent style={style}>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>{!props.workflowSortEnabled ? enableWorkflowSort(props) : submitSort(props)}</div>
          <div style={{ flex: 1 }} />

          <div style={{ flex: 4 }}>
            <Typography variant="body2">{strings.workflow.workflow_type_workflow}</Typography>
          </div>
          <div style={{ flex: 4 }}>
            <Typography variant="body2">{strings.common.budget}</Typography>
          </div>
          <div style={{ flex: 4 }}>
            <Typography variant="body2">{strings.common.assignee}</Typography>
          </div>
          <div style={{ flex: 2 }}>
            <Typography variant="body2">{strings.common.actions}</Typography>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const enableWorkflowSort = props => (
  <Button
    onClick={() => props.enableWorkflowSort()}
    style={{
      position: "relative",
      zIndex: 2
    }}
    labelStyle={{
      fontWeight: "200"
    }}
  >
    <SortIcon />
  </Button>
);

const submitSort = props => (
  <Button
    onClick={() => handleSubmitSort(props)}
    style={{
      position: "relative",
      zIndex: 2
    }}
  >
    <DoneIcon />
  </Button>
);

const handleSubmitSort = props => {
  props.reorderWorkflowItems(props.projectId, props.subProjectId, props.workflowItems);
  props.disableWorkflowSort();
};

const createWorkflowItems = ({ workflowItems, ...props }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    workflowItems = arrayMove(workflowItems, oldIndex, newIndex);
    props.updateWorkflowSortOnState(workflowItems);
  };

  return <WorkflowList lockAxis={"y"} workflowItems={workflowItems} onSortEnd={onSortEnd} {...props} />;
};
// Not sure about the Name
const WorkflowTable = props => {
  return (
    <div style={{ paddingBottom: "8px" }}>
      {createTableHeader(props)}
      {createWorkflowItems(props)}
      {<WorkflowDetails {...props} />}
    </div>
  );
};

export default WorkflowTable;
