import React from "react";
import Highlighter from "react-highlight-words";
import { useLocation, useNavigate } from "react-router-dom";
import _isEmpty from "lodash/isEmpty";

import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";

import { statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import {
  canUpdateSubProject,
  canViewSubProjectDetails,
  canViewSubProjectPermissions,
  canViewSubProjectSummary
} from "../../permissions";
import ActionButton from "../Common/ActionButton";

import SubProjectEmptyState from "./SubProjectEmptyState";
import SubProjectSearch from "./SubProjectSearch";

import "./SubProjectTable.scss";

const displaySubprojectBudget = (budgets) => {
  const consolidatedBudgets = budgets.reduce((acc, next) => {
    acc[next.currencyCode] = acc[next.currencyCode] ? [...acc[next.currencyCode], next] : [next];
    return acc;
  }, {});

  let display = [];
  for (const currencyCode in consolidatedBudgets) {
    const numberOfBudgets = consolidatedBudgets[currencyCode].length;
    display.push(
      <div key={`projectedBudget-sp-${currencyCode}`} className="sub-project-budget">
        <Tooltip
          title={
            <div>
              {consolidatedBudgets[currencyCode].map((b, i) => (
                <div key={`tt-pb-sp-${i}`}>{`${b.organization}: ${toAmountString(b.value, currencyCode)}`}</div>
              ))}
            </div>
          }
        >
          <Chip
            avatar={
              <Avatar>
                {numberOfBudgets === 1 ? consolidatedBudgets[currencyCode][0].organization.slice(0, 1) : <MoreIcon />}
              </Avatar>
            }
            label={toAmountString(
              consolidatedBudgets[currencyCode].reduce((acc, next) => acc + parseFloat(next.value), 0),
              currencyCode
            )}
          />
        </Tooltip>
      </div>
    );
  }

  return <div className="sub-project-budget-container">{display}</div>;
};

const getTableEntries = ({
  subProjects,
  location,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData,
  searchTermArray,
  storeSubSearchTerm,
  theme,
  navigate
}) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, description, displayName, id, projectedBudgets, additionalData } = data;
    const isOpen = status !== "closed";
    const editDisabled = !(canUpdateSubProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewSubProjectPermissions(allowedIntents);
    const redacted = displayName === null && _isEmpty(projectedBudgets);
    const visibleSubproject = canViewSubProjectSummary(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);

    if (!redacted && visibleSubproject) {
      const amountString = displaySubprojectBudget(projectedBudgets);
      return (
        <TableRow key={index} data-test={`subproject-${id}`}>
          <TableCell className="sub-project-name" data-test={`subproject-title-${index}`}>
            <Highlighter
              data-test="highlighted-displayname"
              highlightStyle={{ backgroundColor: theme.palette.primary.light }}
              searchWords={searchTermArray}
              textToHighlight={displayName}
            />
          </TableCell>
          <TableCell className="sub-project-projected-budget">{amountString}</TableCell>
          <TableCell className="sub-project-status">
            <Highlighter
              highlightStyle={{ backgroundColor: theme.palette.primary.light }}
              searchWords={searchTermArray}
              textToHighlight={statusMapping(status)}
            />
          </TableCell>
          <TableCell className="sub-project-actions">
            <div className="sub-project-button-container">
              <div className="sub-project-button">
                <ActionButton
                  ariaLabel="show subproject data"
                  notVisible={additionalDataEmpty}
                  onClick={() => {
                    showSubProjectAdditionalData(id);
                  }}
                  title="Additional Data"
                  icon={<MoreIcon />}
                  data-test={`subproject-additionaldata-${index}`}
                />
              </div>
              <div className="sub-project-button">
                <ActionButton
                  ariaLabel="show edit dialog"
                  notVisible={!isOpen || editDisabled}
                  onClick={() => showEditDialog(id, displayName, description, currency, projectedBudgets)}
                  title={strings.common.edit}
                  icon={<EditIcon />}
                  data-test={`subproject-edit-button-${index}`}
                />
              </div>
              <div className="sub-project-button">
                <ActionButton
                  ariaLabel="show subproject permissions"
                  notVisible={!canViewPermissions}
                  onClick={() => showSubProjectPermissions(id, displayName)}
                  title={strings.common.show_permissions}
                  icon={<PermissionIcon />}
                  data-test={"spp-button-" + index}
                />
              </div>
              <div className="sub-project-button">
                <ActionButton
                  ariaLabel="show subproject"
                  notVisible={!canViewSubProjectDetails(allowedIntents)}
                  onClick={() => {
                    storeSubSearchTerm("");
                    navigate("/projects/" + location.pathname.split("/")[2] + "/" + id);
                  }}
                  title={strings.common.view}
                  icon={<LaunchIcon />}
                  data-test={`subproject-view-details-${index}`}
                />
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    return null;
  });
};

const SubProjectTable = ({
  idsPermissionsUnassigned,
  subProjects,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData,
  searchBarDisplayed,
  searchTerm,
  searchDisabled,
  storeSubSearchBarDisplayed,
  storeSubSearchTerm,
  searchTermArray
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const tableEntries = getTableEntries({
    subProjects,
    location,
    navigate,
    showEditDialog,
    showSubProjectPermissions,
    showSubProjectAdditionalData,
    searchTermArray,
    theme,
    storeSubSearchTerm,
    storeSubSearchBarDisplayed,
    idsPermissionsUnassigned
  });

  return (
    <Card>
      <CardHeader title={strings.common.subprojects} />
      <SubProjectSearch
        searchBarDisplayed={searchBarDisplayed}
        searchTerm={searchTerm}
        searchDisabled={searchDisabled}
        storeSearchBarDisplayed={storeSubSearchBarDisplayed}
        storeSearchTerm={storeSubSearchTerm}
      />
      {subProjects.length > 0 ? (
        <Table data-test="ssp-table" className="sub-project-table">
          <TableHead>
            <TableRow data-test="subproject-row">
              <TableCell className="sub-project-name">{strings.common.subproject}</TableCell>
              <TableCell className="sub-project-projected-budget">{strings.common.projected_budget}</TableCell>
              <TableCell className="sub-project-status">{strings.common.status}</TableCell>
              <TableCell className="sub-project-actions"> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableEntries}</TableBody>
        </Table>
      ) : (
        <SubProjectEmptyState />
      )}
    </Card>
  );
};

export default SubProjectTable;
