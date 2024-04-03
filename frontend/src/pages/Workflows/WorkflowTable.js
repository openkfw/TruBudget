import React from "react";
import { arrayMoveImmutable } from "array-move";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import { Button } from "@mui/material";
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

import "./WorkflowTable.scss";

const WorkflowTableHeader = (props) => {
  const {
    enableWorkflowEdit,
    workflowSortEnabled,
    storeWorkflowItemsBulkAction,
    storeWorkflowItemsSelected,
    selectedWorkflowItems,
    workflowItems
  } = props;

  const handleSelectAllButton = () => {
    selectedWorkflowItems.splice(0, selectedWorkflowItems.length);
    selectedWorkflowItems.push(...workflowItems);
    storeWorkflowItemsSelected(selectedWorkflowItems);
    enableWorkflowEdit();
  };

  const handleDeselectAllButton = () => {
    selectedWorkflowItems.splice(0, selectedWorkflowItems.length);
    storeWorkflowItemsSelected(selectedWorkflowItems);
    storeWorkflowItemsBulkAction("");
  };

  const handlePermissionBulkActionButton = () => {
    storeWorkflowItemsBulkAction("permissions");
  };

  const handleCopyBulkActionButton = () => {
    storeWorkflowItemsBulkAction("copy");
  };

  return (
    <Card>
      <CardHeader title={strings.workflow.workflow_table_title} />
      <Grid container>
        <Grid xs={12} sm={12} md={3}>
          <WorkflowitemSearch {...props} />
        </Grid>
        <Grid xs={12} sm={12} md={9}>
          <div className="bulk-actions">
            <Button
              variant="outlined"
              size="small"
              disabled={selectedWorkflowItems.length === workflowItems.length}
              onClick={handleSelectAllButton}
              className="bulk-action-button"
              data-test="select-all-workflow-items"
            >
              {strings.common.select_all}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={!workflowSortEnabled || selectedWorkflowItems.length === 0}
              onClick={handleDeselectAllButton}
              className="bulk-action-button"
              data-test="deselect-all-workflow-items"
            >
              {strings.common.deselect_all}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={!workflowSortEnabled || selectedWorkflowItems.length === 0}
              onClick={handlePermissionBulkActionButton}
              startIcon={<KeyIcon />}
              className="bulk-action-button"
              data-test="open-batch-workflow-items-permission-table"
            >
              {strings.users.edit_permissions}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={!workflowSortEnabled || selectedWorkflowItems.length === 0}
              onClick={handleCopyBulkActionButton}
              startIcon={<ContentCopyIcon />}
              className="bulk-action-button"
              data-test="open-batch-workflow-items-copy-table"
            >
              {strings.common.copy}
            </Button>
          </div>
        </Grid>
      </Grid>

      <CardContent className="workfow-card-content">
        <div className="workflow-table-header">
          <div className="columns" />
          <div className="columns">
            <Typography variant="body1">{strings.workflow.workflow_type_workflow}</Typography>
          </div>
          <div className="columns">
            <Typography variant="body1">{strings.common.budget}</Typography>
          </div>
          <div className="columns">
            <Typography variant="body1">{strings.workflow.assignee}</Typography>
          </div>
          <div className="columns">
            <Typography variant="body1">{strings.common.tag}</Typography>
          </div>
          <div className="columns">
            <Typography variant="body1">{strings.common.actions}</Typography>
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
    <div className="workflow-empty-state">
      <WorkflowEmptyState />
    </div>
  );
};

// Not sure about the Name
const WorkflowTable = (props) => {
  const { showDetailsItem, filteredWorkflowitems } = props;
  const workflowItems = filteredWorkflowitems;

  return (
    <div data-test="workflowitem-table" className="workflow-item-table">
      <WorkflowTableHeader {...props} />
      {createWorkflowItems({ ...props, workflowItems })}
      {showDetailsItem && <WorkflowDetails workflowitem={showDetailsItem} {...props} />}
    </div>
  );
};

export default WorkflowTable;
