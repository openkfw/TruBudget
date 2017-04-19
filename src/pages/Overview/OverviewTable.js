import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import ProjectCreationStepper from './ProjectCreationStepper'


const prepareAmount = (inputAmount, currency) => {
  var decimals = ',00'
  var tempCurrency = ' €'
  if (inputAmount.includes('.')){
    decimals = inputAmount.substr(inputAmount.indexOf('.'), inputAmount.length-1);
    decimals = decimals.replace('.',',');
    if (decimals.length === 2){
      decimals += '0';
    }
  }
  if(currency === 'USD'){
    tempCurrency = " $"
  }
  var formattedAmount =  parseInt(inputAmount).toLocaleString();
  return formattedAmount + decimals + tempCurrency;
}

const getTableEntries = ({ streams, history }) => {
  return streams.map((stream, index) => {

    var amount = prepareAmount(stream.details.amount, stream.details.currency)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{stream.name}</TableRowColumn>
        <TableRowColumn>{amount}</TableRowColumn>
        <TableRowColumn>{stream.details.status}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" onTouchTap={() => history.push('/projects/' + stream.name)} secondary={true} />
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
          <ProjectCreationStepper hideWorkflowDialog={props.hideWorkflowDialog} createProject={props.createProject} storeProjectName={props.storeProjectName} projectName={props.projectName}
          storeProjectAmount={props.storeProjectAmount}
          projectPurpose={props.projectPurpose}
          storeProjectPurpose={props.storeProjectPurpose}
          projectAmount={props.projectAmount}
          storeProjectCurrency={props.storeProjectCurrency}
          projectCurrency={props.projectCurrency}/>
        </Dialog>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Amount</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
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
