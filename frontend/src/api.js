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
            data: { ...data }
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

  login = (username, password) => axios.post(`/user.authenticate`, { user: { id: username, password } });

  listUser = () => axios.get(`/user.list`);

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

  grantProjectPermissions = (projectId, intent, userId) =>
    axios.post(`/project.intent.grantPermission`, { projectId, intent, userId });

  revokeProjectPermissions = (projectId, intent, userId) =>
    axios.post(`/project.intent.revokePermission`, { projectId, intent, userId });

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
    axios.post(`/subproject.update`, { projectId, subprojectId, ...changes });

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

  grantSubProjectPermissions = (projectId, subprojectId, intent, userId) =>
    axios.post(`/subproject.intent.grantPermission`, { projectId, subprojectId, intent, userId });

  revokeSubProjectPermissions = (projectId, subprojectId, intent, userId) =>
    axios.post(`/subproject.intent.revokePermission`, { projectId, subprojectId, intent, userId });

  editWorkflowItem = (projectId, subprojectId, workflowitemId, changes) =>
    axios.post(`/workflowitem.update`, { projectId, subprojectId, workflowitemId, ...changes });

  listWorkflowItemPermissions = (projectId, workflowitemId) =>
    axios.get(`/workflowitem.intent.listPermissions?projectId=${projectId}&workflowitemId=${workflowitemId}`);

  grantWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, userId) =>
    axios.post(`/workflowitem.intent.grantPermission`, { projectId, subprojectId, workflowitemId, intent, userId });

  revokeWorkflowItemPermissions = (projectId, subprojectId, workflowitemId, intent, userId) =>
    axios.post(`/workflowitem.intent.revokePermission`, { projectId, subprojectId, workflowitemId, intent, userId });

  assignWorkflowItem = (projectId, subprojectId, workflowitemId, userId) =>
    axios.post(`/workflowitem.assign`, { projectId, subprojectId, workflowitemId, userId });

  assignSubproject = (projectId, subprojectId, userId) =>
    axios.post(`/subproject.assign`, { projectId, subprojectId, userId });

  assignProject = (projectId, userId) => axios.post(`/project.assign`, { projectId, userId });

  closeWorkflowItem = (projectId, subprojectId, workflowitemId) =>
    axios.post(`/workflowitem.close`, { projectId, subprojectId, workflowitemId });

  fetchNotifications = (fromId = "") => {
    return axios.get(`/notification.list?sinceId=${fromId}`);
  };

  markNotificationAsRead = notificationId => axios.post(`/notification.markRead`, { notificationId });
}

export default Api;
