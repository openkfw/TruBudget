import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AttachMoney from 'material-ui/svg-icons/editor/attach-money';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import Description from 'material-ui/svg-icons/action/description';
import Report from 'material-ui/svg-icons/content/report';

const ProcessSelection = () => (
  <div style={{
    left: '20%',
    position: 'relative',
    zIndex: 1100,

  }}>
    <IconMenu
      iconButtonElement={<IconButton><Description /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="Definition of purpose/scope" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><AttachMoney /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
        <MenuItem primaryText="Submission of financing agreement" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><Report /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
        <MenuItem primaryText="Approval report tender evaluation" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><CheckCircle /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="Invoice approval" />
    </IconMenu>
</div>
);


export default ProcessSelection;
