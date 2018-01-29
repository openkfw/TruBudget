import React from 'react';

import RoleSelection from './RoleSelection';
import RoleSelectionContent from './RoleSelectionContent';
import strings from '../../localizeStrings'

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
      title: strings.project.project_budget_authority_role,
      content: (
        <div>
          <p>{strings.project.project_budget_authority_role_description}</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectApprover}
            addSelection={addApproverRole}
            removeSelection={removeApproverRole} />
        </div>
      )
    },
    {
      title: strings.project.project_implementing_authority_role,
      content: (
        <div>
          <p>{strings.project.project_implementing_authority_role_description}</p>
          <RoleSelectionContent
            dataSource={roles}
            selections={projectAssignee}
            addSelection={addAssignmentRole}
            removeSelection={removeAssignmentRole} />
        </div>
      )
    },
    {
      title: strings.project.project_disbursement_authority_role,
      content: (
        <div>
          <p>{strings.project.project_disbursement_authority_role_description}</p>
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
  console.log(props.roles)
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

