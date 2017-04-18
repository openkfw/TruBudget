import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import ProjectCreationStepper from './ProjectCreationStepper'

const getTableEntries = ({ streams, history }) => {
  return streams.map((stream, index) => {
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{stream.name}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" onTouchTap={() => history.push('/details/' + stream.name)} secondary={true} />
        </TableRowColumn>
      </TableRow>
    );
  });
}

const OverviewTable = (props) => {
  const tableEntries = getTableEntries(props);
  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>
        <Dialog
          title="New Project"
          modal={true}
          open={props.workflowDialogVisible}>
          <ProjectCreationStepper hideWorkflowDialog={props.hideWorkflowDialog} createProject={props.createProject} storeProjectName={props.storeProjectName} projectName={props.projectName} />
        </Dialog>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn></TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}
        adjustForCheckbox={false}>>
      {tableEntries}
      </TableBody>
    </Table>
  )
}

export default OverviewTable;
