import axios from "axios";

const devMode = process.env.NODE_ENV === "development";
const API_VERSION = "1.0";

console.log(`API is running in ${devMode ? "development" : "production"} mode (Version ${API_VERSION})`);

class Api {
  constructor() {
    // Set API Version header for POST / PUT / DELETE
    // Move all parameters into data object
    axios.defaults.transformRequest = [
      (data, headers) => {
        if (typeof data === "object") {
          return {
            apiVersion: API_VERSION,
            data: { ...data
            }
          };
        } else {
          return data;
        }
      },
      ...axios.defaults.transformRequest
    ];
  }

  setAuthorizationHeader = token => {
    axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
  };

  setBaseUrl = url => {
    if (!devMode) {
      axios.defaults.baseURL = `${url}/api`;
    } else {
      axios.defaults.baseURL = `/api`;
    }
  };

  login = (username, password) => axios.post(`/user.authenticate`, {
    user: {
      id: username,
      password
    }
  });
  createUser = (displayName, organization, username, password) =>
    axios.post(`/global.createUser`, {
      user: {
        displayName,
        organization,
        id: username,
        password
      }
    });
  grantAllUserPermissions = userId => axios.post(`user.intent.grantAllPermissions`, {
    identity: userId
  });
  listUser = () => axios.get(`/user.list`);

  createGroup = (groupId, displayName, users) =>
    axios.post(`/global.createGroup`, {
      group: {
        displayName,
        id: groupId,
        users
      }
    });
  addUserToGroup = (groupId, userId) => axios.post(`/group.addUser`, {
    groupId,
    userId
  });
  removeUserFromGroup = (groupId, userId) => axios.post(`/group.removeUser`, {
    groupId,
    userId
  });
  listGroup = () => axios.get(`/group.list`);
  listNodes = () => axios.get(`/network.list`);
  listActiveNodes = () => axios.get(`/network.listActive`);
  approveNewOrganization = organization => axios.post(`/network.approveNewOrganization`, {
    organization
  });
  approveNewNodeForOrganization = address => axios.post(`/network.approveNewNodeForExistingOrganization`, {
    address
  });
  listProjects = () => axios.get(`/project.list`);

  createProject = (displayName, amount, description, currency, thumbnail) =>
    axios.post(`/global.createProject`, {
      project: {
        displayName,
        amount: `${amount}`,
        description,
        currency,
        thumbnail
      }
    });

  editProject = (projectId, changes) =>
    axios.post(`/project.update`, {
      projectId,
      ...changes
    });

  viewProjectDetails = projectId => axios.get(`/project.viewDetails?projectId=${projectId}`);
  viewProjectHistory = projectId => axios.get(`/project.viewHistory?projectId=${projectId}`);

  listProjectIntents = projectId => axios.get(`/project.intent.listPermissions?projectId=${projectId}`);

  grantProjectPermissions = (projectId, intent, identity) =>
    axios.post(`/project.intent.grantPermission`, {
      projectId,
      intent,
      identity
    });

  revokeProjectPermissions = (projectId, intent, identity) =>
    axios.post(`/project.intent.revokePermission`, {
      projectId,
      intent,
      identity
    });

  createSubProject = (projectId, name, amount, description, currency) =>
    axios.post(`/project.createSubproject`, {
      projectId,
      subproject: {
        displayName: name,
        amount,
        description,
        currency
      }
    });

  editSubProject = (projectId, subprojectId, changes) =>
    axios.post(`/subproject.update`, {
      projectId,
      subprojectId,
      ...changes
    });

  viewSubProjectDetails = (projectId, subprojectId) =>
    axios.get(`/subproject.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}`);

  viewSubProjectHistory = (projectId, subprojectId) =>
    axios.get(`/subproject.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}`);

  createWorkflowItem = payload =>
    axios.post(`/subproject.createWorkflowitem`, {
      ...payload,
      currency: payload.amountType === "N/A" ? null : payload.currency,
      amount: payload.amountType === "N/A" ? null : payload.amount
    });

  listSubProjectPermissions = (projectId, subprojectId) =>
    axios.get(`/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`);

  grantSubProjectPermissions = (projectId, subprojectId, intent, identity) =>
    axios.post(`/subproject.intent.grantPermission`, {
      projectId,
      subprojectId,
      intent,
      identity
    });

  revokeSubProjectPermissions = (projectId, subprojectId, intent, identity) =>
    axios.post(`/subproject.intent.revokePermission`, {
      projectId,
      subprojectId,
      intent,
      identity
    });

  editWorkflowItem = (projectId, subprojectId, workflowitemId, changes) =>
    axios.post(`/workflowitem.update`, {
      projectId,
      subprojectId,
      workflowitemId,
      ...changes
    });

  listWorkflowItemPermissions = (projectId, workflowitemId) =>
    axios.get(`/workflowitem.intent.listPermissions?projectId=${projectId}&workflowitemId=${workflowitemId}`);

  grantWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, identity) =>
    axios.post(`/workflowitem.intent.grantPermission`, {
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      identity
    });

  revokeWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, identity) =>
    axios.post(`/workflowitem.intent.revokePermission`, {
      projectId,
      subprojectId,
      workflowitemId,
      intent,
      identity
    });

  assignWorkflowItem = (projectId, subprojectId, workflowitemId, identity) =>
    axios.post(`/workflowitem.assign`, {
      projectId,
      subprojectId,
      workflowitemId,
      identity
    });

  assignSubproject = (projectId, subprojectId, identity) =>
    axios.post(`/subproject.assign`, {
      projectId,
      subprojectId,
      identity
    });

  assignProject = (projectId, identity) => axios.post(`/project.assign`, {
    projectId,
    identity
  });

  closeProject = projectId => axios.post(`/project.close`, {
    projectId
  });

  closeSubproject = (projectId, subprojectId) => axios.post(`subproject.close`, {
    projectId,
    subprojectId
  });

  closeWorkflowItem = (projectId, subprojectId, workflowitemId) =>
    axios.post(`/workflowitem.close`, {
      projectId,
      subprojectId,
      workflowitemId
    });

  fetchNotifications = (fromId = "") => {
    return axios.get(`/notification.list?sinceId=${fromId}`);
  };

  markNotificationAsRead = notificationId => axios.post(`/notification.markRead`, {
    notificationId
  });
}

export default Api;
