import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import _ from 'lodash';
import strings from '../../localizeStrings'
import ProjectStepper from './ProjectStepper';

const getDialogActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const isLastStep = props.creationStep === props.numberOfSteps - 1;
  const isFirstStep = props.creationStep === 0;
  const editMode = props.editMode;

  const cancelButton = <FlatButton aria-label='cancel' label={strings.common.cancel} secondary={true} onTouchTap={() => handleCancel(props)} />
  const backButton = <FlatButton aria-label='back' label={strings.common.back} primary={true} disabled={isFirstStep} onTouchTap={() => handleBack(props)} />
  const nextButton = <FlatButton aria-label='next' label={strings.common.next} primary={true} disabled={isLastStep} onTouchTap={() => handleNext(props)} />
  const submitButton = <FlatButton aria-label='submit' label={strings.common.submit} primary={true} disabled={!isLastStep && !editMode} onTouchTap={() => handleSubmit(props)} />

  const leftActions = <div>{cancelButton}{backButton}</div>
  const rightActions = <div>{nextButton}{submitButton}</div>

  return [
    leftActions,
    rightActions
  ]
}

const handleCancel = (props) => {
  props.hideDialog();
  props.setProjectCreationStep(0);
}

const handleBack = (props) => props.setProjectCreationStep(props.creationStep - 1)
const handleNext = (props) => props.setProjectCreationStep(props.creationStep + 1)

const extractRole = (roles) => _.map(roles, role => role.role);

const handleSubmit = (props) => {
  const { createProject, type, hideDialog, showSnackBar, setProjectCreationStep, storeSnackBarMessage, projectName, projectAmount, projectComment, projectCurrency, projectThumbnail, projectApprover, projectAssignee, projectBank, location } = props;
  const approvers = type === 'subproject' ? projectApprover : extractRole(projectApprover);
  const assignees = type === 'subproject' ? projectAssignee : extractRole(projectAssignee);
  const banks = type === 'subproject' ? projectBank : extractRole(projectBank);
  createProject(projectName, projectAmount, projectComment, projectCurrency, location.pathname.split('/')[2],
    approvers, assignees, banks, projectThumbnail);
  hideDialog();
  storeSnackBarMessage('Added ' + projectName)
  showSnackBar();
  setProjectCreationStep(0);
}



const ProjectDialog = (props) => {
  const { creationDialogShown, title } = props;
  return (

    <Dialog
      open={creationDialogShown}
      title={title}
      modal={true}
      bodyStyle={{
        minHeight: '400px'
      }}
      contentStyle={{
        width: '50%',
        maxWidth: 'none',
      }}
      actionsContainerStyle={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
      actions={getDialogActions(props, handleCancel, handleBack, handleNext, handleSubmit)}
    >
      <ProjectStepper {...props} />
    </Dialog>
  );
}


export default ProjectDialog;
