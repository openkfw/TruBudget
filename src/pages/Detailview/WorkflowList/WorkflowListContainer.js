import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';
import { fetchStremItems } from './actions';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import { connect } from 'react-redux';
import WorkflowList from './WorkflowList'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';



class FlowListContainer extends Component {

  componentWillMount() {
    this.props.fetchStremItems();
  }


  state = {
    finished: false,
    stepIndex: 0,
  };



  render() {
      return <WorkflowList {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchStremItems: () => dispatch(fetchStremItems())
  };
}

const mapStateToProps = (state) => {
  console.log('Show Next is '+state.getIn(['detailview','streamItems']) )
  return {
    streamItems: state.getIn(['detailview','streamItems'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowListContainer);
