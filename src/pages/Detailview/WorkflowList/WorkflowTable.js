import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';


const getTableEntries = ({streamItems, history}) => {
  console.log('StreamItems ' + streamItems)
  return streamItems.map((streamItem, index) => {
    console.log('Stream Item ' + streamItem);
    var time = new Date(streamItem.time * 1000)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{streamItem.key}</TableRowColumn>
        <TableRowColumn>{time.toString()}</TableRowColumn>
          <TableRowColumn>
              <FlatButton label="Select"  secondary={true} />
          </TableRowColumn>

      </TableRow>
    );
  });
}

function handleClose(){



}
const WorkflowTable = (props) => {
  console.log("Props " + props.streamItems);
  const tableEntries = getTableEntries(props);
  const actions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onTouchTap={handleClose}
        />,
        <FlatButton
          label="Submit"
          primary={true}
          disabled={true}
          onTouchTap={handleClose}
        />,
      ];

  return (
    <Table>
    <TableHeader displaySelectAll={false}
              adjustForCheckbox={false}>
      <FloatingActionButton secondary onTouchTap={() => props.history.push('/')} style={{
          position: 'absolute',
          right: '-28px',
          top: '16px'
      }}>
      <ContentAdd />
      </FloatingActionButton>

      <Dialog
         title="Dialog With Actions"
         actions={actions}
         modal={true}
         open={false}
       >
         Only actions can close this dialog.
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
