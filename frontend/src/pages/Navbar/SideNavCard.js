import React from "react";
import { List, ListItem } from "material-ui/List";
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
        position: "relative"
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
          <Avatar
            size={60}
            src={avatar}
            style={{
              marginLeft: "16px"
            }}
          />
          <ListItem
            primaryText={<div style={{ color: colors.lightColor }}>{displayName}</div>}
            secondaryText={<div style={{ color: colors.lightColor }}>{organization}</div>}
            disabled
            style={{ paddingTop: "16px" }}
          />
        </div>
      </div>
    </div>
    <List>
      <Subheader>{strings.navigation.selections}</Subheader>
      <ListItem
        primaryText={strings.navigation.menu_item_projects}
        leftIcon={<ProjectIcon />}
        onTouchTap={() => history.push("/")}
      />
      <ListItem
        primaryText={strings.navigation.menu_item_notifications}
        leftIcon={<SocialNotificationIcon />}
        onTouchTap={() => history.push("/notifications")}
      />
      <ListItem
        primaryText={strings.navigation.menu_item_network}
        leftIcon={<NetworkIcon />}
        onTouchTap={() => history.push("/network")}
      />
    </List>
    <Divider />
  </div>
);

export default SideNavCard;
