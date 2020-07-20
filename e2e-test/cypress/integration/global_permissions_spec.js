const testUserName = "globalPermissionTestUser";
const testUserNamePassword = "test1234";
let baseUrl, apiRoute;

describe("Users/Groups Dashboard", function() {
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login("root", "root-secret");
    cy.getUserList().then(userList => {
      const userIds = userList.map(user => user.id);
      if (!userIds.includes(testUserName)) {
        cy.addUser(testUserName, testUserName, testUserNamePassword, "KfW");
      }
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit("/users");
  });

  it("Display the global permission dialog correctly", function() {
    cy.get(`[data-test=edit-user-permissions-${testUserName}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
  });

  it("Grant and revoke permission to user works", function() {
    cy.server();
    cy.route("GET", apiRoute + "/user.list*").as("userlist");
    cy.route("GET", apiRoute + "/group.list*").as("grouplist");
    cy.route("GET", apiRoute + "/global.listPermissions*").as("listPermissions");
    cy.route("POST", apiRoute + "/global.grantPermission*").as("grantPermission");
    cy.route("POST", apiRoute + "/global.revokePermission*").as("revokePermission");
    cy.visit("/users");
    cy.wait("@userlist")
      .wait("@grouplist")
      .wait("@listPermissions")
      .get(`[data-test=edit-user-permissions-${testUserName}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");

    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
    cy.get("[data-test='permission-global.createUser']").click();
    cy.get("[data-test='permission-global.createUser'] input").should("be.checked");
    cy.get("[data-test=submit]").click();

    cy.wait("@grantPermission")
      .wait("@listPermissions")
      .get(`[data-test=edit-user-permissions-${testUserName}]`)
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("be.checked");

    // Revoke permission from user
    cy.get("[data-test='permission-global.createUser'] input").click();
    cy.get("[data-test=submit]").click();

    // Check if permission was removed
    cy.wait("@revokePermission")
      .wait("@listPermissions")
      .get(`[data-test=edit-user-permissions-${testUserName}]`)
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
  });

  it("After clicking 'cancel', the selection is not adopted", function() {
    cy.server();
    cy.route("GET", apiRoute + "/user.list*").as("userlist");
    cy.route("GET", apiRoute + "/group.list*").as("grouplist");
    cy.route("GET", apiRoute + "/global.listPermissions*").as("listPermissions");
    cy.visit("/users");
    cy.wait("@userlist")
      .wait("@grouplist")
      .wait("@listPermissions")
      .get(`[data-test=edit-user-permissions-${testUserName}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");

    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
    cy.get("[data-test='permission-global.createUser']").click();
    cy.get("[data-test='permission-global.createUser'] input").should("be.checked");
    cy.get("[data-test=cancel]").click();

    cy.wait("@listPermissions")
      .get(`[data-test=edit-user-permissions-${testUserName}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
  });
});
