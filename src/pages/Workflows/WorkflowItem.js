import React from 'react';
import { SortableElement } from 'react-sortable-hoc';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import { Card } from 'material-ui/Card';
import { toAmountString, statusMapping } from '../../helper.js';
import InfoIcon from 'material-ui/svg-icons/action/info-outline';
import Paper from 'material-ui/Paper';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InprogressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import EditIcon from 'material-ui/svg-icons/image/edit';
import ReviewIcon from 'material-ui/svg-icons/action/find-in-page';
import IconButton from 'material-ui/IconButton';
import { ACMECorpLightgrey, ACMECorpSuperLightgreen } from '../../colors.js';

const styles = {
  in_progress: {
    backgroundColor: ACMECorpLightgrey
  },
  done: {
    backgroundColor: ACMECorpSuperLightgreen
  },
  listText: {
    fontSize: '14px'
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
  },
  infoButton: {
    minWidth: '40px',
    marginLeft: '5px',
    marginRight: '5px',
  }
}


const createLine = (isFirst, selectable) => {
  const lineStyle = (isFirst && selectable) ? styles.firstLine : { ...styles.line, opacity: selectable ? 1 : 0.2 };

  return (
    <div style={lineStyle}></div>
  )
};

const getEditButtons = (status = 'open', role, permissions, editCB, progressCB) => {
  const statusMapping = {
    open: {
      tooltip: 'Start Workflow',
      icon: InprogressIcon
    },
    'in_progress': {
      tooltip: 'Finish Workflow',
      icon: ReviewIcon
    },
    'in_review': {
      tooltip: 'Review Workflow',
      icon: DoneIcon

    }
  }
  const Icon = statusMapping[status].icon;

  const userAllowedToEdit = (status === 'open' || status === 'in_progress') && permissions.isAssignee;
  const userAllowedToProgress = (status === 'open' && permissions.isAssignee) || (status === 'in_progress' && permissions.isApprover) || (status === 'in_review' && permissions.isBank);
  return (
    <TableRowColumn colSpan={2}>
      <IconButton
        disabled={!role.write || !userAllowedToEdit}
        onTouchTap={() => editCB()}>
        <EditIcon />
      </IconButton>
      <IconButton
        disabled={!role.write || !userAllowedToProgress}
        onTouchTap={() => progressCB()}>
        <Icon />
      </IconButton>
    </TableRowColumn>
  )
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
    case 'in_review':
      Icon = ReviewIcon;
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



const editWorkflow = ({ key, txid, data }, props) => {
  const { workflowName, amount, currency, purpose, addData, assignee, status } = data;
  props.storeWorkflowName(workflowName)
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

const getNextStatus = (status) => {
  switch (status) {
    case 'open':
      return 'in_progress';
    case 'in_progress':
      return 'in_review'
    case 'in_review':
      return 'done';
    default:
      return 'open';
  }
}

const changeProgress = ({ key, txid, data }, props) => {
  const { workflowName, amount, currency, purpose, addData, assignee, status } = data;
  const nextStatus = getNextStatus(status)
  props.editWorkflowItem(props.location.pathname.split('/')[3], key, workflowName, amount, currency, purpose, addData, nextStatus, assignee, txid, data)
}

const getInfoButton = ({ workflowSortEnabled, openWorkflowDetails }, workflow) => {
  if (!workflowSortEnabled) {
    return (
      <IconButton
        style={styles.infoButton}
        onTouchTap={() => openWorkflowDetails(workflow.txid)}>
        <InfoIcon />
      </IconButton>
    )
  }
}
const isWorkflowSelectable = (currentWorkflowSelectable, workflowSortEnabled, status) => {
  const workflowSortable = (status === 'open')
  return workflowSortEnabled ? workflowSortable : currentWorkflowSelectable;
}

const WorkflowItem = SortableElement(({ workflow, mapIndex, index, permissions, currentWorkflowSelectable, workflowSortEnabled, ...props }) => {

  const status = workflow.data.status;
  const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
  const amount = toAmountString(workflow.data.amount, workflow.data.currency);
  const workflowName = workflow.data.workflowName;
  const tableStyle = workflowSelectable ? styles[status] : { ...styles[status], opacity: 0.3 };
  const infoButton = getInfoButton(props, workflow)
  return (
    <Card key={mapIndex} style={{
      marginLeft: '50px',
      marginRight: '10px',
      marginTop: '15px',
      marginBottom: '15px',
      position: 'relative',
    }}>

      {createLine(mapIndex === 0, workflowSelectable)}
      <StepDot status={status} selectable={workflowSelectable} />

      <Table>
        <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>
          <TableRow style={tableStyle} selectable={false} disabled={workflowSelectable}>
            <TableRowColumn colSpan={1}>
              {infoButton}
            </TableRowColumn>
            <TableRowColumn style={styles.listText} colSpan={4}>{workflowName}</TableRowColumn>
            <TableRowColumn style={styles.listText} colSpan={2}>{amount}</TableRowColumn>
            <TableRowColumn style={styles.listText} colSpan={2}>{statusMapping[status]}</TableRowColumn>
            {workflowSelectable && status !== 'done' && !workflowSortEnabled ? getEditButtons(status, props.loggedInUser.role, permissions, () => editWorkflow(workflow, props), () => changeProgress(workflow, props)) : <TableRowColumn colSpan={2} />}
          </TableRow>


        </TableBody>
      </Table>
    </Card>
  )
});

export default WorkflowItem;
