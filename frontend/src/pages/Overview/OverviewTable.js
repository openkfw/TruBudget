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
import ContentAdd from "@material-ui/icons/Add";
import DateIcon from "@material-ui/icons/DateRange";
import InfoIcon from "@material-ui/icons/Search";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { toAmountString, statusMapping, tsToString } from "../../helper";
import strings from "../../localizeStrings";
import { canCreateProject, canViewProjectDetails } from "../../permissions";

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
  }
};

const getTableEntries = ({ projects, history, classes }) => {
  return projects.map((project, index) => {
    const { displayName, amount, currency, status, thumbnail = "/Thumbnail_0008.jpg", creationUnixTs } = project;
    const amountString = toAmountString(amount, currency);
    const mappedStatus = strings.common.status + ": " + statusMapping(status);
    const imagePath = !_isEmpty(thumbnail) ? thumbnail : "/amazon_cover.jpg";
    const dateString = tsToString(creationUnixTs);

    return (
      <Card aria-label="project" key={index} className={classes.card}>
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
          <Button
            className={classes.button}
            disabled={!canViewProjectDetails(project.allowedIntents)}
            color="primary"
            onClick={() => history.push("/projects/" + project.id)}
            variant="fab"
          >
            <InfoIcon />
          </Button>
        </CardActions>
        <CardContent>
          <CardHeader className={classes.cardHeader} title={displayName} subheader={mappedStatus} />
          <List>
            {/* <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <CommentIcon />
              </ListItemIcon>
              <ListItemText primary={description} secondary={strings.common.comment} />
            </ListItem> */}
            <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <AmountIcon />
              </ListItemIcon>
              <ListItemText primary={amountString} secondary={strings.common.budget} />
            </ListItem>
            <ListItem className={classes.listItem} disabled={true}>
              <ListItemIcon>
                <DateIcon />
              </ListItemIcon>
              <ListItemText primary={dateString} secondary={strings.common.created} />
            </ListItem>
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
      <Card style={{ margin: "35px", width: "25%", opacity: "0.7" }}>
        <div
          style={{
            display: "flex",
            height: "450px",
            backgroundColor: "lightgray",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CardActions>
            <Button
              className={props.classes.button}
              aria-label="create"
              disabled={!canCreateProject(props.allowedIntents)}
              onClick={() => props.showProjectDialog()}
              variant="fab"
              color="primary"
            >
              <ContentAdd />
            </Button>
          </CardActions>
        </div>
      </Card>
    </div>
  );
};

export default withStyles(styles)(OverviewTable);
