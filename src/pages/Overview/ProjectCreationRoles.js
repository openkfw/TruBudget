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
      title: 'Select budget authority role',
      content: (
        <div>
          <p>The authority enabled to modify the budget line of the project</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectApprover}
            addSelection={addApproverRole}
            removeSelection={removeApproverRole} />
        </div>
      )
    },
    {
      title: 'Select implementation authority role',
      content: (
        <div>
          <p>The authorities enabled to create and modify subprojects, define and execute workflow activities</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectAssignee}
            addSelection={addAssignmentRole}
            removeSelection={removeAssignmentRole} />
        </div>
      )
    },
    {
      title: 'Select disbursement authority role',
      content: (
        <div>
          <p>The authorities enabled to approve financial transactions</p>
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

