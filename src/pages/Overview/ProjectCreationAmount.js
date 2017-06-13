import React from 'react';

import TextField from 'material-ui/TextField';
import ProjectCreationCurrency from './ProjectCreationCurrency';

const ProjectCreationAmount = (props) => {

  const {
    storeProjectAmount,
    storeProjectCurrency,
    projectCurrency,
    projectAmount,
    type,
    parentCurrency
  } = props;

  let hintText = "Budget for the project";
  let floatingLabelText = "Project budget amount";
  if (type === 'subProject') {
    floatingLabelText = "Sub-project budget amount";
    hintText = "Budget amount for the project";
  } else if (type === 'workflow') {
    floatingLabelText = "Workflow budget amount";
    hintText = "Budget amount for the workflow";
  }
  return (
    <div style={{
      width: '90%',
      left: '20%',
      position: 'relative',
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
