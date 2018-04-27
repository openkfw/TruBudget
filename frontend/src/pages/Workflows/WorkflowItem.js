import React from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card } from 'material-ui/Card';
import InfoIcon from 'material-ui/svg-icons/action/info-outline';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import OpenIcon from 'material-ui/svg-icons/content/remove';
import InprogressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import EditIcon from 'material-ui/svg-icons/image/edit';
import ReviewIcon from 'material-ui/svg-icons/action/find-in-page';
import PermissionIcon from 'material-ui/svg-icons/action/lock-open';
import IconButton from 'material-ui/IconButton';
import { toAmountString, statusMapping, amountTypes } from '../../helper.js';
import { ACMECorpLightgrey, ACMECorpSuperLightgreen, ACMECorpLightblue } from '../../colors.js';
import strings from '../../localizeStrings';
import { canViewWorkflowItemPermissions, canUpdateWorkflowItem, canCloseWorkflowItem } from '../../permissions.js';


const styles = {
  in_progress: {
    backgroundColor: ACMECorpLightgrey
  },
  in_review: {
    backgroundColor: ACMECorpLightblue
  },
  closed: {
    backgroundColor: ACMECorpSuperLightgreen
  },
  text: {
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
  actions: {
    display: 'flex',
    justifyContent: 'center'
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
  },
  amountChip: {
    marginLeft: '16px'
  },
  statusChip: {
    marginLeft: '4px'
  },
  chipLabel: {
    fontSize: 10
  },
  chipDiv: {
    display: 'flex',
    alignItems: 'center'
  },
}


const createLine = (isFirst, selectable) => {
  const lineStyle = (isFirst && selectable) ? styles.firstLine : {
    ...styles.line,
    opacity: selectable ? 1 : 0.2
  };

  return (
    <div style={lineStyle}></div>
  )
};

const StepDot = ({ status, selectable }) => {
  let Icon;
  switch (status) {
    case 'open':
      Icon = OpenIcon;
      break;
    case 'closed':
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

const editWorkflow = ({ id, displayName, amount, amountType, currency, description, status, documents }, props) => {
  props.storeWorkflowName(displayName)
  props.storeWorkflowAmount(amount)
  props.storeWorkflowAmountType(amountType)
  props.storeWorkflowCurrency(currency)
  props.storeWorkflowComment(description)
  props.storeWorkflowStatus(status)
  props.storeWorkflowTxid(id)
  props.openWorkflowDialog(true)
  props.prefillDocuments(documents);
}

const getNextStatus = (status, approvalRequired) => {
  switch (status) {
    case 'open':
      return 'in_progress';
    case 'in_progress':
      if (!approvalRequired) {
        return 'done';
      }
      return 'in_review'
    case 'in_review':
      return 'done';
    default:
      return 'open';
  }
}

const createWorkflowItem = ({ workflowName, amount, currency, comment, status, type, amountType, approvalRequired }, nextStatus) => {
  return {
    name: workflowName,
    previousStatus: status,
    status: nextStatus,
    amount,
    currency,
    comment,
    type,
    amountType,
    approvalRequired
  }
}


const changeProgress = ({ key, txid, data }, props) => {
  const { status, approvalRequired } = data;
  const nextStatus = getNextStatus(status, approvalRequired)
  const workflowItem = createWorkflowItem(data, nextStatus);
  props.editWorkflowItem(props.location.pathname.split('/')[3], key, workflowItem, data.documents, workflowItem.previousStatus)
}

const getInfoButton = ({ workflowSortEnabled, openWorkflowDetails }, workflow) => {
  if (!workflowSortEnabled) {
    return (
      <IconButton style={styles.infoButton} onTouchTap={() => openWorkflowDetails(workflow.txid)}>
        <InfoIcon />
      </IconButton>
    )
  }
}
const isWorkflowSelectable = (currentWorkflowSelectable, workflowSortEnabled, status) => {
  const workflowSortable = (status === 'open')
  return workflowSortEnabled ? workflowSortable : currentWorkflowSelectable;
}

const getAmountField = (amount, type) => {
  const noBudgetAllocated = type === 'N/A'
  const amountToShow = noBudgetAllocated ? amountTypes(type) : amount;

  return (
    <div style={styles.chipDiv}>
      <div>
        {amountToShow}
      </div>
      {noBudgetAllocated ? null : <Chip style={styles.amountChip}>
        {amountTypes(type)}
      </Chip>}
    </div>
  )
}

const renderActionButtons = (canEditWorkflow, edit, canListWorkflowPermissions, showPerm, canCloseWorkflow, close, selectable) => {


  return (
    <TableRowColumn colSpan={3}>
      <div style={styles.actions}>
        <IconButton disabled={!canEditWorkflow} onTouchTap={edit}>
          <EditIcon />
        </IconButton>
        <IconButton disabled={!canListWorkflowPermissions} onTouchTap={showPerm}>
          <PermissionIcon />
        </IconButton>
        <IconButton disabled={!canCloseWorkflow} onTouchTap={close}>
          <DoneIcon />
        </IconButton>
      </div>
    </TableRowColumn>
  )
}

const WorkflowItem = SortableElement(({ workflow, mapIndex, index, permissions, currentWorkflowSelectable, workflowSortEnabled, ...props }) => {
  const { id, status, type, displayName, amountType, allowedIntents } = workflow;
  const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
  const amount = toAmountString(workflow.amount, workflow.currency);
  const tableStyle = workflowSelectable ? styles[status] : {
    ...styles[status],
    opacity: 0.3
  };

  const showEdit = canUpdateWorkflowItem(allowedIntents) && status !== 'closed'
  const showClose = canCloseWorkflowItem(allowedIntents) && status !== 'closed'
  const infoButton = getInfoButton(props, workflow)
  return (
    <Card key={mapIndex} style={{ marginLeft: '50px', marginRight: '10px', marginTop: '15px', marginBottom: '15px', position: 'relative', }}>
      {createLine(mapIndex === 0, workflowSelectable)}
      <StepDot status={status} selectable={workflowSelectable} />
      <Table>
        <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>
          <TableRow style={tableStyle} selectable={false} disabled={workflowSelectable}>
            <TableRowColumn colSpan={1}>
              {infoButton}
            </TableRowColumn>
            <TableRowColumn style={styles.text} colSpan={3}>
              {displayName}
            </TableRowColumn>
            <TableRowColumn style={styles.listText} colSpan={3}>
              {getAmountField(amount, amountType)}
            </TableRowColumn>
            <TableRowColumn style={styles.listText} colSpan={2}>
              <div style={styles.chipDiv}>
                {statusMapping(status)}
              </div>
            </TableRowColumn>
            {renderActionButtons(
              showEdit, editWorkflow.bind(this, workflow, props),
              canViewWorkflowItemPermissions(allowedIntents), () => props.showWorkflowItemPermissions(id),
              showClose, () => props.closeWorkflowItem(id), currentWorkflowSelectable)}
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  )
});



export default WorkflowItem;
