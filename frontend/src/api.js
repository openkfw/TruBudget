import axios from "axios";

const devMode = process.env.NODE_ENV === "development";
const API_VERSION = "1.0";
const instance = axios.create();

// eslint-disable-next-line no-console
console.log(`API is running in ${devMode ? "development" : "production"} mode (Version ${API_VERSION})`);

class Api {
  constructor() {
    // Set API Version header for POST / PUT / DELETE
    // Move all parameters into data object
    instance.defaults.transformRequest = [
      (data, headers) => {
        if (typeof data === "object") {
          return {
            apiVersion: API_VERSION,
            data: {
              ...data
            }
          };
        } else {
          return data;
        }
      },
      ...instance.defaults.transformRequest
    ];
  }

  setAuthorizationHeader = token => {
    instance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
  };

  setBaseUrl = url => {
    if (!devMode) {
      instance.defaults.baseURL = `${url}/api`;
    } else {
      instance.defaults.baseURL = `/api`;
    }
  };

  login = (username, password) =>
    instance.post(`/user.authenticate`, {
      user: {
        id: username,
        password
      }
    });
  fetchVersions = () => instance.get(`/version`);
  createUser = (displayName, organization, username, password) =>
    instance.post(`/global.createUser`, {
      user: {
        displayName,
        organization,
        id: username,
        password
      }
    });
  grantAllUserPermissions = userId =>
    instance.post(`global.grantAllPermissions`, {
      identity: userId
    });
  grantGlobalPermission = (identity, intent) => instance.post(`global.grantPermission`, { identity, intent });

  revokeGlobalPermission = (identity, intent) => instance.post(`global.revokePermission`, { identity, intent });
  listGlobalPermissions = () => instance.get(`global.listPermissions`);

  listUser = () => instance.get(`/user.list`);

  changeUserPassword = (userId, newPassword) =>
    instance.post(`/user.changePassword`, {
      userId,
      newPassword
    });

  createGroup = (groupId, displayName, users) =>
    instance.post(`/global.createGroup`, {
      group: {
        displayName,
        id: groupId,
        users
      }
    });
  addUserToGroup = (groupId, userId) =>
    instance.post(`/group.addUser`, {
      groupId,
      userId
    });
  removeUserFromGroup = (groupId, userId) =>
    instance.post(`/group.removeUser`, {
      groupId,
      userId
    });
  listGroup = () => instance.get(`/group.list`);
  listNodes = () => instance.get(`/network.list`);
  listActiveNodes = () => instance.get(`/network.listActive`);
  approveNewOrganization = organization =>
    instance.post(`/network.approveNewOrganization`, {
      organization
    });
  approveNewNodeForOrganization = address =>
    instance.post(`/network.approveNewNodeForExistingOrganization`, {
      address
    });
  listProjects = () => instance.get(`/project.list`);
  listSubprojects = projectId => instance.get(`/subproject.list?projectId=${projectId}`);

  createProject = (displayName, description, thumbnail, projectedBudgets, tags) =>
    instance.post(`/global.createProject`, {
      project: {
        displayName,
        description,
        thumbnail,
        projectedBudgets,
        tags
      }
    });

  editProject = (projectId, changes) =>
    instance.post(`/project.update`, {
      projectId,
      ...changes
    });

  viewProjectDetails = projectId => instance.get(`/project.viewDetails?projectId=${projectId}`);
  viewProjectHistory = (projectId, offset, limit) =>
    instance.get(`/project.viewHistory.v2?projectId=${projectId}&offset=${offset}&limit=${limit}`);

  listProjectIntents = projectId => instance.get(`/project.intent.listPermissions?projectId=${projectId}`);

  grantProjectPermissions = (projectId, intent, identity) =>
    instance.post(`/project.intent.grantPermission`, {
      projectId,
      intent,
      identity
    });

  revokeProjectPermissions = (projectId, intent, identity) =>
    instance.post(`/project.intent.revokePermission`, {
      projectId,
      intent,
      identity
    });

  createSubProject = (projectId, name, description, currency, projectedBudgets) =>
    instance.post(`/project.createSubproject`, {
      projectId,
      subproject: {
        displayName: name,
        description,
        currency,
        projectedBudgets
      }
    });

  editSubProject = (projectId, subprojectId, changes) =>
    instance.post(`/subproject.update`, {
      projectId,
      subprojectId,
      ...changes
    });

  viewSubProjectDetails = (projectId, subprojectId) =>
    instance.get(`/subproject.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}`);

  viewSubProjectHistory = (projectId, subprojectId, offset, limit) =>
    instance.get(
      `/subproject.viewHistory.v2?projectId=${projectId}&subprojectId=${subprojectId}&offset=${offset}&limit=${limit}`
    );

  viewWorkflowitemHistory = (projectId, subprojectId, workflowitemId, offset, limit) =>
    instance.get(
      `/workflowitem.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&offset=${offset}&limit=${limit}`
    );

  updateProjectBudgetProjected = (projectId, organization, currencyCode, value) =>
    instance.post(`/project.budget.updateProjected`, {
      projectId,
      organization,
      currencyCode,
      value: value.toString()
    });

  deleteProjectBudgetProjected = (projectId, organization, currencyCode) =>
    instance.post(`/project.budget.deleteProjected`, {
      projectId,
      organization,
      currencyCode
    });

