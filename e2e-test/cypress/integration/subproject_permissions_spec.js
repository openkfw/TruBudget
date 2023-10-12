import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "jdoe", displayname: "Jane Doe", password: "test" };
const testUser2 = { id: "jxavier", displayname: "Jane Xavier", password: "test" };
const testUser3 = { id: "pkleffmann", displayname: "Piet Kleffmann" };
const testGroup = { id: "admins", displayname: "Admins" };
const testGroup2 = { id: "reviewers", displayname: "Reviewers" };
let projectId, subprojectId, permissionsBeforeTesting;
const subprojectDisplayname = "subproject assign test";
const apiRoute = "/api";

describe("Subproject Permissions", function() {
  permissionsBeforeTesting = { project: {}, subproject: {} };
  beforeEach(function() {
    cy.login();
    cy.createProject("p-subp-permissions", "subproject permissions test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, subprojectDisplayname).then(({ id }) => {
        subprojectId = id;
        cy.listProjectPermissions(projectId).then(permissions => {
          permissionsBeforeTesting.project = permissions;
        });
        cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
          permissionsBeforeTesting.subproject = permissions;
        });
        cy.visit(`/projects/${projectId}`);
      });
    });
    cy.intercept(apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.intercept(apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.intercept(apiRoute + "/project.viewDetails*").as("viewDetailsProject");
    cy.intercept(apiRoute + "/project.intent.grantPermission").as("grantProjectPermission");
    cy.intercept(apiRoute + "/subproject.intent.grantPermission").as("grantSubprojectPermission");
  });

  function alphabeticalSort(a, b) {
    const stringA = a.toUpperCase();
    const stringB = b.toUpperCase();
    if (stringA < stringB) {
      return -1;
    }
    if (stringA > stringB) {
      return 1;
    }
    return 0;
  }

  function sortPermissionsObject(permissions) {
    for (const intent in permissions) {
      if (Object.prototype.hasOwnProperty.call(permissions, intent)) {
        const identities = permissions[intent];
        permissions[intent] = identities.sort(alphabeticalSort);
      }
    }
    return permissions;
  }

  function assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId) {
    permissionsBeforeTesting.project = sortPermissionsObject(permissionsBeforeTesting.project);
    permissionsBeforeTesting.subproject = sortPermissionsObject(permissionsBeforeTesting.subproject);
    cy.listProjectPermissions(projectId).then(permissions => {
      expect(sortPermissionsObject(permissions)).to.deep.equal(permissionsBeforeTesting.project);
    });
    cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
      expect(sortPermissionsObject(permissions)).to.deep.equal(permissionsBeforeTesting.subproject);
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
    return permissionsCopy;
  }

  function addPermission(permissions, intent, identity) {
    permissions[intent].push(identity);
    return permissions;
  }

  it("Show subproject permissions correctly", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    cy.wait("@listSubprojectPermissions");
    cy.get("[data-test=view-list]")
      .scrollIntoView()
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
      .should("have.length", 4)
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
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.exist");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
  });

  it("Submitting the permission dialog without any changes doesn't revoke nor grant permissions and close the dialog", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open confirmation
    cy.get("[data-test=permission-submit]")
      .should("be.visible")
      .click();
    cy.get("[data-test=permission-container]").should("not.exist");
    assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
  });

  it("Submitting the permission dialog after adding a user opens a confirmation dialog", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .scrollIntoView()
      .click();
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Open confirmation
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id).then(() => {
      cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
      cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
        .should("be.visible")
        .click();
      // Open permission search popup
      cy.get("[data-test='permission-select-subproject.list']").click();
      // Select and add a User
      cy.get("[data-test='permission-list']")
        .scrollIntoView()
        .find(`li[value*='${testUser.id}']`)
        .should("be.visible")
        .click();
      // Close permission search popup
      cy.get("[data-test=permission-search] input").type("{esc}");
      cy.wait("@viewDetailsProject");
      cy.get("[data-test=permission-selection-popup]").should("not.exist");
      cy.get("[data-test=permission-submit]").click();
      // Open confirmation
      cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
    });
  });

  it("Revoke a permission from myself is not allowed", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.get("[data-test='permission-select-subproject.list']").click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${executingUser.id}']`)
      .should("be.visible")
      .should("have.attr", "aria-disabled")
      .and("match", /true/);
  });

  it("Submitting the permission dialog without subproject.intent.grantPermission disables the submit button when adding user", function() {
    cy.login(executingUser.id, "test");
    // Grant subproject.intent.grantPermission to other user first because it's not allowed to revoke the last user
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testUser2.id);
    cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", executingUser.id).then(
      () => {
        // Mstein login
        cy.login();
        cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
        cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
          .should("be.visible")
          .click();
        // Open permission search popup
        cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
        // Select and add a User
        cy.get("[data-test='permission-list']")
          .scrollIntoView()
          .find(`li[value*='${testUser.id}']`)
          .should("be.visible")
          .click();
        // Close permission search popup
        cy.get("[data-test=permission-search] input").type("{esc}");
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=permission-selection-popup]").should("not.exist");
        cy.get("[data-test=permission-submit]").should("be.disabled");
      }
    );
  });

  it("Submitting the permission dialog without subproject.intent.revokePermission disables the submit button when removing user", function() {
    cy.login(executingUser.id, "test");
    // Grant test User view-permission
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id).then(() => {
      // Revoke revoke-permission from mstein
      cy.revokeSubprojectPermission(
        projectId,
        subprojectId,
        "subproject.intent.revokePermission",
        executingUser.id
      ).then(() => {
        // Mstein login
        cy.login();
        cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
        cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
          .should("be.visible")
          .click();
        // Open permission search popup
        cy.get("[data-test='permission-select-subproject.list']").click();
        // Select and remove a User
        cy.get("[data-test='permission-list']")
          .scrollIntoView()
          .find(`li[value*='${testUser.id}']`)
          .should("be.visible")
          .click();
        // Close permission search popup
        cy.get("[data-test=permission-search] input").type("{esc}");
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=permission-selection-popup]").should("not.exist");
        cy.get("[data-test=permission-submit]").should("be.disabled");
      });
    });
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    cy.login(executingUser.id, "test");
    // Grant test User view-permission
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id).then(() => {
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id).then(() => {
        // Test user login
        cy.login(testUser.id, testUser.password);
        cy.visit(`/projects/${projectId}`);
        cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
        cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
          .should("have.css", "opacity", "0")
          .should("be.disabled");
      });
    });
  });

  it("Granting update permissions views 4 additional view permissions needed", function() {
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.get("[data-test='permission-select-subproject.update']")
      .scrollIntoView()
      .should("be.visible")
      .click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .click();
    // Close permission popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Open confirmation
    // 4 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 4);
    });
    // 1 original actions
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
  });

  it("Granting revoke permissions views 5 additional permissions needed including 'view permission'-permissions", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.get("[data-test='permission-select-subproject.intent.revokePermission']").click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .click();
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Open confirmation
    // 6 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 6);
    });
    // 1 original actions
    cy.get("[data-test=original-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 1);
    });
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    // Grant test User project view-permission
    cy.grantProjectPermission(projectId, "project.list", testUser.id).then(() => {
      cy.grantProjectPermission(projectId, "project.viewDetails", testUser.id).then(() => {
        // Mstein login
        cy.login();
        cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
        cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
          .should("be.visible")
          .click();
        // Open permission search popup
        cy.get("[data-test='permission-select-subproject.viewDetails']").click();
        // Select and add test user
        cy.get("[data-test='permission-list']")
          .scrollIntoView()
          .find(`li[value*='${testUser.id}']`)
          .should("be.visible")
          .click();
        // Close permission search popup
        cy.get("[data-test=permission-search] input").type("{esc}");
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=permission-selection-popup]").should("not.exist");
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        // 1 additional actions
        cy.get("[data-test=additional-actions]").within(() => {
          cy.get("[data-test=actions-table-body]")
            .should("be.visible")
            .children()
            .should("have.length", 1)
            .contains("view");
        });
        // 1 original actions
        cy.get("[data-test=original-actions]").within(() => {
          cy.get("[data-test=actions-table-body]")
            .should("be.visible")
            .children()
            .should("have.length", 1);
        });
      });
    });
  });

  it("Executing additional actions grant permissions correctly", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.wait("@listSubprojectPermissions")
      .get("[data-test='permission-select-subproject.intent.revokePermission']")
      .click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .click();
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    // Open confirmation
    cy.get("[data-test=permission-submit]").click();
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);
    // 6 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 6);
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
    cy.wait(["@viewDetailsProject", "@listSubprojectPermissions"]);

    // Remove project.update permission
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.wait("@listSubprojectPermissions")
      .get("[data-test='permission-select-subproject.intent.revokePermission']")
      .click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .click();
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    // compare Permissions to check if additional permission are granted successfully
    assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId, subprojectId);
  });

  it("User with grant permission inherited by a group can grant a permission", function() {
    Cypress.Promise.all([
      // grant permissions to testgroup
      cy.grantProjectPermission(projectId, "project.list", testGroup.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroup.id),
      cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroup.id),
      cy.grantProjectPermission(projectId, "project.intent.grantPermission", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testGroup.id)
    ]).then(() => {
      // Modify permissionsBeforeTestingr regarding theprevious api calls
      permissionsBeforeTesting.project["project.list"].push(testGroup.id);
      permissionsBeforeTesting.project["project.viewDetails"].push(testGroup.id);
      permissionsBeforeTesting.project["project.intent.listPermissions"].push(testGroup.id);
      permissionsBeforeTesting.project["project.intent.grantPermission"].push(testGroup.id);
      permissionsBeforeTesting.subproject["subproject.list"].push(testGroup.id);
      permissionsBeforeTesting.subproject["subproject.viewDetails"].push(testGroup.id);
      permissionsBeforeTesting.subproject["subproject.intent.listPermissions"].push(testGroup.id);
      permissionsBeforeTesting.subproject["subproject.intent.grantPermission"].push(testGroup.id);
      // user from testgroup grant permission to user
      cy.login(testUser.id, testUser.password);
      cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
      cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
        .should("be.visible")
        .click();
      // Open permission search popup
      cy.wait("@listSubprojectPermissions")
        .get("[data-test='permission-select-subproject.intent.grantPermission']")
        .click();
      // Select and add a User
      cy.get("[data-test='permission-list']")
        .scrollIntoView()
        .find(`li[value*='${testUser2.id}']`)
        .should("be.visible")
        .click();
      // Close permission search popup
      cy.get("[data-test=permission-search] input").type("{esc}");
      cy.wait("@viewDetailsProject");
      cy.get("[data-test=permission-selection-popup]").should("not.exist");
      cy.get("[data-test=permission-submit]")
        .should("be.visible")
        .click();
      cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);
      // 6 additional actions
      cy.get("[data-test=additional-actions]").within(() => {
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 6);
      });
      // 1 original action
      cy.get("[data-test=original-actions]").within(() => {
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 1);
      });
      // Confirm additional actions
      cy.get("[data-test=confirmation-dialog-confirm]").click();
      cy.wait(["@viewDetailsProject", "@listSubprojectPermissions"]);

      // Check permissions has changed
      // Permissions before testing equal the previous permissions + additional actions
      let permissions = addViewPermissions(permissionsBeforeTesting, testUser2.id);
      permissions.subproject["subproject.intent.grantPermission"].push(testUser2.id);
      cy.login();
      assertUnchangedPermissions(permissions, projectId, subprojectId);
    });
  });

  it("Granting grant-permission permission additionally generates an action to grant list-permissions permission", function() {
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
    // Select and add test user
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${testUser.id}']`)
      .should("be.visible")
      .click();
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    // 6 additional actions
    cy.get("[data-test=additional-actions]").within(() => {
      cy.get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 6)
        .find("td")
        .contains("view permissions")
        .should("have.length", 1);
    });
  });

  it("Confirmation of multiple grant permission changes grants permissions correctly", function() {
    const testIds = [testUser.id, testUser2.id, testGroup.id];
    // Grant testUser testUser2 and admins write permissions (createWorkflowitem)
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.wait("@listSubprojectPermissions")
      .get("[data-test='permission-select-subproject.createWorkflowitem']")
      .scrollIntoView()
      .should("be.visible")
      .click();
    // Select and add all test Identities
    cy.wrap(testIds).each(id => {
      cy.get("[data-test='permission-list']")
        .scrollIntoView()
        .find(`li[value*='${id}']`)
        .should("exist")
        .click();
    });
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject")
      .get("[data-test=permission-selection-popup]")
      .should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
      .get("[data-test=additional-actions]")
      .within(() => {
        cy.get("[data-test=actions-table-body]")
          .scrollIntoView({ offset: { top: 150, left: 0 } })
          .should("be.visible")
          .children()
          // 6 permissions per user/group granted
          .should("have.length", 6 * 3);
      });
    // Confirm additional actions
    cy.get("[data-test=confirmation-dialog-confirm]")
      .click()
      // Intercepting after the confirmation makes sure it's the next viewDetails fetch including all changes
      .intercept(apiRoute + "/project.viewDetails*")
      .as("viewDetailsProjectAfterSubmit");

    // Check permissions has changed
    // Due to liveUpdate, viewDetailsProjectAfterSubmit has to be waited for 3 times
    cy.wait("@viewDetailsProjectAfterSubmit")
      .wait("@viewDetailsProjectAfterSubmit")
      .wait("@viewDetailsProjectAfterSubmit")
      .visit(`/projects/${projectId}`);
    cy.get("[data-test=subproject-" + subprojectId + "]")
      .should("be.visible")
      .within(() => {
        cy.intercept(apiRoute + "/user.list")
          .as("listUsers")
          .intercept(apiRoute + "/group.list")
          .as("listGroups");
        cy.get("[data-test*=spp-button]")
          .should("be.visible")
          .click();
      });
    // Permissions before testing equal the previous permissions + additional actions
    cy.wait(["@listUsers", "@listGroups"])
      .wrap(testIds)
      .each(id => {
        permissionsBeforeTesting.subproject["subproject.createWorkflowitem"].push(id);
        permissionsBeforeTesting = addViewPermissions(permissionsBeforeTesting, id);
      })
      .then(() => {
        // Push identities in specific order so assertion doesn't fail
        assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
      });
  });

  it("Confirmation of multiple revoke permission changes grants permissions correctly", function() {
    const testIds = [testUser.id, testUser2.id, testGroup.id];
    // Revoke testUser testUser2 and admins write permissions (assign)
    // Modify permissionsBeforeTestingr regarding theprevious api calls
    cy.wrap(testIds).each(id => {
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.assign", id),
        permissionsBeforeTesting.subproject["subproject.assign"].push(id);
    });
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    // Open permission search popup
    cy.wait("@listSubprojectPermissions")
      .get("[data-test='permission-select-subproject.assign']")
      .click();
    // Select and add all test Identities
    cy.wrap(testIds).each(id => {
      cy.get("[data-test='permission-list']")
        .scrollIntoView()
        .find(`li[value*='${id}']`)
        .should("exist")
        .click();
    });
    // Close permission search popup
    cy.get("[data-test=permission-search] input").type("{esc}");
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.exist");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
      .get("[data-test=confirmation-dialog]")
      .should("be.visible");

    // Confirm revoke permissions
    cy.get("[data-test=confirmation-dialog-confirm]").click();
    // Permissions before testing equal the previous permissions without assign permissions for testIds
    cy.wrap(testIds)
      .each(testId => {
        permissionsBeforeTesting.subproject["subproject.assign"] = permissionsBeforeTesting.subproject[
          "subproject.assign"
        ].filter(id => id !== testId);
      })
      .then(() => {
        assertUnchangedPermissions(permissionsBeforeTesting, projectId, subprojectId);
      });
  });

  it(
    "Users of group with Permission have minimum the same permission as the group",
    { defaultCommandTimeout: 50000 },
    function() {
      Cypress.Promise.all([
        // grant permissions to testgroup
        cy.grantProjectPermission(projectId, "project.list", testGroup2.id),
        cy.grantProjectPermission(projectId, "project.viewDetails", testGroup2.id),
        cy.grantProjectPermission(projectId, "project.intent.listPermissions", testGroup2.id),
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testGroup2.id),
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroup2.id),
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.createWorkflowitem", testGroup2.id),
        cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroup2.id)
      ]).then(() => {
        // Create WorkflowItem with user as creator and assignee
        // After provisioning testUser3 is part of testGroup2 and should automatically have the groups permissions
        cy.login(testUser3.id, "test");
        cy.visit(`/projects/${projectId}/${subprojectId}`);

        cy.get("[data-test=createWorkflowitem]").click();
        cy.get("[data-test=nameinput]").type("Test");

        cy.get("[data-test=next]").click();
        cy.get("[data-test=submit]").click();

        cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);

        cy.get("[data-test=confirmation-dialog-confirm]")
          .should("be.visible")
          .click();

        // Check if assignee has been set
        cy.get("[data-test^=workflowitem-]")
          .last()
          .find(`[data-test=single-select]`)
          .should("contain", testUser3.displayname);
      });
    }
  );

  it("It is possible to revoke and grant a permission in one step", function() {
    // Grant Permission Beforehand so it can be revoked during the test
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.list", testUser.id).then(() => {
      // Edit Sub Project Permissions
      cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
      cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
        .should("be.visible")
        .click();

      // Edit View Summary Permissions
      cy.wait("@listSubprojectPermissions")
        .get("[data-test='permission-select-subproject.list']")
        .click();

      // Revoke Permission from Test-User
      cy.get("[data-test='permission-list']")
        .find(`li[value*='${testUser.id}']`)
        .scrollIntoView()
        .click();

      // Grant Permission to Test-User 2
      cy.get("[data-test='permission-list']")
        .find(`li[value*='${testUser2.id}']`)
        .scrollIntoView()
        .click();

      cy.get("[data-test=permission-search] input").type("{esc}");

      // Submit selection
      cy.wait("@viewDetailsProject")
        .get("[data-test=permission-selection-popup]")
        .should("not.exist");

      cy.get("[data-test=permission-submit]").click();
    });

    // Confirms the Actions and waits for Screen to Load
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();

    cy.wait("@viewDetailsProject");

    // Assert that the Page did not Crash and Sub-Project is still visible
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
  });
});
