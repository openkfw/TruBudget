import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import ProjectCreationStepper from './ProjectCreationStepper';

const ProjectCreationDialog = (props) => {
  const { creationDialogShown, title } = props;

  return (
    <Dialog
      title={title}
      modal={true}
      bodyStyle={{
        minHeight: '200px'
      }}
      actionsContainerStyle={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
      open={creationDialogShown}
      actions={getDialogActions(props, handleCancel, handleBack, handleNext, handleSubmit)}
    >
      <ProjectCreationStepper {...props} />
    </Dialog>
  );
}

const getDialogActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const isLastStep = props.creationStep === 2;
  const isFirstStep = props.creationStep === 0;
  const editMode = props.editMode;

  const cancelButton = <FlatButton label="Cancel" secondary={true} onTouchTap={() => handleCancel(props)} />
  const backButton = <FlatButton label="Back" primary={true} disabled={isFirstStep} onTouchTap={() => handleBack(props)} />
  const nextButton = <FlatButton label="Next" primary={true} disabled={isLastStep} onTouchTap={() => handleNext(props)} />
  const submitButton = <FlatButton label="Submit" primary={true} disabled={!isLastStep && !editMode} onTouchTap={() => handleSubmit(props)} />

  const leftActions = <div>{cancelButton}{backButton}</div>
  const rightActions = <div>{nextButton}{submitButton}</div>

  return [
    leftActions,
    rightActions
  ]
}

const handleCancel = (props) => {
  props.hideWorkflowDialog();
  props.setProjectCreationStep(0);
}

const handleBack = (props) => props.setProjectCreationStep(props.creationStep - 1)
const handleNext = (props) => props.setProjectCreationStep(props.creationStep + 1)

const handleSubmit = (props) => {
  props.createProject(props.projectName, props.projectAmount, props.projectPurpose, props.projectCurrency, props.location.pathname.split('/')[2]);
  props.hideWorkflowDialog();
  props.storeSnackBarMessage('Added ' + props.projectName)
  props.showSnackBar();
  props.setProjectCreationStep(0);
}

export default ProjectCreationDialog;
