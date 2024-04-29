describe("Project Assignee", function () {
  const executingUser = "mstein";
  const testUser = "jdoe";
  let projectId;
  let permissionsBeforeTesting;
  const apiRoute = "/api";
  const longUserId = `long_test_user_${Math.floor(Math.random() * 1000000)}`;
  const longUserName = "Testuser-with-a-very-very-very-very-very-very-long-name";

  before(() => {
    cy.login();
    cy.createProject("p-assign", "project assign test").then(({ id }) => {
      projectId = id;
    });
    cy.addUser(longUserName, longUserId, "test");
  });

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects/${projectId}`);
    permissionsBeforeTesting = { project: {} };
    cy.listProjectPermissions(projectId).then((permissions) => {
      permissionsBeforeTesting.project = permissions;
    });
    setupConfirmationDialog();
  });

  function revokeViewPermissions(permissions, projectId, assigneeId) {
    // Project
    if (permissions.project["project.viewDetails"].includes(assigneeId))
      cy.revokeProjectPermission(projectId, "project.viewDetails", assigneeId);
    if (permissions.project["project.list"].includes(assigneeId))
      cy.revokeProjectPermission(projectId, "project.list", assigneeId);
    cy.listProjectPermissions(projectId).then((p) => {
      permissions.project = p;
    });
    return permissions;
  }

  function assertViewPermissions(permissionsBeforeTesting, projectId, increased = false) {
    cy.listProjectPermissions(projectId).then((permissions) => {
      assert.equal(
        permissions["project.list"].length,
        increased
          ? permissionsBeforeTesting.project["project.list"].length + 1
          : permissionsBeforeTesting.project["project.list"].length,
      );
      assert.equal(
        permissions["project.viewDetails"].length,
        increased
          ? permissionsBeforeTesting.project["project.viewDetails"].length + 1
          : permissionsBeforeTesting.project["project.list"].length,
      );
    });
  }

  // Setup firstUncheckedRadioButton
  // Setup assigneeId
  function setupConfirmationDialog() {
    cy.get("[data-test=single-select]").click();
    cy.get("[data-test=single-select-list]")
      .should("exist")
      .find("[data-test=not-selected-item]")
      .first()
      .invoke("attr", "value")
      .as("assigneeId");

    cy.get("[data-test=single-select-list]")
      .should("exist")
      .then(($list) => {
        cy.wrap($list.find("input:not(:checked)").first()).as("firstUncheckedRadioButton");
      });

    cy.get("@assigneeId").then((assigneeId) => {
      cy.log(assigneeId);
      revokeViewPermissions(permissionsBeforeTesting, projectId, assigneeId);
    });
  }

  it("After selecting a new assignee, a confirmation dialog opens", function () {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("The confirmation dialog assigns the selected user and grants required view Permissions", function () {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    cy.get("[data-test=confirmation-dialog-confirm]").should("be.visible").click();
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("be.checked");
    });
    assertViewPermissions(permissionsBeforeTesting, projectId, true);
    // Reset permissions
    cy.get("@assigneeId").then((assigneeId) => {
      revokeViewPermissions(permissionsBeforeTesting, projectId, assigneeId);
    });
  });

  it("Canceling the confirmation dialog doesn't assign nor grant view permissions", function () {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible").click();
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });
    assertViewPermissions(permissionsBeforeTesting, projectId, false);
  });

  it("Assigning without project permission to grant view permissions is not possible", function () {
    cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");

    // Grant project.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser);
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", executingUser);
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });

    cy.wait("@listProjectPermissions");
    // Permission required Dialog should be open
    cy.get("[data-test='confirmation-dialog']")
      .find("h2")
      .should("be.visible")
      .should("contain", "Permissions required");

    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible").click();

    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });
    // Reset permissions
    cy.login(testUser, "test");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser);
  });

  it("Assigning without project 'list permissions'- permissions opens dialog viewing this information", function () {
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser);
    cy.revokeProjectPermission(projectId, "project.intent.listPermissions", executingUser);
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    cy.get("[data-test=confirmation-dialog-title]").should("be.visible").should("have.text", "Permissions required");
    cy.get("[data-test=confirmation-dialog-close]").should("be.visible").click();
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked");
    });

    cy.login(testUser, "test");
    cy.grantProjectPermission(projectId, "project.intent.listPermissions", executingUser);
  });

  it("All required project permissions and actions are shown", function () {
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    // 2 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 2);
    });
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 1);
    });
  });

  it("No additional permissions are shown if there aren't any", function () {
    cy.get("@assigneeId").then((assigneeId) => {
      cy.grantProjectPermission(projectId, "project.list", assigneeId);
      cy.grantProjectPermission(projectId, "project.viewDetails", assigneeId);
    });
    // Open dialog
    cy.get("@firstUncheckedRadioButton").then((firstUncheckedRadioButton) => {
      cy.get(firstUncheckedRadioButton).should("not.be.checked").check();
    });
    cy.get("[data-test=additional-actions]").should("not.exist");
    cy.get("[data-test=original-actions]").should("be.visible");
    // reset Permissions
    cy.get("@assigneeId").then((assigneeId) => {
      cy.revokeProjectPermission(projectId, "project.list", assigneeId);
      cy.revokeProjectPermission(projectId, "project.viewDetails", assigneeId);
    });
  });

  it(
    "The dropdown can be closed by pressing the close-button",
    {
      defaultCommandTimeout: 70000,
    },
    function () {
      cy.get("[data-test=single-select-list]").scrollIntoView().should("be.visible");
      cy.get("[data-test=close-select]").should("be.visible").click();
      cy.get("[data-test=single-select-list]").should("not.be.visible");
    },
  );

  it("If the assignee name is too long, an ellipses with tooltip is shown", function () {
    cy.get("[data-test=single-select-list]").should("be.visible");
    cy.get(`[data-test=single-select-name-${longUserId}]`).contains(longUserName).trigger("mouseover");
    // show tooltip
    cy.get("[data-test=overflow-tooltip]").should("be.visible").contains(longUserName);
  });
});
