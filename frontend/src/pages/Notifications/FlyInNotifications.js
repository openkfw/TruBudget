import React, { Component } from "react";
import Transition from "react-transition-group/Transition";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

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
      notifications: []
    };
  }

  componentWillReceiveProps = props => {
    if (!_isEmpty(props.notifications)) {
      const ids = props.notifications.map(n => n.notificationId);
      setTimeout(() => {
        this.removeNotification(ids);
      }, 4000);
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

  getMessages = () => {
    return this.state.notifications.map(({ data, id }, index) => {
      return (
        <Card
          key={id}
          style={{
            width: "300px",
            marginBottom: "8px"
          }}
        >
          <CardContent>h1</CardContent>
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
              {this.getMessages()}
            </div>
          )}
        </Transition>
      </div>
    );
  }
}
