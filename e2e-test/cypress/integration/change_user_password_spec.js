const testUserName = "passwordChangeUser";
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

  it("If a user is granted permission to edit another user's password, the edit button appears next to the user", function() {
    // Log in as root and grant the permission
    cy.login("root", "root-secret");
    cy.grantUserPermissions("dviolin", "user.changePassword", testUserName);

    // Log in as test user again and refresh the page
    cy.login(testUserName, testUserNamePassword);
    cy.visit("/users");

    // Check if the button is indeed visible
    cy.get("[data-test=edit-user-dviolin]").should("be.visible");

    // Revoke the permission agian to make the test re-runnable
    cy.login("root", "root-secret");
    cy.revokeUserPermissions("dviolin", "user.changePassword", testUserName);
    cy.login();
  });

  it("Before the user enters the user password and the new passwords, he/she cannot proceed", function() {
    cy.get(`[data-test=edit-user-${testUserName}]`).should("be.visible");
    cy.get(`[data-test=edit-user-${testUserName}]`).click();

    // When the window is opened, the "Submit" button is disabled
    cy.get("[data-test=password-change-submit]").should("be.disabled");

    // Leave the window
    cy.get("[data-test=password-change-cancel]").click();
  });

  it("An error is displayed if the wrong password is given", function() {
    const newPassword = "test1234";
    cy.get(`[data-test=edit-user-${testUserName}]`).should("be.visible");

    // User enters wrong password
    cy.get(`[data-test=edit-user-${testUserName}]`).click();
    cy.get("[data-test=user-password-textfield] input").type("asdf");
    cy.get("[data-test=new-password-textfield] input").type(newPassword);
    cy.get("[data-test=new-password-confirmation-textfield] input").type(newPassword);
    cy.get("[data-test=password-change-submit]").click();

    // The warning "Incorrect password" is displayed
    cy.get("#userPassword-helper-text").contains("Incorrect password");

    // Leave the window
    cy.get("[data-test=password-change-cancel]").click();
  });

  it("An error is displayed if the new passwords don't match (the user password is not checked)", function() {
    const oldPassword = testUserNamePassword;
    const newPassword = "test1234";
    const newPasswordWrong = "test12345";
    cy.get(`[data-test=edit-user-${testUserName}]`).should("be.visible");

    cy.get(`[data-test=edit-user-${testUserName}]`).click();
    // Wrong user password entered, but it won't be checked
    cy.get("[data-test=user-password-textfield] input").type(oldPassword);
    cy.get("[data-test=new-password-textfield] input").type(newPassword);
    cy.get("[data-test=new-password-confirmation-textfield] input").type(newPasswordWrong);
    cy.get("[data-test=password-change-submit]").click();

    // The warning "Passwords don't match" is displayed
    cy.get("#newPasswordConfirmation-helper-text").contains("Passwords don't match");

    // Leave the window
    cy.get("[data-test=password-change-cancel]").click();
  });

  it("If the password is updated, the new password is activated immediately", function() {
    const oldPassword = testUserNamePassword;
    const newPassword = "test12345";
    cy.get(`[data-test=edit-user-${testUserName}]`).should("be.visible");

    // User enters correct password
    cy.get(`[data-test=edit-user-${testUserName}]`).click();
    cy.get("[data-test=user-password-textfield] input").type(oldPassword);

    // User enters new password and confirms it
    cy.get("[data-test=new-password-textfield] input").type(newPassword);
    cy.get("[data-test=new-password-confirmation-textfield] input").type(newPassword);
    cy.get("[data-test=password-change-submit]").click();

    // A success snackbar is displayed
    cy.get("#client-snackbar")
      .should("be.visible")
      .contains("Password successfully changed");

    // The user table should be visible again
    cy.get("[data-test=userdashboard]").should("be.visible");

    // Edit user password again
    cy.get(`[data-test=edit-user-${testUserName}]`).click();

    // User enters old (wrong) password
    cy.get("[data-test=user-password-textfield] input").type(oldPassword);

    // User enters new password and confirmation correctly
    cy.get("[data-test=new-password-textfield] input").type(oldPassword);
    cy.get("[data-test=new-password-confirmation-textfield] input").type(oldPassword);
    cy.get("[data-test=password-change-submit]").click();

    // The warning "Incorrect password" is displayed
    cy.get("#userPassword-helper-text").contains("Incorrect password");

    // User enters now the new password
    cy.get("[data-test=user-password-textfield] input").clear();
    cy.get("[data-test=user-password-textfield] input").type(newPassword);
    cy.get("[data-test=password-change-submit]").click();

    // A success snackbar is displayed
    cy.get("#client-snackbar")
      .should("be.visible")
      .contains("Password successfully changed");
  });

  it("Root can edit all user passwords", function() {
    // Log in as root
    cy.login("root", "root-secret");
    cy.visit("/users");

    // Check if the button is indeed visible
    cy.get("[data-test=edit-user-auditUser]").should("be.visible");
    cy.get("[data-test=edit-user-dviolin]").should("be.visible");
    cy.get("[data-test=edit-user-jdoe]").should("be.visible");
    cy.get("[data-test=edit-user-jxavier]").should("be.visible");
    cy.get("[data-test=edit-user-mstein]").should("be.visible");
    cy.get("[data-test=edit-user-pkleffmann]").should("be.visible");
    cy.get("[data-test=edit-user-thouse]").should("be.visible");
  });
});
