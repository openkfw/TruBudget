import React from 'react';

import RoleSelection from './RoleSelection';
import RoleSelectionContent from './RoleSelectionContent';


const styles = {
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-start',
  }
}

const getSteps = ({ roles,
  projectApprover, addApproverRole, removeApproverRole,
  projectAssignee, addAssignmentRole, removeAssignmentRole,
  projectBank, addBankRole, removeBankRole
}) => [
    {
      title: 'Select approver roles',
      content: (
        <div>
          <p>Approver approves the fullfilement of workflows. The are also able to increase the budget line of the project.</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectApprover}
            addSelection={addApproverRole}
            removeSelection={removeApproverRole} />
        </div>
      )
    },
    {
      title: 'Select assignee roles',
      content: (
        <div>
          <p>The assignee is able to create and update sub-projects and workflows.</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectAssignee}
            addSelection={addAssignmentRole}
            removeSelection={removeAssignmentRole} />
        </div>
      )
    },
    {
      title: 'Select financial roles',
      content: (
        <div>
          <p>The financial processor is approving financial transaction for workflows.</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectBank}
            addSelection={addBankRole}
            removeSelection={removeBankRole} />
        </div>
      )
    }
  ]

const ProjectCreationRoles = (props) => {
  const steps = getSteps(props);
  return (
    <div style={styles.container}>
      <RoleSelection
        steps={steps}
      />
    </div>
  );
}

export default ProjectCreationRoles;

