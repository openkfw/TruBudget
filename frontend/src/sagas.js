import { put, takeEvery, takeLatest, call, select } from "redux-saga/effects";

import Api from "./api.js";

import {
  CREATE_PROJECT,
  CREATE_PROJECT_SUCCESS,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_ALL_PROJECTS
} from "./pages/Overview/actions";

import {
  CREATE_SUBPROJECT,
  CREATE_SUBPROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS,
  FETCH_PROJECT_PERMISSIONS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  GRANT_PERMISSION,
  GRANT_PERMISSION_SUCCESS,
  ASSIGN_PROJECT_SUCCESS,
  ASSIGN_PROJECT,
  FETCH_PROJECT_HISTORY_SUCCESS,
  FETCH_PROJECT_HISTORY,
  REVOKE_PERMISSION_SUCCESS,
  REVOKE_PERMISSION
} from "./pages/SubProjects/actions";
import {
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  MARK_NOTIFICATION_AS_READ_SUCCESS,
  MARK_NOTIFICATION_AS_READ,
  FETCH_NOTIFICATIONS_WITH_ID_SUCCESS,
  FETCH_NOTIFICATIONS_WITH_ID,
  FETCH_ALL_NOTIFICATIONS,
  FETCH_ALL_NOTIFICATIONS_SUCCESS
} from "./pages/Notifications/actions";
import {
  CREATE_WORKFLOW,
  CREATE_WORKFLOW_SUCCESS,
  FETCH_ALL_SUBPROJECT_DETAILS,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  GRANT_SUBPROJECT_PERMISSION,
  GRANT_SUBPROJECT_PERMISSION_SUCCESS,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION,
  CLOSE_WORKFLOWITEM,
  CLOSE_WORKFLOWITEM_SUCCESS,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  ASSIGN_WORKFLOWITEM,
  ASSIGN_SUBPROJECT_SUCCESS,
  ASSIGN_SUBPROJECT,
  FETCH_SUBPROJECT_HISTORY,
  FETCH_SUBPROJECT_HISTORY_SUCCESS,
  REVOKE_SUBPROJECT_PERMISSION_SUCCESS,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  REVOKE_SUBPROJECT_PERMISSION,
  REVOKE_WORKFLOWITEM_PERMISSION
} from "./pages/Workflows/actions";

import {
  LOGIN,
  LOGIN_SUCCESS,
  SHOW_LOGIN_ERROR,
  STORE_ENVIRONMENT,
  LOGOUT_SUCCESS,
  LOGOUT,
  FETCH_USER_SUCCESS,
  FETCH_USER,
  FETCH_ENVIRONMENT_SUCCESS,
  FETCH_ENVIRONMENT,
  STORE_ENVIRONMENT_SUCCESS
} from "./pages/Login/actions";

import { showLoadingIndicator, hideLoadingIndicator, cancelDebounce } from "./pages/Loading/actions.js";

const api = new Api();

function* execute(fn, showLoading = false, errorCallback = undefined) {
  const done = yield handleLoading(showLoading);
  try {
    yield fn();
  } catch (error) {
    if (typeof errorCallback === "function") {
      yield errorCallback(error);
    } else {
      console.error(error);
      yield handleError(error);
    }
  } finally {
    yield done();
  }
}

function* handleError(error) {
  console.error("API-Error: ", error.response.data.error.message || "unknown");
  console.error(error);

  // which status should we use?
  if (error.response.status === 401) {
    yield call(logoutSaga);
  } else if (error.response) {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: error.response.data
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    });
  } else {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: "Disconnected!"
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    });
  }
}

const getJwt = state => state.toJS().login.jwt;
const getEnvironment = state => {
  const env = state.getIn(["login", "environment"]);
  if (env) {
    return env;
  }
  return "Test";
};

function* callApi(func, ...args) {
  const token = yield select(getJwt);
  yield call(api.setAuthorizationHeader, token);
  const env = yield select(getEnvironment);
  // TODO dont set the environment on each call
  const prefix = env === "Test" ? "/test" : "/prod";
  yield call(api.setBaseUrl, prefix);

  const { data } = yield call(func, ...args);
  return data;
}

var loadingCounter = 0;

function* handleLoading(showLoading) {
  if (showLoading) {
    loadingCounter++;
    yield put(showLoadingIndicator());
    return function* done() {
      loadingCounter--;
      if (!loadingCounter) {
        yield put(cancelDebounce());
        yield put(hideLoadingIndicator());
      }
    };
  } else {
    return function*() {};
  }
}

