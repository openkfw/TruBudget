import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import { toAmountString, statusMapping } from '../../helper';
import { Card, CardHeader } from 'material-ui/Card';
import { ACMECorpLightgreen } from '../../colors.js';
import strings from '../../localizeStrings'
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
        <TableRowColumn style={styles.tableText}>
          {subProject.details.name}
        </TableRowColumn>
        <TableRowColumn style={styles.tableText}>
          {amount}
        </TableRowColumn>
        <TableRowColumn style={styles.tableText}>
          {statusMapping(subProject.details.status)}
        </TableRowColumn>
        <TableRowColumn>
          <FlatButton style={styles.tableText} label={strings.subproject.subproject_select_button} onTouchTap={() => history.push('/projects/' + location.pathname.split('/')[2] + '/' + subProject.name)} secondary={true} />
        </TableRowColumn>
      </TableRow>
    );
  });
}

const SubProjectsTable = ({ subProjects, subprojectVisible, history, location, createSubProject, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount, subProjectComment, storeSubProjectComment, subProjectCurrency, storeSubProjectCurrency, showSnackBar, storeSnackBarMessage }) => {
  const tableEntries = getTableEntries(subProjects, location, history);
  return (
    <Card>
      <CardHeader titleColor='white' style={{ backgroundColor: ACMECorpLightgreen }} title={strings.common.subprojects} />
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.tableText}>
              {strings.common.subproject}
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}>
              {strings.common.budget}
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}>
              {strings.common.status}
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.tableText}> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>
          {tableEntries}
        </TableBody>
      </Table>
    </Card>
  )
}

export default SubProjectsTable;
