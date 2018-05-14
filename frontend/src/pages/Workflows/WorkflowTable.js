import React from "react";
import Card, { CardHeader } from "material-ui/Card";
import Table, { TableHead, TableCell, TableRow } from "material-ui/Table";
import { arrayMove } from "react-sortable-hoc";

import WorkflowDetails from "./WorkflowDetails";
import WorkflowList from "./WorkflowList";
import { ACMECorpLightgreen } from "../../colors.js";
import strings from "../../localizeStrings";

const styles = {
  listText: {
    fontSize: "14px"
  },
  actions: {
    textAlign: "center"
  }
};

const createTableHeader = () => (
  <Card>
    <CardHeader style={{ backgroundColor: ACMECorpLightgreen }} title={strings.workflow.workflow_table_title} />
    <div style={{ marginLeft: "50px", marginRight: "10px", position: "relative" }}>
      <Table>
        <TableHead style={{ borderBottom: "0px" }}>
          <TableRow style={{ borderBottom: "0px" }}>
            <TableCell style={styles.listText} colSpan={1} />
            <TableCell style={styles.listText} colSpan={3}>
              {strings.workflow.workflow_type_workflow}
            </TableCell>
            <TableCell style={styles.listText} colSpan={3}>
              {strings.common.budget}
            </TableCell>
            <TableCell style={styles.listText} colSpan={2}>
              {strings.common.assignee}
            </TableCell>
            <TableCell style={{ ...styles.actions, ...styles.listText }} colSpan={3}>
              {strings.common.actions}
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </div>
  </Card>
);

const createWorkflowItems = ({ workflowItems, permissions, ...props }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    workflowItems = arrayMove(workflowItems, oldIndex, newIndex);
    props.updateWorkflowSortOnState(workflowItems);
  };

  return (
    <WorkflowList
      lockAxis={"y"}
      workflowItems={workflowItems}
      onSortEnd={onSortEnd}
      permissions={permissions}
      {...props}
    />
  );
};
// Not sure about the Name
const WorkflowTable = props => {
  return (
    <div style={{ paddingBottom: "8px" }}>
      {createTableHeader()}
      {createWorkflowItems(props)}
      {/* <WorkflowDetails {...props} /> */}
    </div>
  );
};

export default WorkflowTable;
