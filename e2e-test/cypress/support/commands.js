// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const baseUrl = Cypress.env("API_BASE_URL") || Cypress.config("baseUrl");

//let token = undefined;
let cookie = undefined;

beforeEach(() => {
  cy.intercept("**/*.jpeg", { statusCode: 200, body: "", headers: { "Content-Type": "image/jpeg" } });
  cy.intercept("**/*.jpg", { statusCode: 200, body: "", headers: { "Content-Type": "image/jpeg" } });
  cy.intercept("**/*.png", { statusCode: 200, body: "", headers: { "Content-Type": "image/png" } });
  cy.intercept("**/*.webp", { statusCode: 200, body: "", headers: { "Content-Type": "image/webp" } });
});

Cypress.Commands.add("login", (username = "mstein", password = "test", opts = { language: "en-gb" }) => {
  const loginRequest = (retries = 3) => {
    return cy
      .request({
        url: `${baseUrl}/api/user.authenticate`,
        method: "POST",
        failOnStatusCode: false, // do not fail on non 2xx or 3xx status codes
        body: {
          apiVersion: "1.0",
          data: { user: { id: username, password: password } },
        },
      })
      .then((response) => {
        if (response.status === 502 && retries > 0) {
          cy.wait(500);
          return loginRequest(retries - 1);
        } else if (response.status >= 400) {
          throw new Error(`Request failed with status ${response.status}`);
        } else {
          return response;
        }
      });
  };

  loginRequest().then((response) => {
    const state = {
      login: {
        isUserLoggedIn: true,
        environment: "Test",
        productionActive: false,
        id: response.body.data.user.id,
        displayName: response.body.data.user.displayName,
        organization: response.body.data.user.organization,
        allowedIntents: response.body.data.user.allowedIntents,
        ...opts,
      },
      overview: {
        limit: 100,
      },
    };
    localStorage.setItem("state", JSON.stringify(state));
    /*
     * The token is in the cookie header we need to extract it:
     */
    cookie = response.headers["set-cookie"][0];
    const JWTtoken = response.headers["set-cookie"][0].split(";")[0].replace("token=", "");

    cy.setCookie("token", JWTtoken);
  });
});

Cypress.Commands.add("addUser", (username, userId, password, organization = "KfW") => {
  cy.request({
    url: `${baseUrl}/api/global.createUser`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        user: {
          id: userId,
          displayName: username,
          organization: organization,
          password: password,
        },
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body));
});

Cypress.Commands.add("fetchProjects", () => {
  cy.request({
    url: `${baseUrl}/api/project.list`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data.items));
});

Cypress.Commands.add("fetchSubprojects", (projectId) => {
  cy.request({
    url: `${baseUrl}/api/project.viewDetails?projectId=${projectId}`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data.subprojects));
});

Cypress.Commands.add("createWorkflowitem", (projectId, subprojectId, displayName, opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/subproject.createWorkflowitem`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        displayName: displayName,
        amountType: "N/A",
        ...opts,
      },
    },
  })
    .its("body")
    .then((body) =>
      Cypress.Promise.resolve({
        id: body.data.workflowitem.id,
      }),
    );
});

Cypress.Commands.add(
  "createProject",
  (displayName, description, projectedBudgets, thumbnail = "/Thumbnail_0001.jpg", opts = {}) => {
    cy.request({
      url: `${baseUrl}/api/global.createProject`,
      method: "POST",
      headers: {
        Cookie: cookie,
      },
      body: {
        apiVersion: "1.0",
        data: {
          project: {
            displayName,
            description,
            projectedBudgets,
            thumbnail,
            ...opts,
          },
        },
      },
    })
      .its("body")
      .then((body) =>
        Cypress.Promise.resolve({
          id: body.data.project.id,
        }),
      );
  },
);

Cypress.Commands.add("updateProject", (projectId, opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/project.update`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        ...opts,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateProjectAssignee", (projectId, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.assign`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        identity,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateSubprojectAssignee", (projectId, subprojectId, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.assign`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        identity,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateWorkflowitemAssignee", (projectId, subprojectId, workflowitemId, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.assign`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("createSubproject", (projectId, displayName, currency = "EUR", opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/project.createSubproject`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subproject: {
          displayName,
          currency,
          ...opts,
        },
      },
    },
  })
    .its("body")
    .then((body) =>
      Cypress.Promise.resolve({
        id: body.data.subproject.id,
      }),
    );
});

Cypress.Commands.add("grantProjectPermission", (projectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.intent.grantPermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeProjectPermission", (projectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.intent.revokePermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("grantSubprojectPermission", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.grantPermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeSubprojectPermission", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.revokePermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("grantWorkflowitemPermission", (projectId, subprojectId, workflowitemId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.grantPermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        workflowitemId: workflowitemId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeWorkflowitemPermission", (projectId, subprojectId, workflowitemId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.revokePermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        workflowitemId: workflowitemId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateSubprojectPermissions", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.grantPermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("grantUserPermissions", (userId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/user.intent.grantPermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        userId: userId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeUserPermissions", (userId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/user.intent.revokePermission`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        userId: userId,
        identity: identity,
        intent: intent,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("closeProject", (projectId) => {
  cy.request({
    url: `${baseUrl}/api/project.close`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("closeSubproject", (projectId, subprojectId) => {
  cy.request({
    url: `${baseUrl}/api/subproject.close`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("closeWorkflowitem", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.close`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateWorkflowitem", (projectId, subprojectId, workflowitemId, opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.update`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        ...opts,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("reorderWorkflowitems", (projectId, subprojectId, ordering) => {
  cy.request({
    url: `${baseUrl}/api/subproject.reorderWorkflowitems`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        ordering,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("assignWorkflowitem", (projectId, subprojectId, workflowitemId, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.assign`,
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity,
      },
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("getUserList", () => {
  cy.request({
    url: `${baseUrl}/api/user.list`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data.items));
});

Cypress.Commands.add("listProjectPermissions", (projectId) => {
  cy.request({
    url: `${baseUrl}/api/project.intent.listPermissions?projectId=${projectId}`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("listSubprojectPermissions", (projectId, subprojectId) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("listWorkflowitemPermissions", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("listWorkflowitems", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("createBackup", () => {
  cy.request({
    url: `${baseUrl}/api/system.createBackup`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
    timeout: 60000,
  })
    .its("headers")
    .then((headers) => Cypress.Promise.resolve(headers));
});

Cypress.Commands.add("getVersion", () => {
  cy.request({
    url: `${baseUrl}/api/version`,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
    timeout: 60000,
  })
    .its("body")
    .then((body) => Cypress.Promise.resolve(body.data));
});
