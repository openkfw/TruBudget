import React from 'react';
import IconButton from 'material-ui/IconButton';
import BubbleIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';

import Badge from 'material-ui/Badge';

import colors from '../../colors';
import strings from '../../localizeStrings';


const NotificationIcon = ({ unreadNotifications, history }) => {
  return (
    <Badge
      badgeContent={unreadNotifications}
      secondary={true}
      style={{ padding: 0 }}
      badgeStyle={{ height: '18px', width: '18px' }}>
      <IconButton
        tooltip={strings.navigation.unread_notifications}
        onTouchTap={() => history.push('/notifications')}>
        <BubbleIcon color={colors.lightColor} />
      </IconButton>
    </Badge>
  )
}

export default NotificationIcon;
