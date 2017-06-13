import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import { toAmountString, statusMapping } from '../../helper';
import { Card, CardHeader } from 'material-ui/Card';
import { ACMECorpLightgreen } from '../../colors.js';
const styles = {
  tableText: {
    fontSize: '14px'
  }
};

const getTableEntries = (subProjects, location, history) => {
  return subProjects.map((subProject, index) => {
    var amount = toAmountString(subProject.details.amount, subProject.details.currency)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn style={styles.tableText}>{subProject.details.projectName}</TableRowColumn>
        <TableRowColumn style={styles.tableText}>{amount}</TableRowColumn>
        <TableRowColumn style={styles.tableText}>{statusMapping[subProject.details.status]}</TableRowColumn>
        <TableRowColumn>
          <FlatButton style={styles.tableText} label="Select" onTouchTap={() => history.push('/projects/' + location.pathname.split('/')[2] + '/' + subProject.name)} secondary={true} />
        </TableRowColumn>
      </TableRow>
    );
  });
}

const SubProjectsTable = ({ subProjects, hideWorkflowDialog, workflowDialogVisible, history, location, createSubProjectItem, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount, subProjectPurpose, storeSubProjectPurpose, subProjectCurrency, storeSubProjectCurrency, showSnackBar, storeSnackBarMessage }) => {
  const tableEntries = getTableEntries(subProjects, location, history);
  return (
    <Card >
      <CardHeader titleColor='white' style={{ backgroundColor: ACMECorpLightgreen }}
        title="Sub-projects"
      />
      <Table>
        <TableHeader displaySelectAll={false}
          adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.tableText}>Sub-project</TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}>Budget</TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}>Status</TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}
          adjustForCheckbox={false}>
          {tableEntries}
        </TableBody>
      </Table>
    </Card>
  )
}

export default SubProjectsTable;
