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

Cypress.Commands.add("login", (username = "mstein", password = "test", opts = { language: "en-gb" }) => {
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
          id: body.data.user.id,
          displayName: body.data.user.displayName,
          organization: body.data.user.organization,
          allowedIntents: body.data.user.allowedIntents,
          ...opts
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
    .then(body => Cypress.Promise.resolve(body));
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
    .then(body => Cypress.Promise.resolve(body.data.items));
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
    .then(body => Cypress.Promise.resolve(body.data.subprojects));
});

Cypress.Commands.add("createWorkflowitem", (projectId, subprojectId, displayName, opts = {}) => {
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
        amountType: "N/A",
        ...opts
      }
    }
  })
    .its("body")
    .then(body =>
      Cypress.Promise.resolve({
        id: body.data.workflowitem.id
      })
    );
});

Cypress.Commands.add(
  "createProject",
  (displayName, description, projectedBudgets, thumbnail = "/Thumbnail_0001.jpg", opts = {}) => {
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
            thumbnail,
            ...opts
          }
        }
      }
    })
      .its("body")
      .then(body =>
        Cypress.Promise.resolve({
          id: body.data.project.id
        })
      );
  }
);

Cypress.Commands.add("updateProject", (projectId, opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/project.update`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        ...opts
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

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
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateSubprojectAssignee", (projectId, subprojectId, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.assign`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        identity
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateWorkflowitemAssignee", (projectId, subprojectId, workflowitemId, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.assign`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
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
    .then(body =>
      Cypress.Promise.resolve({
        id: body.data.subproject.id
      })
    );
});

Cypress.Commands.add("grantProjectPermission", (projectId, intent, identity) => {
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
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeProjectPermission", (projectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/project.intent.revokePermission`,
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
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("grantSubprojectPermission", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.grantPermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeSubprojectPermission", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.revokePermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("grantWorkflowitemPermission", (projectId, subprojectId, workflowitemId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.grantPermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        workflowitemId: workflowitemId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("revokeWorkflowitemPermission", (projectId, subprojectId, workflowitemId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.revokePermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        workflowitemId: workflowitemId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateSubprojectPermissions", (projectId, subprojectId, intent, identity) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.grantPermission`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId: projectId,
        subprojectId: subprojectId,
        identity: identity,
        intent: intent
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
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
    .then(body => Cypress.Promise.resolve(body.data));
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
    .then(body => Cypress.Promise.resolve(body.data));
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
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("closeWorkflowitem", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.close`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("updateWorkflowitem", (projectId, subprojectId, workflowitemId, opts = {}) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.update`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        ...opts
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("reorderWorkflowitems", (projectId, subprojectId, ordering) => {
  cy.request({
    url: `${baseUrl}/api/subproject.reorderWorkflowitems`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        ordering
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("assignWorkflowitem", (projectId, subprojectId, workflowitemId, identity) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.assign`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity
      }
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("getUserList", () => {
  cy.request({
    url: `${baseUrl}/api/user.list`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data.items));
});

Cypress.Commands.add("listProjectPermissions", projectId => {
  cy.request({
    url: `${baseUrl}/api/project.intent.listPermissions?projectId=${projectId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});
Cypress.Commands.add("listSubprojectPermissions", (projectId, subprojectId) => {
  cy.request({
    url: `${baseUrl}/api/subproject.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});
Cypress.Commands.add("listWorkflowitemPermissions", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.intent.listPermissions?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});

Cypress.Commands.add("listWorkflowitems", (projectId, subprojectId, workflowitemId) => {
  cy.request({
    url: `${baseUrl}/api/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .its("body")
    .then(body => Cypress.Promise.resolve(body.data));
});
Cypress.Commands.add("createBackup", () => {
  cy.request({
    url: `${baseUrl}/api/system.createBackup`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 60000
  })
    .its("headers")
    .then(headers => Cypress.Promise.resolve(headers));
});
