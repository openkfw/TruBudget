/*
 * TruBudget API documentation
 * The documentation contains all endpoints used for TruBudget blockchain communication.
 *
 * OpenAPI spec version: 0.1.0
 *
 */

import { check, group, sleep } from "k6";
import http from "k6/http";

const BASE_URL = "http://localhost:8080";
// Sleep duration between successive requests.
const SLEEP_DURATION = 0.1;

//API Auth-Token
let MSTEIN_TOKEN = "";
let ROOT_TOKEN = "";

//organisation name
const ORGANISATION = "KfW";
const apiVersion = "1.0";
const jdoe = { identity: "jdoe", intent: "global.createProject" };
const mstein = { identity: "mstein", intent: "global.createProject" };
const jxavier = { identity: "jxavier", intent: "" };
const createdProjects = [];

const defaultGroup = "reviewers";

function authenticate() {
  let userRequest = http.post(
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

  MSTEIN_TOKEN = userRequest.json().data.user.token;

  let rootRequest = http.post(
    `${BASE_URL}/api/user.authenticate`,
    JSON.stringify({
      apiVersion: "1.0",
      data: {
        user: {
          id: "root",
          password: "root-secret",
        },
      },
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  ROOT_TOKEN = rootRequest.json().data.user.token;
}

export default function () {
  if (__ITER == 0) {
    authenticate();
  }
  group("/api/readiness", () => {
    let url = BASE_URL + `/api/readiness`;
    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/liveness", () => {
    let url = BASE_URL + `/api/liveness`;

    let request = http.get(url);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/version", () => {
    let url = BASE_URL + `/api/version`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/network.list", () => {
    let url = BASE_URL + `/api/network.list`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/network.listActive", () => {
    let url = BASE_URL + `/api/network.listActive`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/system.createBackup", () => {
    let url = BASE_URL + `/api/system.createBackup`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${ROOT_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/global.grantPermission", () => {
    let url = BASE_URL + `/api/global.grantPermission`;
    let body = JSON.stringify({
      apiVersion,
      data: jdoe,
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    let body = JSON.stringify({
      apiVersion,
      data: { identity: jdoe.identity },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    let body = JSON.stringify({
      apiVersion,
      data: jdoe,
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.authenticate", () => {
    let url = BASE_URL + `/api/user.authenticate`;
    let request = http.post(
      url,
      JSON.stringify({
        apiVersion: "1.0",
        data: {
          user: {
            id: "root",
            password: "root-secret",
          },
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/global.createUser", () => {
    let url = BASE_URL + `/api/global.createUser`;
    let body = JSON.stringify({
      apiVersion,
      data: {
        user: {
          id: Math.random().toString(36).substring(7),
          displayName: Math.random().toString(36).substring(7),
          organization: ORGANISATION,
          password: Math.random().toString(36).substring(7),
        },
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    let body = JSON.stringify({
      apiVersion,
      data: { userId: jxavier.identity },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: { userId: "dviolin" },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);

    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/global.listAssignments", () => {
    let userId = jdoe.identity;
    let url = BASE_URL + `/api/global.listAssignments?userId=${userId}`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/user.list", () => {
    let url = BASE_URL + `/api/user.list`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/user.intent.grantPermission", () => {
    let url = BASE_URL + `/api/user.intent.grantPermission`;
    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "user.view",
        userId: jdoe.identity,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ROOT_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "user.view",
        userId: jdoe.identity,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ROOT_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);

    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/user.intent.listPermissions", () => {
    let userId = mstein.identity;
    let url = BASE_URL + `/api/user.intent.listPermissions?userId=${userId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });

    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/global.createGroup", () => {
    let url = BASE_URL + `/api/global.createGroup`;

    let body = JSON.stringify({
      apiVersion,
      data: {
        group: {
          id: Math.random().toString(36).substring(7),
          displayName: Math.random().toString(36).substring(7),
          users: ["jdoe,mstein"],
        },
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/group.addUser", () => {
    let url = BASE_URL + `/api/group.addUser`;

    let body = JSON.stringify({
      apiVersion,
      data: { groupId: defaultGroup, userId: jdoe.identity },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ROOT_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: { groupId: defaultGroup, userId: jdoe.identity },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ROOT_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/group.intent.listPermissions", () => {
    let groupId = defaultGroup;
    let url = BASE_URL + `/api/group.intent.listPermissions?groupId=${groupId}`;
    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });

    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/notification.list", () => {
    let offset = "0";
    let limit = "100";
    let url =
      BASE_URL + `/api/notification.list?limit=${limit}&offset=${offset}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/notification.count", () => {
    let url = BASE_URL + `/api/notification.count`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/global.createProject", () => {
    const id = Math.random().toString(36).substring(7);
    createdProjects.push({ id, subprojects: [] });
    let url = BASE_URL + `/api/global.createProject`;
    let body = JSON.stringify({
      apiVersion,
      data: {
        project: {
          id,
          status: "open",
          displayName: "Build a town-project",
          description: "A town should be built",
          assignee: jdoe.identity,
          thumbnail: "/Thumbnail_0001.jpg",
          projectedBudgets: [
            {
              organization: "My Goverment Bank",
              value: "1000000",
              currencyCode: "EUR",
            },
          ],
          additionalData: {
            additionalProp1: {},
          },
          tags: ["test"],
        },
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const id =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let body = JSON.stringify({
      apiVersion,
      data: { identity: jdoe.identity, projectId: id },
    });

    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId:
          createdProjects[Math.floor(Math.random() * createdProjects.length)]
            .id,
        displayName: "new name",
        description: "new description",
        thumbnail: "string",
        additionalData: {},
        tags: [],
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "project.intent.listPermissions",
        projectId:
          createdProjects[Math.floor(Math.random() * createdProjects.length)]
            .id,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "project.intent.listPermissions",
        projectId:
          createdProjects[Math.floor(Math.random() * createdProjects.length)]
            .id,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.intent.listPermissions", () => {
    let projectId =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let url =
      BASE_URL + `/api/project.intent.listPermissions?projectId=${projectId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });

    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/project.list", () => {
    let url = BASE_URL + `/api/project.list`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/project.viewDetails", () => {
    let projectId =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let url = BASE_URL + `/api/project.viewDetails?projectId=${projectId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.viewHistory", () => {
    let offset = "0";
    let limit = "100000";
    let projectId =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let url =
      BASE_URL +
      `/api/project.viewHistory?projectId=${projectId}&limit=${limit}&offset=${offset}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/project.viewHistory.v2", () => {
    let offset = "0";
    let limit = "100000";
    let publisher = jdoe.identity;
    let projectId =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let url =
      BASE_URL +
      `/api/project.viewHistory.v2?projectId=${projectId}&limit=${limit}&offset=${offset}&publisher=${publisher}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/project.budget.updateProjected", () => {
    let url = BASE_URL + `/api/project.budget.updateProjected`;
    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId:
          createdProjects[Math.floor(Math.random() * createdProjects.length)]
            .id,
        organization: ORGANISATION,
        currencyCode: "EUR",
        value: "1",
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId:
          createdProjects[Math.floor(Math.random() * createdProjects.length)]
            .id,
        organization: ORGANISATION,
        currencyCode: "EUR",
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const id = createdProjects[pos].id;
    const subId = Math.random().toString(36).substring(7);
    createdProjects[pos].subprojects.push(subId);
    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId: id,

        subproject: {
          id: subId,
          status: "open",
          displayName: "townproject",
          description: "A town should be built",
          assignee: "aSmith",
          validator: "aSmith",
          workflowitemType: "general",
          currency: "EUR",
          projectedBudgets: [
            {
              organization: "My Goverment Bank",
              value: "1000000",
              currencyCode: "EUR",
            },
          ],
          additionalData: {
            additionalProp1: {},
          },
        },
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const id = createdProjects[pos].id;
    const subId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: { identity: mstein.identity, projectId: id, subprojectId: subId },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/subproject.list", () => {
    let projectId =
      createdProjects[Math.floor(Math.random() * createdProjects.length)].id;
    let url = BASE_URL + `/api/subproject.list?projectId=${projectId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/subproject.viewDetails", () => {
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let url =
      BASE_URL +
      `/api/subproject.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.viewHistory", () => {
    let offset = "0";
    let limit = "10000";
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let url =
      BASE_URL +
      `/api/subproject.viewHistory?projectId=${projectId}&subprojectId=${subprojectId}&limit=${limit}&offset=${offset}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.viewHistory.v2", () => {
    let offset = "0";
    let limit = "10000";
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let url =
      BASE_URL +
      `/api/subproject.viewHistory.v2?projectId=${projectId}&subprojectId=${subprojectId}&limit=${limit}&offset=${offset}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
  group("/api/subproject.intent.listPermissions", () => {
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let url =
      BASE_URL +
      `/api/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`;

    let request = http.get(url, {
      headers: { Authorization: `Bearer ${MSTEIN_TOKEN}` },
    });
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });

  group("/api/subproject.intent.grantPermission", () => {
    let url = BASE_URL + `/api/subproject.intent.grantPermission`;
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "subproject.viewDetails",
        projectId,
        subprojectId,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: {
        identity: jdoe.identity,
        intent: "subproject.viewDetails",
        projectId,
        subprojectId,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId,
        subprojectId,
        organization: ORGANISATION,
        currencyCode: "EUR",
        value: "23",
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: {
        displayName: "string",
        description: "string",
        additionalData: {},
        projectId,
        subprojectId,
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    const pos = Math.floor(Math.random() * createdProjects.length);
    const projectId = createdProjects[pos].id;
    const subprojectId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];

    let body = JSON.stringify({
      apiVersion,
      data: {
        projectId,
        subprojectId,
        organization: ORGANISATION,
        currencyCode: "EUR",
      },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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
    const pos = Math.floor(Math.random() * createdProjects.length);
    const id = createdProjects[pos].id;
    const subId =
      createdProjects[pos].subprojects[
        Math.floor(Math.random() * createdProjects[pos].subprojects.length)
      ];
    let body = JSON.stringify({
      apiVersion,
      data: { projectId: id, subprojectId: subId },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
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

    let body = JSON.stringify({
      apiVersion,
      data: { identity: jdoe.identity, projectId: id },
    });
    let params = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MSTEIN_TOKEN}`,
      },
    };
    let request = http.post(url, body, params);
    check(request, {
      "Default Response": (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);
  });
}
