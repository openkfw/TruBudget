describe("Users/Groups Dashboard", function() {
  before(() => {
    cy.login();
    cy.visit("/users");
  });

  it("User can edit his/her own user profile", function() {
    cy.get("[data-test=edit-user-mstein]").should("be.visible");
  });

  it("If a user is granted permission to edit another user's password, the edit button appears next to the user", function() {
    // Log in as root and grant the permission
    cy.login("root", "asdf");
    cy.grantUserPermissions("dviolin", "user.changePassword", "mstein");

    // Log in as mstein again and refresh the page
    cy.login();
    cy.visit("/users");

    // Check if the button is indeed visible
    cy.get("[data-test=edit-user-dviolin]").should("be.visible");

    // Revoke the permission agian to make the test re-runnable
    cy.login("root", "asdf");
    cy.revokeUserPermissions("dviolin", "user.changePassword", "mstein");
    cy.login();
  });

  it("Before the user enters the user password and the new passwords, he/she cannot proceed", function() {
    cy.get("[data-test=edit-user-mstein]").should("be.visible");
    cy.get("[data-test=edit-user-mstein]").click();

    // When the window is opened, the "Submit" button is disabled
    cy.get("[data-test=submit]").should("be.disabled");

    // Leave the window
    cy.get("[data-test=cancel]").click();
  });

  it("An error is displayed if the wrong password is given", function() {
    cy.get("[data-test=edit-user-mstein]").should("be.visible");

    // User enters wrong password
    cy.get("[data-test=edit-user-mstein]").click();
    cy.get("[data-test=user-password-textfield] input").type("asdf");
    cy.get("[data-test=new-password-textfield] input").type("asdf1");
    cy.get("[data-test=new-password-confirmation-textfield] input").type("asdf1");
    cy.get("[data-test=submit]").click();

    // The warning "Incorrect password" is displayed
    cy.get("#userPassword-helper-text").contains("Incorrect password");

    // Leave the window
    cy.get("[data-test=cancel]").click();
  });

  it("An error is displayed if the new passwords don't match (the user password is not checked)", function() {
    cy.get("[data-test=edit-user-mstein]").should("be.visible");

    cy.get("[data-test=edit-user-mstein]").click();
    // Wrong user password entered, but it won't be checked
    cy.get("[data-test=user-password-textfield] input").type("asdf");
    cy.get("[data-test=new-password-textfield] input").type("asdf1");
    cy.get("[data-test=new-password-confirmation-textfield] input").type("asdf2");
    cy.get("[data-test=submit]").click();

    // The warning "Passwords don't match" is displayed
    cy.get("#newPasswordConfirmation-helper-text").contains("Passwords don't match");

    // Leave the window
    cy.get("[data-test=cancel]").click();
  });

  it("If the password is updated, the new password is activated immediately", function() {
    cy.get("[data-test=edit-user-mstein]").should("be.visible");

    // User enters correct password
    cy.get("[data-test=edit-user-mstein]").click();
    cy.get("[data-test=user-password-textfield] input").type("test");

    // User enters new password and confirms it
    cy.get("[data-test=new-password-textfield] input").type("test2");
    cy.get("[data-test=new-password-confirmation-textfield] input").type("test2");
    cy.get("[data-test=submit]").click();

    // A success snackbar is displayed
    cy.get("#client-snackbar")
      .should("be.visible")
      .contains("Password successfully changed");

    // The user table should be visible again
    cy.get("[data-test=userdashboard]").should("be.visible");

    // Edit user password again
    cy.get("[data-test=edit-user-mstein]").click();

    // User enters old (wrong) password
    cy.get("[data-test=user-password-textfield] input").type("test");

    // User enters new password and confirmation correctly
    cy.get("[data-test=new-password-textfield] input").type("test");
    cy.get("[data-test=new-password-confirmation-textfield] input").type("test");
    cy.get("[data-test=submit]").click();

    // The warning "Incorrect password" is displayed
    cy.get("#userPassword-helper-text").contains("Incorrect password");

    // User enters now the new password
    cy.get("[data-test=user-password-textfield] input").clear();
    cy.get("[data-test=user-password-textfield] input").type("test2");
    cy.get("[data-test=submit]").click();

    // A success snackbar is displayed
    cy.get("#client-snackbar")
      .should("be.visible")
      .contains("Password successfully changed");
  });
});
