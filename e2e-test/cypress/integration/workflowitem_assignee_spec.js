describe("Workflowitem Assignee", function() {
  const executingUser = "mstein";
  const testUser = "jdoe";
  let projectId;
  let subprojectId;
  let workflowitemId;
  let permissionsBeforeTesting;
  let baseUrl, apiRoute;

  before(() => {
    cy.login();
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.createProject("p-subp-assign", "workflowitem assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "workflowitem assign test").then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "workflowitem assign test").then(({ id }) => {
          workflowitemId = id;
        });
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    permissionsBeforeTesting = { project: {}, subproject: {} };
    cy.listProjectPermissions(projectId).then(permissions => {
      permissionsBeforeTesting.project = permissions;
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      permissionsBeforeTesting.subproject = permissions;
    });
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
      permissionsBeforeTesting.workflowitem = permissions;
    });
    setupConfirmationDialog();
  });

  function revokeViewPermissions(permissions, projectId, subprojectId, workflowitemId, assigneeId) {
    // Project
    if (permissions.project["project.viewDetails"].includes(assigneeId))
      cy.revokeProjectPermission(projectId, "project.viewDetails", assigneeId);
    if (permissions.project["project.viewSummary"].includes(assigneeId))
      cy.revokeProjectPermission(projectId, "project.viewSummary", assigneeId);
    cy.listProjectPermissions(projectId).then(p => {
      permissions.project = p;
    });
    // Subproject
    if (permissions.subproject["subproject.viewSummary"].includes(assigneeId))
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", assigneeId);
    if (permissions.subproject["subproject.viewDetails"].includes(assigneeId))
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", assigneeId);
    cy.listSubprojectPermissions(projectId, subprojectId).then(p => {
      permissions.subproject = p;
    });
    // Workflowitem
    if (permissions.workflowitem["workflowitem.view"].includes(assigneeId))
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(p => {
      permissions.workflowitem = p;
    });

    return permissions;
  }

  function assertViewPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId, increased = false) {
    // Project
    cy.listProjectPermissions(projectId).then(permissions => {
      assert.equal(
        permissions["project.viewSummary"].length,
        increased
          ? permissionsBeforeTesting.project["project.viewSummary"].length + 1
          : permissionsBeforeTesting.project["project.viewSummary"].length
      );
      assert.equal(
        permissions["project.viewDetails"].length,
        increased
          ? permissionsBeforeTesting.project["project.viewDetails"].length + 1
          : permissionsBeforeTesting.project["project.viewSummary"].length
      );
    });
    // Subproject
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      assert.equal(
        permissions["subproject.viewSummary"].length,
        increased
          ? permissionsBeforeTesting.subproject["subproject.viewSummary"].length + 1
          : permissionsBeforeTesting.subproject["subproject.viewSummary"].length
      );
      assert.equal(
        permissions["subproject.viewDetails"].length,
        increased
          ? permissionsBeforeTesting.subproject["subproject.viewDetails"].length + 1
          : permissionsBeforeTesting.subproject["subproject.viewDetails"].length
      );
    });
    // Workflowitem
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
      assert.equal(
        permissions["workflowitem.view"].length,
        increased
          ? permissionsBeforeTesting.workflowitem["workflowitem.view"].length + 1
          : permissionsBeforeTesting.workflowitem["workflowitem.view"].length
      );
    });
  }

  // Setup firstUncheckedRadioButton
  // Setup assigneeId
  function setupConfirmationDialog() {
    cy.get(`[data-test=workflowitem-assignee-${workflowitemId}]`).click();
    cy.get("[data-test=assignee-list]")
      .should("exist")
      .then($list => {
        const firstUncheckedRadioButton = $list.find("input:not(:checked)").first();
        cy.wrap($list.find("input:not(:checked)").first()).as("firstUncheckedRadioButton");
        cy.wrap(
          firstUncheckedRadioButton
            .parent()
            .parent()
            .parent()
        )
          .invoke("attr", "value")
          .as("assigneeId");
      });
    cy.get("@assigneeId").then(assigneeId => {
      revokeViewPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId, assigneeId);
    });
  }

  it("After selecting a new assignee, a confirmation dialog opens", function() {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("The confirmation dialog assigns the selected user and grants required view Permissions", function() {
    cy.server();
    cy.route("POST", apiRoute + "/workflowitem.assign*").as("assign");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetails");
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get("@assigneeId").then(assigneeId => {
        cy.get(firstUncheckedRadioButton)
          .should("not.be.checked")
          .check();
        cy.get("[data-test=confirmation-dialog-confirm]")
          .should("be.visible")
          .click();
        cy.get("[data-test=confirmation-dialog-confirm]")
          .should("be.visible")
          .click();

        // Check if right assignee in assignee list is checked
        cy.wait("@assign")
          .wait("@viewDetails")
          .get(`[data-test=workflowitem-assignee-${workflowitemId}]`)
          .click()
          .get(`[data-test=assignee-list] li[value=${assigneeId}] input`)
          .should("be.checked");
      });
    });

    assertViewPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId, true);

    // Reset permissions
    cy.get("@assigneeId").then(assigneeId => {
      revokeViewPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId, assigneeId);
    });
  });

  it("Canceling the confirmation dialog doesn't assign nor grant view permissions", function() {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-cancel]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    assertViewPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId, false);
  });

  it("Assigning without project permission to grant view permissions is not possible", function() {
    // Grant project/subproject.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser);
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", executingUser);
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-warning]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
    cy.get("[data-test=confirmation-dialog-cancel]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });
    // Reset permissions
    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser);
  });

  it("Assigning without subproject permission to grant view permissions is not possible", function() {
    // Grant subproject.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser);

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-warning]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
    cy.get("[data-test=confirmation-dialog-cancel]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser);
  });

  it("Assigning without workflowitem permission to grant view permissions is not possible", function() {
    // Grant workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      testUser
    );
    cy.revokeWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      executingUser
    );

    // Open the dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-warning]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
    cy.get("[data-test=confirmation-dialog-cancel]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      executingUser
    );
  });

  it("Assigning without project nor subproject nor workflowitem permission to grant view permissions is not possible", function() {
    // Grant project/subproject/workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser);
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      testUser
    );
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", executingUser);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser);
    cy.revokeWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      executingUser
    );

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-warning]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.disabled");
    cy.get("[data-test=confirmation-dialog-cancel]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser);
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.grantPermission",
      executingUser
    );
  });

  it("Assigning without project 'list permissions'- permissions opens dialog viewing this information", function() {
    cy.revokeProjectPermission(projectId, "project.intent.listPermissions", executingUser);

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-title]")
      .should("be.visible")
      .should("have.text", "Permissions required");
    cy.get("[data-test=confirmation-dialog-close]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.listPermissions", executingUser);
  });

  it("Assigning without subproject 'list permissions'- permissions opens dialog viewing this information", function() {
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", executingUser);

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-title]")
      .should("be.visible")
      .should("have.text", "Permissions required");
    cy.get("[data-test=confirmation-dialog-close]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", executingUser);
  });

  it("Assigning without workflowitem 'list permissions'- permissions opens dialog viewing this information", function() {
    cy.revokeWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.listPermissions",
      executingUser
    );

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-title]")
      .should("be.visible")
      .should("have.text", "Permissions required");
    cy.get("[data-test=confirmation-dialog-close]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.listPermissions",
      executingUser
    );
  });

  it("Assigning without project nor subproject nor workflowitem 'list permissions'- permissions opens dialog viewing this information", function() {
    cy.revokeProjectPermission(projectId, "project.intent.listPermissions", executingUser);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", executingUser);
    cy.revokeWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.listPermissions",
      executingUser
    );
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=confirmation-dialog-title]")
      .should("be.visible")
      .should("have.text", "Permissions required");
    cy.get("[data-test=confirmation-dialog-close]")
      .should("be.visible")
      .click();
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.listPermissions", executingUser);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", executingUser);
    cy.grantWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.listPermissions",
      executingUser
    );
  });

  it("All missing project/subproject/workflowitem permissions are shown", function() {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
  });

  it("Only missing project permissions are shown", function() {
    cy.get("@assigneeId").then(assigneeId => {
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", assigneeId);
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", assigneeId);
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 2);

    // reset Permissions
    cy.get("@assigneeId").then(assigneeId => {
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", assigneeId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", assigneeId);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });
  });

  it("Only missing subproject permissions are shown", function() {
    cy.get("@assigneeId").then(assigneeId => {
      cy.grantProjectPermission(projectId, "project.viewSummary", assigneeId);
      cy.grantProjectPermission(projectId, "project.viewDetails", assigneeId);
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 2);
    // Reset permissions
    cy.get("@assigneeId").then(assigneeId => {
      cy.revokeProjectPermission(projectId, "project.viewSummary", assigneeId);
      cy.revokeProjectPermission(projectId, "project.viewDetails", assigneeId);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });
  });

  it("No missing permissions are shown if there aren't any", function() {
    cy.get("@assigneeId").then(assigneeId => {
      cy.grantProjectPermission(projectId, "project.viewSummary", assigneeId);
      cy.grantProjectPermission(projectId, "project.viewDetails", assigneeId);
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", assigneeId);
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", assigneeId);
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });

    // Open dialog
    cy.get("@firstUncheckedRadioButton").then(firstUncheckedRadioButton => {
      cy.get(firstUncheckedRadioButton)
        .should("not.be.checked")
        .check();
    });
    cy.get("[data-test=actions-table-body]").should("not.be.visible");

    // reset Permissions
    cy.get("@assigneeId").then(assigneeId => {
      cy.revokeProjectPermission(projectId, "project.viewSummary", assigneeId);
      cy.revokeProjectPermission(projectId, "project.viewDetails", assigneeId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", assigneeId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", assigneeId);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", assigneeId);
    });
  });
});
