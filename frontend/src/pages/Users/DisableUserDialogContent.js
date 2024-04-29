import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";

import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

import "./index.scss";

const formatUserAssignments = (assignments, hasHiddenAssignments, assignmentType) => {
  if (_isEmpty(assignments) && !hasHiddenAssignments) {
    return strings.users.no_assignments;
  }

  const baseurl = window.location.origin;
  return assignments.map((assignment) => {
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
      <div key={assignment.id} className="disable-user-container">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {assignment.displayName}
        </a>
      </div>
    );
  });
};

const formatHiddenAssignments = (hasHiddenAssignments, assignmentType) => {
  if (!hasHiddenAssignments) {
    return;
  }
  const hiddenAssignmentInfo = formatString(strings.users.hidden_assignments, assignmentType);
  return (
    <div className="hidden-info">
      <InfoIcon className="info-icon" />
      <Typography variant="body2">{hiddenAssignmentInfo}</Typography>
    </div>
  );
};

const getUserAssignmentsTable = (userAssignments) => {
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
            <TableCell className="table-cell" data-test="project-assignments">
              {formatUserAssignments(userAssignments.projects, hasHiddenProjects, "project")}
              {formatHiddenAssignments(hasHiddenProjects, "projects")}
            </TableCell>
            <TableCell className="table-cell" data-test="subproject-assignments">
              {formatUserAssignments(userAssignments.subprojects, hasHiddenSubprojects, "subproject")}
              {formatHiddenAssignments(hasHiddenSubprojects, "subprojects")}
            </TableCell>
            <TableCell className="table-cell" data-test="workflowitem-assignments">
              {formatUserAssignments(userAssignments.workflowitems, hasHiddenWorkflowitems, "workflowitem")}
              {formatHiddenAssignments(hasHiddenWorkflowitems, "workflowitems")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

const DisableUserDialogContent = (props) => {
  const { fetchUserAssignments, cleanUserAssignments, userAssignments, editId } = props;

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
        <div className="disable-user-container">
          <div className="error-area">
            <div className="info-area-container">
              <div className="info-area">
                <InfoIcon className="info-icon" data-test="info-hidden-assignment" />
                <Typography variant="body2">{strings.users.assigned_message}</Typography>
              </div>
            </div>
            <ActionButton
              ariaLabel="refresh assignments"
              onClick={() => {
                setIsUserAssignmentsFetched(false);
                fetchUserAssignments(editId);
              }}
              title={strings.common.refresh_assignments}
              alignTooltip={[60, 30]}
              icon={<RefreshIcon />}
              data-test={"refresh-assignments"}
              className="refresh-icon"
            />
          </div>
          <Card>
            <CardContent>{getUserAssignmentsTable(userAssignments)}</CardContent>
          </Card>
        </div>
      ) : null}

      {!isUserAssigned && isUserAssignmentsFetched ? (
        <div className="info-area">
          <InfoIcon className="info-icon" />
          <Typography variant="body2">{strings.users.not_assigned_message}</Typography>
        </div>
      ) : null}
    </div>
  );
};

export default DisableUserDialogContent;
