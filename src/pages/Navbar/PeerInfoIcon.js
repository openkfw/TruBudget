import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Badge from 'material-ui/Badge';
import IconMenu from 'material-ui/IconMenu';
import Subheader from 'material-ui/Subheader';
import NetworkIcon from 'material-ui/svg-icons/hardware/device-hub';

import colors from '../../colors'

class Icon extends Component {
  render() {
    return (
      <IconButton
        {...this.props}
        tooltip="Peers">
        <NetworkIcon color={colors.lightColor} />
      </IconButton>
    )
  }
};

const transformPeers = (peers = []) => {
  const amount = peers.length || 0;
  const list = peers.map((peer, index) => {
    return <MenuItem key={index} primaryText={peer.addr} />
  });

  return { amount, list };
}
const PeerInfoIcon = (props) => {
  const { amount, list } = transformPeers(props.peers);
  return (
    <Badge
      badgeContent={amount}
      secondary={true}
      style={{ padding: 0 }}
      badgeStyle={{ height: '18px', width: '18px' }}>
      <IconMenu
        iconButtonElement={<Icon />}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Subheader>Connected peers</Subheader>
        {amount > 0 ? list : <MenuItem primaryText="No peers" disabled />}
      </IconMenu>
    </Badge>
  )
}

export default PeerInfoIcon;