////////////////////// Specific Sagas start here /////////////////

// export function* fetchPeersSaga(action) {
//   try {
//     const peers = yield callApi(api.fetchPeers);
//     yield put({
//       type: FETCH_PEERS_SUCCESS,
//       peers: peers.data
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchProjectDetailsSaga(action) {
//   try {
//     const projectDetails = yield callApi(api.fetchProjectDetails, action.project)
//     yield put({
//       type: FETCH_PROJECT_DETAILS_SUCCESS,
//       projectDetails: projectDetails.data
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchProjectsSaga() {
//   try {
//     const projects = yield callApi(api.fetchProjects)
//     yield put({
//       type: FETCH_PROJECTS_SUCCESS,
//       projects: projects.data
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchWorkflowItemsSaga(action) {
//   try {
//     const workflowItems = yield callApi(api.fetchWorkflowItems, action.streamName);
//     yield put({
//       type: FETCH_WORKFLOW_ITEMS_SUCCESS,
//       workflowItems: workflowItems.data
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

export function* createProject(action) {
  yield execute(function*() {
    yield callApi(api.createProject, action.name, action.amount, action.comment, action.currency, action.thumbnail);
    yield put({
      type: CREATE_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECTS,
      showLoading: true
    });
  }, true);
}

export function* createSubProjectSaga({ projectId, name, amount, comment, currency, showLoading }) {
  yield execute(function*() {
    yield callApi(api.createSubProject, projectId, name, `${amount}`, comment, currency);
    yield put({
      type: CREATE_SUBPROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading
    });
  }, showLoading);
}

export function* createWorkflowItemSaga({ type, ...rest }) {
  yield execute(function*() {
    yield callApi(api.createWorkflowItem, rest);
    yield put({
      type: CREATE_WORKFLOW_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId: rest.projectId,
      subprojectId: rest.subprojectId,
      showLoading: true
    });
  });
}

// export function* editWorkflowItemSaga(action) {
//   const { stream, key, workflowName, amount, amountType, currency, comment, documents, state, txid, previousState, workflowType, approvalRequired } = action;
//   try {
//     yield callApi(api.editWorkflowItem, stream, key, workflowName, amount, amountType, currency, comment, documents, state, txid, previousState, workflowType, approvalRequired);
//     yield put({
//       type: EDIT_WORKFLOW_SUCCESS
//     });
//     yield put({
//       type: FETCH_WORKFLOW_ITEMS,
//       streamName: action.stream
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* editSubProjectSaga(action) {
//   try {
//     yield callApi(api.editSubProject, action.parent, action.streamName, action.status, action.amount);
//     yield put({
//       type: POST_SUBPROJECT_EDIT_SUCCESS
//     });
//     yield put({
//       type: FETCH_WORKFLOW_ITEMS,
//       streamName: action.streamName
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

export function* setEnvironmentSaga(action) {
  yield execute(function*() {
    yield put({
      type: STORE_ENVIRONMENT_SUCCESS,
      environment: action.environment,
      productionActive: action.productionActive
    });
    yield put({
      type: FETCH_ENVIRONMENT
    });
  });
}

export function* getEnvironmentSaga() {
  yield execute(function*() {
    const env = yield select(getEnvironment);
    yield put({
      type: FETCH_ENVIRONMENT_SUCCESS,
      environment: env,
      productionActive: env === "Test" ? false : true
    });
  });
}

// export function* fetchNodeInformationSaga() {
//   try {
//     const nodeInformation = yield callApi(api.fetchNodeInformation)
//     yield put({
//       type: FETCH_NODE_INFORMATION_SUCCESS,
//       nodeInformation: nodeInformation.data
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* postWorkflowSortSaga({ streamName, order, sortEnabled }) {
//   try {
//     yield callApi(api.postWorkflowSort, streamName, order);
//     yield put({
//       type: POST_WORKFLOW_SORT_SUCCESS
//     });
//     yield put({
//       type: FETCH_WORKFLOW_ITEMS,
//       streamName
//     });
//     yield put({
//       type: ENABLE_WORKFLOW_SORT,
//       sortEnabled
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchUsersSaga() {
//   try {
//     const users = yield callApi(api.fetchUsers)
//     yield put({
//       type: FETCH_USERS_SUCCESS,
//       users: users.data
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* addUserSaga({ username, fullName, avatar, password, role }) {
//   try {
//     yield callApi(api.addUser, username, fullName, avatar, password, role);
//     yield put({
//       type: FETCH_USERS
//     })
//     yield put({
//       type: ADD_USER_SUCCESS
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* addRoleSaga({ name, organization, read, write, admin }) {
//   try {
//     yield callApi(api.addRole, name, organization, read, write, admin);
//     yield put({
//       type: FETCH_ROLES
//     });
//     yield put({
//       type: ADD_ROLE_SUCCESS
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchRolesSaga() {
//   try {
//     const roles = yield callApi(api.fetchRoles);
//     yield put({
//       type: FETCH_ROLES_SUCCESS,
//       roles: roles.data
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

export function* fetchAllNotificationsSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotifications);
    yield put({
      type: FETCH_ALL_NOTIFICATIONS_SUCCESS,
      notifications: data.notifications
    });
  }, showLoading);
}

export function* fetchNotificationWithIdSaga({ fromId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotifications, fromId);
    yield put({
      type: FETCH_NOTIFICATIONS_WITH_ID_SUCCESS,
      notifications: data.notifications
    });
  }, showLoading);
}

export function* markNotificationAsReadSaga({ notificationId }) {
  yield execute(function*() {
    yield callApi(api.markNotificationAsRead, notificationId);
    yield put({
      type: MARK_NOTIFICATION_AS_READ_SUCCESS
    });
    yield put({
      type: FETCH_ALL_NOTIFICATIONS,
      showLoading: false
    });
  }, false);
}

export function* loginSaga({ user }) {
  function* login() {
    const { data } = yield callApi(api.login, user.username, user.password);

    yield put({
      type: LOGIN_SUCCESS,
      ...data
    });
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: false
    });
  }
  function* onLoginError(error) {
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: true
    });
    yield handleError(error);
  }
  yield execute(login, true, onLoginError);
}

