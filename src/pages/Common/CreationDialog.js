import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import strings from '../../localizeStrings'
import CreationDialogStepper from './CreationDialogStepper';

const getDialogActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const isLastStep = props.currentStep === props.numberOfSteps - 1;
  const isFirstStep = props.currentStep === 0;
  const requiredInfoAdded = props.steps[props.currentStep].nextDisabled;
  const editMode = props.editMode;


  const cancelButton = <FlatButton aria-label='cancel' label={strings.common.cancel} secondary={true} onTouchTap={() => handleCancel(props)} />
  const backButton = <FlatButton aria-label='back' label={strings.common.back} primary={true} disabled={isFirstStep} onTouchTap={() => handleBack(props)} />
  const nextButton = <FlatButton aria-label='next' label={strings.common.next} primary={true} disabled={isLastStep ? isLastStep : requiredInfoAdded} onTouchTap={() => handleNext(props)} />
  const submitButton = <FlatButton aria-label='submit' label={strings.common.submit} primary={true} disabled={isLastStep ? requiredInfoAdded : !editMode} onTouchTap={() => handleSubmit(props)} />

  const leftActions = <div>{cancelButton}{backButton}</div>
  const rightActions = <div>{nextButton}{submitButton}</div>

  return [
    leftActions,
    rightActions
  ]
}

const handleCancel = (props) => {
  props.onDialogCancel();
}

const handleBack = (props) => props.setCurrentStep(props.currentStep - 1)
const handleNext = (props) => props.setCurrentStep(props.currentStep + 1)



const CreationDialog = (props) => {

  const { creationDialogShown, title, handleSubmit } = props;
  return (

    <Dialog
      open={creationDialogShown}
      title={title}
      modal={true}
      autoScrollBodyContent={true}
      bodyStyle={{
        minHeight: '200px'
      }}
      contentStyle={{
        width: '55%',
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
      <CreationDialogStepper {...props} />
    </Dialog>
  );
}

export default CreationDialog;
