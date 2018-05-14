import React from "react";
import Dialog, { DialogTitle, DialogActions } from "material-ui/Dialog";
import Button from "material-ui/Button";
import strings from "../../localizeStrings";
import CreationDialogStepper from "./CreationDialogStepper";

const getDialogActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const { numberOfSteps, currentStep = 0, steps, editMode } = props;

  const isLastStep = currentStep === numberOfSteps - 1;
  const isFirstStep = currentStep === 0;
  const requiredInfoAdded = steps[currentStep].nextDisabled;

  const cancelButton = (
    <Button aria-label="cancel" color="secondary" onClick={() => handleCancel(props)}>
      {strings.common.cancel}
    </Button>
  );
  const backButton =
    numberOfSteps > 1 ? (
      <Button aria-label="back" color="primary" disabled={isFirstStep} onClick={() => handleBack(props)}>
        {strings.common.back}
      </Button>
    ) : null;
  const nextButton =
    numberOfSteps > 1 ? (
      <Button
        aria-label="next"
        primary={true}
        color="primary"
        disabled={isLastStep ? isLastStep : requiredInfoAdded}
        onClick={() => handleNext(props)}
      >
        {strings.common.next}
      </Button>
    ) : null;
  const submitButton = (
    <Button
      aria-label="submit"
      color="primary"
      disabled={isLastStep ? requiredInfoAdded : !editMode}
      onClick={() => handleSubmit(props)}
    >
      {strings.common.submit}
    </Button>
  );

  const leftActions = (
    <div key="leftactions">
      {cancelButton}
      {backButton}
    </div>
  );
  const rightActions = (
    <div key="rightactions">
      {nextButton}
      {submitButton}
    </div>
  );

  return [leftActions, rightActions];
};

const handleCancel = props => {
  props.onDialogCancel();
};

const handleBack = props => props.setCurrentStep(props.currentStep - 1);
const handleNext = props => props.setCurrentStep(props.currentStep + 1);

const CreationDialog = props => {
  const { creationDialogShown, title, handleSubmit } = props;
  return (
    <Dialog open={creationDialogShown}>
      <DialogTitle> {title}</DialogTitle>
      <CreationDialogStepper {...props} />
      <DialogActions>{getDialogActions(props, handleCancel, handleBack, handleNext, handleSubmit)}</DialogActions>
    </Dialog>
  );
};

export default CreationDialog;
