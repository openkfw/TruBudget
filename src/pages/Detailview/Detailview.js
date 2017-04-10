import React from 'react';

import {Card, CardTitle, CardText} from 'material-ui/Card';

import ProcessSelection from './ProcessSelection';
import OriginatingStep from './OriginatingStep';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
const Detailview = () => (
  <Card style={{
    width: '40%',
    left: '2%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,

  }}>
    <CardTitle title="Workflow Steps" subtitle="Add steps to the workflow" />
    <OriginatingStep/>
  </Card>
);

export default Detailview;
