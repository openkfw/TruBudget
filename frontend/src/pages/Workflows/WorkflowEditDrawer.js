import React from "react";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";

import { workflowItemIntentOrder } from "../../permissions";
import { PermissionsTable } from "../Common/Permissions/PermissionsScreen";
import _isEmpty from "lodash/isEmpty";
import AssigneeSelection from "../Common/AssigneeSelection";

const getDefaultPermissions = () => {
  const permissions = workflowItemIntentOrder.reduce((acc, next) => {
    next.intents.map(intent => (acc[intent] = []));
    return acc;
  }, {});
  return permissions;
};

const WorkflowEditDrawer = props => {
  const {
    selectedWorkflowItems,
    showWorkflowItemPreview,
    storePermissions,
    users,
    disableWorkflowSort,
    deselectWorkflowItems,
    resetPermissions,
    workflowAssignee,
    storeAssignee,
    resetAssignee
  } = props;
  const permissions = _isEmpty(props.tempDrawerPermissions) ? getDefaultPermissions() : props.tempDrawerPermissions;
  const assign = assignee => {
    storeAssignee(assignee);
  };
  const grantPermission = (_, intent, user) => {
    if (!permissions[intent].includes(user)) {
      permissions[intent].push(user);
    }
    storePermissions(permissions);
  };
  const revokePermission = (_, intent, user) => {
    if (permissions[intent].includes(user)) {
      permissions[intent].splice(permissions[intent].indexOf(user), 1);
    }
    storePermissions(permissions);
  };
  const closeDrawer = () => {
    disableWorkflowSort();
    deselectWorkflowItems();
    resetPermissions();
    resetAssignee();
  };
  return (
    <Drawer
      open={selectedWorkflowItems !== undefined && selectedWorkflowItems.length !== 0}
      variant="persistent"
      anchor="right"
    >
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => showWorkflowItemPreview()}
          style={{
            float: "left",
            top: "10px",
            left: "15px"
          }}
        >
          Update All
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => closeDrawer()}
          style={{
            position: "right",
            left: "205px",
            zIndex: 2,
            top: "10px"
          }}
        >
          Cancel
        </Button>
      </div>
      <Typography
        style={{ paddingTop: "36px", align: "center", textAlign: "center" }}
        color="primary"
        variant="subtitle1"
      >
        You have selected {selectedWorkflowItems.length} workflowitems
      </Typography>
      <div>
        <Card style={{ marginTop: "12px", marginBottom: "12px" }}>
          <CardHeader subheader="Assignee" />
          <CardContent>
            <AssigneeSelection assigneeId={workflowAssignee} disabled={false} users={users} assign={assign} />
          </CardContent>
        </Card>
        <PermissionsTable
          permissions={permissions}
          intentOrder={workflowItemIntentOrder}
          user={users}
          grant={grantPermission}
          revoke={revokePermission}
        />
      </div>
    </Drawer>
  );
};

export default WorkflowEditDrawer;
