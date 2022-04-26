import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Fab from "@mui/material/Fab";
import { withStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import ContentAdd from "@mui/icons-material/Add";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { statusMapping, unixTsToString } from "../../helper";
import strings from "../../localizeStrings";
import {
  canCreateProject,
  canUpdateProject,
  canViewProjectPermissions,
  canViewProjectSummary
} from "../../permissions";
import ProjectCard from "./ProjectCard";
import BudgetsList from "./BudgetsList";
import SelectablePill from "../Common/SelectablePill";

const styles = theme => ({
  card: {
    maxWidth: "310px",
    margin: "35px",
    width: "35%",
    height: "580px"
  },
  cardHeader: {
    paddingLeft: 0
  },
  listItem: {
    opacity: "1"
  },
  media: {
    paddingTop: "70%"
  },
  button: {
    minHeight: "56px"
  },
  editContainer: {
    display: "flex",
    maxHeight: "10px",
    alignItems: "center",
    marginTop: "10px",
    justifyContent: "flex-end"
  },
  cardTitle: {
    textOverflow: "ellipsis",
    width: "250px",
    whiteSpace: "nowrap",
    paddingTop: "10px",
    overflow: "hidden"
  },
  addProject: {
    height: "580px",
    margin: "35px",
    width: "300px",
    opacity: "0.7"
  },
  addProjectContent: {
    display: "flex",
    backgroundColor: "lightgray",
    flexDirection: "row",
    maxWidth: "350px",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  tableEntries: {
    backgroundColor: "transparent",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const displayTags = ({ classes, tags, storeSearchTerm, showSearchBar, searchTermArray }) => {
  return tags.map((tag, i) => (
    <SelectablePill
      key={tag}
      isSelected={searchTermArray?.includes(tag) || false}
      onClick={() => {
        showSearchBar();
        storeSearchTerm(`tag:${tag}`);
      }}
      data-test="overview-tag"
    >
      {tag}
    </SelectablePill>
  ));
};

const getTableEntries = ({
  filteredProjects,
  history,
  classes,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  storeSearchTerm,
  showSearchBar,
  highlightingRegex,
  searchTermArray
}) => {
  return filteredProjects.map(({ data, allowedIntents }, index) => {
    const {
      displayName,
      id,
      description,
      status,
      thumbnail = "/Thumbnail_0008.jpg",
      creationUnixTs,
      projectedBudgets,
      additionalData,
      tags
    } = data;
    const budgets = <BudgetsList budgets={projectedBudgets} />;
    const mappedStatus = strings.common.status + ": " + statusMapping(status);
    const imagePath = !_isEmpty(thumbnail) ? thumbnail : "/amazon_cover.jpg";
    const dateString = unixTsToString(creationUnixTs);
    const isOpen = status === "open";
    const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewProjectPermissions(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);
    const displayedTags = displayTags({ classes, tags: tags || [], storeSearchTerm, showSearchBar, searchTermArray });
    console.log("PROJECT: ");
    console.log(displayName);
    console.log(allowedIntents);
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
          parentClasses={classes}
          imagePath={imagePath}
          highlightingRegex={highlightingRegex}
        />
      );
    } else return null;
  });
};

const CardView = props => {
  const { classes, isRoot, allowedIntents, showCreationDialog } = props;
  const tableEntries = getTableEntries(props);
  return (
    <div aria-label="projects" className={classes.tableEntries}>
      {tableEntries}
      <Card data-test="project-creation" className={classes.addProject}>
        <div className={classes.addProjectContent}>
          <CardActions>
            <Tooltip id="tooltip-pcreate" title={strings.common.create}>
              <div>
                <Fab
                  className={classes.button}
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

export default withStyles(styles)(CardView);
