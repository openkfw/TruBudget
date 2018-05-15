import React from "react";
import moment from "moment";

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";

export default ({ show, close, ressourceHistory, mapIntent }) => {
  return (
    <Drawer open={show} onClose={close} anchor="right">
      <List subheader={<ListSubheader>History</ListSubheader>} style={{ maxWidth: "350px" }}>
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
    </Drawer>
  );
};
