import React from 'react';

import TextField from 'material-ui/TextField';
import ProjectCreationCurrency from './ProjectCreationCurrency';
import strings from '../../localizeStrings'


const ProjectCreationAmount = (props) => {

  const {
    storeProjectAmount,
    storeProjectCurrency,
    projectCurrency,
    projectAmount,
    type,
    parentCurrency
  } = props;

  let hintText = strings.project.project_budget_amount;
  let floatingLabelText = strings.project.project_budget_amount_description;
  if (type === 'subProject') {
    floatingLabelText = strings.project.subproject_budget_amount;
    hintText = strings.project.subproject_budget_amount_description;
  } else if (type === 'workflow') {
    floatingLabelText = strings.workflow.workflow_budget_amount;
    hintText = strings.workflow.workflow_budget_amount_description;
  }
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: '30px'
    }}>
      <TextField
        floatingLabelText={floatingLabelText}
        hintText={hintText}
        type='number'
        value={projectAmount}
        onChange={(event) => storeProjectAmount(event.target.value)}
      />
      <ProjectCreationCurrency parentCurrency={parentCurrency} storeProjectCurrency={storeProjectCurrency} projectCurrency={projectCurrency} />
    </div>
  );
}

export default ProjectCreationAmount;
