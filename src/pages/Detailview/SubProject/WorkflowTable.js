import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import DetailWorkflowView from '../WorkflowCreation/DetailWorkflowView'

const getTableEntries = (streamItems) => {
  return streamItems.map((streamItem, index) => {
    var time = new Date(streamItem.time * 1000)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{streamItem.key}</TableRowColumn>
        <TableRowColumn>{time.toString()}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" secondary={true} />
        </TableRowColumn>
      </TableRow>
    );
  });
}

const WorkflowTable = ({ showWorkflowDialog, hideWorkflowDialog, streamItems, workflowDialogVisible, location, createSubProjectItem, streamName, storeStreamName }) => {
  const tableEntries = getTableEntries(streamItems);

  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>
        <FloatingActionButton secondary onTouchTap={showWorkflowDialog} style={{
          position: 'absolute',
          right: '-28px',
          top: '16px'
        }}>
          <ContentAdd />
        </FloatingActionButton>

        <Dialog
          title="New Sub-Project"

          modal={true}
          open={workflowDialogVisible}
        >
          <DetailWorkflowView hideWorkflowDialog={hideWorkflowDialog} location={location} createSubProjectItem={createSubProjectItem} streamName={streamName} storeStreamName={storeStreamName} />
        </Dialog>

        <TableRow>
          <TableHeaderColumn>Sub-Project</TableHeaderColumn>
          <TableHeaderColumn>Open </TableHeaderColumn>
          <TableHeaderColumn> </TableHeaderColumn>
          <TableHeaderColumn> </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}
        adjustForCheckbox={false}>

        {tableEntries}
      </TableBody>
    </Table>
  )
}

export default WorkflowTable;
