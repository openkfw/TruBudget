import axios from "axios";
import { parse } from "content-disposition-attachment";
import _isEmpty from "lodash/isEmpty";

import config from "./config";
import { base64ToBlob } from "./helper";
import strings from "./localizeStrings";
import { store } from "./store";

const devMode = config.envMode === "development";
const API_VERSION = "1.0";
const instance = axios.create();

const isAuthProxyEnabled = window?.injectedEnv?.REACT_APP_AUTHPROXY_ENABLED === "true" || config.authProxy.enabled;
const authProxySignoutUri = (window?.injectedEnv?.REACT_APP_AUTHPROXY_URL || config.authProxy.url).replace(
  "signin",
  "signout"
);

// eslint-disable-next-line no-console
console.log(`API is running in ${devMode ? "development" : "production"} mode (API Version ${API_VERSION})`);

class Api {
  constructor() {
    // Set API Version header for POST / PUT / DELETE
    // Move all parameters into data object
    instance.defaults.transformRequest = [
      (data, _headers) => {
        if (data instanceof FormData) {
          return data;
        } else if (typeof data === "object") {
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

    instance.interceptors.request.use((request) => {
      if (request.url.includes("/version")) {
        this.timeStamp = performance.now();
      }
      return request;
    });

    instance.interceptors.response.use((response) => {
      if (response.config.url.includes("/version")) {
        response.data.ping = performance.now() - this.timeStamp;
      }
      return response;
    });
  }

  setAuthorizationHeader = (token) => {
    instance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
  };

  setBaseUrl = () => {
    instance.defaults.baseURL = `/api`;
  };

  /**
   * Returns URL for calling Excel export service
   * @param {*} urlSlug tail segment of the URL
   * @param {*} devModePrefix prefixes urlSlug with additional string, if needed
   */
  getExportServiceUrl = (urlSlug, devModeEnvironment = "") => {
    const baseURL = devMode
      ? `http://localhost:${config.export.servicePort}${
          !devModeEnvironment.length ? "" : `/${devModeEnvironment.toLowerCase()}`
        }`
      : "/export/xlsx";
    return `${baseURL}/${urlSlug}`;
  };

  /**
   * Returns URL for calling Email service
   * @param {*} urlSlug tail segment of the URL
   */
  getEmailServiceUrl = (urlSlug) => `${devMode ? `http://localhost:${config.email.servicePort}` : "/email"}/${urlSlug}`;

  login = (username, password) =>
    instance.post(`/user.authenticate`, {
      user: {
        id: username,
        password
      }
    });

  loginAd = (token) =>
    instance.post(`/user.authenticateAd`, {
      token
    });

  logout = () => {
    if (isAuthProxyEnabled) {
      const isUsingAuthproxy = store?.getState()?.get("login")?.toJS()?.isUsingAuthproxy;
      if (isUsingAuthproxy && authProxySignoutUri) {
        window.open(`${authProxySignoutUri}`, "_blank");
      }
    }
    return instance.post(`/user.logout`, {});
  };

  disableUser = (userId) =>
    instance.post(`/global.disableUser`, {
      userId
    });

  enableUser = (userId) =>
    instance.post(`/global.enableUser`, {
      userId
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

  grantAllUserPermissions = (userId) =>
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

  listUserAssignments = (userId) => instance.get(removeEmptyQueryParams(`/global.listAssignments?userId=${userId}`));

  createGroup = (groupId, displayName, users) =>
    instance.post(`/global.createGroup`, {
      group: {
        displayName,
        id: groupId,
        users
      }
    });
  addUsersToGroup = (groupId, userIds) =>
    instance.post(`/group.addUser`, {
      groupId,
      userIds
    });
  removeUsersFromGroup = (groupId, userIds) =>
    instance.post(`/group.removeUser`, {
      groupId,
      userIds
    });
  listGroup = () => instance.get(`/group.list`);
  listNodes = () => instance.get(`/network.list`);
  listActiveNodes = () => instance.get(`/network.listActive`);
  approveNewOrganization = (organization) =>
    instance.post(`/network.approveNewOrganization`, {
      organization
    });
  approveNewNodeForOrganization = (address) =>
    instance.post(`/network.approveNewNodeForExistingOrganization`, {
      address
    });
  registerNewOrganization = (organization, address) =>
    instance.post(`/network.registerNodeManual`, { organization, address });
  declineNode = (node) =>
    instance.post(`/network.declineNode`, {
      node
    });
  listProjects = () => instance.get(`/project.list`);
  listProjectsV2 = (page, limit, searchTerm, column, direction) =>
    instance.get(
      removeEmptyQueryParams(
        `/v2/project.list?page=${page}&limit=${limit}&search=${searchTerm}&sort=${column}&order=${direction}`
      )
    );

  listSubprojects = (projectId) => instance.get(removeEmptyQueryParams(`/subproject.list?projectId=${projectId}`));

  createProject = (displayName, description, thumbnail, projectedBudgets, tags, additionalData) =>
    instance.post(`/global.createProject`, {
      project: {
        displayName,
        description,
        thumbnail,
        projectedBudgets,
        tags,
        additionalData
      }
    });

  editProject = (projectId, changes) =>
    instance.post(`/project.update`, {
      projectId,
      ...changes
    });

  viewProjectDetails = (projectId) =>
    instance.get(removeEmptyQueryParams(`/project.viewDetails?projectId=${projectId}`));
  viewProjectHistory = (projectId, offset, limit, filter) => {
    let url = removeEmptyQueryParams(`/project.viewHistory?projectId=${projectId}&offset=${offset}&limit=${limit}`);

    // filter: startAt|endAt|publisher|eventType
    for (const key in filter) {
      if (!_isEmpty(filter[key])) {
        url = url + `&${key}=${filter[key]}`;
      }
    }
    return instance.get(url);
  };

  listProjectIntents = (projectId) =>
    instance.get(removeEmptyQueryParams(`/project.intent.listPermissions?projectId=${projectId}`));

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

  createSubProject = (
    projectId,
    displayName,
    description,
    currency,
    projectedBudgets = [],
    validatorId = undefined,
    workflowitemType = undefined
  ) => {
    if (_isEmpty(validatorId)) validatorId = undefined;
    if (_isEmpty(workflowitemType)) workflowitemType = undefined;
    return instance.post(`/project.createSubproject`, {
      projectId,
      subproject: {
        displayName,
        description,
        currency,
        projectedBudgets,
        validator: validatorId,
        workflowitemType
      }
    });
  };

  editSubProject = (projectId, subprojectId, changes) =>
    instance.post(`/subproject.update`, {
      projectId,
      subprojectId,
      ...changes
    });

  viewSubProjectDetails = (projectId, subprojectId) =>
    instance.get(removeEmptyQueryParams(`/subproject.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}`));

  viewSubProjectHistory = (projectId, subprojectId, offset, limit, filter) => {
    let url = removeEmptyQueryParams(
      `/subproject.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&offset=${offset}&limit=${limit}`
    );
    // filter: startAt|endAt|publisher|eventType
    for (const key in filter) {
      if (!_isEmpty(filter[key])) {
        url = url + `&${key}=${filter[key]}`;
      }
    }
    return instance.get(url);
  };

  viewWorkflowitemHistory = (projectId, subprojectId, workflowitemId, offset, limit, filter) => {
    let url = removeEmptyQueryParams(
      `/workflowitem.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&offset=${offset}&limit=${limit}`
    );
    // filter: startAt|endAt|publisher|eventType
    for (const key in filter) {
      if (!_isEmpty(filter[key])) {
        url = url + `&${key}=${filter[key]}`;
      }
    }
    return instance.get(url);
  };

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

  createWorkflowItem = (payload) => {
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

  createWorkflowItemV2 = (payload) => {
    const { currency, amount, exchangeRate, documents, ...minimalPayload } = payload;
    const payloadToSend =
      payload.amountType === "N/A"
        ? minimalPayload
        : {
            ...minimalPayload,
            currency,
            amount,
            exchangeRate: exchangeRate.toString()
          };

    const formData = new FormData();

    formData.append("apiVersion", "2.0");

    for (const key in payloadToSend) {
      formData.append(key, payloadToSend[key]);
    }

    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        if (documents[i].base64) {
          const blob = base64ToBlob(documents[i].base64, documents[i].type); // data in redux store needs to be serializable, so we store base64 string
          formData.append("documents", blob, documents[i].fileName);
        }
      }
    }
    return instance.post(`/v2/subproject.createWorkflowitem`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  };

  listSubProjectPermissions = (projectId, subprojectId) =>
    instance.get(
      removeEmptyQueryParams(`/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`)
    );

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

  validateDocument = (base64String, hash, id, projectId, subprojectId, workflowitemId) =>
    instance.post(`/workflowitem.validateDocument`, {
      base64String,
      hash,
      id,
      projectId,
      subprojectId,
      workflowitemId
    });

  listWorkflowItemPermissions = (projectId, subprojectId, workflowitemId) =>
    instance.get(
      removeEmptyQueryParams(
        `/workflowitem.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`
      )
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

  closeProject = (projectId) =>
    instance.post(`/project.close`, {
      projectId
    });

  closeSubproject = (projectId, subprojectId) =>
    instance.post(`subproject.close`, {
      projectId,
      subprojectId
    });

  closeWorkflowItem = (projectId, subprojectId, workflowitemId, rejectReason) => {
    if (rejectReason === "")
      return instance.post(`/workflowitem.close`, {
        projectId,
        subprojectId,
        workflowitemId
      });
    else
      return instance.post(`/workflowitem.close`, {
        projectId,
        subprojectId,
        workflowitemId,
        rejectReason
      });
  };

  fetchNotifications = (offset, limit) => {
    let url = removeEmptyQueryParams(`/notification.list?offset=${offset}&limit=${limit}`);
    return instance.get(url);
  };

  fetchNotificationCounts = () => {
    return instance.get(`/notification.count`);
  };

  markNotificationAsRead = (notificationId) =>
    instance.post(`/notification.markRead`, {
      notifications: [notificationId]
    });
  markMultipleNotificationsAsRead = (notificationIds) =>
    instance.post(`/notification.markRead`, { notifications: notificationIds });

  createBackup = () => instance.get(`/system.createBackup`, { responseType: "blob" });
  restoreFromBackup = (token, data) => {
    const binaryInstance = axios.create();
    binaryInstance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
    const response = binaryInstance.post(`/api/system.restoreBackup`, data, {
      headers: { "Content-Type": "application/gzip" }
    });
    return response;
  };
  export = (devModeEnvironment) => {
    const path = this.getExportServiceUrl(`download?lang=${strings.getLanguage()}`, devModeEnvironment);
    return instance.get(path, { responseType: "blob", withCredentials: true });
  };
  fetchExportServiceVersion = () => {
    const path = this.getExportServiceUrl("version");
    return instance.get(path);
  };
  checkExportService = () => {
    const path = this.getExportServiceUrl("readiness");
    return instance.get(path);
  };
  checkEmailService = () => {
    const path = this.getEmailServiceUrl("readiness");
    return instance.get(path, { withCredentials: true });
  };
  fetchEmailServiceVersion = () => {
    const path = this.getEmailServiceUrl("version");
    return instance.get(path);
  };
  insertEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = this.getEmailServiceUrl("user.insert");
    return instance.post(path, data, { withCredentials: true });
  };
  updateEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = this.getEmailServiceUrl("user.update");
    return instance.post(path, data, { withCredentials: true });
  };
  deleteEmailAddress = (id, emailAddress) => {
    const data = { user: { id, emailAddress } };
    const path = this.getEmailServiceUrl("user.delete");
    return instance.post(path, data, { withCredentials: true });
  };
  getEmailAddress = (id) => {
    const path = this.getEmailServiceUrl(`user.getEmailAddress?id=${id}`);
    return instance.get(path, { withCredentials: true });
  };

  getWorkflowItem = (projectId, subprojectId, workflowitemId) => {
    return instance.get(
      removeEmptyQueryParams(
        `/workflowitem.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`
      )
    );
  };

  downloadDocument = (projectId, subprojectId, workflowitemId, documentId) =>
    instance
      .get(
        removeEmptyQueryParams(
          `/workflowitem.downloadDocument?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&documentId=${documentId}`
        ),
        { responseType: "blob" }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const { attachment, filename } = parse(response.headers["content-disposition"]);
        if (attachment) {
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          return Promise.resolve({ data: {} });
        }
      });

  deleteDocument = (projectId, subprojectId, workflowitemId, documentId) =>
    instance.delete(
      removeEmptyQueryParams(
        `/workflowitem.deleteDocument?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&documentId=${documentId}`
      )
    );
}

/**
 *
 * @param url url that needs to be checked for empty parameters
 * @returns the url without empty or undefined parameters

 */
const removeEmptyQueryParams = (url) => {
  const [baseUrl, queryParams] = url.split("?");

  if (!queryParams) {
    return url;
  }

  const newQueryParams = queryParams
    .split("&")
    .filter((param) => {
      // eslint-disable-next-line no-unused-vars
      const [key, value] = param.split("=");
      return value && value !== "undefined";
    })
    .join("&");

  return newQueryParams ? `${baseUrl}?${newQueryParams}` : baseUrl;
};

export default Api;
