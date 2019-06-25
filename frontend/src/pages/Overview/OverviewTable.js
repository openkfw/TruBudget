import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AmountIcon from "@material-ui/icons/AccountBalance";
import ContentAdd from "@material-ui/icons/Add";
import DateIcon from "@material-ui/icons/DateRange";
import EditIcon from "@material-ui/icons/Edit";
import LabelIcon from "@material-ui/icons/LabelOutlined";
import PermissionIcon from "@material-ui/icons/LockOpen";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import ViewIcon from "@material-ui/icons/ZoomIn";
import _isEmpty from "lodash/isEmpty";
import React from "react";

import { formattedTag, statusMapping, toAmountString, unixTsToString } from "../../helper";
import strings from "../../localizeStrings";
import { canCreateProject, canEditProject, canViewProjectDetails, canViewProjectPermissions } from "../../permissions";
import ActionButton from "../Common/ActionButton";

const styles = {
  card: {
    maxWidth: 300,
    margin: "35px",
    width: "35%"
    // height: "590px"
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
  editIcon: {
    color: "black"
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

const displayTags = tags => {
  return tags.map((tag, i) => (
    <Button
      variant="outlined"
      // TODO: This will be used to filter projects by tag
      onClick={() => null}
      key={`${tag}-${i}`}
      style={{ margin: "1px" }}
      component="span"
      data-test="overview-tag"
      size="small"
    >
      {`#${formattedTag(tag)}`}
    </Button>
  ));
};

const getTableEntries = ({
  projects,
  history,
  classes,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  searchTerm,
  closeSearchBar
}) => {
  const filteredProjects = projects.filter(
    project =>
      project.data.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.data.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.data.description.toLowerCase().includes(searchTerm.toLowerCase())
    // TODO: If tags are added, search them as well
    // project.data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
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
    const editDisabled = !(canEditProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewProjectPermissions(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);
    const displayedTags = displayTags(tags || []);

    return (
      <Card aria-label="project" key={index} className={classes.card} data-test={`projectcard-${index}`}>
        <CardMedia className={classes.media} image={imagePath} />
        <CardActions
          style={{
            display: "flex",
            flexDirection: "column",
            height: "20px",
            alignItems: "flex-end",
            marginTop: "-40px"
          }}
        >
          <Tooltip id="tooltip-pview" title={strings.common.view}>
            <div>
              <Fab
                className={classes.button}
                disabled={!canViewProjectDetails(allowedIntents)}
                color="primary"
                onClick={() => {
                  closeSearchBar();
                  history.push("/projects/" + id);
                }}
                data-test={`project-view-button-${index}`}
              >
                <ViewIcon />
              </Fab>
            </div>
          </Tooltip>
        </CardActions>
        <CardContent>
          <CardHeader
            data-test="projectheader"
            className={classes.cardHeader}
            title={
              <div className={classes.cardTitle}>
                <span>{displayName}</span>
              </div>
            }
            subheader={mappedStatus}
          />
          <List>
            {projectedBudgets.length === 0 ? null : (
              <ListItem className={classes.listItem} disabled={true}>
                <ListItemIcon>
                  <AmountIcon />
                </ListItemIcon>
                <ListItemText data-test="projectbudget" primary={budgets} secondary={strings.common.budget} />
              </ListItem>
            )}
            <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <DateIcon />
              </ListItemIcon>
              <ListItemText data-test="projectcreation" primary={dateString} secondary={strings.common.created} />
            </ListItem>
            {displayedTags.length > 0 ? (
              <ListItem style={{ marginTop: "13px" }} className={classes.listItem} disabled={true}>
                <ListItemIcon>
                  <LabelIcon />
                </ListItemIcon>
                <ListItemText data-test="tags" primary="" secondary={displayedTags} />
              </ListItem>
            ) : null}
            <div className={classes.editContainer}>
              <ActionButton
                notVisible={additionalDataEmpty}
                onClick={() => {
                  showProjectAdditionalData(id);
                }}
                title="Additional Data"
                icon={<MoreIcon />}
                data-test={`project-overview-additionaldata-${index}`}
              />
              <ActionButton
                notVisible={!canViewPermissions}
                onClick={() => showProjectPermissions(id)}
                title={strings.common.show_permissions}
                icon={<PermissionIcon />}
                data-test={`pp-button-${index}`}
                iconButtonStyle={styles.editIcon}
              />
              <ActionButton
                notVisible={!isOpen && editDisabled}
                onClick={() => {
                  showEditDialog(id, displayName, description, thumbnail, projectedBudgets);
                }}
                title={strings.common.edit}
                icon={<EditIcon />}
                data-test={`pe-button-${index}`}
                iconButtonStyle={styles.editIcon}
              />
            </div>
          </List>
        </CardContent>
      </Card>
    );
  });
};

const OverviewTable = props => {
  const tableEntries = getTableEntries(props);
  return (
    <div
      aria-label="projects"
      style={{
        backgroundColor: "transparent",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {tableEntries}
      <Card data-test="projectcreation" style={{ height: "510px", margin: "35px", width: "300px", opacity: "0.7" }}>
        <div
          style={{
            display: "flex",
            backgroundColor: "lightgray",
            flexDirection: "row",
            maxWidth: "350px",
            height: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CardActions>
            <Tooltip id="tooltip-pcreate" title={strings.common.create}>
              <div>
                <Fab
                  className={props.classes.button}
                  aria-label="create"
                  disabled={!canCreateProject(props.allowedIntents)}
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
