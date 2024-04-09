import React from "react";
import _isEmpty from "lodash/isEmpty";

import ContentAdd from "@mui/icons-material/Add";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Fab from "@mui/material/Fab";
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
    const imagePath = !_isEmpty(thumbnail) ? thumbnail : "Default_thumbnail.jpg";
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
  const { isRoot, allowedIntents, showCreationDialog } = props;
  const tableEntries = getTableEntries(props);
  return (
    <div aria-label="projects" className="projects-table-entries">
      {tableEntries}
      <Card data-test="project-creation" className="add-project-card">
        <div className="add-project-content">
          <CardActions>
            <Tooltip id="tooltip-pcreate" title={strings.common.create}>
              <div>
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
              </div>
            </Tooltip>
          </CardActions>
        </div>
      </Card>
    </div>
  );
};

export default CardView;
