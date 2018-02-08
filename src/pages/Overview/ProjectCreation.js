import React from 'react';
import _ from 'lodash';

import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import ProjectCreationRoles from '../Overview/ProjectCreationRoles';
import ProjectCreationContent from './ProjectCreationContent';


const extractRole = (roles) => _.map(roles, role => role.role);

const handleSubmit = (props) => {
  const { createProject, type, hideDialog, showSnackBar, setCurrentStep, storeSnackBarMessage,
    projectName, projectAmount, projectComment, projectCurrency, projectThumbnail, projectApprover, projectAssignee, projectBank, location } = props;
  const approvers = extractRole(projectApprover);
  const assignees = extractRole(projectAssignee);
  const banks = extractRole(projectBank);
  createProject(projectName, projectAmount, projectComment, projectCurrency, location.pathname.split('/')[2],
    approvers, assignees, banks, projectThumbnail);
  hideDialog();
  storeSnackBarMessage('Added ' + projectName)
  showSnackBar();
  setCurrentStep(0);
}

const ProjectCreation = (props) => {

  const steps = [
    {
      title: strings.project.project_details,
      content: < ProjectCreationContent { ...props } />
    },
    {
      title: strings.project.project_roles,
      content: < ProjectCreationRoles { ...props } />
    }
  ]
  return (
    <CreationDialog title={strings.project.add_new_project} hideDialog={props.hideProjectDialog} steps={steps} numberOfSteps={steps.length} handleSubmit={handleSubmit} {...props} />
  )
}

export default ProjectCreation;
