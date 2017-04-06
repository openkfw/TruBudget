import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import Badge from 'material-ui/Badge';
import IconMenu from 'material-ui/IconMenu';

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import colors from '../../colors'


class Icon extends Component {
  render() {
    return (
      <IconButton 
          iconClassName="material-icons"
          tooltip="Peers"
          {...this.props}>
          device_hub
      </IconButton>
    );
  }

}
const PeerInfoIcon = (props) => (
  <Badge
    badgeContent={4}
    secondary={true}
    style={{ padding: 0 }}
    badgeStyle={{ height: '18px', width: '18px' }}>
    <IconMenu
      iconButtonElement={<Icon/>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
    >
      <MenuItem primaryText="Refresh" />
      <MenuItem primaryText="Send feedback" />
      <MenuItem primaryText="Settings" />
      <MenuItem primaryText="Help" />
      <MenuItem primaryText="Sign out" />
    </IconMenu>
  </Badge>
)

export default PeerInfoIcon;