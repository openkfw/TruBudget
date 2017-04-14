import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';
import { fetchStreamItems, showWorkflowDialog, createSubProjectItem } from './actions';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import { connect } from 'react-redux';
import WorkflowList from './WorkflowList'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class FlowListContainer extends Component {

  componentWillMount() {
     this.props.fetchStremItems(this.props.location.pathname.substring(9));
  }

  render() {
      return <WorkflowList {...this.props}/>
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {

  return {
    fetchStremItems: (streamName) => dispatch(fetchStreamItems(streamName)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    createSubProjectItem: (parentName, subprojectName) => dispatch(createSubProjectItem(parentName, subprojectName)),

  };
}

const mapStateToProps = (state) => {
  return {
    streamItems: state.getIn(['detailview','streamItems']),
    workflowDialogVisible: state.getIn(['detailview','workflowDialogVisible']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowListContainer);
