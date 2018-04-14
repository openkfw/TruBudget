import axios from 'axios';
const devMode = process.env.NODE_ENV === 'development';
const API_VERSION = '1.0';

console.log(`API is running in ${devMode ? "development" : "production"} mode (Version ${API_VERSION})`)


class Api {

  constructor() {
    // Set API Version header for POST / PUT / DELETE
    // Move all parameters into data object
    axios.defaults.transformRequest = [
      (data, headers) => {
        if (typeof data === 'object') {
          return {
            apiVersion: API_VERSION,
            data: { ...data }
          }
        } else {
          return data;
        }
      },
      ...axios.defaults.transformRequest
    ]
  }


  setAuthorizationHeader = (token) => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }

  setBaseUrl = (url) => {
    if (!devMode) {
      axios.defaults.baseURL = url
    }
  }

  login = (username, password) => axios.post(`/user.authenticate`, { id: username, password })

  listUser = () => axios.get(`/user.list`);

  listProjects = () => axios.get(`/project.list`);

  createProject = (displayName, amount,
    description, currency, thumbnail) => axios.post(`/project.create`, {
      displayName, amount: `${amount}`, description, currency, thumbnail
    });

  viewProjectDetails = (projectId) => axios.get(`/project.viewDetails?projectId=${projectId}`);

  listProjectIntents = (projectId) => axios.get(`/project.intent.list?projectId=${projectId}`);

  // loginAdmin = async (username, password) => {
  //   const { data } = await axios.post(`/login`, { username, password })
  //   return data;
  // }
  //
  // addUser = (username, fullName, avatar, password, role) => axios.post(`/users`, {
  //   id: username,
  //   name: fullName,
  //   avatar_back: avatar,
  //   password,
  //   role,
  //   avatar
  // })
  // addRole = (id, organization, read, write, admin) => axios.post(`/roles`, {
  //   id,
  //   organization,
  //   read,
  //   write,
  //   admin
  // })
  // fetchPermissions = () => axios.get(`/permissions`);
  // fetchPeers = () => axios.get(`/peers`);


  // fetchStreamNames = () => axios.get(`/projects/mapping`);
  // fetchStreamItems = (flowName) => axios.get(`/streams/` + flowName);
  // postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectComment, subProjectCurrency) => axios.post(`/subprojects`, {
  //   parentStream: parentProject,
  //   name: subProjectName,
  //   amount: subProjectAmount,
  //   comment: subProjectComment,
  //   currency: subProjectCurrency,
  //   status: `open`
  // })
  // fetchNodeInformation = () => axios.get(`/nodes`);
  // fetchNotifications = (user) => axios.get(`/notifications/` + user);
  // fetchWorkflowItems = (subProjectName) => axios.get(`/subprojects/` + subProjectName);
  // // fetch the user to the existing JWToken
  // fetchUser = () => axios.get(`/users/mapping`)
  // fetchUsers = () => axios.get(`/users`);
  // fetchRoles = () => axios.get(`/roles`);
  // postWorkflowItem = (stream, workflowItemName, amount, amountType, currency, comment, documents, status, type, approvalRequired) => axios.post(`/workflows`, {
  //   streamName: stream,
  //   workflowName: workflowItemName,
  //   amount,
  //   amountType,
  //   currency,
  //   comment,
  //   documents,
  //   status,
  //   type,
  //   approvalRequired
  // })
  // editWorkflowItem = (stream, key, workflowItemName, amount, amountType, currency, comment, documents, status, txid, previousState, type, approvalRequired) => axios.put(`/workflows/` + workflowItemName, {
  //   streamName: stream,
  //   key,
  //   workflowName: workflowItemName,
  //   amount,
  //   amountType,
  //   currency,
  //   comment,
  //   documents,
  //   status,
  //   previousState,
  //   type,
  //   approvalRequired
  // })
  // fetchHistory = (project) => axios.get(`/history/` + project);
  // markNotificationAsRead = (user, id, data) => axios.put(`/notifications/${user}/${id}`, data);
  // postWorkflowSort = (streamName, workflowOrder) => axios.put(`/subprojects/` + streamName + `/sort`, {
  //   order: workflowOrder
  // });
  // editSubProject = (parentProject, subProjectName, status, amount) => axios.put(`/subprojects/` + subProjectName, {
  //   parent: parentProject,
  //   status: status,
  //   amount: amount
  // });
  // hashDocument = (payload) => {
  //   const data = new FormData();
  //   data.append(`doc`, payload);
  //   return axios.post(`/documents`, data)
  // };
  // validateDocument = (payload, hash) => {
  //   const data = new FormData();
  //   data.append(`doc`, payload);
  //   return axios.post(`/documents/` + hash, data)
  // };
}

export default Api;
