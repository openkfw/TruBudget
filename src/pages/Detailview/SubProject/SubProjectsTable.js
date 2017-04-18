import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import SubProjectCreationStepper from './SubProjectCreationStepper'

const getTableEntries = (streamItems) => {
  return streamItems.map((streamItem, index) => {
    var time = new Date(streamItem.time * 1000)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{streamItem.key}</TableRowColumn>
        <TableRowColumn>{time.toString()}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" secondary={true}/>
        </TableRowColumn>
      </TableRow>
    );
  });
}

const SubProjectsTable = ({
  hideWorkflowDialog,
  streamItems,
  workflowDialogVisible,
  location,
  createSubProjectItem,
  subProjectName,
  storeSubProjectName,
  subProjectAmount,
  storeSubProjectAmount,
  subProjectPurpose,
  storeSubProjectPurpose
}) => {
  const tableEntries = getTableEntries(streamItems);

  return (
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <Dialog title="New Sub-Project" modal={true} open={workflowDialogVisible}>
          <SubProjectCreationStepper hideWorkflowDialog={hideWorkflowDialog} location={location} createSubProjectItem={createSubProjectItem} subProjectName={subProjectName} storeSubProjectName={storeSubProjectName} subProjectAmount={subProjectAmount} storeSubProjectAmount={storeSubProjectAmount} subProjectPurpose={subProjectPurpose} storeSubProjectPurpose={storeSubProjectPurpose}/>
        </Dialog>

        <TableRow>
          <TableHeaderColumn>Sub-Project</TableHeaderColumn>
          <TableHeaderColumn>Open
          </TableHeaderColumn>
          <TableHeaderColumn></TableHeaderColumn>
          <TableHeaderColumn></TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>

        {tableEntries}
      </TableBody>
    </Table>
  )
}

export default SubProjectsTable;