  updateSubprojectBudgetProjected = (projectId, subprojectId, organization, currencyCode, value) =>
    instance.post(`/subproject.budget.updateProjected`, {
      projectId,
      subprojectId,
      organization,
      currencyCode,
      value: value.toString()
    });

  deleteSubprojectBudgetProjected = (projectId, subprojectId, organization, currencyCode) =>
    instance.post(`/subproject.budget.deleteProjected`, {
      projectId,
      subprojectId,
      organization,
      currencyCode
    });

  createWorkflowItem = payload => {
    const { currency, amount, exchangeRate, ...minimalPayload } = payload;

    const payloadToSend =
      payload.amountType === "N/A"
        ? minimalPayload
        : {
            ...minimalPayload,
            currency,
            amount,
            exchangeRate: exchangeRate.toString()
          };

    return instance.post(`/subproject.createWorkflowitem`, {
      ...payloadToSend
    });
  };

  listSubProjectPermissions = (projectId, subprojectId) =>
    instance.get(`/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`);

  grantSubProjectPermissions = (projectId, subprojectId, intent, identity) =>
    instance.post(`/subproject.intent.grantPermission`, {
      projectId,
      subprojectId,
      intent,
      identity
    });

  revokeSubProjectPermissions = (projectId, subprojectId, intent, identity) =>
    instance.post(`/subproject.intent.revokePermission`, {
      projectId,
      subprojectId,
      intent,
      identity
    });

  editWorkflowItem = (projectId, subprojectId, workflowitemId, changes) => {
    const { currency, amount, exchangeRate, ...minimalChanges } = changes;

    const changesToSend =
      changes.amountType === "N/A"
        ? minimalChanges
        : {
            ...minimalChanges,
            currency,
            amount,
            exchangeRate: exchangeRate ? exchangeRate.toString() : undefined
          };

    return instance.post(`/workflowitem.update`, {
      projectId,
      subprojectId,
      workflowitemId,
      ...changesToSend
    });
  };

  reorderWorkflowitems = (projectId, subprojectId, ordering) =>
    instance.post(`/subproject.reorderWorkflowitems`, { projectId, subprojectId, ordering });

  validateDocument = (base64String, hash) => instance.post(`/workflowitem.validateDocument`, { base64String, hash });

  listWorkflowItemPermissions = (projectId, subprojectId, workflowitemId) =>
    instance.get(
      `/workflowitem.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`
    );

  grantWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, identity) =>
    instance.post(`/workflowitem.intent.grantPermission`, {
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      identity
    });

  revokeWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, identity) =>
    instance.post(`/workflowitem.intent.revokePermission`, {
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      identity
    });

  assignWorkflowItem = (projectId, subprojectId, workflowitemId, identity) =>
    instance.post(`/workflowitem.assign`, {
      projectId,
      subprojectId,
      workflowitemId,
      identity
    });

  assignSubproject = (projectId, subprojectId, identity) =>
    instance.post(`/subproject.assign`, {
      projectId,
      subprojectId,
      identity
    });

  assignProject = (projectId, identity) =>
    instance.post(`/project.assign`, {
      projectId,
      identity
    });

  closeProject = projectId =>
    instance.post(`/project.close`, {
      projectId
    });

  closeSubproject = (projectId, subprojectId) =>
    instance.post(`subproject.close`, {
      projectId,
      subprojectId
    });

  closeWorkflowItem = (projectId, subprojectId, workflowitemId) =>
    instance.post(`/workflowitem.close`, {
      projectId,
      subprojectId,
      workflowitemId
    });

  fetchNotifications = (offset, limit) => {
    return instance.get(`/notification.list?offset=${offset}&limit=${limit}`);
  };

  fetchNotificationCounts = () => {
    return instance.get(`/notification.count`);
  };

  markNotificationAsRead = notificationId =>
    instance.post(`/notification.markRead`, {
      notifications: [notificationId]
    });
  markMultipleNotificationsAsRead = notificationIds =>
    instance.post(`/notification.markRead`, { notifications: notificationIds });

  createBackup = () => instance.get(`/system.createBackup`, { responseType: "blob" });
  restoreFromBackup = (envPrefix, token, data) => {
    let apiPrefix = "/api";
    if (!devMode) {
      apiPrefix = `${envPrefix}${apiPrefix}`;
    }
    const binaryInstance = axios.create();
    binaryInstance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
    const response = binaryInstance.post(`${apiPrefix}/system.restoreBackup`, data, {
      headers: { "Content-Type": "application/gzip" }
    });
    return response;
  };
  export = () => {
    const path = devMode ? "http://localhost:8888/test" : "/export/xlsx/";
    return instance.get(path, { responseType: "blob" });
  };
  checkEmailService = () => {
    const path = devMode ? "http://localhost:8890/readiness" : "/email/readiness";
    return instance.get(path);
  };
  insertEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = devMode ? "http://localhost:8890/user.insert" : "/email/user.insert";
    return instance.post(path, data);
  };
  updateEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = devMode ? "http://localhost:8890/user.update" : "/email/user.update";
    return instance.post(path, data);
  };
  deleteEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = devMode ? "http://localhost:8890/user.delete" : "/email/user.delete";
    return instance.post(path, data);
  };
  getEmailAddress = id => {
    const path = devMode
      ? `http://localhost:8890/user.getEmailAddress?id=${id}`
      : `/email/user.getEmailAddress?id=${id}`;
    return instance.get(path);
  };
}

export default Api;
