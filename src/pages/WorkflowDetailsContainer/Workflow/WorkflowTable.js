import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

const prepareAmount = (inputAmount, currency) => {
  var decimals = ',00'
  var tempCurrency = ' €'
  var formattedAmount ='0'
  if (typeof inputAmount !== "undefined" && inputAmount.includes('.')){
    decimals = inputAmount.substr(inputAmount.indexOf('.'), inputAmount.length-1);
    decimals = decimals.replace('.',',');
    if (decimals.length === 2){
      decimals += '0';
    }
  }
  if(currency === 'USD'){
    tempCurrency = " $"
  }
  formattedAmount =  parseInt(inputAmount).toLocaleString();
  return formattedAmount + decimals + tempCurrency;
}


const getTableEntries = (workflowItems, location, history, openWorkflowDialog, editWorkflow) => {
  return workflowItems.map((item, index) => {

    var amount = prepareAmount(item.data.amount, item.data.currency)
    return (
      <TableRow key={index} >
        <TableRowColumn>{item.key}</TableRowColumn>
          <TableRowColumn>{amount}</TableRowColumn>
        <TableRowColumn>{item.data.status}</TableRowColumn>
        <TableRowColumn>
        <IconMenu
    iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
    targetOrigin={{horizontal: 'left', vertical: 'top'}}

  >
    <MenuItem primaryText="Edit"  onTouchTap={() => editWorkflow(item.key, openWorkflowDialog)}/>
    <MenuItem primaryText="Close" />
  </IconMenu>
        </TableRowColumn>
      </TableRow>
    );
  });
}
const editWorkflow = (name, openWorkflowDialog) =>{
  console.log('Name ' + name)
  openWorkflowDialog()
}

const WorkflowTable = (props) => {
  const tableEntries = getTableEntries(props.workflowItems, props.location, props.history, props.openWorkflowDialog, props.editWorkflow);

  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>

        <TableRow>
          <TableHeaderColumn>Workflow</TableHeaderColumn>
          <TableHeaderColumn>Amount</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
          <TableHeaderColumn></TableHeaderColumn>
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
