import React from "react";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";

import { workflowItemIntentOrder } from "../../permissions";
import PermissionTable from "../Common/Permissions/PermissionsTable";
import SingleSelection from "../Common/SingleSelection";

import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";

const styles = {
  drawerCancelButton: {
    position: "right",
    left: "205px",
    zIndex: 2,
    top: "10px"
  },
  drawerUpdateButton: {
    float: "left",
    top: "10px",
    left: "15px"
  },
  assigneeCard: {
    marginTop: "12px",
    marginBottom: "12px"
  },
  selectedWorkflowItemsDisplay: {
    paddingTop: "36px",
    align: "center",
    textAlign: "center"
  },
  assigneeContainer: {
    padding: "32px"
  }
};

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
    groups,
    disableWorkflowEdit,
    tempDrawerAssignee,
    tempDrawerPermissions,
    storeAssignee,
    projectId,
    subprojectId,
    myself,
    subprojectValidator,
    hasSubprojectValidator
  } = props;
  const permissions = _isEmpty(tempDrawerPermissions) ? getDefaultPermissions() : tempDrawerPermissions;

  const assign = assignee => {
    storeAssignee(assignee);
  };

  const grantPermission = (intent, user) => {
    if (!permissions[intent].includes(user)) {
      permissions[intent].push(user);
    }
    storePermissions(permissions);
  };

  const revokePermission = (intent, user) => {
    if (permissions[intent].includes(user)) {
      permissions[intent].splice(permissions[intent].indexOf(user), 1);
    }
    storePermissions(permissions);
  };

  const isOpen = !_isEmpty(selectedWorkflowItems);
  const usersAndGroups = [...users, ...groups];

  // Only render the drawer if there are elements selected
  if (!isOpen) return null;

  return (
    <Drawer open={isOpen} variant="persistent" anchor="right">
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            return showWorkflowItemPreview(
              projectId,
              subprojectId,
              selectedWorkflowItems,
              tempDrawerAssignee,
              tempDrawerPermissions
            );
          }}
          style={styles.drawerUpdateButton}
          disabled={_isEmpty(tempDrawerAssignee) && _isEmpty(tempDrawerPermissions)}
        >
          {strings.common.update}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => disableWorkflowEdit()}
          style={styles.drawerCancelButton}
        >
          {strings.common.cancel}
        </Button>
      </div>
      <Typography style={styles.selectedWorkflowItemsDisplay} color="primary" variant="subtitle1">
        {strings.formatString(strings.workflow.workflow_selection, selectedWorkflowItems.length)}
      </Typography>
      <div>
        <Card style={styles.assigneeCard}>
          <CardHeader subheader="Assignee" />
          <CardContent style={styles.assigneeContainer}>
            <SingleSelection
              disabled={hasSubprojectValidator}
              selectId={hasSubprojectValidator ? subprojectValidator : tempDrawerAssignee}
              selectableItems={users}
              onSelect={assign}
            />
          </CardContent>
        </Card>
        <PermissionTable
          permissions={permissions}
          intentOrder={workflowItemIntentOrder}
          userList={usersAndGroups}
          addTemporaryPermission={grantPermission}
          removeTemporaryPermission={revokePermission}
          temporaryPermissions={permissions}
          myself={myself}
        />
      </div>
    </Drawer>
  );
};

export default WorkflowEditDrawer;
