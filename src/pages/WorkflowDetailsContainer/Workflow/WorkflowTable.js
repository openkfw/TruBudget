import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

class WorkflowTable extends Component {
  prepareAmount(inputAmount, currency) {
    var decimals = ',00'
    var tempCurrency = ' €'
    var formattedAmount = '0'
    if (typeof inputAmount !== "undefined" && inputAmount.includes('.')) {
      decimals = inputAmount.substr(inputAmount.indexOf('.'), inputAmount.length - 1);
      decimals = decimals.replace('.', ',');
      if (decimals.length === 2) {
        decimals += '0';
      }
    }
    if (currency === 'USD') {
      tempCurrency = " $"
    }
    formattedAmount = parseInt(inputAmount).toLocaleString();
    return formattedAmount + decimals + tempCurrency;
  }

  getTableEntries(workflowItems, location, history, openWorkflowDialog, editWorkflow) {
    return workflowItems.map((item, index) => {

      var amount = this.prepareAmount(item.data.amount, item.data.currency)
      return (
        <TableRow key={index}>
          <TableRowColumn>{item.key}</TableRowColumn>
          <TableRowColumn>{amount}</TableRowColumn>
          <TableRowColumn>{item.data.status}</TableRowColumn>
          <TableRowColumn>
            <IconMenu iconButtonElement={< IconButton > <MoreVertIcon/> < /IconButton>} anchorOrigin={{
              horizontal: 'left',
              vertical: 'top'
            }} targetOrigin={{
              horizontal: 'left',
              vertical: 'top'
            }}>
              <MenuItem primaryText="Edit" onTouchTap={(event) => this.editWorkflow(item.key, item.data.amount, item.data.currency, item.data.purpose, item.data.addData, item.data.assignee, item.data.status)}/>
              <MenuItem primaryText="Close"/>
            </IconMenu>
          </TableRowColumn>
        </TableRow>
      );
    })
  }
  editWorkflow(name, amount,currency, purpose, addData, assignee, state){
    this.props.storeWorkflowName(name)
    this.props.storeWorkflowAmount(amount)
    this.props.storeWorkflowCurrency(currency)
    this.props.storeWorkflowPurpose(purpose)
    this.props.storeWorkflowAdditionalData(addData)
    this.props.storeWorkflowAssignee(assignee)
    this.props.enableWorkflowState()
    this.props.storeWorkflowState(state)
    this.props.openWorkflowDialog()
  }

  render() {
    const tableEntries = this.getTableEntries(this.props.workflowItems, this.props.location, this.props.history, this.props.openWorkflowDialog, this.props.editWorkflow);

    return (
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>

          <TableRow>
            <TableHeaderColumn>Workflow</TableHeaderColumn>
            <TableHeaderColumn>Amount</TableHeaderColumn>
            <TableHeaderColumn>Status</TableHeaderColumn>
            <TableHeaderColumn></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>

          {tableEntries}
        </TableBody>
      </Table>
    )
  }
}
export default WorkflowTable;
