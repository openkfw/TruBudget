import { Typography } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import RefreshIcon from "@material-ui/icons/Refresh";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";
import { formatString } from "../../helper";

const styles = {
  tableCell: {
    verticalAlign: "top"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px"
  },
  infoArea: {
    display: "flex",
    flexDirection: "row",
    margin: "10px"
  },
  hiddenInfo: {
    display: "flex",
    flexDirection: "row"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  },
  errorArea: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
};

const formatUserAssignments = (assignments, hasHiddenAssignments, assignmentType, classes) => {
  if (_isEmpty(assignments) && !hasHiddenAssignments) {
    return strings.users.no_assignments;
  }

  const baseurl = window.location.origin;
  return assignments.map(assignment => {
    let url;
    if (assignmentType === "project") {
      url = `${baseurl}/projects/${assignment.id}`;
    }
    if (assignmentType === "subproject") {
      url = `${baseurl}/projects/${assignment.projectId}/${assignment.id}`;
    }
    if (assignmentType === "workflowitem") {
      url = `${baseurl}/projects/${assignment.projectId}/${assignment.subprojectId}`;
    }
    return (
      <div key={assignment.id} className={classes.container}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {assignment.displayName}
        </a>
      </div>
    );
  });
};

const formatHiddenAssignments = (hasHiddenAssignments, assignmentType, classes) => {
  if (!hasHiddenAssignments) {
    return;
  }
  const hiddenAssignmentInfo = formatString(strings.users.hidden_assignments, assignmentType);
  return (
    <div className={classes.hiddenInfo}>
      <InfoIcon className={classes.infoIcon} />
      <Typography variant="body2">{hiddenAssignmentInfo}</Typography>
    </div>
  );
};

const getUserAssignmentsTable = (userAssignments, classes) => {
  const hasHiddenProjects = userAssignments.hiddenAssignments.hasHiddenProjects;
  const hasHiddenSubprojects = userAssignments.hiddenAssignments.hasHiddenSubprojects;
  const hasHiddenWorkflowitems = userAssignments.hiddenAssignments.hasHiddenWorkflowitems;
  return (
    <div>
      <Table data-test="assignment-table">
        <TableHead>
          <TableRow>
            <TableCell>{strings.users.assigned_projects}</TableCell>
            <TableCell>{strings.users.assigned_subprojects}</TableCell>
            <TableCell>{strings.users.assigned_workflowitems}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody id="usertablebody">
          <TableRow>
            <TableCell className={classes.tableCell} data-test="project-assignments">
              {formatUserAssignments(userAssignments.projects, hasHiddenProjects, "project", classes)}
              {formatHiddenAssignments(hasHiddenProjects, "projects", classes)}
            </TableCell>
            <TableCell className={classes.tableCell} data-test="subproject-assignments">
              {formatUserAssignments(userAssignments.subprojects, hasHiddenSubprojects, "subproject", classes)}
              {formatHiddenAssignments(hasHiddenSubprojects, "subprojects", classes)}
            </TableCell>
            <TableCell className={classes.tableCell} data-test="workflowitem-assignments">
              {formatUserAssignments(userAssignments.workflowitems, hasHiddenWorkflowitems, "workflowitem", classes)}
              {formatHiddenAssignments(hasHiddenWorkflowitems, "workflowitems", classes)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

const DisableUserDialogContent = props => {
  const { classes, fetchUserAssignments, cleanUserAssignments, userAssignments, editId } = props;

  const [isUserAssigned, setIsUserAssigned] = useState(false);
  const [isUserAssignmentsFetched, setIsUserAssignmentsFetched] = useState(false);

  useEffect(() => {
    fetchUserAssignments(editId);
    return () => {
      setIsUserAssigned(false);
      setIsUserAssignmentsFetched(false);
      cleanUserAssignments();
    };
  }, [fetchUserAssignments, editId, cleanUserAssignments, setIsUserAssignmentsFetched, setIsUserAssigned]);

  useEffect(() => {
    if (
      _isEmpty(userAssignments.projects) &&
      _isEmpty(userAssignments.subprojects) &&
      _isEmpty(userAssignments.workflowitems) &&
      _isEmpty(userAssignments.hiddenAssignments)
    ) {
      setIsUserAssigned(false);
    } else {
      setIsUserAssigned(true);
    }
  }, [userAssignments, setIsUserAssigned]);

  useEffect(() => {
    if (!_isEmpty(userAssignments)) {
      setIsUserAssignmentsFetched(true);
    } else {
      setIsUserAssignmentsFetched(false);
    }
  }, [setIsUserAssignmentsFetched, userAssignments]);

  return (
    <div>
      {isUserAssigned && isUserAssignmentsFetched ? (
        <div className={classes.container}>
          <div className={classes.errorArea}>
            <div className={{ float: "left" }}>
              <div className={classes.infoArea}>
                <InfoIcon className={classes.infoIcon} data-test="info-hidden-assignment" />
                <Typography variant="body2">{strings.users.assigned_message}</Typography>
              </div>
            </div>
            <ActionButton
              onClick={() => {
                setIsUserAssignmentsFetched(false);
                fetchUserAssignments(editId);
              }}
              title={strings.common.refresh_assignments}
              icon={<RefreshIcon />}
              data-test={"refresh-assignments"}
              iconButtonStyle={{ float: "right", marginRight: "10px" }}
            />
          </div>
          <Card>
            <CardContent>{getUserAssignmentsTable(userAssignments, classes)}</CardContent>
          </Card>
        </div>
      ) : null}

      {!isUserAssigned && isUserAssignmentsFetched ? (
        <div className={classes.infoArea}>
          <InfoIcon className={classes.infoIcon} />
          <Typography variant="body2">{strings.users.not_assigned_message}</Typography>
        </div>
      ) : null}
    </div>
  );
};

export default withStyles(styles)(DisableUserDialogContent);
