import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import strings from '../../localizeStrings';

import _ from 'lodash';


export default class FlyInNotification extends Component {
  constructor() {
    super();

    this.state = {
      id: 0,
      notificationStack: []
    }

    this.mountingTime = undefined;
  }

  componentDidMount = () => {
    this.mountingTime = Date.now();
  }

  componentDidUpdate = (prevProps) => {
    const isFirstRequest = this.mountingTime > (Date.now() - 2000);

    const oldNotifications = prevProps.notifications;
    const newNotifications = this.props.notifications;
    if (newNotifications.length > 0 && !isFirstRequest) {
      this.compareAndFireNotifications(oldNotifications, newNotifications);
    }
  }

  componentWillUnmount = () => {
    this.state.notificationStack.map((notification) => clearTimeout(notification.timer));
  }

  mapNotifications = (notification) => {
    return {
      key: notification.key,
      data: notification.data
    }
  }

  filterNotifications = (notification) => notification.data.done === false

  compareAndFireNotifications = (oldN, newN) => {
    const oldData = oldN.map(this.mapNotifications).filter(this.filterNotifications).sort();
    const newData = newN.map(this.mapNotifications).filter(this.filterNotifications).sort();

    const changedData = newData.filter((data) => !_.some(oldData, data));

    changedData.map((notification) => this.showNotification(notification.data));
  }

  showNotification = (data) => {
    const id = this.state.id + 1;

    const timer = setTimeout(() => {
      this.removeNotification(id);
    }, 7000);

    this.setState({
      id,
      notificationStack: [
        ...this.state.notificationStack,
        { data, id, timer }
      ],
    });
  }

  removeNotification (id) {
    const notifications = this.state.notificationStack.filter((notification) => id !== notification.id);
    this.setState({
      notificationStack: notifications
    })
  }

  getDescription = (data) => {
    const { action, workflowItem } = data;
    const templateString = strings.notification[action]
    return strings.formatString(templateString, workflowItem)

  }

  getMessages = () => {
    return this.state.notificationStack.map(({ data, id }, index) => {
      const user = this.props.users[data.issuer]
      return (
        <Card key={id} style={{
          width: '300px',
          marginBottom: '8px'
        }}>
          <CardHeader style={{ fontSize: '8pt' }}
            title={user.name}
            subtitle={user.organization}
            avatar={user.avatar}
          />
          <CardText>
            {this.getDescription(data)}
          </CardText>
        </Card>
      )
    })

  }

  render () {
    return (
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '16px',
        zIndex: 2000,
      }}>
        <CSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {this.getMessages()}
        </CSSTransitionGroup>
      </div>
    )
  }
}
