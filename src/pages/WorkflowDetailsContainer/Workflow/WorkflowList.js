import React from 'react';
import { Card } from 'material-ui/Card';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InprogressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import EditIcon from 'material-ui/svg-icons/image/edit';
import RaisedButton from 'material-ui/RaisedButton';


import { toAmountString } from '../../../helper.js';
import { ACMECorpLightgrey, ACMECorpSuperLightgreen } from '../../../colors.js';


const styles = {
  in_progress: {
    backgroundColor: ACMECorpLightgrey
  },
  done: {
    backgroundColor: ACMECorpSuperLightgreen
  },
  open: {},
  dots: {
    height: 20,
    width: 20,
    textAlign: 'center',
    display: 'inline-block',
    position: 'absolute',
    top: '14px',
    left: '-35px',
  },
  line: {
    position: 'absolute',
    borderLeft: '2px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'black',
    height: '100%',
    left: '-26px',
    bottom: '30px',
  },
  firstLine: {
    position: 'absolute',
    borderLeft: '2px solid',
    borderLeftColor: 'black',
    height: '34px',
    left: '-26px',
    bottom: '30px',
  },
  editButtons: {
    minWidth: '40px',
    marginLeft: '5px',
    marginRight: '5px',
    backgroundColor: 'white'
  }
}

const StepDot = ({ status, selectable }) => {
  let Icon;

  switch (status) {
    case 'open':
      Icon = OpenIcon;
      break;
    case 'in_progress':
      Icon = InprogressIcon;
      break;
    case 'done':
      Icon = DoneIcon;
      break;
    default:
      Icon = OpenIcon;
  }

  return (
    <Paper style={styles.dots} zDepth={2} circle={true}>
      <Icon style={{ width: '14px', height: '20px', opacity: selectable ? 1 : 0.3 }} />
    </Paper>
  )
};

const getEditButtons = (status = 'open', editCB, progressCB) => {
  const statusMapping = {
    open: {
      tooltip: 'Start Workflow',
      icon: InprogressIcon
    },
    'in_progress': {
      tooltip: 'Finish Workflow',
      icon: DoneIcon
    }
  }

  const Icon = statusMapping[status].icon;

  return (
    <TableRowColumn>
      <RaisedButton
        onTouchTap={() => progressCB()}
        style={styles.editButtons}
        primary
        icon={<Icon />}>
      </RaisedButton>
      <RaisedButton
        onTouchTap={() => editCB()}
        style={styles.editButtons}
        secondary
        icon={<EditIcon />}>
      </RaisedButton>
    </TableRowColumn>
  )
}

const createLine = (isFirst, selectable) => {
  const lineStyle = isFirst ? styles.firstLine : { ...styles.line, opacity: selectable ? 1 : 0.2 };

  return (
    <div style={lineStyle}></div>
  )
};

const createHeader = () => (
  <Card style={{
    paddingLeft: '50px',
    paddingRight: '10px',
  }}>
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow displayBorder={false}>
          <TableHeaderColumn>Workflow</TableHeaderColumn>
          <TableHeaderColumn>Amount</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
          <TableHeaderColumn></TableHeaderColumn>
        </TableRow>
      </TableHeader>
    </Table>
  </Card>
)

const createWorkflowItems = ({ workflowItems, ...props }) => {
  let nextWorkflowNotSelectable = false;
  return workflowItems.map((workflow, index) => {
    const status = workflow.data.status;
    const currentWorkflowSelectable = !nextWorkflowNotSelectable;
    if (!nextWorkflowNotSelectable) nextWorkflowNotSelectable = status === 'open' || status === 'in_progress'

    const amount = toAmountString(workflow.data.amount, workflow.data.currency);

    const tableStyle = currentWorkflowSelectable ? styles[status] : { ...styles[status], opacity: 0.3 };

    const statusMapping = {
      done: 'Done',
      'in_progress': 'In progress',
      open: 'Open'
    }

    return (
      <Card key={index} style={{
        marginLeft: '50px',
        marginRight: '10px',
        marginTop: '15px',
        marginBottom: '15px',
        position: 'relative',
      }}>
        {createLine(index === 0, currentWorkflowSelectable)}
        <StepDot status={status} selectable={currentWorkflowSelectable} />
        <Table>
          <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>
            <TableRow style={tableStyle} selectable={false} disabled={currentWorkflowSelectable}>
              <TableRowColumn>{workflow.key}</TableRowColumn>
              <TableRowColumn>{amount}</TableRowColumn>
              <TableRowColumn>{statusMapping[status]}</TableRowColumn>
              {currentWorkflowSelectable && status !== 'done' ? getEditButtons(status, () => editWorkflow(workflow, props), () => changeProgress(workflow, props)) : <TableRowColumn />}
            </TableRow>

          </TableBody>
        </Table>
      </Card>
    )
  });
}

const editWorkflow = ({ key, txid, data }, props) => {
  const { amount, currency, purpose, addData, assignee, status } = data;
  props.storeWorkflowName(key)
  props.storeWorkflowAmount(amount)
  props.storeWorkflowCurrency(currency)
  props.storeWorkflowPurpose(purpose)
  props.storeWorkflowAdditionalData(addData)
  props.storeWorkflowAssignee(assignee)
  props.enableWorkflowState()
  props.storeWorkflowState(status)
  props.storeWorkflowTxid(txid)
  props.openWorkflowDialog(true)
}

const changeProgress = ({ key, txid, data }, props) => {
  const { amount, currency, purpose, addData, assignee, status } = data;

  const nextStatus = status === 'open' ? 'in_progress' : 'done';
  props.editWorkflowItem(props.location.pathname.split('/')[3], key, amount, currency, purpose, addData, nextStatus, assignee, txid)
}

const WorkflowList = (props) => {
  return (
    <div>
      {createHeader()}
      {createWorkflowItems(props)}
    </div>
  )
}

export default WorkflowList;
