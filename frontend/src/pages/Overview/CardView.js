import React from "react";
import _isEmpty from "lodash/isEmpty";

import ContentAdd from "@mui/icons-material/Add";
import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Fab from "@mui/material/Fab";
import TablePagination from "@mui/material/TablePagination";
import Tooltip from "@mui/material/Tooltip";

import { statusMapping, unixTsToString } from "../../helper";
import strings from "../../localizeStrings";
import {
  canCreateProject,
  canUpdateProject,
  canViewProjectPermissions,
  canViewProjectSummary
} from "../../permissions";
import SelectablePill from "../Common/SelectablePill";

import BudgetsList from "./BudgetsList";
import ProjectCard from "./ProjectCard";

import "./CardView.scss";

const webpVersion = (imagePath) => {
  // if imagePath matches Thumbnail_*.jpg, replace .jpg with .webp
  if (imagePath.match(/Thumbnail_\d+.jpg/)) {
    return imagePath.replace(".jpg", ".webp");
  }
  return imagePath;
};

const displayTags = ({ tags, storeSearchTerm, showNavSearchBar, searchTermArray }) => {
  return tags.map((tag) => (
    <SelectablePill
      key={tag}
      isSelected={searchTermArray?.includes(tag) || false}
      onClick={() => {
        showNavSearchBar();
        storeSearchTerm(`tag:${tag}`);
      }}
      data-test="overview-tag"
      label={tag}
    ></SelectablePill>
  ));
};

const getTableEntries = ({
  filteredProjects,
  history,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  storeSearchTerm,
  showNavSearchBar,
  searchTermArray
}) => {
  return filteredProjects.map(({ data, allowedIntents }, index) => {
    const {
      displayName,
      id,
      description,
      status,
      thumbnail = "Default_thumbnail.jpg",
      creationUnixTs,
      projectedBudgets,
      additionalData,
      tags
    } = data;
    const budgets = <BudgetsList budgets={projectedBudgets} />;
    const mappedStatus = strings.common.status + ": " + statusMapping(status);
    const imagePath = !_isEmpty(thumbnail) ? webpVersion(thumbnail) : "Default_thumbnail.jpg";
    const dateString = unixTsToString(creationUnixTs);
    const isOpen = status === "open";
    const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewProjectPermissions(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);
    const displayedTags = displayTags({
      tags: tags || [],
      storeSearchTerm,
      showNavSearchBar,
      searchTermArray
    });

    if (canViewProjectSummary(allowedIntents)) {
      return (
        <ProjectCard
          key={index}
          index={index}
          id={id}
          allowedIntents={allowedIntents}
          history={history}
          displayName={displayName}
          mappedStatus={mappedStatus}
          projectedBudgets={projectedBudgets}
          budgets={budgets}
          displayedTags={displayedTags}
          dateString={dateString}
          showProjectAdditionalData={showProjectAdditionalData}
          additionalDataEmpty={additionalDataEmpty}
          canViewPermissions={canViewPermissions}
          isOpen={isOpen}
          showProjectPermissions={showProjectPermissions}
          editDisabled={editDisabled}
          showEditDialog={showEditDialog}
          description={description}
          thumbnail={thumbnail}
          tags={tags}
          imagePath={imagePath}
          searchTermArray={searchTermArray}
        />
      );
    } else return null;
  });
};

const CardView = (props) => {
  const { isRoot, allowedIntents, showCreationDialog, pagination, setRowsPerPage, page, setPage } = props;

  const handleChangePage = (_event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10), 1);
  };

  const tableEntries = getTableEntries(props);
  return (
    <>
      <div className="card-view-actions">
        <TablePagination
          className="card-view-pagination"
          data-test="card-pagination-north"
          component="div"
          count={pagination?.totalRecords}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination?.limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20, 50, 100]}
          labelRowsPerPage={strings.project.cards_per_page}
        />
        <Box className="add-project">
          <Tooltip id="tooltip-pcreate" title={strings.project.add_new_project}>
            <Fab
              className="project-add-button"
              aria-label="create"
              disabled={!canCreateProject(allowedIntents) || isRoot}
              onClick={() => showCreationDialog()}
              color="primary"
              data-test="add-project-button"
            >
              <ContentAdd />
            </Fab>
          </Tooltip>
        </Box>
      </div>
      <div aria-label="projects" className="projects-table-entries">
        {tableEntries}
        <Card data-test="project-creation" className="add-project-card">
          <div className="add-project-content">
            <CardActions>
              <Tooltip id="tooltip-pcreate" title={strings.project.add_new_project}>
                <Fab
                  className="content-add-button"
                  aria-label="create"
                  disabled={!canCreateProject(allowedIntents) || isRoot}
                  onClick={() => showCreationDialog()}
                  color="primary"
                  data-test="create-project-button"
                >
                  <ContentAdd />
                </Fab>
              </Tooltip>
            </CardActions>
          </div>
        </Card>
      </div>
      <TablePagination
        className="card-view-pagination"
        data-test="card-pagination-south"
        component="div"
        count={pagination?.totalRecords}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={pagination?.limit}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20, 50, 100]}
        labelRowsPerPage={strings.project.cards_per_page}
      />
    </>
  );
};

export default CardView;
