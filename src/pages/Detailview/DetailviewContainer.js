import React, { Component } from 'react';

import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import {Card, CardTitle} from 'material-ui/Card';
import { showNext } from './actions';
import { connect } from 'react-redux';
import DetailWorkflowView from './DetailWorkflowView'
import FlowList from './FlowList'
class DetailviewContainer extends Component {


  render() {
      return (
        <div>
        <DetailWorkflowView/>
        <FlowList/>
        </div>

    )
  }
}

export default DetailviewContainer;
