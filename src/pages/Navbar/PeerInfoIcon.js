import React from 'react';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';


const PeerInfoIcon = (props) => (
  <Badge
      badgeContent={4}
      secondary={true}
      style={{padding: 0}}
      badgeStyle={{height: '18px', width: '18px'}}>
    <IconButton
      iconClassName="material-icons"
      tooltip="Peers"
      style={{padding: 0}}>
      device_hub
    </IconButton>
  </Badge>
)

export default PeerInfoIcon;