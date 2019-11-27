import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House" };
let projectId;
let permissionsBeforeTesting;

describe("Project Permissions", function() {
  before(() => {
    cy.login();
    cy.createProject("p-subp-assign", "subproject assign test").then(({ id }) => {
      projectId = id;
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
    permissionsBeforeTesting = { project: {}, subproject: {} };
    cy.listProjectPermissions(projectId).then(permissions => {
      permissionsBeforeTesting.project = permissions;
      resetUser(testUser.id, permissions);
    });
  });

  function resetUser(userId, permissions) {
    const intentsToRevoke = Object.keys(permissions).filter(intent => permissions[intent].includes(userId));
    intentsToRevoke.forEach(intent => cy.revokeProjectPermission(projectId, intent, userId));
  }

  function checkPermissionsEquality(permissionsBeforeTesting, projectId) {
    cy.listProjectPermissions(projectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.project);
    });
  }

  function addViewPermissions(permissions, identity) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.viewSummary", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.project, "project.intent.listPermissions", identity);
    return permissionsCopy;
  }

  function addPermission(permissions, intent, identity) {
    permissions[intent].push(identity);
    return permissions;
  }
  function removePermission(permissions, intent, identity) {
    permissions[intent] = permissions[intent].filter(id => {
      return id !== identity;
    });
    return permissions;
  }

  function changePermissionInGui(intent, identity) {
    cy.get(`[data-test='permission-select-${intent}']`).click();
    cy.get("[data-test=permission-list]")
      .find(`li[value*='${identity}']`)
      .click()
      .type("{esc}");
  }

  function actionTableIncludes(permissionText) {
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 3)
      .find("td")
      .contains(permissionText)
      .should("have.length", 1);
  }

  it("Show project permissions correctly", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      // select all buttons which has an attribute data-test which value begins with pp-button
      .find("button[data-test^='pp-button']")
      .click();

    cy.get("[data-test=view-list]")
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=write-list]")
      .scrollIntoView()
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=admin-list]")
      .scrollIntoView()
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Canceling the permission dialog doesn't revoke nor grant permissions ", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test=permission-close]").click();
    checkPermissionsEquality(permissionsBeforeTesting, projectId);
  });

  it("Submitting the permission dialog without any changes doesn't revoke nor grant permissions and close the dialog", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
    checkPermissionsEquality(permissionsBeforeTesting, projectId);
  });

  it("Submitting the permission dialog after adding a user opens a confirmation dialog", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test='permission-select-project.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id);
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test='permission-select-project.viewSummary']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog without project.intent.grantPermission disables the submit button when adding user", function() {
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", executingUser.id);

    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Remove permission
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser.id);
  });

  it("Submitting the permission dialog without project.intent.revokePermission disables the submit button when removing user", function() {
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser.id);
    cy.revokeProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);

    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Remove permission
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Add permission
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.grantProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", executingUser.id);
    cy.revokeProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);

    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get(`[data-test='permission-select-project.viewDetails']`).click();
    cy.get("[data-test=read-only-permissions-text]").should("be.visible");
    cy.get("[data-test=permission-list]")
      .find(`li[value*='${testUser.id}']`)
      .find("input")
      .should("be.disabled");

    cy.login("root", "root-secret");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser.id);
    cy.grantProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);
  });

  it("Granting update permissions views 4 additional permissions needed", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 2);
  });

  it("Granting revoke permissions views 5 additional permissions needed including 'view permission'-permissions", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    actionTableIncludes("view permissions");
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.viewDetails", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 1)
      .find("td")
      .contains("view summary")
      .should("have.length", 1);
  });

  it("Executing additional actions grant permissions correctly", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 3);
    cy.get("[data-test=confirmation-dialog-confirm]")
      .click()
      .should("be.not.disabled")
      .then(() => {
        checkPermissionsEquality(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId);
      });

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id)
    ]);
  });

  it("Granting assign/grant/revoke permissions additionally generates an action to grant 'list permissions'-permissions", function() {
    // Check assign
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    changePermissionInGui("project.assign", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    actionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("project.assign", testUser.id);
    // Check grant
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    actionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    // Check revoke
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    actionTableIncludes("view permissions");

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.revokePermission", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.grantPermission", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser.id),
      cy.revokeProjectPermission(projectId, "project.assign", testUser.id)
    ]);
  });

  it("Confirmation of multiple grant permission changes grants permissions correctly", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permissions
    changePermissionInGui("project.update", testUser.id);
    changePermissionInGui("project.viewDetails", testUser.id);
    changePermissionInGui("project.intent.listPermissions", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=actions-table-body]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-confirm]")
      .click()
      .should("be.not.disabled")
      .click()
      .then(() => {
        let permissions = addViewPermissions(permissionsBeforeTesting, testUser.id);
        permissions.project["project.update"].push(testUser.id);
        checkPermissionsEquality(permissions, projectId);
      });

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.update", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser.id)
    ]);
  });

  it("Confirmation of multiple revoke permission changes grants permissions correctly", function() {
    let permissionsCopy;

    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testUser.id),
      cy.grantProjectPermission(projectId, "project.update", testUser.id)
    ]).then(() => {
      cy.listProjectPermissions(projectId).then(permissions => {
        permissionsBeforeTesting.project = permissions;
        permissionsCopy = _cloneDeep(permissionsBeforeTesting);

        cy.get(`[data-test=project-card-${projectId}]`)
          .find("button[data-test^='pp-button']")
          .click();
        // Remove permissions
        changePermissionInGui("project.update", testUser.id);
        changePermissionInGui("project.viewSummary", testUser.id);
        changePermissionInGui("project.viewDetails", testUser.id);
        changePermissionInGui("project.intent.listPermissions", testUser.id);
        cy.get("[data-test=permission-submit]").click();
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        cy.get("[data-test=permission-submit]").should("not.be.visible");

        // Equal permissions
        permissionsCopy.project = removePermission(permissionsCopy.project, "project.update", testUser.id);
        permissionsCopy.project = removePermission(permissionsCopy.project, "project.viewSummary", testUser.id);
        permissionsCopy.project = removePermission(permissionsCopy.project, "project.viewDetails", testUser.id);
        permissionsCopy.project = removePermission(
          permissionsCopy.project,
          "project.intent.listPermissions",
          testUser.id
        );

        checkPermissionsEquality(permissionsCopy, projectId);
      });
    });
  });
});
