import React from 'react';
import { Card, CardHeader } from 'material-ui/Card';
import {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow
} from 'material-ui/Table';


import WorkflowDetails from './WorkflowDetails'
import WorkflowList from './WorkflowList'
import { ACMECorpLightgreen } from '../../colors.js';
import { arrayMove } from 'react-sortable-hoc';


const styles = {
  listText: {
    fontSize: '14px'
  }
}


const createTableHeader = () => (
  <Card>
    <CardHeader titleColor='white' style={{ backgroundColor: ACMECorpLightgreen }} title="Workflow items" />
    <div style={{ marginLeft: '50px', marginRight: '10px', position: 'relative' }}>
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} style={{ borderBottom: '0px' }}>
          <TableRow displayBorder={false}>
            <TableHeaderColumn style={styles.listText} colSpan={1}></TableHeaderColumn>
            <TableHeaderColumn style={styles.listText} colSpan={3}>Workflow</TableHeaderColumn>
            <TableHeaderColumn style={styles.listText} colSpan={3}>Amount</TableHeaderColumn>
            <TableHeaderColumn style={styles.listText} colSpan={2}>Status</TableHeaderColumn>
            <TableHeaderColumn style={styles.listText} colSpan={2}>Actions</TableHeaderColumn>
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  </Card >
)
const createWorkflowItems = ({ workflowItems, permissions, ...props }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    workflowItems = arrayMove(workflowItems, oldIndex, newIndex)
    props.updateWorkflowSortOnState(workflowItems)
  };

  return (
    <WorkflowList lockAxis={'y'} workflowItems={workflowItems} onSortEnd={onSortEnd} permissions={permissions} {...props} />
  )
}
// Not sure about the Name
const WorkflowTable = (props) => {
  return (
    <div style={{ paddingBottom: '8px' }}>
      {createTableHeader()}
      {createWorkflowItems(props)}
      <WorkflowDetails {...props} />
    </div >
  )
}

export default WorkflowTable;
