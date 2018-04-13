import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/reorder';

import SubProjectsTable from './SubProjectsTable';
import ChangeLog from '../Notifications/ChangeLog';
import _ from 'lodash';
import { ACMECorpLightgreen, ACMECorpDarkBlue } from '../../colors.js';
import SubProjectCreation from './SubProjectCreation';
import PermissionsScreen from '../Common/Permissions/PermissionsScreen';


const SubProjects = (props) => {
  const roleOfUser = props.loggedInUser.role
  const isAllowedCreateProjects = roleOfUser.write && _.includes([...props.projectAssignee], roleOfUser.roleName);
  return (
    <Card style={{
      position: 'relative',
      width: '100%'
    }}>
      <SubProjectCreation {...props} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        alignItems: 'center',
        top: '16px',
        right: '-26px'
      }}>
        <FloatingActionButton disabled={!isAllowedCreateProjects} backgroundColor={ACMECorpDarkBlue} onTouchTap={props.showSubprojectDialog} style={{
          position: 'relative'
        }}>
          <ContentAdd />
        </FloatingActionButton>
        <FloatingActionButton mini={true} onTouchTap={() => props.openHistory()} backgroundColor={ACMECorpLightgreen} style={{
          position: 'relative',
          marginTop: '8px'
        }}>
          <HistoryIcon />
        </FloatingActionButton>

      </div>
      {/* <PermissionsScreen permissions={props.permissions} user={props.user} /> */}
      <SubProjectsTable {...props} />
      <ChangeLog {...props} />
    </Card>

  )
};

export default SubProjects;
