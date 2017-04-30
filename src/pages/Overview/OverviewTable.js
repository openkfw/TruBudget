import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import ProjectCreationStepper from './ProjectCreationStepper';
import { toAmountString } from '../../helper';

const getTableEntries = ({ projects, history }) => {
  return projects.map((project, index) => {
    var amount = toAmountString(project.details.amount, project.details.currency)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{project.details.projectName}</TableRowColumn>
        <TableRowColumn>{amount}</TableRowColumn>
        <TableRowColumn>{project.details.status}</TableRowColumn>
        <TableRowColumn>
          <FlatButton label="Select" onTouchTap={() => history.push('/projects/' + project.name)} secondary={true} />
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
          modal={false}
          open={props.workflowDialogVisible}>
          <ProjectCreationStepper hideWorkflowDialog={props.hideWorkflowDialog} createProject={props.createProject} storeProjectName={props.storeProjectName} projectName={props.projectName}
            storeProjectAmount={props.storeProjectAmount}
            projectPurpose={props.projectPurpose}
            storeProjectPurpose={props.storeProjectPurpose}
            projectAmount={props.projectAmount}
            storeProjectCurrency={props.storeProjectCurrency}
            projectCurrency={props.projectCurrency}
            openSnackBar={props.openSnackBar}
            storeSnackBarMessage={props.storeSnackBarMessage} />
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
