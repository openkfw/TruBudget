import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import LaunchIcon from "@material-ui/icons/Launch";
import Typography from "@material-ui/core/Typography";

import _isEmpty from "lodash/isEmpty";

import { intentMapping, parseURI, fetchRessourceName, hasAccess } from "./helper";

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
  constructor() {
    super();

    this.state = {
      notifications: []
    };
  }

  componentWillReceiveProps = props => {
    if (!_isEmpty(props.notifications)) {
      const ids = props.notifications.map(n => n.notificationId);
      setTimeout(() => {
        this.removeNotification(ids);
      }, 7000);
    }
    this.setState({
      notifications: props.notifications
    });
  };

  removeNotification(ids) {
    this.setState({
      notifications: this.state.notifications.filter(n => ids.indexOf(n.notificationId) < 0)
    });
  }

  getMessages = history => {
    return this.state.notifications.map(({ notificationId, originalEvent, resources }) => {
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
            title={fetchRessourceName(resources, "project")}
            subheader={fetchRessourceName(resources, "subproject")}
          />
          <CardContent>
            <Typography component="p">{message}</Typography>
          </CardContent>
        </Card>
      );
    });
  };

  render() {
    const show = !_isEmpty(this.props.notifications);

    return (
      <div
        style={{
          position: "fixed",
          top: "60px",
          right: "16px",
          zIndex: 2000
        }}
      >
        <Transition in={show} timeout={500}>
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
