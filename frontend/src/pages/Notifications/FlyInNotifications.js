import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import LaunchIcon from "@mui/icons-material/ZoomIn";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { getParentData, intentMapping, isAllowedToSee, parseURI } from "./helper";

import "./FlyInNotifications.scss";

const styles = {
  notificationTransition: {
    entering: { right: "-400px" },
    entered: { right: "0px" },
    exiting: { right: "0px" },
    exited: { right: "-400px" }
  }
};

export default class FlyInNotification extends Component {
  getMessages = () => {
    return this.props.notifications.map((notification) => {
      const { id, businessEvent, metadata } = notification;
      const projectId = metadata.project ? metadata.project.id : undefined;
      const subprojectId = metadata.subproject ? metadata.subproject.id : undefined;
      const { publisher } = businessEvent;
      const message = intentMapping(notification);
      const { projectDisplayName, subprojectDisplayName } = getParentData(notification);
      return (
        <Card key={id + "flyin"} className="fly-in-notification-card">
          <CardHeader
            avatar={<Avatar>{publisher ? publisher[0].toString().toUpperCase() : "?"}</Avatar>}
            action={
              isAllowedToSee(notification) ? (
                <IconButton
                  aria-label="launch"
                  disabled={!isAllowedToSee(notification)}
                  color="primary"
                  onClick={() => this.props.navigate(parseURI({ projectId, subprojectId }))}
                  size="large"
                >
                  <LaunchIcon />
                </IconButton>
              ) : null
            }
            title={projectDisplayName + " " + subprojectDisplayName}
          />
          <CardContent>
            <Typography component="p">{message}</Typography>
          </CardContent>
        </Card>
      );
    });
  };

  render() {
    return (
      <div className="fly-in-notifications-container">
        <Transition in={this.props.show} timeout={{ enter: 500, exit: 500 }}>
          {(state) => (
            <div className="fly-in-notifications" style={styles.notificationTransition[state]}>
              {this.getMessages()}
            </div>
          )}
        </Transition>
      </div>
    );
  }
}
