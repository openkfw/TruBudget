const testUser = {
  userName: "dviolin",
  password: "test"
};

describe("Users/Groups Dashboard", function() {
  before(() => {
    cy.login();
    cy.visit("/users");
  });

  it("User dashboard is displayed for user with basic permissions", function() {
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Button to add user not visible to user without proper permission", function() {
    // Login as user without permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test=create]").should("not.exist");
  });

  it("Button to change password should be visible for all users", function() {
    // Login as user with basic permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get(`[data-test=edit-user-${testUser.userName}]`).should("be.visible");
  });

  it("Button to change user permissions is not visible to user without proper permission", function() {
    // Login as user without permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test*=edit-user-permissions-]").should("not.exist");
  });

  it("Button to add user is visible to user with proper permission", function() {
    // Login as user with permissions
    cy.login();
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test=create]").should("be.visible");
  });

  it("Button to edit user permissions is visible to user with proper permission", function() {
    // Login as user with permissions
    cy.login();
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test*=edit-user-permissions-]").should("be.visible");
  });

  it("Create new user", function() {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input")
      .type("Test User")
      .should("have.value", "Test User");
    cy.get("[data-test=username] input")
      .type("testuser")
      .should("have.value", "testuser");
    cy.get("[data-test=password-new-user] input")
      .type("Testing1Testing1")
      .should("have.value", "Testing1Testing1");
    cy.get("[data-test=password-new-user-confirm] input")
      .type("Testing1Testing1")
      .should("have.value", "Testing1Testing1");
    cy.get("[data-test=submit]").click();
  });

  it("Created user should be visible", function() {
    cy.login();
    cy.visit("/users");

    cy.get("[data-test=user-testuser]")
      .find("th")
      .then($th => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text("testuser");
      });
  });

  it("New user cannot be named 'root'", function() {
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input")
      .type("root")
      .should("have.value", "root");
    cy.get("[data-test=username] input")
      .type("root")
      .should("have.value", "root");
    cy.get("[data-test=password-new-user] input")
      .type("Testing1")
      .should("have.value", "Testing1");
    cy.get("[data-test=password-new-user-confirm] input")
      .type("Testing1")
      .should("have.value", "Testing1");
    cy.get("[data-test=submit]").click();
    cy.get("#username-helper-text").contains("Invalid login ID");
    cy.get("[data-test=cancel]").click();
  });

  it("An info is shown if the password and confirmation-password are not equal", function() {
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input")
      .type("newUser")
      .should("have.value", "newUser");
    cy.get("[data-test=username] input")
      .type("newUser")
      .should("have.value", "newUser");
    cy.get("[data-test=password-new-user] input")
      .type("password1")
      .should("have.value", "password1");
    cy.get("[data-test=password-new-user-confirm] input")
      .type("differentPassword1")
      .should("have.value", "differentPassword1");
    cy.get("[data-test=submit]").click();
    cy.get("[data-test=password-new-user-confirm]").contains("Passwords don't match");
  });
});
