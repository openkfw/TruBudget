import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import StatusIcon from "@mui/icons-material/Build";
import ProjectIcon from "@mui/icons-material/Business";
import NodesIcon from "@mui/icons-material/DesktopWindows";
import ExportIcon from "@mui/icons-material/ListAlt";
import SocialNotificationIcon from "@mui/icons-material/NotificationsActive";
import UsersIcon from "@mui/icons-material/PeopleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import { Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Subheader from "@mui/material/ListSubheader";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";

import strings from "../../localizeStrings";

import DownloadBackupButton from "./DownloadBackupButton";
import RestoreBackupButton from "./RestoreBackupButton";

import "./SideNavCard.scss";

const SideNavCard = ({
  avatar,
  avatarBackground,
  createBackup,
  disableLiveUpdates,
  displayName,
  enableLiveUpdates,
  environment,
  exportData,
  exportServiceAvailable,
  fetchEmailAddress,
  groups,
  isLiveUpdateAllProjectsEnabled,
  nodeDashboardEnabled,
  organization,
  restoreBackup,
  showUserProfile,
  userId
}) => {
  const navigate = useNavigate();
  const openUserProfile = () => {
    fetchEmailAddress();
    showUserProfile();
  };

  const toggleLiveUpdates = useCallback(() => {
    if (isLiveUpdateAllProjectsEnabled) {
      disableLiveUpdates();
    } else {
      enableLiveUpdates();
    }
  }, [disableLiveUpdates, enableLiveUpdates, isLiveUpdateAllProjectsEnabled]);

  return (
    <div className="side-navigation" data-test="side-navigation">
      <div
        style={{
          background: `url('${avatarBackground}') no-repeat`
        }}
        className="side-navigation-header"
      >
        <div>
          <ListItem className="side-navigation-header-list">
            <ListItemIcon>
              <IconButton aria-label="avatar icon" size="large">
                <ListItemAvatar>
                  <Avatar size={60} src={avatar} />
                </ListItemAvatar>
              </IconButton>
            </ListItemIcon>
            <ListItemText
              className="info-user"
              primary={<span>{displayName}</span>}
              secondary={<span>{organization}</span>}
            />
            <IconButton
              aria-label="show user profile"
              data-test="show-user-profile"
              onClick={() => openUserProfile()}
              size="large"
            >
              <SettingsIcon />
            </IconButton>
          </ListItem>
        </div>
      </div>
      <List>
        <Subheader>{strings.navigation.selections}</Subheader>
        <ListItemButton onClick={() => navigate("/")} data-test="side-navigation-projects">
          <ListItemIcon>
            <ProjectIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_projects} />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/notifications")} data-test="side-navigation-notifications">
          <ListItemIcon>
            <SocialNotificationIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_notifications} />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/users")} data-test="side-navigation-users">
          <ListItemIcon>
            <UsersIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.menu_item_users} />
        </ListItemButton>
        {nodeDashboardEnabled ? (
          <ListItemButton onClick={() => navigate("/nodes")} data-test="side-navigation-nodes">
            <ListItemIcon>
              <NodesIcon />
            </ListItemIcon>
            <ListItemText primary={strings.nodesDashboard.nodes} />
          </ListItemButton>
        ) : null}
        {exportServiceAvailable ? (
          <ListItemButton onClick={() => exportData(environment)} data-test="side-navigation-export">
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText primary={strings.navigation.menu_item_export} />
          </ListItemButton>
        ) : null}
        <ListItemButton onClick={() => navigate("/status")} data-test="side-navigation-service-status">
          <ListItemIcon>
            <StatusIcon />
          </ListItemIcon>
          <ListItemText primary={strings.navigation.service_status} />
        </ListItemButton>
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
      <Divider />
      <List>
        <Subheader>{strings.navigation.rtUpdates}</Subheader>
        <div className="real-time-updates-container">
          <Stack direction={"row"}>
            <Typography className="real-time-typography">{strings.common.off}</Typography>
            <Switch
              value={"liveUpdateSwitch"}
              checked={isLiveUpdateAllProjectsEnabled}
              onChange={() => toggleLiveUpdates()}
            />
            <Typography className="real-time-typography">{strings.common.on}</Typography>
          </Stack>
        </div>
      </List>
      <Divider />
      <List>
        {groups.length ? <Subheader> {strings.users.groups} </Subheader> : null}
        {groups.map((group) => {
          return (
            <div key={group.groupId}>
              <ListItem>
                <ListItemText primary={group.displayName} secondary={strings.common.id + ": " + group.groupId} />
              </ListItem>
              <Divider />
            </div>
          );
        })}
      </List>
      <div style={{ flexGrow: 1 }} />
    </div>
  );
};

export default SideNavCard;
