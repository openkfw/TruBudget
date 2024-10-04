import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House" };
const testUser2 = { id: "jdoe", displayname: "John Doe" };
const testUser3 = { id: "auditUser", displayname: "Romina Checker" };
const testUser4 = { id: "pkleffmann", displayname: "Piet Kleffmann" };
const testGroupId = "admins";
const groupToGivePermissions = "reviewers";
let projectId, subprojectId, workflowitemId, permissionsBeforeTesting;
const apiRoute = "/api";
const projectDisplayname = "p-witem-assign";
const subprojectDisplayname = "subp-witem-assign";
const workflowitemDisplayname = "witem-witem-assign";

describe("Workflowitem Permissions", function () {
  beforeEach(function () {
    cy.login();
    cy.createProject(projectDisplayname, "workflowitem assign test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, subprojectDisplayname).then(({ id }) => {
        subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, workflowitemDisplayname).then(({ id }) => {
          workflowitemId = id;
          cy.visit(`/projects/${projectId}/${subprojectId}`);
          permissionsBeforeTesting = { project: {}, subproject: {}, workflowitem: {} };
          cy.listProjectPermissions(projectId).then((permissions) => {
            permissionsBeforeTesting.project = permissions;
          });
          cy.listSubprojectPermissions(projectId, subprojectId).then((permissions) => {
            permissionsBeforeTesting.subproject = permissions;
          });
          cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then((permissions) => {
            permissionsBeforeTesting.workflowitem = permissions;
          });
        });
      });
    });
  });

  function assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId) {
    cy.listProjectPermissions(projectId).then((permissions) => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.project);
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then((permissions) => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.subproject);
    });
    cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then((permissions) => {
      expect(permissions).to.deep.equal(permissionsBeforeTesting.workflowitem);
    });
  }

  function addViewPermissions(permissions, identity) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.list", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.project, "project.intent.listPermissions", identity);
    addPermission(permissionsCopy.subproject, "subproject.list", identity);
    addPermission(permissionsCopy.subproject, "subproject.viewDetails", identity);
    addPermission(permissionsCopy.subproject, "subproject.intent.listPermissions", identity);
    addPermission(permissionsCopy.workflowitem, "workflowitem.list", identity);
    addPermission(permissionsCopy.workflowitem, "workflowitem.intent.listPermissions", identity);
    return permissionsCopy;
  }

  function addPermission(permissions, intent, identity) {
    permissions[intent].push(identity);
    return permissions;
  }

  function removePermission(permissions, intent, identity) {
    permissions[intent] = permissions[intent].filter((id) => {
      return id !== identity;
    });
    return permissions;
  }

  function changePermissionInGui(intent, identity) {
    cy.get(`[data-test='permission-select-${intent}']`).click();
    cy.get("[data-test=permission-list]").find(`li[value*='${identity}']`).click().type("{esc}");
  }

  function additionalActionTableIncludes(permissionText, amountOfPermissions = 6) {
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", amountOfPermissions)
        .find("td")
        .contains(permissionText)
        .should("have.length", 1);
    });
  }

  function filterPermissionsById(permissions, id) {
    return Object.keys(permissions).filter((intent) => permissions[intent].includes(id));
  }

  function assertTableData(tableTestData, expectedValues) {
    const intentTable = [];
    cy.get(`[data-test='${tableTestData}'`)
      .find("td")
      .each((element) => {
        intentTable.push(element.text());
      })
      .wrap(intentTable)
      .should("deep.equal", expectedValues);
  }

  it("Show worklfowitem permissions correctly", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
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
    cy.get("[data-test=permission-container]").should("not.exist");
  });

  it("Canceling the permission dialog neither revokes nor grant permissions ", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get("[data-test=permission-close]").click();
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId);
  });

  it("Submitting the permission dialog without any changes neither revokes nor grant permissions and close the dialog", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=permission-container]").should("not.exist");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId);
  });

  it("Submitting the permission dialog after adding a user opens a confirmation dialog", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']").find(`li[value*='${testUser.id}']`).click().type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible").click();
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function () {
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get("[data-test='permission-select-workflowitem.list']").click();
    cy.get("[data-test='permission-list']").find(`li[value*='${testUser.id}']`).click().type("{esc}");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible").click();
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id);
  });

  it("Revoke a permission from myself is not allowed", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get("[data-test='permission-select-workflowitem.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']").find(`li[value*='${executingUser.id}'] input`).should("be.disabled");
  });

  it("Submitting the permission dialog without workflowitem.intent.grantPermission disables the submit button when adding user", function () {
    const intent = "workflowitem.intent.grantPermission";
    // Grant workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser2.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, executingUser.id);

    // cypress needs reload because permission changes are made via api calls
    cy.reload();

    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Add permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Remove permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.exist");

    // Reset permissions
    cy.login(testUser2.id, "test");
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, testUser.id);
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, intent, executingUser.id);
  });

  it("Submitting the permission dialog without workflowitem.intent.revokePermission disables the submit button when removing user", function () {
    const grantIntent = "workflowitem.intent.grantPermission";
    const revokeIntent = "workflowitem.intent.revokePermission";

    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);

    // cypress needs reload because permission changes are made via api calls
    cy.reload();

    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Remove permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").should("be.disabled");
    // Add permission
    changePermissionInGui("workflowitem.intent.grantPermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=confirmation-dialog-cancel]").should("not.exist");

    // Reset permissions
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser.id);
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function () {
    const grantIntent = "workflowitem.intent.grantPermission";
    const revokeIntent = "workflowitem.intent.revokePermission";

    // Grant workflowitem.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, testUser2.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, executingUser.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);

    // cypress needs reload because permission changes are made via api calls
    cy.reload();

    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    cy.get(`[data-test='permission-select-workflowitem.list']`).click();
    cy.get("[data-test=read-only-permissions-text]").should("be.visible");
    cy.get("[data-test=permission-list]").find(`li[value*='${testUser.id}']`).find("input").should("be.disabled");

    cy.login(testUser2.id, "test");
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, grantIntent, executingUser.id);
    cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, revokeIntent, executingUser.id);
  });

  it("Granting update permissions views 5 additional permissions needed", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Add permission
    changePermissionInGui("workflowitem.update", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // 5 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 5);
    });
    // 1 original action
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 1);
    });
  });

  it("Granting revoke permissions views 8 additional permissions needed including 'view permission'-permissions", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Add permission
    changePermissionInGui("workflowitem.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions", 8);
  });

  it("Granting view permissions doesn't additionally view the same permission", function () {
    cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id);
    cy.grantProjectPermission(projectId, "project.list", testUser.id);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id);
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id);

    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Add permission
    changePermissionInGui("workflowitem.list", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=additional-actions]").should("not.exist");
    cy.get("[data-test=original-actions]").should("be.visible");
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible").click();

    //Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.list", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id),
    ]);
  });

  it("Executing additional actions grants permissions correctly", function () {
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    // Add permission
    changePermissionInGui("workflowitem.intent.revokePermission", testUser.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // listPermissions calls are done
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 8);
    });
    // Make sure cypress waits for future listPermissions calls
    cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    cy.wait("@listWorkflowitemPermissions", { timeout: 30000 });
    let permissions = addViewPermissions(permissionsBeforeTesting, testUser.id);
    permissions.workflowitem["workflowitem.intent.revokePermission"].push(testUser.id);
    assertUnchangedPermissions(permissions, projectId, subprojectId, workflowitemId);

    // Reset permissions
    Cypress.Promise.all([
      cy.revokeProjectPermission(projectId, "project.list", testUser.id),
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser.id),
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser.id,
      ),
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id),
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.revokePermission",
        testUser.id,
      ),
    ]).then(() => {
      assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId, workflowitemId);
    });
  });

  it("Executing additional actions as normal user extended through group permissions", function () {
    cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");

    Cypress.Promise.all([
      // grant permissions
      cy.grantProjectPermission(projectId, "project.list", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.grantPermission", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testGroupId,
      ),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testGroupId),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.grantPermission",
        testGroupId,
      ),
    ]).then(() => {
      permissionsBeforeTesting.project["project.intent.grantPermission"].push(testGroupId);
      permissionsBeforeTesting.workflowitem["intent.grantPermission"].push(testGroupId);
      // user from testgroup grant other group some permission
      cy.login(testUser2.id, "test");

      cy.get("[data-test=show-workflowitem-permissions]").first().click();
      // Add permission
      changePermissionInGui("workflowitem.intent.revokePermission", groupToGivePermissions);
      cy.get("[data-test=permission-submit]").click();
      // Confirmation opens
      // listPermissions calls are done
      cy.get("[data-test=additional-actions]").within(() => {
        cy.get("[data-test=actions-table-body]").should("be.visible").children().should("have.length", 8);
      });
      // Make sure cypress waits for future listPermissions calls
      cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      // Reset permissions of testgroup
      cy.wait("@listWorkflowitemPermissions").then(() => {
        Cypress.Promise.all([
          cy.login("mstein", "test"),
          cy.revokeProjectPermission(projectId, "project.list", testGroupId),
          cy.revokeProjectPermission(projectId, "project.viewDetails", testGroupId),
          cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
          cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testGroupId),
          cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
          cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId),
          cy.revokeWorkflowitemPermission(
            projectId,
            subprojectId,
            workflowitemId,
            "workflowitem.intent.listPermissions",
            testGroupId,
          ),
          cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testGroupId),
          cy.revokeWorkflowitemPermission(
            projectId,
            subprojectId,
            workflowitemId,
            "workflowitem.intent.revokePermission",
            groupToGivePermissions,
          ),
        ]).then(() => {
          assertUnchangedPermissions(
            addViewPermissions(permissionsBeforeTesting, groupToGivePermissions),
            projectId,
            subprojectId,
            workflowitemId,
          );
        });
      });
    });
  });

  it("Granting assign/grant/revoke permissions additionally generates an action to grant 'list permissions'-permissions", function () {
    // Check assign
    cy.get("[data-test=show-workflowitem-permissions]").first().click();
    changePermissionInGui("workflowitem.assign", testUser3.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens (for workflowitem.assign intent, project.intent.listPermission and subproject.intent.listPermissions are needed)
    additionalActionTableIncludes("view permissions", 8);
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("workflowitem.assign", testUser3.id);
    // Check grant
    changePermissionInGui("workflowitem.intent.grantPermission", testUser3.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions", 8);
    cy.get("[data-test=confirmation-dialog-cancel]").click();
    changePermissionInGui("workflowitem.intent.grantPermission", testUser3.id);
    // Check revoke
    changePermissionInGui("workflowitem.intent.revokePermission", testUser3.id);
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    additionalActionTableIncludes("view permissions", 8);
    cy.get("[data-test=confirmation-dialog-cancel]").click();
  });

  it("Confirmation of revoking multiple permissions changes permissions correctly", function () {
    let permissionsCopy;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testUser.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser.id),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser.id,
      ),
    ]).then(() => {
      cy.listProjectPermissions(projectId).then((permissions) => {
        permissionsBeforeTesting.project = permissions;
      });
      cy.listSubprojectPermissions(projectId, subprojectId).then((permissions) => {
        permissionsBeforeTesting.subproject = permissions;
      });
      cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then((permissions) => {
        permissionsBeforeTesting.workflowitem = permissions;
        permissionsCopy = _cloneDeep(permissionsBeforeTesting);

        cy.get("[data-test=show-workflowitem-permissions]").first().click();
        // Remove permissions
        changePermissionInGui("workflowitem.update", testUser.id);
        changePermissionInGui("workflowitem.list", testUser.id);
        changePermissionInGui("workflowitem.intent.listPermissions", testUser.id);
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        cy.get("[data-test=confirmation-dialog-confirm]").should("be.visible");
        cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");
        cy.get("[data-test=confirmation-dialog-confirm]").click();
        // Original actions are executed
        cy.get("[data-test=permission-submit]").should("not.exist");
        cy.wait("@listWorkflowitemPermissions");
        // Equal permissions
        permissionsCopy.workflowitem = removePermission(
          permissionsCopy.workflowitem,
          "workflowitem.update",
          testUser.id,
        );
        permissionsCopy.workflowitem = removePermission(permissionsCopy.workflowitem, "workflowitem.list", testUser.id);
        permissionsCopy.workflowitem = removePermission(
          permissionsCopy.workflowitem,
          "workflowitem.intent.listPermissions",
          testUser.id,
        );

        // Check if the 3 permissions are revoked correctly
        assertUnchangedPermissions(permissionsCopy, projectId, subprojectId, workflowitemId);

        // Reset permissions
        cy.revokeProjectPermission(projectId, "project.list", testUser.id);
        cy.revokeProjectPermission(projectId, "project.viewDetails", testUser.id);
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id);
        cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser.id);
      });
    });
  });

  it("Grant group Permission and test if their users have them", function () {
    let filteredWorkflowPermissions;
    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testGroupId),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroupId),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testGroupId),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testGroupId),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testGroupId,
      ),
    ]).then(() => {
      // login as group-user
      cy.login(testUser2.id, "test");
      cy.visit(`/projects`);

      cy.listWorkflowitemPermissions(projectId, subprojectId, workflowitemId).then((permissions) => {
        filteredWorkflowPermissions = filterPermissionsById(permissions, testGroupId);
        let isWorkflowtPermissionSet =
          filteredWorkflowPermissions.includes("workflowitem.list") &&
          filteredWorkflowPermissions.includes("workflowitem.update");
        cy.expect(isWorkflowtPermissionSet).to.equal(true);
      });

      // Reset permissions
      cy.login();
      cy.revokeProjectPermission(projectId, "project.list", testGroupId);
      cy.revokeProjectPermission(projectId, "project.viewDetails", testGroupId);
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testGroupId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testGroupId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroupId);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroupId);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testGroupId);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testGroupId);
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testGroupId,
      );
    });
  });

  it("Shows permission required dialog when grant permissions on intents is missing", function () {
    cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");

    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testUser4.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser4.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testUser4.id),

      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id),

      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser4.id,
      ),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.assign", testUser4.id),
    ]).then(() => {
      // Visit Subproject with Test User
      cy.login(testUser4.id, "test");
      cy.visit(`/projects/${projectId}/${subprojectId}`);

      // Open Selection list for assigning the Workflowitem
      cy.get("[data-test=single-select]").click();

      // Try to assign it to Test User 2
      cy.get("[data-test='single-select-list']").find(`li[value*='${testUser2.id}']`).scrollIntoView().click();

      cy.wait("@listWorkflowitemPermissions");

      // Permission required Dialog should be open
      cy.get("[data-test='confirmation-dialog']")
        .find("h2")
        .should("be.visible")
        .should("contain", "Permissions required");

      // Reset permissions
      cy.login();
      cy.revokeProjectPermission(projectId, "project.list", testUser4.id);
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser4.id);
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.assign", testUser4.id);
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser4.id,
      );
    });
  });

  //not working
  it("Lists required permissions and permitted users in PermissionRequired dialog", function () {
    cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");

    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testUser4.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser4.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testUser4.id),

      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id),

      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser4.id,
      ),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.assign", testUser4.id),
    ]).then(() => {
      // Visit Subproject with Test User
      cy.login(testUser4.id, "test");
      cy.visit(`/projects/${projectId}/${subprojectId}`);

      // Open Selection list for assigning the Workflowitem
      cy.get("[data-test=single-select]").click();

      // Try to assign it to Test User 2
      cy.get("[data-test='single-select-list']")
        .should("be.visible")
        .find(`li[value*='${testUser2.id}']`)
        .scrollIntoView()
        .click();

      cy.wait("@listWorkflowitemPermissions");

      const intentValues = [
        "Project",
        "p-witem-assign",
        "Grant project permissions",
        "Subproject",
        "subp-witem-assign",
        "Grant subproject permissions",
        "Workflow action",
        "witem-witem-assign",
        "Grant workflow action permission",
      ];
      assertTableData("permission-required-intent-table", intentValues);

      const userValues = ["Project", "mstein", "Subproject", "mstein", "Workflow action", "mstein"];
      assertTableData("permission-required-user-table", userValues);
      cy.wait(7000);
      // Reset permissions
      cy.login();
      cy.revokeProjectPermission(projectId, "project.list", testUser4.id);
      cy.revokeProjectPermission(projectId, "project.viewDetails", testUser4.id);
      cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id);
      cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id);
      cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.assign", testUser4.id);
      cy.revokeWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser4.id,
      );
    });
  });

  it("Lists workflowItem grant permission", function () {
    cy.intercept(apiRoute + "/workflowitem.intent.listPermissions*").as("listWorkflowitemPermissions");

    Cypress.Promise.all([
      cy.grantProjectPermission(projectId, "project.list", testUser4.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser4.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testUser4.id),
      cy.grantProjectPermission(projectId, "project.intent.grantPermission", testUser4.id),

      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser4.id),

      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id),
      cy.grantWorkflowitemPermission(
        projectId,
        subprojectId,
        workflowitemId,
        "workflowitem.intent.listPermissions",
        testUser4.id,
      ),
      cy.grantWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.assign", testUser4.id),
    ]).then(() => {
      // Visit Subproject with Test User
      cy.login(testUser4.id, "test");
      cy.visit(`/projects/${projectId}/${subprojectId}`);

      // Open Selection list for assigning the Workflowitem
      cy.get("[data-test=single-select]").click();

      // Try to assign it to Test User 2
      cy.get("[data-test='single-select-list']").find(`li[value*='${testUser2.id}']`).scrollIntoView().click();

      cy.wait("@listWorkflowitemPermissions");

      // Permission required Dialog should be open
      cy.get("[data-test='confirmation-dialog']")
        .find("h2")
        .should("be.visible")
        .should("contain", "Permissions required");

      // Since Project & Sub-Project permissions are in place, only workflowitem permission is listed
      const intentValues = ["Workflow action", "witem-witem-assign", "Grant workflow action permission"];
      assertTableData("permission-required-intent-table", intentValues);

      const userValues = ["Workflow action", "mstein"];
      assertTableData("permission-required-user-table", userValues);
    });

    // Reset permissions
    cy.login();
    cy.revokeProjectPermission(projectId, "project.list", testUser4.id);
    cy.revokeProjectPermission(projectId, "project.viewDetails", testUser4.id);
    cy.revokeProjectPermission(projectId, "project.intent.listPermissions", testUser4.id);
    cy.revokeProjectPermission(projectId, "project.intent.grantPermission", testUser4.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", testUser4.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testUser4.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testUser4.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testUser4.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser4.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", testUser4.id);
    cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.update", testUser4.id);
    cy.revokeWorkflowitemPermission(
      projectId,
      subprojectId,
      workflowitemId,
      "workflowitem.intent.listPermissions",
      testUser4.id,
    );
  });
});
