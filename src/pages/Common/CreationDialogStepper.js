import React from 'react';
import { Step, Stepper, StepLabel, StepButton } from 'material-ui/Stepper';



const getStepContent = ({ currentStep, steps, ...props }) => {

  return steps[currentStep].content
}

const styles = {
  contentStyle: { margin: '0 16px' }
}


const getSteps = (steps, editable, setCurrentStep) => {
  return steps.slice(0, steps.length).map((step, index) => (
    <Step key={'stepper' + index}>
      {editable ? <StepButton onClick={() => setCurrentStep(index)}>{step.title}</StepButton> : <StepLabel>{step.title}</StepLabel>}
    </Step >)
  )
}

const CreationDialogStepper = (props) => {

  const { steps, currentStep, editable = false, setCurrentStep } = props
  return (
    <div>
      <Stepper linear={!editable} activeStep={currentStep}>
        {getSteps(steps, editable, setCurrentStep)}
      </Stepper>
      <div style={styles.contentStyle}>
        <div>{getStepContent(props)}</div>
      </div>
    </div>
  )
}
export default CreationDialogStepper;
