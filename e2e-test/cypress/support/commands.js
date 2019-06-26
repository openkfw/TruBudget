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

const baseUrl = Cypress.env("API_BASE_URL") || "/test";

let token = undefined;

Cypress.Commands.add("login", (username = "mstein", password = "test") => {
  cy.request({
    url: `${baseUrl}/api/user.authenticate`, // assuming you've exposed a seeds route
    method: "POST",
    body: {
      apiVersion: "1.0",
      data: { user: { id: username, password: password } }
    }
  })
    .its("body")
    .then(body => {
      const state = {
        login: {
          jwt: body.data.user.token,
          environment: "Test",
          productionActive: false,
          language: "en-gb",
          id: body.data.user.id,
          displayName: body.data.user.displayName,
          organization: body.data.user.organization,
          allowedIntents: body.data.user.allowedIntents
        }
      };
      localStorage.setItem("state", JSON.stringify(state));
      token = body.data.user.token;
    });
});

Cypress.Commands.add("addUser", (username, userId, password, organization = "KfW") => {
  cy.request({
    url: `${baseUrl}/api/global.createUser`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        user: {
          id: userId,
          displayName: username,
          organization: organization,
          password: password
        }
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body));
});

Cypress.Commands.add("fetchProjects", () => {
  cy.request({
    url: `${baseUrl}/api/project.list`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data.items));
});

Cypress.Commands.add("fetchSubprojects", projectId => {
  cy.request({
    url: `${baseUrl}/api/project.viewDetails?projectId=${projectId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data.subprojects));
});

Cypress.Commands.add("createWorkflowitem", (projectId, subprojectId, displayName, opts) => {
  cy.request({
    url: `${baseUrl}/api/subproject.createWorkflowitem`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        displayName: displayName,
        ...opts
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data.created));
});

Cypress.Commands.add(
  "createProject",
  (displayName, description, projectedBudgets, thumbnail = "/Thumbnail_0001.jpg") => {
    cy.request({
      url: `${baseUrl}/api/global.createProject`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        apiVersion: "1.0",
        data: {
          project: {
            displayName,
            description,
            projectedBudgets,
            thumbnail
          }
        }
      }
    })
      .its("body")
      .then(body => ({
        id: body.data.project.id
      }));
  }
);

Cypress.Commands.add("updateProjectAssignee", (projectId, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.assign`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        identity
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data));
});

Cypress.Commands.add("createSubproject", (projectId, displayName, currency = "EUR", opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/project.createSubproject`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subproject: {
          displayName,
          currency,
          ...opts
        }
      }
    }
  })
    .its("body")
    .then(body => ({
      id: body.data.subproject.id
    }));
});

Cypress.Commands.add("updateProjectPermissions", (projectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.intent.grantPermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data));
});

Cypress.Commands.add("grantUserPermissions", (userId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/user.intent.grantPermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        userId: userId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data));
});

Cypress.Commands.add("revokeUserPermissions", (userId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/user.intent.revokePermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        userId: userId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data));
});

Cypress.Commands.add("closeProject", projectId => {
  cy.request({
    url: `${baseUrl}/api/project.close`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId
      }
    }
  })
    .its("body")
    .then(body => Promise.resolve(body.data));
});
