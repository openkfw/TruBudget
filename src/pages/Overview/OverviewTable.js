import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import NewProject from './NewProject'

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
        <FloatingActionButton secondary onTouchTap={props.showWorkflowDialog} style={{
            position: 'absolute',
            right: '-28px',
            top: '16px'
        }}>
        <ContentAdd />
        </FloatingActionButton>
        <Dialog
           title="New Project"

           modal={true}
           open={props.workflowDialogVisible}
         >
         <NewProject hideWorkflowDialog ={props.hideWorkflowDialog} createProject={props.createProject} storeProjectName={props.storeProjectName} projectName = {props.projectName}/>
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
