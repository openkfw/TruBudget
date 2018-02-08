import React from 'react';
import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import SubProjectCreationContent from './SubProjectCreationContent';

const handleSubmit = (props) => {
  const { createSubProject, hideDialog, showSnackBar, setCurrentStep, storeSnackBarMessage,
    subProjectName, subProjectAmount, subProjectComment, subProjectCurrency, location } = props;
  createSubProject(subProjectName, subProjectAmount, subProjectComment, subProjectCurrency, location.pathname.split('/')[2]);
  hideDialog();
  storeSnackBarMessage('Added ' + subProjectName)
  showSnackBar();
  setCurrentStep(0);
}



const SubProjectCreation = (props) => {

  const steps = [
    {
      title: strings.project.project_details,
      content: < SubProjectCreationContent {...props} />
    }
  ]
  return (
    <CreationDialog
      title={strings.project.subproject_add}
      creationDialogShown={props.subprojectsDialogVisible}
      hideDialog={props.onSubprojectDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props} />
  )
}

export default SubProjectCreation;
