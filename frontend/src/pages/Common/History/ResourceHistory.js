import React from "react";
import moment from "moment";

import Card from "@material-ui/core/Card";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from "@material-ui/core/CircularProgress";

import strings from "../../../localizeStrings";

const styles = {
  empty: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  list: {
    maxWidth: "350px",
    minWidth: "350px"
  },
  icon: {
    fontSize: "40px"
  }
};
export default ({ show, close, resourceHistory, mapIntent }) => {
  return (
    <Drawer open={show} onClose={close} anchor="right">
      {resourceHistory.length > 0 ? (
        <List subheader={<ListSubheader disableSticky>{strings.common.history}</ListSubheader>} style={styles.list}>
          {resourceHistory.map(i => (
            <ListItem key={i.key + i.createdAt}>
              <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
              <ListItemText
                primary={mapIntent(i)}
                secondary={i.createdAt ? moment(i.createdAt).fromNow() : "Processing ..."}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <div style={{ ...styles.empty, ...styles.list }}>
          <Card elevation={0}>
          <div style={styles.container}>
              <div style={styles.refreshContainer}>
                <CircularProgress size={50} left={0} top={0} percentage={50} color="primary" style={styles.refresh} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </Drawer>
  );
};
