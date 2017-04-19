import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import SubProjectCreationStepper from './SubProjectCreationStepper'


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

const getTableEntries = (streamItems, location, history) => {

  return streamItems.map((streamItem, index) => {
    var amount = prepareAmount(streamItem.amount, streamItem.currency)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{streamItem.key}</TableRowColumn>
        <TableRowColumn>{amount}</TableRowColumn>
        <TableRowColumn>{streamItem.status}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" onTouchTap={() => history.push('/details/' + location.pathname.substring(9)+ '/'+ streamItem.key)}secondary={true} />
        </TableRowColumn>
      </TableRow>
    );
  });
}

const SubProjectsTable = ({ hideWorkflowDialog, streamItems, workflowDialogVisible, history, location, createSubProjectItem, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount,subProjectPurpose, storeSubProjectPurpose, subProjectCurrency, storeSubProjectCurrency }) => {
  const tableEntries = getTableEntries(streamItems, location, history);

  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>
        <Dialog
          title="New Sub-Project"

          modal={true}
          open={workflowDialogVisible}
        >
          <SubProjectCreationStepper hideWorkflowDialog={hideWorkflowDialog} location={location} createSubProjectItem={createSubProjectItem} subProjectName={subProjectName} storeSubProjectName={storeSubProjectName}
          subProjectAmount={subProjectAmount}
            storeSubProjectAmount={storeSubProjectAmount}
            subProjectPurpose={subProjectPurpose}
            storeSubProjectPurpose={storeSubProjectPurpose}
            subProjectCurrency={subProjectCurrency}
            storeSubProjectCurrency={storeSubProjectCurrency}/>
        </Dialog>

        <TableRow>
          <TableHeaderColumn>Sub-Project</TableHeaderColumn>
          <TableHeaderColumn>Amount</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
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

export default SubProjectsTable;
