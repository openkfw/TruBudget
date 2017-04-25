import React, { Component } from 'react';
import NotificationSystem from 'react-notification-system';
import _ from 'lodash';


export default class FlyInNotification extends Component {
  constructor() {
    super();
    this._notificationSystem = null;
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentDidUpdate = (prevProps) => {
    const oldNotifications = prevProps.notifications;
    const newNotifications = this.props.notifications;
    if(newNotifications.length > 0) {
      this.compareAndFireNotifications(oldNotifications, newNotifications);
    }
  }

  mapNotifications = (notification) => {
    return {
      key: notification.key,
      data: notification.data
    }
  }

  filterNotifications = (notification) => notification.data.read === false

  compareAndFireNotifications = (oldN, newN) => {
    if (!oldN.length) return;

    const oldData = oldN.map(this.mapNotifications).filter(this.filterNotifications).sort();
    const newData = newN.map(this.mapNotifications).filter(this.filterNotifications).sort();

    const nothingChanged = _.isEqual(oldData, newData);

    const changedData = newData.filter((data) => !_.some(oldData, data));

    changedData.map((notification) => this.showNotification(notification.data.description));
  }

  showNotification = (message) => {
    this._notificationSystem.addNotification({
      message,
      level: 'success'
    });
  }

  render() {
    return (
      <NotificationSystem ref="notificationSystem" />
    )
  }
}
