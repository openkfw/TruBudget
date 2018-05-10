import React from "react";

import Card, { CardActions, CardMedia, CardTitle } from "material-ui/Card";
import Button from "material-ui/Button";
import List, { ListItem } from "material-ui/List";
import CommentIcon from "@material-ui/icons/ShortText";
import DateIcon from "@material-ui/icons/DateRange";
import AmountIcon from "@material-ui/icons/AccountBalance";
import InfoIcon from "@material-ui/icons/Search";
import ContentAdd from "@material-ui/icons/Add";
import _ from "lodash";
import { withStyles } from "material-ui/styles";

import { toAmountString, statusMapping, tsToString } from "../../helper";
import strings from "../../localizeStrings";
import { canCreateProject, canViewProjectDetails } from "../../permissions";
import { ListItemIcon, CardHeader } from "material-ui";
import { ListItemText } from "material-ui";
import { CardContent } from "material-ui";
import { Typography } from "material-ui";

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
    const imagePath = !_.isEmpty(thumbnail) ? thumbnail : "/amazon_cover.jpg";
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
