import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ProjectCreationDialog from './ProjectCreationDialog';

import OverviewTable from './OverviewTable';

const Overview = (props) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ProjectCreationDialog title={"Add new project"} {...props}/>
      <Card style={{
        width: '60%',
        position: 'relative',
        marginTop: '40px'
      }}>
        <FloatingActionButton disabled={!props.loggedInUser.role.write} onTouchTap={props.showWorkflowDialog} style={{ position: 'absolute', right: '-26px', top: '16px' }}>
          <ContentAdd />
        </FloatingActionButton>
        <CardTitle title="Projects" subtitle="Overview of ongoing projects" />
        <CardText>
          The list of currently ongoing projects is shown below. Click on the select link to view additional details.
        </CardText>
        <OverviewTable {...props} />
      </Card>
    </div>
  );

export default Overview;
