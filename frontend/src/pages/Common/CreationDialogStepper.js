import React from "react";

import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Divider from "@mui/material/Divider";

const getStepContent = ({ currentStep = 0, steps, ...props }) => {
  return steps[currentStep].content;
};

const styles = {
  contentStyle: { margin: "0 16px", minWidth: "500px" },
  multiStep: { width: "90%" }
};

const getSteps = (steps, editable, setCurrentStep) => {
  return steps
    .slice(0, steps.length)
    .map((step, index) => (
      <Step key={"stepper" + index}>
        {editable ? (
          <StepButton onClick={() => setCurrentStep(index)}>{step.title}</StepButton>
        ) : (
          <StepLabel>{step.title}</StepLabel>
        )}
      </Step>
    ));
};

const CreationDialogStepper = props => {
  const { steps, currentStep = 0, editable = false, setCurrentStep, numberOfSteps } = props;
  return (
    <div>
      {numberOfSteps > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
          <Stepper style={styles.multiStep} nonLinear={editable} activeStep={currentStep}>
            {getSteps(steps, editable, setCurrentStep)}
          </Stepper>
          <Divider />
        </div>
      ) : null}
      <div style={styles.contentStyle}>
        <div>{getStepContent(props)}</div>
      </div>
    </div>
  );
};
export default CreationDialogStepper;
