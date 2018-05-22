import React from "react";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { toAmountString, statusMapping } from "../../helper";
import { ACMECorpLightgreen } from "../../colors.js";
import strings from "../../localizeStrings";
import { canViewSubProjectDetails } from "../../permissions";
const styles = {
  tableText: {
    fontSize: "14px"
  }
};

const getTableEntries = (subProjects, location, history) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, displayName, id } = data;

    const amount = toAmountString(data.amount, currency);
    return (
      <TableRow key={index}>
        <TableCell style={styles.tableText}>{displayName}</TableCell>
        <TableCell style={styles.tableText}>{amount}</TableCell>
        <TableCell style={styles.tableText}>{statusMapping(status)}</TableCell>
        <TableCell>
          <Button
            style={styles.tableText}
            disabled={!canViewSubProjectDetails(allowedIntents)}
            onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + id)}
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
