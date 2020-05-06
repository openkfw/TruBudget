import { IconButton } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Subheader from "@material-ui/core/ListSubheader";
import ProjectIcon from "@material-ui/icons/Business";
import NodesIcon from "@material-ui/icons/DesktopWindows";
import ExportIcon from "@material-ui/icons/ListAlt";
import SocialNotificationIcon from "@material-ui/icons/NotificationsActive";
import UsersIcon from "@material-ui/icons/PeopleOutline";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";
import strings from "../../localizeStrings";
import DownloadBackupButton from "./DownloadBackupButton";
import RestoreBackupButton from "./RestoreBackupButton";
import VersionsTable from "./VersionsTable";

const SideNavCard = ({
  avatarBackground,
  avatar,
  displayName,
  organization,
  nodeDashboardEnabled,
  history,
  groups,
  userId,
  createBackup,
  restoreBackup,
  versions,
  exportData,
  showUserProfile
}) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto"
    }}
    data-test="side-navigation"
  >
    <div
      style={{
        background: `url('${avatarBackground}') no-repeat`,
        backgroundSize: "cover",
        height: "100px",
        position: "relative",
        width: "100%",
        minWidth: "300px"
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
            <IconButton children={<Avatar size={60} src={avatar} />} />
          </ListItemIcon>
          <ListItemText
            style={{ padding: "0px" }}
            primary={<span>{displayName}</span>}
            secondary={<span>{organization}</span>}
          />
          <IconButton data-test="show-user-profile" onClick={() => showUserProfile()}>
            <SettingsIcon />
          </IconButton>
        </ListItem>
      </div>
    </div>
    <List>
      <Subheader>{strings.navigation.selections}</Subheader>
      <ListItem button onClick={() => history.push("/")} data-test="side-navigation-projects">
        <ListItemIcon>
          <ProjectIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_projects} />
      </ListItem>
      <ListItem button onClick={() => history.push("/notifications")} data-test="side-navigation-notifications">
        <ListItemIcon>
          <SocialNotificationIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_notifications} />
      </ListItem>
      <ListItem button onClick={() => history.push("/users")} data-test="side-navigation-users">
        <ListItemIcon>
          <UsersIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_users} />
      </ListItem>
      {nodeDashboardEnabled ? (
        <ListItem button onClick={() => history.push("/nodes")} data-test="side-navigation-nodes">
          <ListItemIcon>
            <NodesIcon />
          </ListItemIcon>
          <ListItemText primary={strings.nodesDashboard.nodes} />
        </ListItem>
      ) : null}
      <ListItem button onClick={exportData} data-test="side-navigation-export">
        <ListItemIcon>
          <ExportIcon />
        </ListItemIcon>
        <ListItemText primary={strings.navigation.menu_item_export} />
      </ListItem>
    </List>
    <Divider />
    {userId === "root" ? (
      <List>
        <Subheader> {strings.navigation.backup} </Subheader>
        <ListItem>
          <DownloadBackupButton createBackup={createBackup} />
          <RestoreBackupButton restoreBackup={restoreBackup} />
        </ListItem>
        <Divider />
      </List>
    ) : null}
    <List>
      <Subheader> {strings.users.groups} </Subheader>
      {groups.map(group => (
        <div key={group.groupId}>
          <ListItem>
            <ListItemText primary={group.displayName} secondary={strings.common.id + ": " + group.groupId} />
          </ListItem>
          <Divider />
        </div>
      ))}
    </List>
    <div style={{ flexGrow: 1 }} />
    <VersionsTable versions={versions} />
  </div>
);

export default SideNavCard;
