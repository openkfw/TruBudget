import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House" };
const testUser2 = { id: "jdoe", displayname: "John Doe" };
const testGroupId = "admins";
const groupToGivePermissions = "reviewers";
let projectId, subprojectId, workflowitemId, permissionsBeforeTesting, baseUrl, apiRoute;
const projectDisplayname = "p-witem-assign";
const subprojectDisplayname = "subp-witem-assign";
const workflowitemDisplayname = "witem-witem-assign";

describe("Workflowitem Permissions", function() {
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login();
    cy.createProject(projectDisplayname, "workflowitem assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, subprojectDisplayname).then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, workflowitemDisplayname).then(({ id }) => {
          workflowitemId = id;
        });
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projectId}/${subprojectId}`);
    permissionsBeforeTesting = { project: {}, subproject: {}, workflowitem: {} };
    cy.listProjectPermissions(projectId).then(permissions => {
      permissionsBeforeTesting.project = permissions;
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      permissionsBeforeTesting.subproject = permissions;
    });
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
      permissionsBeforeTesting.workflowitem = permissions;
    });
  });

  function assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId) {
    cy.listProjectPermissions(projectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.project);
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.subproject);
    });
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.workflowitem);
    });
  }

  function addViewPermissions(permissions, identity) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.viewSummary", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.project, "project.intent.listPermissions", identity);
    addPermission(permissionsCopy.subproject, "subproject.view", identity);
    addPermission(permissionsCopy.subproject, "subproject.intent.listPermissions", identity);
    addPermission(permissionsCopy.workflowitem, "workflowitem.view", identity);
    addPermission(permissionsCopy.workflowitem, "workflowitem.intent.listPermissions", identity);
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

  function actionTableIncludes(permissionText, amountOfPermissions = 6) {
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", amountOfPermissions)
      .find("td")
      .contains(permissionText)
      .should("have.length", 1);
  }

  function filterPermissionsById(permissions, id) {
    return Object.keys(permissions).filter(intent => permissions[intent].includes(id));
  }

  it("Show worklfowitem permissions correctly", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=view-list]")
      .should("be.visible")
      .children()
      .find("input")
      .should("have.value", executingUser.displayname);
    cy.get("[data-test=view-list]")
      .should("be.visible")
      .children()
      .find("span")
      .should("have.length", 2)
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
      .should("have.length", 2)
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
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Canceling the permission dialog neither revokes nor grant permissions ", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=permission-close]").click();
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId);
  });

  it("Submitting the permission dialog without any changes neither revokes nor grant permissions and close the dialog", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId);
  });

  it("Submitting the permission dialog after adding a user opens a confirmation dialog", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testUser.id);
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test='permission-select-workflowitem.view']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${testUser.id}']`)
      .click()
      .type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testUser.id);
  });

  it("Revoke a permission from myself is not allowed", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .find(`li[value*='${executingUser.id}'] input`)
      .should("be.disabled");
  });

  it("Submitting the permission dialog without workflowitem.intent.grantPermission disables the submit button when adding user", function() {
    const intent = "workflowitem.intent.grantPermission";
    // Grant workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser2.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, executingUser.id);

    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Add permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Remove permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.login("root", "root-secret");
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser.id);
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, executingUser.id);
  });

  it("Submitting the permission dialog without workflowitem.intent.revokePermission disables the submit button when removing user", function() {
    const grantIntent = "workflowitem.intent.grantPermission";
    const revokeIntent = "workflowitem.intent.revokePermission";

    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);

    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Remove permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Add permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.be.visible");

    // Reset permissions
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser.id);
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    const grantIntent = "workflowitem.intent.grantPermission";
    const revokeIntent = "workflowitem.intent.revokePermission";

    // Grant workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser2.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, executingUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);

    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    cy.get(`[data-test='permission-select-workflowitem.view']`).click();
    cy.get("[data-test=read-only-permissions-text]").should("be.visible");
    cy.get("[data-test=permission-list]")
      .find(`li[value*='${testUser.id}']`)
      .find("input")
      .should("be.disabled");

    cy.login("root", "root-secret");
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, executingUser.id);
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);
  });

  it("Granting update permissions views 5 additional permissions needed", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Add permission
    changePermissionInGui("workflowitem.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
  });

  it("Granting revoke permissions views 8 additional permissions needed including 'view permission'-permissions", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Add permission
    changePermissionInGui("workflowitem.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions", 8);
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
    cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.view", testUser.id);

    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Add permission
    changePermissionInGui("workflowitem.view", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
    cy.get("[data-test=actions-table-body]").should("not.be.visible");

    //Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.view", testUser.id)
    ]);
  });

  it("Executing additional actions grants permissions correctly", function() {
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    // Add permission
    changePermissionInGui("workflowitem.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // listPermissions calls are done
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 8);
    // Make sure cypress waits for future listPermissions calls
    cy.server();
    cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.route("GET", apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions", "@listWorkflowitemPermissions"]);
    cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");
    assertUnchangedPermissions(
      addViewPermissions(permissionsBeforeTesting, testUser.id),
      projectId,
      subprojectId,
      workflowitemId
    );

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.view", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser.id),
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser.id
      ),
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testUser.id)
    ]);
  });

  it("Executing additional actions as normal user extended through group permissions", function() {
    Cypress.Promise.all([
      // grant permissions
      cy.grantProjectPermission(projectId, "project.viewSummary", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.view", testGroupId),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testGroupId
      ),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testGroupId)
    ]).then(() => {
      // user from testgroup grant other group some permission
      cy.login("jdoe", "test");

      cy.get("[data-test=show-workflowitem-permissions]")
        .first()
        .click();
      // Add permission
      changePermissionInGui("workflowitem.intent.revokePermission", groupToGivePermissions);
      cy.get("[data-test=permission-submit]").click();
      // Confirmation opens
      // listPermissions calls are done
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 8);
      // Make sure cypress waits for future listPermissions calls
      cy.server();
      cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
      cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
      cy.route("GET", apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      cy.wait(["@listProjectPermissions", "@listSubprojectPermissions", "@listWorkflowitemPermissions"]);
      cy.get("[data-test=confirmation-dialog-confirm]").should("not.be.disabled");

      // Reset permissions of testgroup
      Cypress.Promise.all([
        cy.login("mstein", "test"),
        cy.revokeProjectPermission(projectId, "project.viewSummary", testGroupId),
        cy.revokeProjectPermission(projectId, "project.viewDetails", testGroupId),
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.view", testGroupId),
        cy.revokeWorkflowitemPermission(
          projectId,
          subprojectId,
          workflowitemId,
          "workflowitem.intent.listPermissions",
          testGroupId
        ),
        cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testGroupId)
      ]).then(() => {
        assertUnchangedPermissions(
          addViewPermissions(permissionsBeforeTesting, groupToGivePermissions),
          projectId,
          subprojectId,
          workflowitemId
        );
      });
    });
  });

  it("Granting assign/grant/revoke permissions additionally generates an action to grant 'list permissions'-permissions", function() {
    // Check assign
    cy.get("[data-test=show-workflowitem-permissions]")
      .first()
      .click();
    changePermissionInGui("workflowitem.assign", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens (for workflowitem.assign intent, project.intent.listPermission and subproject.intent.listPermissions are needed)
    actionTableIncludes("view permissions", 8);
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("workflowitem.assign", testUser.id);
    // Check grant
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions", 8);
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    // Check revoke
    changePermissionInGui("workflowitem.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    actionTableIncludes("view permissions", 8);
  });

  it("Confirmation of multiple revoke permission changes grants permissions correctly", function() {
    let permissionsCopy;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.view", testUser.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testUser.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser.id),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser.id
      )
    ]).then(() => {
      cy.listProjectPermissions(projectId).then(permissions => {
        permissionsBeforeTesting.project = permissions;
      });
      cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
        permissionsBeforeTesting.subproject = permissions;
      });
      cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
        permissionsBeforeTesting.workflowitem = permissions;
        permissionsCopy = _cloneDeep(permissionsBeforeTesting);

        cy.get("[data-test=show-workflowitem-permissions]")
          .first()
          .click();
        // Remove permissions
        changePermissionInGui("workflowitem.update", testUser.id);
        changePermissionInGui("workflowitem.view", testUser.id);
        changePermissionInGui("workflowitem.intent.listPermissions", testUser.id);
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        cy.get("[data-test=confirmation-dialog-confirm]").should("be.visible");
        cy.server();
        cy.route("GET", apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        // Original actions are executed
        cy.get("[data-test=permission-submit]").should("not.be.visible");
        cy.wait("@listWorkflowitemPermissions");
        // Equal permissions
        permissionsCopy.workflowitem = removePermission(
          permissionsCopy.workflowitem,
          "workflowitem.update",
          testUser.id
        );
        permissionsCopy.workflowitem = removePermission(permissionsCopy.workflowitem, "workflowitem.view", testUser.id);
        permissionsCopy.workflowitem = removePermission(
          permissionsCopy.workflowitem,
          "workflowitem.intent.listPermissions",
          testUser.id
        );

        assertUnchangedPermissions(permissionsCopy, projectId, subprojectId, workflowitemId);

        // Reset permissions
        cy.revokeProjectPermission(projectId, "project.viewSummary", testUser.id);
        cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id);
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.view", testUser.id);
      });
    });
  });

  it("Grant group Permission and test if their users have them", function() {
    let filteredWorkflowPermissions;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.viewSummary", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.view", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.view", testGroupId),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testGroupId),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testGroupId
      )
    ]).then(() => {
      // login as group-user
      cy.login("jdoe", "test");
      cy.visit(`/projects`);

      cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then(permissions => {
        filteredWorkflowPermissions = filterPermissionsById(permissions, testGroupId);
        let isWorkflowtPermissionSet =
          filteredWorkflowPermissions.includes("workflowitem.view") &&
          filteredWorkflowPermissions.includes("workflowitem.update");
        cy.expect(isWorkflowtPermissionSet).to.equal(true);
      });
    });
  });
});
