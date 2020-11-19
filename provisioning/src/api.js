const { withRetry } = require("./lib");

const authenticate = async (axios, userId, password) => {
  const response = await withRetry(() =>
    axios.post("/user.authenticate", {
      user: {
        id: userId,
        password,
      },
    })
  );
  const body = response.data;
  if (body.apiVersion !== "1.0") throw Error("unexpected API version");
  return body.data.user.token;
};

const createUser = async (axios, user, organization) => {
  await withRetry(() => {
    return axios.post("/global.createUser", {
      user: {
        ...user,
        organization,
      },
    });
  });
};

const createGroup = async (axios, group) => {
  await withRetry(() =>
    axios.post("/global.createGroup", {
      group: {
        ...group,
      },
    })
  );
};

const addUserToGroup = async (axios, groupId, userId) => {
  await withRetry(() =>
    axios.post("/group.addUser", {
      groupId,
      userId,
    })
  );
};

const removeUserFromGroup = async (axios, groupId, userId) => {
  await withRetry(() =>
    axios.post("/group.removeUser", {
      groupId,
      userId,
    })
  );
};

const grantGlobalPermissionToUser = async (axios, intent, userId) => {
  return await withRetry(() =>
    axios.post("/global.grantPermission", {
      intent,
      identity: userId,
    })
  );
};

const grantAllPermissionsToUser = async (axios, userId) => {
  return await withRetry(() =>
    axios.post("/global.grantAllPermissions", {
      identity: userId,
    })
  );
};

const createProject = async (axios, projectTemplate) => {
  const args = {
    ...projectTemplate,
  };
  delete args.permissions;
  delete args.subprojects;
  await withRetry(() =>
    axios.post("/global.createProject", {
      project: {
        ...args,
        status: "open", // otherwise we won't be able to add subprojects
      },
    })
  );
};

const assignProject = async (axios, projectId, assignee) => {
  await withRetry(() =>
    axios.post("/project.assign", {
      projectId: projectId,
      identity: assignee,
    })
  );
};

const closeProject = async (axios, project) => {
  await withRetry(() =>
    axios.post("/project.close", {
      projectId: project.data.id,
    })
  );
};

const createSubproject = async (axios, project, subprojectTemplate) => {
  const args = {
    ...subprojectTemplate,
  };
  delete args.permissions;
  delete args.workflows;
  await withRetry(() =>
    axios.post("/project.createSubproject", {
      projectId: project.data.id,
      subproject: {
        ...args,
        description: "FAILED UPDATE?",
        status: "open", // otherwise we won't be able to add workflowitems
      },
    })
  );
};

const updateProject = async (axios, projectId, description) => {
  await withRetry(() =>
    axios.post("/project.update", {
      projectId: projectId,
      description: description || "",
    })
  );
};

const assignSubproject = async (axios, projectId, subprojectId, assignee) => {
  await withRetry(() =>
    axios.post("/subproject.assign", {
      projectId: projectId,
      subprojectId: subprojectId,
      identity: assignee,
    })
  );
};

const updateSubproject = async (
  axios,
  projectId,
  subprojectId,
  description
) => {
  await withRetry(() =>
    axios.post("/subproject.update", {
      projectId: projectId,
      subprojectId: subprojectId,
      description: description || "",
    })
  );
};
const closeSubproject = async (axios, projectId, subprojectId) => {
  await withRetry(() =>
    axios.post("/subproject.close", {
      projectId: projectId,
      subprojectId: subprojectId,
    })
  );
};

const createWorkflowitem = async (axios, data) => {
  await withRetry(() => axios.post("/subproject.createWorkflowitem", data));
};

const updateWorkflowitem = async (
  axios,
  projectId,
  subprojectId,
  workflowitemId,
  description
) => {
  await withRetry(() =>
    axios.post("/workflowitem.update", {
      projectId: projectId,
      subprojectId: subprojectId,
      workflowitemId: workflowitemId,
      description: description || "",
    })
  );
};

const closeWorkflowitem = async (
  axios,
  projectId,
  subprojectId,
  workflowitemId
) => {
  await withRetry(() =>
    axios.post("/workflowitem.close", {
      projectId: projectId,
      subprojectId: subprojectId,
      workflowitemId: workflowitemId,
    })
  );
};

const assignWorkflowitem = async (
  axios,
  projectId,
  subprojectId,
  workflowitemId,
  assignee
) => {
  await withRetry(() =>
    axios.post("/workflowitem.assign", {
      projectId: projectId,
      subprojectId: subprojectId,
      workflowitemId: workflowitemId,
      identity: assignee,
    })
  );
};

const findProject = async (axios, projectTemplate) => {
  return await withRetry(() =>
    axios
      .get("/project.list")
      .then((res) => res.data.data.items)
      .then((projects) =>
        projects.find((p) => p.data.displayName === projectTemplate.displayName)
      )
      .catch((err) => {
        console.error(err);
        process.exit(1);
      })
  );
};

const findSubproject = async (axios, project, subprojectTemplate) => {
  return await withRetry(() =>
    axios
      .get(`/subproject.list?projectId=${project.data.id}`)
      .then((res) => res.data.data.items)
      .then((subprojects) =>
        subprojects.find(
          (x) => x.data.displayName === subprojectTemplate.displayName
        )
      )
  );
};

const findWorkflowitem = async (
  axios,
  project,
  subproject,
  workflowitemTemplate
) => {
  return await withRetry(() =>
    axios
      .get(
        `/workflowitem.list?projectId=${project.data.id}&subprojectId=${subproject.data.id}`
      )
      .then((res) => res.data.data.workflowitems)
      .then((items) =>
        items.find(
          (item) => item.data.displayName === workflowitemTemplate.displayName
        )
      )
  );
};
const grantPermissions = async (
  axios,
  permissions,
  projectId,
  subprojectId,
  workflowitemId
) => {
  if (permissions === undefined) return;

  let url;
  let body;
  if (workflowitemId !== undefined) {
    url = "/workflowitem.intent.grantPermission";
    body = {
      projectId,
      subprojectId,
      workflowitemId,
    };
  } else if (subprojectId !== undefined) {
    url = "/subproject.intent.grantPermission";
    body = {
      projectId,
      subprojectId,
    };
  } else if (projectId !== undefined) {
    url = "/project.intent.grantPermission";
    body = {
      projectId,
    };
  } else {
    throw Error("not even projectId is given..");
  }

  console.log("... check permissions before granting");
  for (const [intent, users] of Object.entries(permissions)) {
    for (const userId of users) {
      await withRetry(() =>
        axios.post(url, {
          ...body,
          intent,
          identity: userId,
        })
      );
    }
  }
};

const revokeProjectPermission = async (axios, projectId, userId, intent) => {
  await withRetry(() =>
    axios.post("/project.intent.revokePermission", {
      projectId: projectId,
      identity: userId,
      intent: intent,
    })
  );
};
const queryApiDoc = async (axios) => {
  return await withRetry(() => axios.get("/documentation"));
};

module.exports = {
  authenticate,
  createUser,
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  grantGlobalPermissionToUser,
  grantAllPermissionsToUser,
  createProject,
  assignProject,
  closeProject,
  createSubproject,
  updateProject,
  assignSubproject,
  updateSubproject,
  closeSubproject,
  createWorkflowitem,
  updateWorkflowitem,
  closeWorkflowitem,
  assignWorkflowitem,
  findProject,
  findSubproject,
  findWorkflowitem,
  grantPermissions,
  revokeProjectPermission,
  queryApiDoc,
};
