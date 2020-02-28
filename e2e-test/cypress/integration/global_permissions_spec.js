const testUserName = "globalPermissionTestUser";
const testUserNamePassword = "test1234";

describe("Users/Groups Dashboard", function() {
  before(() => {
    cy.login("root", "root-secret");
    cy.getUserList().then(userList => {
      const userIds = userList.map(user => user.id);
      if (!userIds.includes(testUserName)) {
        cy.addUser(testUserName, testUserName, testUserNamePassword);
      }
    });
    cy.login(testUserName, testUserNamePassword);
    cy.visit("/users");
  });

  beforeEach(function() {
    cy.login();
    cy.visit("/users");
  });

  it("Display the global permission dialog correctly", function() {
    cy.reload();
    cy.get(`[data-test=edit-user-permissions-${testUserName}]`).click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test=cancel]").click();
  });

  it("Grant and revoke permission to user", function() {
    cy.get(`[data-test=edit-user-permissions-${testUserName}]`).click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");

    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
    cy.get("[data-test='permission-global.createUser']").click();
    cy.get("[data-test=submit]").click();

    cy.get(`[data-test=edit-user-permissions-${testUserName}]`).click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("be.checked");

    // Revoke permission from user
    cy.get("[data-test='permission-global.createUser'] input").click();
    cy.get("[data-test=submit]").click();

    // Check if permission was removed
    cy.get(`[data-test=edit-user-permissions-${testUserName}]`).click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
  });

  it("After clicking 'cancel', the selection is not adopted", function() {
    cy.get(`[data-test=user-${testUserName}]`).should("be.visible");
    cy.get(`[data-test=edit-user-permissions-${testUserName}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");

    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");
    cy.get("[data-test='permission-global.createUser']").click();
    cy.get("[data-test=cancel]").click();

    cy.get(`[data-test=edit-user-permissions-${testUserName}]`).click();
    cy.get("[data-test=global-permissions-dialog]").should("be.visible");
    cy.get("[data-test='permission-global.createUser'] input").should("not.be.checked");

    // Restore state to make the test re-runnable
    cy.get("[data-test=cancel]").click();
  });
});
