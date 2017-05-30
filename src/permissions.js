export const getPermissions = (user, details) => {
  const { assignee, approver, bank } = details;
  const roleName = user.role.roleName;

  assignee.indexOf(roleName) > -1;

  return {
    isApprover: approver.indexOf(roleName) > -1,
    isAssignee: assignee.indexOf(roleName) > -1,
    isBank: bank.indexOf(roleName) > -1,
  }
}
