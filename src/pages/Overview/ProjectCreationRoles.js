import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

import RoleSelection from './RoleSelection';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-start',
  }
}

const getSteps = (dataSource) => [
  {
    title: 'Select approver roles',
    content: (
      <div>
        <p>Approver approves the fullfilement of workflows. The are also able to increase the budget line of the project.</p>
        <AutoComplete dataSource={dataSource} />
      </div>
    )
  },
  {
    title: 'Select assignee roles',
    content: (
      <div>
        <p>The assignee is able to create and update sub-projects and workflows.</p>
        <AutoComplete dataSource={dataSource} />
      </div>
    )
  },
  {
    title: 'Select approver Roles',
    content: (
      <div>
        <p>The financial processor is approving financial transaction for workflows.</p>
        <AutoComplete dataSource={dataSource} />
      </div>
    )
  }
]

const ProjectCreationRoles = (props) => {
  const steps = getSteps(props.roles);
  return (
    <div style={styles.container}>
      <RoleSelection
        steps={steps}
      />
    </div>
  );
}

export default ProjectCreationRoles;

