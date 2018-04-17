import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/reorder';

import { ACMECorpLightgreen, ACMECorpDarkBlue } from '../../colors.js';
import ChangeLog from '../Notifications/ChangeLog';

import SubProjectsTable from './SubProjectsTable';
import SubProjectCreation from './SubProjectCreation';


const SubProjects = (props) => {
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
        <FloatingActionButton disabled={!props.canCreateSubProject} backgroundColor={ACMECorpDarkBlue} onTouchTap={props.showSubprojectDialog} style={{
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
      <SubProjectsTable {...props} />
      <ChangeLog {...props} />
    </Card>

  )
};

export default SubProjects;
