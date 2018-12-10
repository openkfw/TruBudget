import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import Typography from "@material-ui/core/Typography";

import _isEmpty from "lodash/isEmpty";

import { intentMapping, parseURI, fetchResourceName, hasAccess } from "./helper";

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
    return this.props.notifications.map(({ notificationId, originalEvent, resources }) => {
      const { createdBy } = originalEvent;
      const message = intentMapping({ originalEvent, resources });
      return (
        <Card
          key={notificationId + "flyin"}
          style={{
            width: "300px",
            marginBottom: "8px"
          }}
        >
          <CardHeader
            avatar={<Avatar>{createdBy[0] || "?"}</Avatar>}
            action={
              <IconButton
                disabled={!hasAccess(resources)}
                color="primary"
                onClick={() => history.push(parseURI({ resources }))}
              >
                <LaunchIcon />
              </IconButton>
            }
            title={fetchResourceName(resources, "project")}
            subheader={fetchResourceName(resources, "subproject")}
          />
          <CardContent>
            <Typography component="p">{message}</Typography>
          </CardContent>
        </Card>
      );
    });
  };

  render() {
    let show = !_isEmpty(this.props.notifications) && !_isEmpty(this.props.latestFlyInId);
    return (
      <div
        style={{
          position: "fixed",
          top: "60px",
          right: "16px",
          zIndex: 2000
        }}
      >
        <Transition in={show} timeout={{ enter: 500, exit: 500 }}>
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
