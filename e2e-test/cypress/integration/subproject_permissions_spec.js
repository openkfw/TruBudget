import _cloneDeep from "lodash/cloneDeep";

const executingUser = { id: "mstein", displayname: "Mauro Stein" };
const testUser = { id: "thouse", displayname: "Tom House", password: "test" };
const testUser2 = { id: "jxavier", displayname: "Jane Xavier", password: "test" };
const testGroup = { id: "admins", displayname: "Admins" };
let projectId, subprojectId, permissionsBeforeTesting, baseUrl, apiRoute;
const subprojectDisplayname = "subproject assign test";
const rootSecret = "root-secret";

describe("Subproject Permissions", function() {
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(function() {
    cy.login();
    cy.createProject("p-subp-permissions", "subproject permissions test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, subprojectDisplayname).then(({ id }) => {
        subprojectId = id;
        permissionsBeforeTesting = { project: {}, subproject: {} };
        cy.listProjectPermissions(projectId).then(permissions => {
          permissionsBeforeTesting.project = permissions;
        });
        cy.listSubprojectPermissions(projectId, subprojectId).then(permissions => {
          permissionsBeforeTesting.subproject = permissions;
        });
        cy.visit(`/projects/${projectId}`);
      });
    });
    cy.server();
    cy.route("GET", apiRoute + "/subproject.intent.listPermissions*").as("listSubprojectPermissions");
    cy.route("GET", apiRoute + "/project.intent.listPermissions*").as("listProjectPermissions");
    cy.route("GET", apiRoute + "/project.viewDetails*").as("viewDetailsProject");
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
      if (permissions.hasOwnProperty(intent)) {
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

  /**
   * @param {boolean} listPermIncluded    If set to true subproject.intent.listPermissions is also added
   */
  function addViewPermissions(permissions, identity, listPermIncluded = true) {
    const permissionsCopy = _cloneDeep(permissions);
    addPermission(permissionsCopy.project, "project.viewSummary", identity);
    addPermission(permissionsCopy.project, "project.viewDetails", identity);
    addPermission(permissionsCopy.subproject, "subproject.viewSummary", identity);
    addPermission(permissionsCopy.subproject, "subproject.viewDetails", identity);
    if (listPermIncluded) {
      addPermission(permissionsCopy.subproject, "subproject.intent.listPermissions", identity);
    }
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
    cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
    cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
      .should("be.visible")
      .click();
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
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
    cy.get("[data-test=permission-container]").should("not.be.visible");
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    cy.get("[data-test=permission-submit]").click();
    // Open confirmation
    cy.get("[data-test=confirmation-dialog-cancel]").should("be.visible");
  });

  it("Submitting the permission dialog after removing a user opens a confirmation dialog", function() {
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id).then(() => {
      cy.get("[data-test=subproject-" + subprojectId + "]").should("be.visible");
      cy.get("[data-test=subproject-" + subprojectId + "] [data-test*=spp-button]")
        .should("be.visible")
        .click();
      // Open permission search popup
      cy.get("[data-test='permission-select-subproject.viewSummary']").click();
      // Select and add a User
      cy.get("[data-test='permission-list']")
        .scrollIntoView()
        .find(`li[value*='${testUser.id}']`)
        .should("be.visible")
        .click();
      // Close permission search popup
      cy.get("[data-test=permission-search] input").type("{esc}");
      cy.wait("@viewDetailsProject");
      cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
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
    cy.get("[data-test='permission-select-subproject.viewSummary']").click();
    // Select and add a User
    cy.get("[data-test='permission-list']")
      .scrollIntoView()
      .find(`li[value*='${executingUser.id}'] input`)
      .should("be.visible")
      .should("be.disabled");
  });

  it("Submitting the permission dialog without subproject.intent.grantPermission disables the submit button when adding user", function() {
    cy.login("root", rootSecret);
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
        cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
        cy.get("[data-test=permission-submit]").should("be.disabled");
      }
    );
  });

  it("Submitting the permission dialog without subproject.intent.revokePermission disables the submit button when removing user", function() {
    cy.login("root", rootSecret);
    // Grant test User view-permission
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id).then(() => {
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
        cy.get("[data-test='permission-select-subproject.viewSummary']").click();
        // Select and remove a User
        cy.get("[data-test='permission-list']")
          .scrollIntoView()
          .find(`li[value*='${testUser.id}']`)
          .should("be.visible")
          .click();
        // Close permission search popup
        cy.get("[data-test=permission-search] input").type("{esc}");
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
        cy.get("[data-test=permission-submit]").should("be.disabled");
      });
    });
  });

  it("User having 'view permissions'- permission only can view but not grant/revoke permissions", function() {
    cy.login("root", rootSecret);
    // Grant test User view-permission
    cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testUser.id).then(() => {
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    cy.get("[data-test=permission-submit]").click();
    // Open confirmation
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 4);
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    // Open confirmation
    cy.get("[data-test=permission-submit]").click();
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
  });

  it("Granting view permissions doesn't additionally view the same permission", function() {
    // Grant test User project view-permission
    cy.grantProjectPermission(projectId, "project.viewSummary", testUser.id).then(() => {
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
        cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
        cy.get("[data-test=permission-submit]").click();
        // Confirmation opens
        cy.get("[data-test=actions-table-body]")
          .should("be.visible")
          .children()
          .should("have.length", 1)
          .find("td")
          .contains("view summary")
          .should("have.length", 1);
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    // Open confirmation
    cy.get("[data-test=permission-submit]").click();
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
      .get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5);
    cy.get("[data-test=confirmation-dialog-confirm]")
      .should("be.visible")
      .click();

    // Check permissions has changed
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);
    // Permissions before testing equal the current permission + viewPermissions
    assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser.id), projectId, subprojectId);
  });

  it("User with grant permission inherited by a group can grant a permission", function() {
    Cypress.Promise.all([
      // grant permissions to testgroup
      cy.grantProjectPermission(projectId, "project.viewSummary", testGroup.id),
      cy.grantProjectPermission(projectId, "project.viewDetails", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewSummary", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.listPermissions", testGroup.id),
      cy.grantSubprojectPermission(projectId, subprojectId, "subproject.intent.grantPermission", testGroup.id)
    ]).then(() => {
      // Modify permissionsBeforeTestingr regarding theprevious api calls
      permissionsBeforeTesting.project["project.viewSummary"].push(testGroup.id);
      permissionsBeforeTesting.project["project.viewDetails"].push(testGroup.id);
      permissionsBeforeTesting.subproject["subproject.viewSummary"].push(testGroup.id);
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
      cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
      cy.get("[data-test=permission-submit]")
        .should("be.visible")
        .click();
      cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
        .get("[data-test=actions-table-body]")
        .should("be.visible")
        .children()
        .should("have.length", 5);
      // Confirm additional actions
      cy.get("[data-test=confirmation-dialog-confirm]").click();

      // Check permissions has changed
      cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"]);
      // Permissions before testing equal the previous permissions + additional actions
      cy.login();
      assertUnchangedPermissions(addViewPermissions(permissionsBeforeTesting, testUser2.id), projectId, subprojectId);
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      .should("have.length", 5)
      .find("td")
      .contains("view permissions")
      .should("have.length", 1);
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
    cy.wait("@viewDetailsProject");
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
    cy.get("[data-test=permission-submit]").click();
    // Confirmation opens
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
      .get("[data-test=actions-table-body]")
      .should("be.visible")
      .children()
      // 4 permissions per user/group granted
      .should("have.length", 4 * 3);
    // Confirm additional actions
    cy.get("[data-test=confirmation-dialog-confirm]").click();

    // Check permissions has changed
    cy.wait(["@listProjectPermissions", "@listSubprojectPermissions"])
      .get("[data-test=confirmation-dialog-confirm]")
      .click();
    // Permissions before testing equal the previous permissions + additional actions
    cy.wrap(testIds)
      .each(id => {
        permissionsBeforeTesting.subproject["subproject.createWorkflowitem"].push(id);
        permissionsBeforeTesting = addViewPermissions(permissionsBeforeTesting, id, false);
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
    cy.get("[data-test=permission-selection-popup]").should("not.be.visible");
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
});
