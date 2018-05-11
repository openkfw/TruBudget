import React from "react";
import Table, { TableBody, TableHead, TableRow, TableCell } from "material-ui/Table";
import Button from "material-ui/Button";
import { toAmountString, statusMapping } from "../../helper";
import Card, { CardHeader } from "material-ui/Card";
import { ACMECorpLightgreen } from "../../colors.js";
import strings from "../../localizeStrings";
import { canViewSubProjectDetails } from "../../permissions";
const styles = {
  tableText: {
    fontSize: "14px"
  }
};

const getTableEntries = (subProjects, location, history) => {
  return subProjects.map((subProject, index) => {
    var amount = toAmountString(subProject.amount, subProject.currency);
    return (
      <TableRow key={index}>
        <TableCell style={styles.tableText}>{subProject.displayName}</TableCell>
        <TableCell style={styles.tableText}>{amount}</TableCell>
        <TableCell style={styles.tableText}>{statusMapping(subProject.status)}</TableCell>
        <TableCell>
          <Button
            style={styles.tableText}
            disabled={!canViewSubProjectDetails(subProject.allowedIntents)}
            onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + subProject.id)}
            color="secondary"
          >
            {strings.subproject.subproject_select_button}
          </Button>
        </TableCell>
      </TableRow>
    );
  });
};

const SubProjectsTable = ({
  subProjects,
  subprojectVisible,
  history,
  location,
  createSubProject,
  subProjectName,
  storeSubProjectName,
  subProjectAmount,
  storeSubProjectAmount,
  subProjectComment,
  storeSubProjectComment,
  subProjectCurrency,
  storeSubProjectCurrency,
  showSnackBar,
  storeSnackBarMessage
}) => {
  const tableEntries = getTableEntries(subProjects, location, history);
  return (
    <Card>
      <CardHeader style={{ backgroundColor: ACMECorpLightgreen }} title={strings.common.subprojects} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={styles.tableText}>{strings.common.subproject}</TableCell>
            <TableCell style={styles.tableText}>{strings.common.budget}</TableCell>
            <TableCell style={styles.tableText}>{strings.common.status}</TableCell>
            <TableCell style={styles.tableText}> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableEntries}</TableBody>
      </Table>
    </Card>
  );
};

export default SubProjectsTable;
