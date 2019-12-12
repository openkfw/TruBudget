import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import ContentAdd from "@material-ui/icons/Add";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { formattedTag, statusMapping, toAmountString, unixTsToString } from "../../helper";
import strings from "../../localizeStrings";
import { canCreateProject, canUpdateProject, canViewProjectPermissions } from "../../permissions";
import ProjectCard from "./ProjectCard";

const styles = {
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
    opacity: 1
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
    marginTop: "20px",
    justifyContent: "flex-end"
  },
  cardTitle: {
    textOverflow: "ellipsis",
    width: "250px",
    whiteSpace: "nowrap",
    paddingTop: "10px",
    overflow: "hidden"
  },
  budgets: {
    marginBottom: "8px"
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
  },
  tagButton: {
    margin: "1px"
  },
  highlightedTagButton: {
    margin: "1px",
    backgroundColor: "#C2CCF8"
  }
};

const displayProjectBudget = budgets => {
  return (
    <div>
      {budgets.map((b, i) => {
        return (
          <div key={`projectedBudget-${i}`} style={styles.budgets}>
            <Tooltip title={b.organization}>
              <Chip
                avatar={<Avatar>{b.organization.slice(0, 1)}</Avatar>}
                label={toAmountString(b.value, b.currencyCode)}
              />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

const displayTags = (tags, storeSearchTerm, showSearchBar, searchTermArray) => {
  return tags.map((tag, i) => (
    <Button
      variant="outlined"
      onClick={() => {
        showSearchBar();
        storeSearchTerm(`tag:${tag}`);
      }}
      key={`${tag}-${i}`}
      style={searchTermArray.includes(tag) ? styles.highlightedTagButton : styles.tagButton}
      component="span"
      data-test="overview-tag"
      size="small"
    >
      {`#${formattedTag(tag)}`}
    </Button>
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
    const budgets = displayProjectBudget(projectedBudgets);
    const mappedStatus = strings.common.status + ": " + statusMapping(status);
    const imagePath = !_isEmpty(thumbnail) ? thumbnail : "/amazon_cover.jpg";
    const dateString = unixTsToString(creationUnixTs);
    const isOpen = status !== "closed";
    const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewProjectPermissions(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);
    const displayedTags = displayTags(tags || [], storeSearchTerm, showSearchBar, searchTermArray);

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
        classes={classes}
        imagePath={imagePath}
        highlightingRegex={highlightingRegex}
      />
    );
  });
};

const OverviewTable = props => {
  const tableEntries = getTableEntries(props);
  return (
    <div aria-label="projects" style={styles.tableEntries}>
      {tableEntries}
      <Card data-test="project-creation" style={styles.addProject}>
        <div style={styles.addProjectContent}>
          <CardActions>
            <Tooltip id="tooltip-pcreate" title={strings.common.create}>
              <div>
                <Fab
                  className={props.classes.button}
                  aria-label="create"
                  disabled={!canCreateProject(props.allowedIntents) || props.isRoot}
                  onClick={() => props.showCreationDialog()}
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

export default withStyles(styles)(OverviewTable);
