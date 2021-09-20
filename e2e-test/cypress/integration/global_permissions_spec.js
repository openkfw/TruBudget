const testUserName = "globalPermissionTestUser";
const testUserNamePassword = "test1234";
const apiRoute = "/api";

describe("Users/Groups Dashboard", function() {
  before(() => {
    cy.login("root", Cypress.env("ROOT_SECRET"));
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
    cy.intercept(apiRoute + "/user.list*").as("userlist");
    cy.intercept(apiRoute + "/group.list*").as("grouplist");
    cy.intercept(apiRoute + "/global.listPermissions*").as("listPermissions");
    cy.intercept(apiRoute + "/global.grantPermission*").as("grantPermission");
    cy.intercept(apiRoute + "/global.revokePermission*").as("revokePermission");
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
    cy.intercept(apiRoute + "/user.list*").as("userlist");
    cy.intercept(apiRoute + "/group.list*").as("grouplist");
    cy.intercept(apiRoute + "/global.listPermissions*").as("listPermissions");
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
