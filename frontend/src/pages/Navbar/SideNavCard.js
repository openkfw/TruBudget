import React from "react";

import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ProjectIcon from "@material-ui/icons/Business";
import SocialNotificationIcon from "@material-ui/icons/NotificationsActive";
import Subheader from "@material-ui/core/ListSubheader";

import strings from "../../localizeStrings";

const SideNavCard = ({ avatarBackground, avatar, displayName, organization, history }) => (
  <div>
    <div
      style={{
        background: `url('${avatarBackground}') no-repeat`,
        backgroundSize: "cover",
        height: "100px",
        position: "relative",
        width: "300px"
      }}
    >
      <div
        style={{
          bottom: 0,
          position: "absolute",
          width: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          <ListItem style={{ paddingTop: "16px" }}>
            <ListItemIcon>
              <Avatar
                size={60}
                src={avatar}
                style={{
                  marginLeft: "16px"
                }}
              />
            </ListItemIcon>
            <ListItemText primary={<span>{displayName}</span>} secondary={<span>{organization}</span>} />
          </ListItem>
        </div>
      </div>
    </div>
    <List>
      <Subheader>{strings.navigation.selections}</Subheader>
      <ListItem button onClick={() => history.push("/")}>
        <ListItemIcon>
          <ProjectIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_projects} />
      </ListItem>
      <ListItem button onClick={() => history.push("/notifications")}>
        <ListItemIcon>
          <SocialNotificationIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_notifications} />
      </ListItem>
    </List>
    <Divider />
  </div>
);

export default SideNavCard;
