import React from "react";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import SocialNotificationIcon from "@material-ui/icons/NotificationsActive";
import NetworkIcon from "@material-ui/icons/DeviceHub";
import ProjectIcon from "@material-ui/icons/Business";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";
import Subheader from "material-ui/List/ListSubheader";

import colors from "../../colors";
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
            <ListItemText
              primary={<span style={{ color: colors.lightColor }}>{displayName}</span>}
              secondary={<span style={{ color: colors.lightColor }}>{organization}</span>}
            />
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
      <ListItem button onClick={() => history.push("/network")}>
        <ListItemIcon>
          <NetworkIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_network} />
      </ListItem>
    </List>
    <Divider />
  </div>
);

export default SideNavCard;
