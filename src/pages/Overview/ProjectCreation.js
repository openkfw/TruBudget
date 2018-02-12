import React from 'react';
import _ from 'lodash';

import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import ProjectCreationRoles from '../Overview/ProjectCreationRoles';
import ProjectCreationContent from './ProjectCreationContent';


const extractRole = (roles) => _.map(roles, role => role.role);

const handleSubmit = (props) => {
  const { createProject, onDialogCancel, showSnackBar, setCurrentStep, storeSnackBarMessage,
    projectName, projectAmount, projectComment, projectCurrency, projectThumbnail, projectApprover, projectAssignee, projectBank, location } = props;
  const approvers = extractRole(projectApprover);
  const assignees = extractRole(projectAssignee);
  const banks = extractRole(projectBank);
  createProject(projectName, projectAmount, projectComment, projectCurrency, location.pathname.split('/')[2],
    approvers, assignees, banks, projectThumbnail);
  onDialogCancel();
  storeSnackBarMessage('Added ' + projectName)
  showSnackBar();
  setCurrentStep(0);
}

const ProjectCreation = (props) => {

  const steps = [
    {
      title: strings.project.project_details,
      content: < ProjectCreationContent {...props} />,
      nextDisabled: (_.isEmpty(props.projectName) || _.isEmpty(props.projectComment) || !_.isNumber(props.projectAmount))
    },
    {
      title: strings.project.project_roles,
      content: < ProjectCreationRoles {...props} />,
      nextDisabled: (_.isEmpty(props.projectAssignee) || _.isEmpty(props.projectApprover) || _.isEmpty(props.projectBank))
    }
  ]
  return (

    < CreationDialog title={strings.project.add_new_project} onDialogCancel={props.onProjectDialogCancel} steps={steps} numberOfSteps={steps.length} handleSubmit={handleSubmit} {...props} />
  )
}

export default ProjectCreation;
