import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';
import { fetchStreamItems } from './actions';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import { connect } from 'react-redux';
import WorkflowList from './WorkflowList'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';


let streamName;

class FlowListContainer extends Component {

  componentWillMount() {
     streamName =this.props.location.pathname.substring(9)
     this.props.fetchStremItems(streamName);
  }


  state = {
    finished: false,
    stepIndex: 0,
  };



  render() {
      return <WorkflowList {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {

  return {
    fetchStremItems: () => dispatch(fetchStreamItems(ownProps.location.pathname.substring(9)))
  };
}

const mapStateToProps = (state) => {
  console.log('Show Next is '+state.getIn(['detailview','streamItems']) )
  return {
    streamItems: state.getIn(['detailview','streamItems'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowListContainer);
