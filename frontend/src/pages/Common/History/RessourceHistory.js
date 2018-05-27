import React from "react";
import moment from "moment";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import NotificationsActive from "@material-ui/icons/NotificationsActive";

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
export default ({ show, close, ressourceHistory, mapIntent }) => {
  return (
    <Drawer open={show} onClose={close} anchor="right">
      {ressourceHistory.length > 0 ? (
        <List subheader={<ListSubheader>History</ListSubheader>} style={styles.list}>
          {ressourceHistory.map(i => (
            <ListItem key={i.key + i.createdAt}>
              <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
              <ListItemText
                primary={mapIntent(i.intent, i.data)}
                secondary={i.createdAt ? moment(i.createdAt).fromNow() : "Processing ..."}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <div style={{ ...styles.empty, ...styles.list }}>
          <Card elevation={0}>
            <CardHeader
              avatar={<NotificationsActive style={styles.icon} />}
              title="Nothing to display yet"
              subheader=" "
            />
          </Card>
        </div>
      )}
    </Drawer>
  );
};
