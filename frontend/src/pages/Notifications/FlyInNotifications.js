import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import Typography from "@material-ui/core/Typography";

import { intentMapping, parseURI, isAllowedToSee, getParentData } from "./helper";

const styles = {
  notification: {
    position: "absolute",
    transition: "all 500ms ease-in"
  },
  notificationTransition: {
    entering: { right: "-400px" },
    entered: { right: "0px" },
    exiting: { right: "0px" },
    exited: { right: "-400px" }
  }
};

export default class FlyInNotification extends Component {
  getMessages = history => {
    return this.props.notifications.map(notification => {
      const { id, businessEvent, metadata } = notification;
      const projectId = metadata.project ? metadata.project.id : undefined;
      const subprojectId = metadata.subproject ? metadata.subproject.id : undefined;
      const { publisher } = businessEvent;
      const message = intentMapping(notification);
      const { projectDisplayName, subprojectDisplayName } = getParentData(notification);
      return (
        <Card
          key={id + "flyin"}
          style={{
            width: "300px",
            marginBottom: "8px"
          }}
        >
          <CardHeader
            avatar={<Avatar>{publisher ? publisher[0].toString().toUpperCase() : "?"}</Avatar>}
            action={
              isAllowedToSee(notification) ? (
                <IconButton
                  disabled={!isAllowedToSee(notification)}
                  color="primary"
                  onClick={() => history.push(parseURI({ projectId, subprojectId }))}
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
      <div
        style={{
          position: "fixed",
          top: "60px",
          right: "16px",
          zIndex: 2000
        }}
      >
        <Transition in={this.props.show} timeout={{ enter: 500, exit: 500 }}>
          {state => (
            <div
              style={{
                ...styles.notification,
                ...styles.notificationTransition[state]
              }}
            >
              {this.getMessages(this.props.history)}
            </div>
          )}
        </Transition>
      </div>
    );
  }
}
