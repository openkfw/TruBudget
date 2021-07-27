/*
 * TruBudget API documentation
 * The documentation contains all endpoints used for TruBudget blockchain communication. Start at the 'user.authenticate' endpoint to receive a token which is needed for authentication at almost every endpoint. To use the token click on the 'Authorize' Button at the top right
 *
 * OpenAPI spec version: 0.1.0
 *
 */

import { check, group, sleep } from "k6";
import http from "k6/http";

const BASE_URL = "http://localhost:8080";
// Sleep duration between successive requests.
// You might want to edit the value of this variable or remove calls to the sleep function on the script.
const SLEEP_DURATION = 0.1;

let TOKEN = "";

/* export let options = {
  hosts: { "test.k6.io": "1.2.3.4" },
  stages: [
    { duration: "1m", target: 10 },
    { duration: "1m", target: 20 },
    { duration: "1m", target: 0 },
  ],
  thresholds: { http_req_duration: ["avg<100", "p(95)<200"] },
  noConnectionReuse: true,
  userAgent: "MyK6UserAgentString/1.0",
};*/

export function setup() {
  let res = http.post(
    `${BASE_URL}/api/user.authenticate`,
    JSON.stringify({
      apiVersion: "1.0",
      data: {
        user: {
          id: "mstein",
          password: "test",
        },
      },
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  TOKEN = res.json().data.user.token;
}

export default function () {
  group("/api/readiness", () => {
    let url = BASE_URL + `/api/readiness`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/liveness", () => {
    let url = BASE_URL + `/api/liveness`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/version", () => {
    let url = BASE_URL + `/api/version`;
    // Request No. 1
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  /*
  group("/api/network.registerNode", () => {
    let url = BASE_URL + `/api/network.registerNode`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { address: "string", organization: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.declineNode", () => {
    let url = BASE_URL + `/api/network.declineNode`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { node: "_api_network_registernode_data" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.voteForPermission", () => {
    let url = BASE_URL + `/api/network.voteForPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { address: "string", vote: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.approveNewOrganization", () => {
    let url = BASE_URL + `/api/network.approveNewOrganization`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { organization: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.approveNewNodeForExistingOrganization", () => {
    let url = BASE_URL + `/api/network.approveNewNodeForExistingOrganization`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { address: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.list", () => {
    let url = BASE_URL + `/api/network.list`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.listActive", () => {
    let url = BASE_URL + `/api/network.listActive`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/system.createBackup", () => {
    let url = BASE_URL + `/api/system.createBackup`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/system.restoreBackup", () => {
    let url = BASE_URL + `/api/system.restoreBackup`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { anyValue: "object" };
    let params = {
      headers: {
        "Content-Type": "application/gzip",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.grantPermission", () => {
    let url = BASE_URL + `/api/global.grantPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.grantAllPermissions", () => {
    let url = BASE_URL + `/api/global.grantAllPermissions`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { identity: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.revokePermission", () => {
    let url = BASE_URL + `/api/global.revokePermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.listPermissions", () => {
    let url = BASE_URL + `/api/global.listPermissions`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.authenticate", () => {
    let url = BASE_URL + `/api/user.authenticate`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { user: "_api_user_authenticate_data_user" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.createUser", () => {
    let url = BASE_URL + `/api/global.createUser`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { user: "_api_global_createuser_data_user" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.enableUser", () => {
    let url = BASE_URL + `/api/global.enableUser`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { userId: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.disableUser", () => {
    let url = BASE_URL + `/api/global.disableUser`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { userId: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.listAssignments", () => {
    let userId = "TODO_EDIT_THE_USERID";
    let url = BASE_URL + `/api/global.listAssignments?userId=${userId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.list", () => {
    let url = BASE_URL + `/api/user.list`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.changePassword", () => {
    let url = BASE_URL + `/api/user.changePassword`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { userId: "string", newPassword: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.intent.grantPermission", () => {
    let url = BASE_URL + `/api/user.intent.grantPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string", userId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.intent.revokePermission", () => {
    let url = BASE_URL + `/api/user.intent.revokePermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string", userId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.intent.listPermissions", () => {
    let userId = "TODO_EDIT_THE_USERID";
    let url = BASE_URL + `/api/user.intent.listPermissions?userId=${userId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.createGroup", () => {
    let url = BASE_URL + `/api/global.createGroup`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { group: "_api_global_creategroup_data_group" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/group.list", () => {
    let url = BASE_URL + `/api/group.list`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/group.addUser", () => {
    let url = BASE_URL + `/api/group.addUser`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { groupId: "string", userId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/group.removeUser", () => {
    let url = BASE_URL + `/api/group.removeUser`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { groupId: "string", userId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/group.intent.listPermissions", () => {
    let userId = "TODO_EDIT_THE_USERID";
    let url = BASE_URL + `/api/group.intent.listPermissions?userId=${userId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/notification.list", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let url =
      BASE_URL + `/api/notification.list?limit=${limit}&offset=${offset}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/notification.count", () => {
    let url = BASE_URL + `/api/notification.count`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/notification.markRead", () => {
    let url = BASE_URL + `/api/notification.markRead`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { notifications: "list" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.assign", () => {
    let url = BASE_URL + `/api/project.assign`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", projectId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.close", () => {
    let url = BASE_URL + `/api/project.close`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: { projectId: "string" } };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.createProject", () => {
    let url = BASE_URL + `/api/global.createProject`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { project: "_api_global_createproject_data_project" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.update", () => {
    let url = BASE_URL + `/api/project.update`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        displayName: "string",
        description: "string",
        thumbnail: "string",
        additionalData: "object",
        tags: "list",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.intent.grantPermission", () => {
    let url = BASE_URL + `/api/project.intent.grantPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string", projectId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.intent.revokePermission", () => {
    let url = BASE_URL + `/api/project.intent.revokePermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", intent: "string", projectId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.intent.listPermissions", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let url =
      BASE_URL + `/api/project.intent.listPermissions?projectId=${projectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.list", () => {
    let url = BASE_URL + `/api/project.list`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.viewDetails", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let url = BASE_URL + `/api/project.viewDetails?projectId=${projectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.viewHistory", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let url =
      BASE_URL +
      `/api/project.viewHistory?projectId=${projectId}&limit=${limit}&offset=${offset}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.viewHistory.v2", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let publisher = "TODO_EDIT_THE_PUBLISHER";
    let eventType = "TODO_EDIT_THE_EVENTTYPE";
    let endAt = "TODO_EDIT_THE_ENDAT";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let startAt = "TODO_EDIT_THE_STARTAT";
    let url =
      BASE_URL +
      `/api/project.viewHistory.v2?projectId=${projectId}&limit=${limit}&offset=${offset}&publisher=${publisher}&startAt=${startAt}&endAt=${endAt}&eventType=${eventType}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.budget.updateProjected", () => {
    let url = BASE_URL + `/api/project.budget.updateProjected`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        organization: "string",
        currencyCode: "string",
        value: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.budget.deleteProjected", () => {
    let url = BASE_URL + `/api/project.budget.deleteProjected`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        organization: "string",
        currencyCode: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.assign", () => {
    let url = BASE_URL + `/api/subproject.assign`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { identity: "string", projectId: "string", subprojectId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.close", () => {
    let url = BASE_URL + `/api/subproject.close`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { projectId: "string", subprojectId: "string" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.createSubproject", () => {
    let url = BASE_URL + `/api/project.createSubproject`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        subproject: "_api_project_createsubproject_data_subproject",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.list", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let url = BASE_URL + `/api/subproject.list?projectId=${projectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.viewDetails", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let url =
      BASE_URL +
      `/api/subproject.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.viewHistory", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let url =
      BASE_URL +
      `/api/subproject.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&limit=${limit}&offset=${offset}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.viewHistory.v2", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let url =
      BASE_URL +
      `/api/subproject.viewHistory.v2?projectId=${projectId}&subprojectId=${subprojectId}&limit=${limit}&offset=${offset}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.intent.listPermissions", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let url =
      BASE_URL +
      `/api/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.intent.grantPermission", () => {
    let url = BASE_URL + `/api/subproject.intent.grantPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        identity: "string",
        intent: "string",
        projectId: "string",
        subprojectId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.intent.revokePermission", () => {
    let url = BASE_URL + `/api/subproject.intent.revokePermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        identity: "string",
        intent: "string",
        projectId: "string",
        subprojectId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.budget.updateProjected", () => {
    let url = BASE_URL + `/api/subproject.budget.updateProjected`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        subprojectId: "string",
        organization: "string",
        currencyCode: "string",
        value: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.budget.deleteProjected", () => {
    let url = BASE_URL + `/api/subproject.budget.deleteProjected`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        subprojectId: "string",
        organization: "string",
        currencyCode: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.reorderWorkflowitems", () => {
    let url = BASE_URL + `/api/subproject.reorderWorkflowitems`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: { projectId: "string", subprojectId: "string", ordering: "list" },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.update", () => {
    let url = BASE_URL + `/api/subproject.update`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        displayName: "string",
        description: "string",
        additionalData: "object",
        projectId: "string",
        subprojectId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.list", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let url =
      BASE_URL +
      `/api/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.viewHistory", () => {
    let offset = "TODO_EDIT_THE_OFFSET";
    let limit = "TODO_EDIT_THE_LIMIT";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let workflowitemId = "TODO_EDIT_THE_WORKFLOWITEMID";
    let url =
      BASE_URL +
      `/api/workflowitem.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&limit=${limit}&offset=${offset}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.intent.listPermissions", () => {
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let workflowitemId = "TODO_EDIT_THE_WORKFLOWITEMID";
    let url =
      BASE_URL +
      `/api/workflowitem.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.close", () => {
    let url = BASE_URL + `/api/workflowitem.close`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.createWorkflowitem", () => {
    let url = BASE_URL + `/api/subproject.createWorkflowitem`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        projectId: "string",
        subprojectId: "string",
        status: "string",
        displayName: "string",
        description: "string",
        assignee: "string",
        amountType: "string",
        billingDate: "string",
        dueDate: "string",
        exchangeRate: "string",
        documents: "list",
        additionalData: "object",
        workflowitemType: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.assign", () => {
    let url = BASE_URL + `/api/workflowitem.assign`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        identity: "string",
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.intent.grantPermission", () => {
    let url = BASE_URL + `/api/workflowitem.intent.grantPermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        identity: "string",
        intent: "string",
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.intent.revokePermission", () => {
    let url = BASE_URL + `/api/workflowitem.intent.revokePermission`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        identity: "string",
        intent: "string",
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.update", () => {
    let url = BASE_URL + `/api/workflowitem.update`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        displayName: "string",
        description: "string",
        amountType: "string",
        amount: "string",
        currency: "string",
        exchangeRate: "string",
        billingDate: "string",
        dueDate: "string",
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
        documents: "list",
        additionalData: "object",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.validateDocument", () => {
    let url = BASE_URL + `/api/workflowitem.validateDocument`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = {
      apiVersion: "string",
      data: {
        base64String: "string",
        hash: "string",
        id: "string",
        projectId: "string",
        subprojectId: "string",
        workflowitemId: "string",
      },
    };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/workflowitem.downloadDocument", () => {
    let documentId = "TODO_EDIT_THE_DOCUMENTID";
    let projectId = "TODO_EDIT_THE_PROJECTID";
    let subprojectId = "TODO_EDIT_THE_SUBPROJECTID";
    let workflowitemId = "TODO_EDIT_THE_WORKFLOWITEMID";
    let url =
      BASE_URL +
      `/api/workflowitem.downloadDocument?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&documentId=${documentId}`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/provisioning.start", () => {
    let url = BASE_URL + `/api/provisioning.start`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: "object" };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/provisioning.end", () => {
    let url = BASE_URL + `/api/provisioning.end`;
    // Request No. 1
    // TODO: edit the parameters of the request body.
    let body = { apiVersion: "string", data: "object" };
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/provisioned", () => {
    let url = BASE_URL + `/api/provisioned`;
    // Request No. 1
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  }); */
}
