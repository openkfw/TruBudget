import React from 'react';
import {Card, CardTitle} from 'material-ui/Card';
import { fetchStremItems } from './actions';

import WorkflowTable from './WorkflowTable';

const WorkflowList = ({ streamItems }) => (
      <Card style={{
        width: '50%',
        right: '2%',
        top: '100px',
        position: 'absolute',
        zIndex: 1100,

      }}>

        <WorkflowTable streamItems={streamItems}/>
      </Card>

);

export default WorkflowList;
