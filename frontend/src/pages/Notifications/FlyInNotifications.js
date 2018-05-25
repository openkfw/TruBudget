import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import Card from "@material-ui/core/Card";

import _some from "lodash/some";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";

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
      id: 0,
      notificationStack: []
    };

    this.mountingTime = undefined;
  }

  componentDidMount = () => {
    this.mountingTime = Date.now();
  };

  componentDidUpdate = prevProps => {
    const isFirstRequest = this.mountingTime > Date.now() - 2000;

    const oldNotifications = prevProps.notifications;
    const newNotifications = this.props.notifications;
    if (newNotifications.length > 0 && !isFirstRequest) {
      this.compareAndFireNotifications(oldNotifications, newNotifications);
    }
  };

  componentWillUnmount = () => {
    this.state.notificationStack.map(notification => clearTimeout(notification.timer));
  };

  mapNotifications = notification => {
    return {
      key: notification.key,
      data: notification.data
    };
  };

  filterNotifications = notification => notification.data.done === false;

  compareAndFireNotifications = (oldN, newN) => {
    const oldData = oldN
      .map(this.mapNotifications)
      .filter(this.filterNotifications)
      .sort();
    const newData = newN
      .map(this.mapNotifications)
      .filter(this.filterNotifications)
      .sort();

    const changedData = newData.filter(data => !_some(oldData, data));

    changedData.map(notification => this.showNotification(notification.data));
  };

  showNotification = data => {
    const id = this.state.id + 1;

    const timer = setTimeout(() => {
      this.removeNotification(id);
    }, 7000);

    this.setState({
      id,
      notificationStack: [...this.state.notificationStack, { data, id, timer }]
    });
  };

  removeNotification(id) {
    const notifications = this.state.notificationStack.filter(notification => id !== notification.id);
    this.setState({
      notificationStack: notifications
    });
  }

  getDescription = data => {
    const { action, workflowItem } = data;
    const templateString = strings.notification[action];
    return strings.formatString(templateString, workflowItem);
  };

  getMessages = () => {
    return this.state.notificationStack.map(({ data, id }, index) => {
      const user = this.props.users[data.issuer];
      return (
        <Card
          key={id}
          style={{
            width: "300px",
            marginBottom: "8px"
          }}
        >
          {/* <CardHeader
            // avatar={
            //   <Avatar aria-label="Recipe" className={classes.avatar}>
            //     R
            //   </Avatar>
            // }

style={{ fontSize: "8pt" }}
            title="Shrimp and Chorizo Paella"
            subheader="September 14, 2016"
          />
          <CardHeader  title={user.name} subtitle={user.organization} avatar={user.avatar} />
          <CardTex>{this.getDescription(data)}</CardText>
          */}
        </Card>
      );
    });
  };

  render() {
    const show = !_isEmpty(this.state.notificationStack);

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
              {this.getMessages()}
            </div>
          )}
        </Transition>
      </div>
    );
  }
}
