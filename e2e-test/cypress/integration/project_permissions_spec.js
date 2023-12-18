import _cloneDeep from "lodash/cloneDeep";

const apiRoute = "/api";
const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House" };
const testUser2 = { id: "jdoe", displayname: "John Doe" };
let projectId, permissionsBeforeTesting;
const groupToGivePermissions = "reviewers";
const testGroupId = "admins";

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
    permissionsBeforeTesting = { project: {} };
    cy.listProjectPermissions(projectId).then(permissions => {
      permissionsBeforeTesting.project = permissions;
      resetUser(testUser.id, permissions);
      resetUser(groupToGivePermissions, permissions);
      resetUser(testGroupId, permissions);
    });
  });

  function resetUser(userId, permissions) {
    const intentsToRevoke = Object.keys(permissions).filter(intent => permissions[intent].includes(userId));
    intentsToRevoke.forEach(intent => cy.revokeProjectPermission(projectId, intent, userId));
  }

  function assertUnchangedPermissions(permissionsBeforeTesting, projectId) {
    cy.listProjectPermissions(projectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.project);
    });
  }

  function addViewPermissions(permissions, identity) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.list", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.project, "project.intent.listPermissions", identity);
    return permissionsCopy;
  }

  function addPermission(permissions, intent, identity) {
    if (!permissions[intent].includes(identity)) {
      permissions[intent].push(identity);
    }
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

  function additionalActionTableIncludes(permissionText) {
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 3)
        .find("td")
        .contains(permissionText)
        .should("have.length", 1);
    });
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
  }

  function filterPermissionsById(permissions, id) {
    return Object.keys(permissions).filter(intent => permissions[intent].includes(id));
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
    cy.get("[data-test=view-list]")
      .should("be.visible")
      .children()
      .find("span")
      .should("have.length", 3)
      .contains(executingUser.displayname);
    cy.get("[data-test=write-list]")
      .scrollIntoView()
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=write-list]")
      .should("be.visible")
      .children()
      .find("span")
      .should("have.length", 3)
      .contains(executingUser.displayname);
    cy.get("[data-test=admin-list]")
      .scrollIntoView()
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=admin-list]")
      .should("be.visible")
      .children()
      .find("span")
      .should("have.length", 2)
      .contains(executingUser.displayname);
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.exist");
  });

  it("Canceling the permission dialog doesn't revoke nor grant permissions ", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test=permission-close]").click();
    assertUnchangedPermissions(permissionsBeforeTesting, projectId);
  });

  it("Submitting the permission dialog without any changes doesn't revoke nor grant permissions and close the dialog", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=permission-container]").should("not.exist");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId);
  });

  it("Executing additional actions as normal user extended through group permissions", function() {
    Cypress.Promise.all([
      // grant permissions
      cy.grantProjectPermission(projectId, "project.list", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.grantPermission", testGroupId),
      cy.grantProjectPermission(projectId, "project.update", testGroupId)
    ]).then(() => {
      cy.login("jdoe", "test");
      cy.visit(`/projects`);
      cy.get(`[data-test=project-card-${projectId}]`)
        .find("button[data-test^='pp-button']")
        .click();
      // Add permission
      changePermissionInGui("project.intent.revokePermission", groupToGivePermissions);
      cy.get("[data-test=permission-submit]").click();
      // Confirmation opens
      // listPermissions calls are done
      // 3 additional actions
      cy.get("[data-test=additional-actions]").within(() => {
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 3);
      });
      // 1 original action
      cy.get("[data-test=original-actions]").within(() => {
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 1);
      });
      // Make sure cypress waits for future listPermissions calls
      cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listPermissions");
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      // Additional actions are executed
      cy.wait("@listPermissions");
      // Reset permissions
      Cypress.Promise.all([
        cy.login("mstein", "test"),
        cy.revokeProjectPermission(projectId, "project.intent.revokePermission", groupToGivePermissions),
        cy.revokeProjectPermission(projectId, "project.list", testGroupId),
        cy.revokeProjectPermission(projectId, "project.viewDetails", testGroupId),
        cy.revokeProjectPermission(projectId, "project.update", testGroupId),
        cy.revokeProjectPermission(projectId, "project.intent.grantPermission", testGroupId),
        cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testGroupId)
      ]).then(() => {
        assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, groupToGivePermissions), projectId);
      });
    });
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
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantProjectPermission(projectId, "project.list", testUser.id);
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test='permission-select-project.list']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Revoke a permission from myself is not allowed", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test='permission-select-project.list']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${executingUser.id}'] input`)
      .should("be.disabled");
  });

  it("Submitting the permission dialog without project.intent.grantPermission disables the submit button when adding user", function() {
    // Grant project.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser2.id);
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
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.exist");

    // Reset permissions
    cy.login(testUser2.id, "test");
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
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.exist");

    // Reset permissions
    cy.grantProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    // Grant project.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser2.id);
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

    cy.login(testUser2.id, "test");
    cy.grantProjectPermission(projectId, "project.intent.grantPermission", executingUser.id);
    cy.grantProjectPermission(projectId, "project.intent.revokePermission", executingUser.id);
  });

  it("Granting update permissions views 2 additional permissions needed", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // 2 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 2);
    });
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
  });

  it("Granting revoke permissions views 5 additional permissions needed including 'view permission'-permissions", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions");
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.viewDetails", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1)
        .find("td")
        .contains("view")
        .should("have.length", 1);
    });
  });

  it("Granting assign/grant/revoke permissions additionally generates an action to grant 'list permissions'-permissions", function() {
    // Check assign
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    changePermissionInGui("project.assign", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("project.assign", testUser.id);
    // Check grant
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("project.intent.grantPermission", testUser.id);
    // Check revoke
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions");
  });

  it("Confirmation of multiple grant permission changes grants permissions correctly", function() {
    cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listPermissions");
    cy.intercept(apiRoute + "/project.intent.grantPermission").as("grantPermission");

    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permissions
    changePermissionInGui("project.update", testUser.id);
    changePermissionInGui("project.viewDetails", testUser.id);
    changePermissionInGui("project.intent.listPermissions", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]").should("be.visible");

    cy.get("[data-test=confirmation-dialog-confirm]")
      .click()
      .wait("@grantPermission");
    // actions are executed
    cy.wait("@listPermissions");
    // Remove project.update permission
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    changePermissionInGui("project.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.wait("@listPermissions");
    // compare Permissions to check if additional permission are granted successfully
    assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId);
  });

  it("Confirmation of multiple revoke permission changes grants permissions correctly", function() {
    let permCopy;

    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testUser.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testUser.id),
      cy.grantProjectPermission(projectId, "project.update", testUser.id)
    ]).then(() => {
      cy.listProjectPermissions(projectId).then(permissions => {
        permissionsBeforeTesting.project = permissions;
        permCopy = _cloneDeep(permissionsBeforeTesting);

        cy.get(`[data-test=project-card-${projectId}]`)
          .find("button[data-test^='pp-button']")
          .click();
        // Remove permissions
        changePermissionInGui("project.update", testUser.id);
        changePermissionInGui("project.list", testUser.id);
        changePermissionInGui("project.viewDetails", testUser.id);
        changePermissionInGui("project.intent.listPermissions", testUser.id);
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listPermissions");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        // Original actions are executed
        cy.wait("@listPermissions");
        // Equal permissions
        permCopy.project = removePermission(permCopy.project, "project.update", testUser.id);
        permCopy.project = removePermission(permCopy.project, "project.list", testUser.id);
        permCopy.project = removePermission(permCopy.project, "project.viewDetails", testUser.id);
        permCopy.project = removePermission(permCopy.project, "project.intent.listPermissions", testUser.id);
        assertUnchangedPermissions(permCopy, projectId);
      });
    });
  });

  it("Grant group Permission and test if their users have them", function() {
    let filteredPermissions;
    Cypress.Promise.all([
      // grant permissions
      cy.grantProjectPermission(projectId, "project.list", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantProjectPermission(projectId, "project.update", testGroupId)
    ]).then(() => {
      // login as group-user
      cy.login("jdoe", "test");
      cy.visit(`/projects`);
      // load all permissions of this project
      cy.listProjectPermissions(projectId).then(permissions => {
        // filter for all permissions, that belongs to testgroup
        filteredPermissions = filterPermissionsById(permissions, testGroupId);
        // assert permissions
        let isPermissionSet =
          filteredPermissions.includes("project.list") &&
          filteredPermissions.includes("project.viewDetails") &&
          filteredPermissions.includes("project.intent.listPermissions") &&
          filteredPermissions.includes("project.update");
        cy.expect(isPermissionSet).to.equal(true);
      });
    });
  });

  it("The user selection dropdown can be closed by pressing the close-button", function() {
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    cy.get("[data-test='permission-select-project.list']").click();
    cy.get("[data-test='permission-list']").should("be.visible");
    cy.get("[data-test=close-select]")
      .should("be.visible")
      .click();
    cy.get("[data-test='permission-list']").should("not.exist");
  });

  it("Executing additional actions grant permissions correctly", function() {
    cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listPermissions");
    cy.intercept(apiRoute + "/project.intent.grantPermission").as("grantPermission");
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    // Add permission
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // 3 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 3);
    });
    // 1 original actions
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();
    cy.wait("@listPermissions");

    // Remove project.intent.revokePermission permission
    cy.get(`[data-test=project-card-${projectId}]`)
      .find("button[data-test^='pp-button']")
      .click();
    changePermissionInGui("project.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.wait("@listPermissions");
    // compare Permissions to check if additional permission are granted successfully
    assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId);
  });
});
