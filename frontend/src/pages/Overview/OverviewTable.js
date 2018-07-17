import React from "react";

import _isEmpty from "lodash/isEmpty";

import { withStyles } from "@material-ui/core/styles";
import AmountIcon from "@material-ui/icons/AccountBalance";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ContentAdd from "@material-ui/icons/Add";
import DateIcon from "@material-ui/icons/DateRange";
import ViewIcon from "@material-ui/icons/ZoomIn";
import EditIcon from "@material-ui/icons/Edit";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PermissionIcon from "@material-ui/icons/LockOpen";

import { toAmountString, statusMapping, tsToString } from "../../helper";
import strings from "../../localizeStrings";
import { canCreateProject, canViewProjectDetails, canEditProject, canViewProjectPermissions } from "../../permissions";

const styles = {
  card: {
    maxWidth: 300,
    margin: "35px",
    width: "35%"
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
  }
};

const getTableEntries = ({ projects, history, classes, showEditDialog, showProjectPermissions }) => {
  return projects.map(({ data, allowedIntents }, index) => {
    const {
      displayName,
      id,
      amount,
      currency,
      description,
      status,
      thumbnail = "/Thumbnail_0008.jpg",
      creationUnixTs
    } = data;
    const amountString = toAmountString(amount, currency);
    const mappedStatus = strings.common.status + ": " + statusMapping(status);
    const imagePath = !_isEmpty(thumbnail) ? thumbnail : "/amazon_cover.jpg";
    const dateString = tsToString(creationUnixTs);
    const isOpen = status !== "closed";
    const editDisabled = !(canEditProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewProjectPermissions(allowedIntents);
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
              <Button
                className={classes.button}
                disabled={!canViewProjectDetails(allowedIntents)}
                color="primary"
                onClick={() => history.push("/projects/" + id)}
                variant="fab"
              >
                <ViewIcon />
              </Button>
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
            <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <AmountIcon />
              </ListItemIcon>
              <ListItemText data-test="projectbudget" primary={amountString} secondary={strings.common.budget} />
            </ListItem>
            <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <DateIcon />
              </ListItemIcon>
              <ListItemText data-test="projectcreation" primary={dateString} secondary={strings.common.created} />
            </ListItem>
            <div className={classes.editContainer}>
              {canViewPermissions ? (
                <Tooltip id="tooltip-ppermissions" title={strings.common.show_permissions}>
                  <div>
                    <IconButton
                      data-test={`pp-button-${index}`}
                      className={classes.editIcon}
                      disabled={!canViewPermissions}
                      onClick={() => showProjectPermissions(id)}
                    >
                      <PermissionIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : null}
              {isOpen && !editDisabled ? (
                <Tooltip id="tooltip-pedit" title={strings.common.edit}>
                  <div>
                    <IconButton
                      data-test="pe-button"
                      className={classes.editIcon}
                      disabled={editDisabled}
                      onClick={() =>
                        showEditDialog(id, displayName, toAmountString(amount), currency, description, thumbnail)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : null}
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
              <Button
                className={props.classes.button}
                aria-label="create"
                disabled={!canCreateProject(props.allowedIntents)}
                onClick={() => props.showCreationDialog()}
                variant="fab"
                color="primary"
              >
                <ContentAdd />
              </Button>
            </Tooltip>
          </CardActions>
        </div>
      </Card>
    </div>
  );
};

export default withStyles(styles)(OverviewTable);
