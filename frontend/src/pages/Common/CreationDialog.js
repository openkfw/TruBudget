import React from "react";
import isEmpty from "lodash/isEmpty";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import strings from "../../localizeStrings";

import CreationDialogStepper from "./CreationDialogStepper";

const getDialogActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const { numberOfSteps, currentStep = 0, steps } = props;

  const isLastStep = currentStep === numberOfSteps - 1;
  const isFirstStep = currentStep === 0;
  const requiredInfoAdded = steps[currentStep].nextDisabled;
  const hideCancel = steps[currentStep].hideCancel;
  const submitButtonText = steps[currentStep].submitButtonText;

  const cancelButton = !hideCancel ? (
    <Button aria-label="cancel" data-test="cancel" color="secondary" onClick={() => handleCancel(props)}>
      {strings.common.cancel}
    </Button>
  ) : null;
  const backButton =
    numberOfSteps > 1 ? (
      <Button
        aria-label="back"
        data-test="back"
        color="primary"
        disabled={isFirstStep}
        onClick={() => handleBack(props)}
      >
        {strings.common.back}
      </Button>
    ) : null;
  const nextButton =
    numberOfSteps > 1 ? (
      <Button
        aria-label="next"
        data-test="next"
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
      data-test="submit"
      color="primary"
      disabled={isLastStep ? isLastStep && requiredInfoAdded : !isLastStep}
      onClick={() => handleSubmit(props)}
    >
      {!isEmpty(submitButtonText) ? submitButtonText : strings.common.submit}
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

const handleCancel = (props) => {
  props.onDialogCancel();
};

const handleBack = (props) => props.setCurrentStep(props.currentStep - 1);
const handleNext = (props) => props.setCurrentStep(props.currentStep + 1);

const CreationDialog = (props) => {
  const { dialogShown, title, handleSubmit } = props;
  return (
    <Dialog disableRestoreFocus className="paper-root" open={dialogShown} maxWidth="xl" data-test="creation-dialog">
      <DialogTitle> {title}</DialogTitle>
      <CreationDialogStepper {...props} />
      <DialogActions>{getDialogActions(props, handleCancel, handleBack, handleNext, handleSubmit)}</DialogActions>
    </Dialog>
  );
};

export default CreationDialog;
