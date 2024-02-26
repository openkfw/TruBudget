const testUser = {
  userName: "dviolin",
  password: "test",
};

describe("Users/Groups Dashboard", function () {
  before(() => {
    cy.login();
    cy.visit("/users");
  });

  it("User dashboard is displayed for user with basic permissions", function () {
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Button to add user not visible to user without proper permission", function () {
    // Login as user without permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test=create]").should("not.exist");
  });

  it("Button to change password should be visible for all users", function () {
    // Login as user with basic permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get(`[data-test=edit-user-${testUser.userName}]`).should("be.visible");
  });

  it("Button to change user permissions is not visible to user without proper permission", function () {
    // Login as user without permissions
    cy.login(testUser.userName, testUser.password);
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test*=edit-user-permissions-]").should("not.exist");
  });

  it("Button to add user is visible to user with proper permission", function () {
    // Login as user with permissions
    cy.login();
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test=create]").should("be.visible");
  });

  it("Button to edit user permissions is visible to user with proper permission", function () {
    // Login as user with permissions
    cy.login();
    cy.visit("/users");

    // User dashboard should be visible to this user
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");

    cy.get("[data-test*=edit-user-permissions-]").should("be.visible");
  });

  it("Create new user", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("Test User").trigger("keyup").should("have.value", "Test User");
    cy.get("[data-test=username] input").type("testuser").trigger("keyup").should("have.value", "testuser");
    cy.get("[data-test=password-new-user] input")
      .type("Testing1Testing1")
      .trigger("keyup")
      .should("have.value", "Testing1Testing1");
    cy.get("[data-test=password-new-user-confirm] input")
      .type("Testing1Testing1")
      .trigger("keyup")
      .should("have.value", "Testing1Testing1");
    cy.get("[data-test=submit]").click();
  });

  it("Created user should be visible", function () {
    cy.login();
    cy.visit("/users");

    cy.get("[data-test=user-testuser]")
      .find("th")
      .then(($th) => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text("testuser");
      });
  });

  it("New user cannot be named 'root'", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("root").should("have.value", "root");
    cy.get("[data-test=username] input").type("root").should("have.value", "root");
    cy.get("[data-test=password-new-user] input").type("Testing1").should("have.value", "Testing1");
    cy.get("[data-test=password-new-user-confirm] input").type("Testing1").should("have.value", "Testing1");
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("#username-helper-text").contains("Invalid login ID");
    cy.get("[data-test=cancel]").click();
  });

  it("New user cannot have space in the name", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("Test User").should("have.value", "Test User");
    cy.get("[data-test=username] input").type("test user").should("have.value", "test user");
    cy.get("[data-test=password-new-user] input").type("Testing1").should("have.value", "Testing1");
    cy.get("[data-test=password-new-user-confirm] input").type("Testing1").should("have.value", "Testing1");
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("#username-helper-text").contains("Invalid login ID");
    cy.get("[data-test=cancel]").click();
  });

  it("An info is shown if the password and confirmation-password are not equal", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=username] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=password-new-user] input").type("password1").should("have.value", "password1");
    cy.get("[data-test=password-new-user-confirm] input")
      .type("differentPassword1")
      .should("have.value", "differentPassword1");
    cy.get("body").click(0, 0);
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=password-new-user-confirm]").contains("Passwords don't match");
    cy.get("[data-test=cancel]").click();
  });

  it("A validation error message is shown if password isn't at least 8 characters long", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=username] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=password-new-user] input").type("passw").should("have.value", "passw");
    cy.get("[data-test=password-new-user-confirm] input").type("passw").should("have.value", "passw");
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=password-new-user]").contains("Your password must: Be at least 8 characters long");
    cy.get("[data-test=cancel]").click();
  });

  it("A validation error message is shown if password doesn't contain at least one number", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=username] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=password-new-user] input").type("password").should("have.value", "password");
    cy.get("[data-test=password-new-user-confirm] input").type("password").should("have.value", "password");
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=password-new-user]").contains(
      "Your password must: Contain at least one letter; Contain at least one number",
    );
    cy.get("[data-test=cancel]").click();
  });

  it("A validation error message is shown if the accountname is touched but stays empty", function () {
    cy.login();
    cy.visit("/users");
    cy.get("[data-test=create]").click();
    cy.get("[data-test=accountname] input").click();
    cy.get("[data-test=username] input").type("newUser").should("have.value", "newUser");
    cy.get("[data-test=password-new-user] input").type("password1").should("have.value", "password1");
    cy.get("[data-test=password-new-user-confirm] input").type("password1").should("have.value", "password1");
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=accountname]").contains("Account name cannot be empty");
    cy.get("[data-test=cancel]").click();
  });
});