// export function* adminLoginSaga({ user }) {
//   try {
//     const data = yield callApi(api.loginAdmin, user.username, user.password);
//     yield put({
//       type: FETCH_ADMIN_USER_SUCCESS,
//       user: {
//         username: data.user.id,
//         ...data.user
//       },
//       jwt: data.jwtToken,
//     })
//     yield put({
//       type: ADMIN_LOGIN_SUCCESS
//     })
//     yield put({
//       type: SHOW_ADMIN_LOGIN_ERROR,
//       show: false
//     })
//   } catch (error) {
//     console.log(error)
//     yield put({
//       type: SHOW_ADMIN_LOGIN_ERROR,
//       show: true
//     })
//   }
// }

export function* fetchUserSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listUser);
    yield put({
      type: FETCH_USER_SUCCESS,
      user: data.items
    });
  }, showLoading);
}

export function* logoutSaga() {
  yield execute(function*() {
    yield put({
      type: LOGOUT_SUCCESS
    });
  });
}

// export function* adminLogoutSaga() {
//   try {
//     yield put({
//       type: ADMIN_LOGOUT_SUCCESS
//     })
//   } catch (error) {
//     console.log(error)
//     yield handleError(error);
//   }
// }

// export function* fetchStreamNamesSaga() {
//   try {
//     const streamNames = yield callApi(api.fetchStreamNames)
//     yield put({
//       type: FETCH_STREAM_NAMES_SUCCESS,
//       streamNames: streamNames.data
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchHistorySaga({ project }) {
//   try {
//     const history = yield callApi(api.fetchHistory, project);
//     yield put({
//       type: FETCH_HISTORY_SUCCESS,
//       historyItems: history.data
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* validateDocumentSaga({ payload, hash }) {
//   try {
//     const response = yield callApi(api.validateDocument, payload, hash);
//     yield put({
//       type: VALIDATE_DOCUMENT_SUCCESS,
//       validates: response.data.validates,
//       hash
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* addDocumentSaga({ id, payload }) {
//   try {
//     const hash = yield callApi(api.hashDocument, payload);
//     yield put({
//       type: ADD_DOCUMENT_SUCCESS,
//       hash: hash.data,
//       id
//     })
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchUpdatesSaga({ user }) {
//   try {
//     const notifications = yield callApi(api.fetchNotifications, user);
//     const users = yield callApi(api.fetchUsers);
//     const peers = yield callApi(api.fetchPeers);
//     const streamNames = yield callApi(api.fetchStreamNames)
//     const projects = yield callApi(api.fetchProjects);
//     yield put({
//       type: FETCH_UPDATES_SUCCESS,
//       users: users.data,
//       peers: peers.data,
//       notifications: notifications.data,
//       streamNames: streamNames.data,
//       projects: projects.data,
//     });
//   } catch (error) {
//     yield handleError(error);
//   }
// }

// export function* fetchNodePermissionsSaga() {
//   const permissions = yield callApi(api.fetchPermissions);
//   yield put({
//     type: FETCH_NODE_PERMISSIONS_SUCCESS,
//     permissions: permissions.data
//   })
// }

export function* fetchAllProjectsSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listProjects);
    //TODO
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: FETCH_ALL_PROJECTS_SUCCESS,
      projects: data.items
      //roles: roles.data
    });
  }, showLoading);
}

