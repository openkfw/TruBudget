import React from "react";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";

import { workflowItemIntentOrder } from "../../permissions";
import { PermissionsTable } from "../Common/Permissions/PermissionsScreen";

const getDefaultPermissions = () => {
  const permissions = workflowItemIntentOrder.reduce((acc, next) => {
    next.intents.map(intent => (acc[intent] = []));
    return acc;
  }, {});
  return permissions;
};
class WorkflowEditDrawerContainer extends React.Component {
  state = {
    permissions: getDefaultPermissions()
  };

  grantPermission = (_, intent, user) => {
    const newPermissions = Object.assign({}, this.state.permissions);
    newPermissions[intent] = [...newPermissions[intent], user];
    this.setState({
      permissions: newPermissions
    });
  };
  revokePermission = () => {};
  render() {
    return (
      <WorkflowEditDrawer
        {...this.props}
        grant={this.grantPermission}
        revoke={this.revokePermission}
        permissions={this.state.permissions}
      />
    );
  }
}

const WorkflowEditDrawer = props => {
  return (
    <Drawer
      open={props.selectedWorkflowItems !== undefined && props.selectedWorkflowItems.length !== 0}
      variant="persistent"
      anchor="right"
    >
      <div>
        <Button
          variant="contained"
          color="primary"
          //onClick={() => handleEnableWorkflowSort(props)} open preview
          style={{
            float: "left",
            top: "10px",
            left: "15px"
          }}
        >
          Update All
        </Button>
      </div>
      <br />
      <div>
        <PermissionsTable
          permissions={props.permissions}
          intentOrder={workflowItemIntentOrder}
          user={props.users}
          grant={props.grant}
          revoke={props.revoke}
        />
      </div>
    </Drawer>
  );
};

export default WorkflowEditDrawerContainer;
