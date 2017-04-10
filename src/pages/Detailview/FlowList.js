import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';
import { showNext } from './actions';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import { connect } from 'react-redux';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';



class DetailWorkflowView extends Component {

  componentWillMount() {
    this.props.showNext();
  }


  state = {
    finished: false,
    stepIndex: 0,
  };



  render() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px'};
      return (
        <Card style={{
          width: '50%',
          right: '2%',
          top: '100px',
          position: 'absolute',
          zIndex: 1100,

        }}>
    <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
    <Table>
         <TableHeader displaySelectAll={false}
            adjustForCheckbox={false}>
           <TableRow>
             <TableHeaderColumn>Step/Key</TableHeaderColumn>
             <TableHeaderColumn>Location</TableHeaderColumn>
             <TableHeaderColumn>Time</TableHeaderColumn>
             <TableHeaderColumn>Confirmation</TableHeaderColumn>
             <TableHeaderColumn>Attached data</TableHeaderColumn>
           </TableRow>
         </TableHeader>
           <TableBody  displayRowCheckbox={false}
              adjustForCheckbox={false}>
             <TableRow>
               <TableRowColumn>Defintion of purpose/scope</TableRowColumn>
               <TableRowColumn>Frankfurt</TableRowColumn>
               <TableRowColumn>heute</TableRowColumn>
               <TableRowColumn>20</TableRowColumn>
               <TableRowColumn>20</TableRowColumn>
             </TableRow>


          </TableBody>
        </Table>
      </div>
        </Card>
    )
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    showNext: () => dispatch(showNext())
  };
}

const mapStateToProps = (state) => {
  console.log('Show Next is '+state.getIn(['detailview','showNext']) )
  return {
    showNext: state.getIn(['detailview','showNext'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailWorkflowView);