export function* fetchAllProjectDetailsSaga({ projectId, showLoading }) {
  yield execute(function*() {
    const projectDetails = yield callApi(api.viewProjectDetails, projectId);
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS_SUCCESS,
      ...projectDetails.data
    });
  }, showLoading);
}

export function* fetchProjectHistorySaga({ projectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewProjectHistory, projectId);
    yield put({
      type: FETCH_PROJECT_HISTORY_SUCCESS,
      ...data
    });
  }, showLoading);
}

export function* fetchAllSubprojectDetailsSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewSubProjectDetails, projectId, subprojectId);
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
      ...data
    });
  }, showLoading);
}

export function* fetchSubprojectHistorySaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewSubProjectHistory, projectId, subprojectId);
    yield put({
      type: FETCH_SUBPROJECT_HISTORY_SUCCESS,
      ...data
    });
  }, showLoading);
}

export function* fetchProjectPermissionsSaga({ projectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listProjectIntents, projectId);
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: FETCH_PROJECT_PERMISSIONS_SUCCESS,
      permissions: data || {}
      //historyItems: history.data,
      //roles: roles.data
    });
  }, showLoading);
}

export function* fetchSubProjectPermissionsSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listSubProjectPermissions, projectId, subprojectId);
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
      permissions: data || {}
    });
  }, showLoading);
}

export function* fetchWorkflowItemPermissionsSaga({ projectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listWorkflowItemPermissions, projectId, workflowitemId);
    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
      permissions: data || {}
    });
  }, showLoading);
}

