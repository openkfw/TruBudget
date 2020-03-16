import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House" };
const testGroupId = "admins";
const groupToGivePermissions = "reviewers";
let projectId, subprojectId, permissionsBeforeTesting, baseUrl, apiRoute;
const subprojectDisplayname = "subproject assign test";

describe("Subproject Permissions", function() {
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login();
    cy.createProject("p-subp-assign", "subproject assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, subprojectDisplayname).then(({ id }) => {
        subprojectId = id;
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}`);
    permissionsBeforeTesting = { project: {}, subproject: {} };
    cy.listProjectPermissions(projectId).then(permissions => {
      permissionsBeforeTesting.project = permissions;
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      permissionsBeforeTesting.subproject = permissions;
      resetUser(testUser.id, permissions);
    });
  });

  function resetUser(userId, permissions) {
    const intentsToRevoke = Object.keys(permissions).filter(intent => permissions[intent].includes(userId));
    intentsToRevoke.forEach(intent => cy.revokeProjectPermission(projectId, intent, userId));
  }

  function assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId) {
    cy.listProjectPermissions(projectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.project);
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.subproject);
    });
  }

  function addViewPermissions(permissions, identity) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.viewSummary", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.subproject, "subproject.viewSummary", identity);
    addPermission(permissionsCopy.subproject, "subproject.viewDetails", identity);
    addPermission(permissionsCopy.subproject, "subproject.intent.listPermissions", identity);
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
      .should("have.length", 5)
      .find("td")
      .contains(permissionText)
      .should("have.length", 1);
  }

  function filterPermissionsById(permissions, id) {
    return Object.keys(permissions).filter(intent => permissions[intent].includes(id));
  }

  it("Show subproject permissions correctly", function() {
    cy.get("[data-test=spp-button-0]").click();
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
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-close]").click();
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
  });

  it("Submitting the permission dialog without any changes doesn't revoke nor grant permissions and close the dialog", function() {
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=permission-container]").should("not.be.visible");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
  });

  it("Submitting the permission dialog after adding a user opens a confirmation dialog", function() {
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id);
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test='permission-select-subproject.viewSummary']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id);
  });

  it("Submitting the permission dialog without subproject.intent.grantPermission disables the submit button when adding user", function() {
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser.id);

    cy.get("[data-test=spp-button-0]").click();
    // Add permission
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Remove permission
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.login("root", "root-secret");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser.id);
  });

  it("Submitting the permission dialog without subproject.intent.revokePermission disables the submit button when removing user", function() {
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.revokePermission", executingUser.id);

    cy.get("[data-test=spp-button-0]").click();
    // Remove permission
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Add permission
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.revokePermission", executingUser.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser.id);
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.revokePermission", executingUser.id);

    cy.get("[data-test=spp-button-0]").click();
    cy.get(`[data-test='permission-select-subproject.viewDetails']`).click();
    cy.get("[data-test=read-only-permissions-text]").should("be.visible");
    cy.get("[data-test=permission-list]")
      .find(`li[value*='${testUser.id}']`)
      .find("input")
      .should("be.disabled");

    cy.login("root", "root-secret");
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser.id);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.revokePermission", executingUser.id);
  });

  it("Granting update permissions views 4 additional permissions needed", function() {
    cy.get("[data-test=spp-button-0]").click();
    // Add permission
    changePermissionInGui("subproject.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 4);
  });

  it("Granting revoke permissions views 5 additional permissions needed including 'view permission'-permissions", function() {
    cy.get("[data-test=spp-button-0]").click();
    // Add permission
    changePermissionInGui("subproject.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions");
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
    cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id);

    cy.get("[data-test=spp-button-0]").click();
    // Add permission
    changePermissionInGui("subproject.viewDetails", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 1)
      .find("td")
      .contains("view summary")
      .should("have.length", 1);

    //Reset permissions
    cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id);
    cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id);
  });

  it("Executing additional actions grant permissions correctly", function() {
    cy.get("[data-test=spp-button-0]").click();
    // Add permission
    changePermissionInGui("subproject.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // listPermissions calls are done
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
    // Make sure cypress waits for future listPermissions calls
    cy.server();
    cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);
    assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId, subprojectId);

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser.id)
    ]);
  });

  it("Executing additional actions as normal user extended through group permissions", function() {
    Cypress.Promise.all([
      // grant permissions to testgroup
      cy.grantProjectPermission(projectId, "project.viewSummary", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testGroupId)
    ]).then(() => {
      // user from testgroup grant other group some permission
      cy.login("jdoe", "test");
      cy.get("[data-test=spp-button-0]").click();
      // Add permission
      changePermissionInGui("subproject.intent.revokePermission", groupToGivePermissions);
      cy.get("[data-test=permission-submit]").click();
      // Confirmation opens
      // listPermissions calls are done
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 5);
      // Make sure cypress waits for future listPermissions calls
      cy.server();
      cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
      cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);

      // Reset permissions of testgroup
      Cypress.Promise.all([
        cy.login("mstein", "test"),
        cy.revokeProjectPermission(projectId, "project.viewSummary", testGroupId),
        cy.revokeProjectPermission(projectId, "project.viewDetails", testGroupId),
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testGroupId),
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testGroupId)
      ]).then(() => {
        assertUnchangedPermissions(
          addViewPermissions(permissionsBeforeTesting, groupToGivePermissions),
          projectId,
          subprojectId
        );
      });
    });
  });

  it("Granting assign/grant/revoke permissions additionally generates an action to grant 'list permissions'-permissions", function() {
    // Check assign
    cy.get("[data-test=spp-button-0]").click();
    changePermissionInGui("subproject.assign", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("subproject.assign", testUser.id);
    // Check grant
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions");
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("subproject.intent.grantPermission", testUser.id);
    // Check revoke
    changePermissionInGui("subproject.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions");
  });

  it("Confirmation of multiple grant permission changes grants permissions correctly", function() {
    cy.get("[data-test=spp-button-0]").click();
    // Add permissions
    changePermissionInGui("subproject.update", testUser.id);
    changePermissionInGui("subproject.createWorkflowitem", testUser.id);
    changePermissionInGui("subproject.viewSummary", testUser.id);
    changePermissionInGui("subproject.viewDetails", testUser.id);
    changePermissionInGui("subproject.intent.listPermissions", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]").should("be.visible");
    cy.server();
    cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    // Additional actions are executed
    cy.wait("@listProjectPermissions");
    cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.not.disabled")
      .click();
    // Original actions are executed
    cy.get("[data-test=permission-submit]").should("not.be.visible");
    cy.wait("@listSubprojectPermissions");
    let permissions = addViewPermissions(permissionsBeforeTesting, testUser.id);
    permissions.subproject["subproject.update"].push(testUser.id);
    permissions.subproject["subproject.createWorkflowitem"].push(testUser.id);
    assertUnchangedPermissions(permissions, projectId, subprojectId);

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.update", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser.id)
    ]);
  });

  it("Confirmation of multiple revoke permission changes grants permissions correctly", function() {
    let permissionsCopy;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.update", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser.id)
    ]).then(() => {
      cy.listProjectPermissions(projectId).then(permissions => {
        permissionsBeforeTesting.project = permissions;
      });
      cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
        permissionsBeforeTesting.subproject = permissions;

        permissionsCopy = _cloneDeep(permissionsBeforeTesting);
        cy.get("[data-test=spp-button-0]").click();
        // Remove permissions
        changePermissionInGui("subproject.update", testUser.id);
        changePermissionInGui("subproject.createWorkflowitem", testUser.id);
        changePermissionInGui("subproject.viewSummary", testUser.id);
        changePermissionInGui("subproject.viewDetails", testUser.id);
        changePermissionInGui("subproject.intent.listPermissions", testUser.id);
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        cy.get("[data-test=confirmation-dialog-confirm]").should("be.visible");
        cy.server();
        cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        // Original actions are executed
        cy.get("[data-test=permission-submit]").should("not.be.visible");
        cy.wait("@listSubprojectPermissions");
        // Equal permissions
        permissionsCopy.subproject = removePermission(permissionsCopy.subproject, "subproject.update", testUser.id);
        permissionsCopy.subproject = removePermission(
          permissionsCopy.subproject,
          "subproject.createWorkflowitem",
          testUser.id
        );
        permissionsCopy.subproject = removePermission(
          permissionsCopy.subproject,
          "subproject.viewSummary",
          testUser.id
        );
        permissionsCopy.subproject = removePermission(
          permissionsCopy.subproject,
          "subproject.viewDetails",
          testUser.id
        );
        permissionsCopy.subproject = removePermission(
          permissionsCopy.subproject,
          "subproject.intent.listPermissions",
          testUser.id
        );

        assertUnchangedPermissions(permissionsCopy, projectId, subprojectId);

        // Reset permissions
        cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id);
        cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id);
      });
    });
  });

  it("Grant group Permission and test if their users have them", function() {
    let filteredSubProjectPermissions, isSubProjectPermissionSet;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.viewSummary", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.update", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testGroupId)
    ]).then(() => {
      // login as group-user
      cy.login("jdoe", "test");
      cy.visit(`/projects`);

      cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
        filteredSubProjectPermissions = filterPermissionsById(permissions, testGroupId);
        isSubProjectPermissionSet =
          filteredSubProjectPermissions.includes("subproject.viewSummary") &&
          filteredSubProjectPermissions.includes("subproject.viewDetails") &&
          filteredSubProjectPermissions.includes("subproject.intent.listPermissions") &&
          filteredSubProjectPermissions.includes("subproject.update") &&
          filteredSubProjectPermissions.includes("subproject.createWorkflowitem");
        cy.expect(isSubProjectPermissionSet).to.equal(true);
      });
    });
  });
});