export function* grantPermissionsSaga({ projectId, intent, user, showLoading }) {
  yield execute(function*() {
    yield callApi(api.grantProjectPermissions, projectId, intent, user);
    //const { data } = yield callApi(api.listProjectIntents, projectId)
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: GRANT_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* revokePermissionsSaga({ projectId, intent, user, showLoading }) {
  yield execute(function*() {
    yield callApi(api.revokeProjectPermissions, projectId, intent, user);
    //const { data } = yield callApi(api.listProjectIntents, projectId)
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: REVOKE_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* grantSubProjectPermissionsSaga({ projectId, subprojectId, intent, user, showLoading }) {
  yield execute(function*() {
    yield callApi(api.grantSubProjectPermissions, projectId, subprojectId, intent, user);
    //const { data } = yield callApi(api.listProjectIntents, projectId)
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: GRANT_SUBPROJECT_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* revokeSubProjectPermissionsSaga({ projectId, subprojectId, intent, user, showLoading }) {
  yield execute(function*() {
    yield callApi(api.revokeSubProjectPermissions, projectId, subprojectId, intent, user);
    //const { data } = yield callApi(api.listProjectIntents, projectId)
    //const history = yield callApi(api.fetchHistory, projectId);
    //const roles = yield callApi(api.fetchRoles);
    yield put({
      type: REVOKE_SUBPROJECT_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* grantWorkflowItemPermissionsSaga({
  projectId,
  subprojectId,
  workflowitemId,
  intent,
  user,
  showLoading
}) {
  yield execute(function*() {
    yield callApi(api.grantWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, user);

    yield put({
      type: GRANT_WORKFLOWITEM_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS,
      projectId,
      subprojectId,
      workflowitemId,
      showLoading: true
    });
  }, showLoading);
}

export function* revokeWorkflowItemPermissionsSaga({
  projectId,
  subprojectId,
  workflowitemId,
  intent,
  user,
  showLoading
}) {
  yield execute(function*() {
    yield callApi(api.revokeWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, user);

    yield put({
      type: REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS,
      projectId,
      subprojectId,
      workflowitemId,
      showLoading: true
    });
  }, showLoading);
}

export function* closeWorkflowItemSaga({ projectId, subprojectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.closeWorkflowItem, projectId, subprojectId, workflowitemId);

    yield put({
      type: CLOSE_WORKFLOWITEM_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading
    });
  }, showLoading);
}

export function* assignWorkflowItemSaga({ projectId, subprojectId, workflowitemId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignWorkflowItem, projectId, subprojectId, workflowitemId, assigneeId);
    yield put({
      type: ASSIGN_WORKFLOWITEM_SUCCESS
    });
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignSubprojectSaga({ projectId, subprojectId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignSubproject, projectId, subprojectId, assigneeId);
    yield put({
      type: ASSIGN_SUBPROJECT_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignProjectSaga({ projectId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignProject, projectId, assigneeId);
    yield put({
      type: ASSIGN_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading: true
    });
  }, showLoading);
}

// WATCHERS

export function* watchFetchAllSubprojectDetails() {
  yield takeEvery(FETCH_ALL_SUBPROJECT_DETAILS, fetchAllSubprojectDetailsSaga);
}

export function* watchFetchSubprojectHistory() {
  yield takeEvery(FETCH_SUBPROJECT_HISTORY, fetchSubprojectHistorySaga);
}

export function* watchFetchAllProjectDetails() {
  yield takeEvery(FETCH_ALL_PROJECT_DETAILS, fetchAllProjectDetailsSaga);
}
export function* watchFetchProjectHistorySaga() {
  yield takeEvery(FETCH_PROJECT_HISTORY, fetchProjectHistorySaga);
}

export function* watchFetchAllProjects() {
  yield takeEvery(FETCH_ALL_PROJECTS, fetchAllProjectsSaga);
}

// export function* watchFetchPeers() {
//   yield takeEvery(FETCH_PEERS, fetchPeersSaga)
// }

// export function* watchFetchProjects() {
//   yield takeEvery(FETCH_PROJECTS, fetchProjectsSaga)
// }

// export function* watchFetchProjectDetails() {
//   yield takeEvery(FETCH_PROJECT_DETAILS, fetchProjectDetailsSaga)
// }

// export function* watchFetchWorkflowItems() {
//   yield takeEvery(FETCH_WORKFLOW_ITEMS, fetchWorkflowItemsSaga)
// }

// export function* watchFetchHistory() {
//   yield takeEvery(FETCH_HISTORY, fetchHistorySaga)
// }

export function* watchCreateSubProject() {
  yield takeEvery(CREATE_SUBPROJECT, createSubProjectSaga);
}

export function* watchCreateWorkflowItem() {
  yield takeEvery(CREATE_WORKFLOW, createWorkflowItemSaga);
}

// export function* watchEditWorkflowItem() {
//   yield takeEvery(EDIT_WORKFLOW, editWorkflowItemSaga)
// }

// export function* watchEditSubProject() {
//   yield takeEvery(POST_SUBPROJECT_EDIT, editSubProjectSaga)
// }

export function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject);
}

// export function* watchFetchNodeInformation() {
//   yield takeEvery(FETCH_NODE_INFORMATION, fetchNodeInformationSaga)
// }

export function* watchFetchAllNotifications() {
  yield takeLatest(FETCH_ALL_NOTIFICATIONS, fetchAllNotificationsSaga);
}

export function* watchFetchNotificationsWithId() {
  yield takeLatest(FETCH_NOTIFICATIONS_WITH_ID, fetchNotificationWithIdSaga);
}

// export function* watchPostWorkflowSort() {
//   yield takeLatest(POST_WORKFLOW_SORT, postWorkflowSortSaga)
// }
export function* watchMarkNotificationAsRead() {
  yield takeLatest(MARK_NOTIFICATION_AS_READ, markNotificationAsReadSaga);
}

// export function* watchFetchUsers() {
//   yield takeLatest(FETCH_USERS, fetchUsersSaga)
// }

// export function* watchFetchRoles() {
//   yield takeLatest(FETCH_ROLES, fetchRolesSaga)
// }

export function* watchLogin() {
  yield takeLatest(LOGIN, loginSaga);
}

// export function* watchAdminLogin() {
//   yield takeLatest(ADMIN_LOGIN, adminLoginSaga)
// }

export function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserSaga);
}

// export function* watchAddUser() {
//   yield takeEvery(ADD_USER, addUserSaga)
// }

// export function* watchAddRole() {
//   yield takeEvery(ADD_ROLE, addRoleSaga)
// }

export function* watchLogout() {
  yield takeEvery(LOGOUT, logoutSaga);
}

// export function* watchAdminLogout() {
//   yield takeLatest(ADMIN_LOGOUT, adminLogoutSaga);
// }

// export function* watchFetchStreamNames() {
//   yield takeLatest(FETCH_STREAM_NAMES, fetchStreamNamesSaga)
// }

// export function* watchValidateDocument() {
//   yield takeLatest(VALIDATE_DOCUMENT, validateDocumentSaga)
// }

// export function* watchAddDocument() {
//   yield takeLatest(ADD_DOCUMENT, addDocumentSaga)
// }

export function* watchSetEnvironment() {
  yield takeLatest(STORE_ENVIRONMENT, setEnvironmentSaga);
}

export function* watchGetEnvironment() {
  yield takeLatest(FETCH_ENVIRONMENT, getEnvironmentSaga);
}

// export function* watchFetchUpdates() {
//   yield takeLatest(FETCH_UPDATES, fetchUpdatesSaga)
// }

// export function* watchFetchNodePermissions() {
//   yield takeLatest(FETCH_NODE_PERMISSIONS, fetchNodePermissionsSaga)
// }

export function* watchFetchProjectPermissions() {
  yield takeLatest(FETCH_PROJECT_PERMISSIONS, fetchProjectPermissionsSaga);
}

export function* watchFetchSubProjectPermissions() {
  yield takeLatest(FETCH_SUBPROJECT_PERMISSIONS, fetchSubProjectPermissionsSaga);
}
export function* watchFetchWorkflowItemPermissions() {
  yield takeLatest(FETCH_WORKFLOWITEM_PERMISSIONS, fetchWorkflowItemPermissionsSaga);
}
export function* watchGrantPermissions() {
  yield takeEvery(GRANT_PERMISSION, grantPermissionsSaga);
}
export function* watchRevokePermissions() {
  yield takeEvery(REVOKE_PERMISSION, revokePermissionsSaga);
}
export function* watchGrantSubProjectPermissions() {
  yield takeEvery(GRANT_SUBPROJECT_PERMISSION, grantSubProjectPermissionsSaga);
}
export function* watchRevokeSubProjectPermissions() {
  yield takeEvery(REVOKE_SUBPROJECT_PERMISSION, revokeSubProjectPermissionsSaga);
}
export function* watchGrantWorkflowitemPermissions() {
  yield takeEvery(GRANT_WORKFLOWITEM_PERMISSION, grantWorkflowItemPermissionsSaga);
}
export function* watchRevokeWorkflowitemPermissions() {
  yield takeEvery(REVOKE_WORKFLOWITEM_PERMISSION, revokeWorkflowItemPermissionsSaga);
}
export function* watchCloseWorkflowItem() {
  yield takeEvery(CLOSE_WORKFLOWITEM, closeWorkflowItemSaga);
}
export function* watchAssignWorkflowItem() {
  yield takeEvery(ASSIGN_WORKFLOWITEM, assignWorkflowItemSaga);
}
export function* watchAssignSubproject() {
  yield takeEvery(ASSIGN_SUBPROJECT, assignSubprojectSaga);
}
export function* watchAssignProject() {
  yield takeEvery(ASSIGN_PROJECT, assignProjectSaga);
}

export default function* rootSaga() {
  try {
    yield [
      // Global
      watchFetchUser(),
      watchLogin(),
      watchLogout(),
      watchSetEnvironment(),
      watchGetEnvironment(),

      // Project
      watchCreateProject(),
      watchFetchAllProjects(),
      watchFetchAllProjectDetails(),
      watchFetchProjectPermissions(),
      watchGrantPermissions(),
      watchRevokePermissions(),
      watchAssignProject(),
      watchFetchProjectHistorySaga(),

      // Subproject
      watchCreateSubProject(),
      watchFetchAllSubprojectDetails(),
      watchFetchSubProjectPermissions(),
      watchGrantSubProjectPermissions(),
      watchRevokeSubProjectPermissions(),
      watchAssignSubproject(),
      watchFetchSubprojectHistory(),

      // Workflow
      watchCreateWorkflowItem(),
      watchFetchWorkflowItemPermissions(),
      watchGrantWorkflowitemPermissions(),
      watchRevokeWorkflowitemPermissions(),
      watchCloseWorkflowItem(),
      watchAssignWorkflowItem(),

      // Notifications
      watchFetchAllNotifications(),
      watchFetchNotificationsWithId(),
      watchMarkNotificationAsRead()
    ];
  } catch (error) {
    console.log(error);
  }
}
