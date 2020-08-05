describe("Login", function() {
  let baseUrl, apiRoute;
  let testUserId;

  // Generate random IDs since every ID can only exists once in the multichain
  const generateUserId = () => `test_user_${Math.floor(Math.random() * 10000)}`;

  const baseUser = {
    id: "baseUser",
    displayName: "Base User",
    password: "test",
    organization: "KfW"
  };

  function loginViaUi(userId, password) {
    cy.visit("/");
    cy.get("#loginpage")
      .should("be.visible")
      .get("#username")
      .type(userId)
      .should("have.value", userId)
      .get("#password")
      .type(password)
      .should("have.value", password)
      .get("#loginbutton")
      .click();
  }

  before(function() {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(function() {
    cy.login();
    cy.server();
    cy.route("GET", apiRoute + "/user.list").as("userList");
    cy.route("GET", apiRoute + "/group.list").as("groupList");
    cy.route("GET", apiRoute + "/global.listPermissions").as("globalPermissionsList");
    // Create new user
    testUserId = generateUserId();
    cy.addUser(`Testuser-${testUserId}`, testUserId, baseUser.password);
    cy.visit("/users")
      .wait("@userList")
      .wait("@groupList")
      .wait("@globalPermissionsList");
  });

  it("When the user has been disabled successfully, he/she is moved to the disabled-user list", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`)
      .should("be.visible")
      .click();
    // Check if disabled User is removed from user list
    cy.wait("@disableUser")
      .wait("@userList")
      .get(`[data-test=user-${testUserId}]`)
      .should("not.be.visible");
    // Check disabled-user list
    cy.get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=user-${testUserId}]`)
      .should("be.visible");
  });

  it("When the user has been enabled successfully, he/she is moved to the user list", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.route("POST", apiRoute + "/global.enableUser").as("enableUser");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`)
      .should("be.visible")
      .click();
    // Enable user
    cy.wait("@disableUser")
      .wait("@userList")
      .get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click();
    cy.get(`[data-test=enable-user-${testUserId}]`)
      .should("be.visible")
      .click({ force: true });
    // Check user list
    cy.wait("@enableUser")
      .wait("@userList")
      .get("[data-test=usersTab]")
      .should("be.visible")
      .click();
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Check disabled-user list
    cy.get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=user-${testUserId}]`)
      .should("not.be.visible");
  });

  it("Disabled user has to use correct password to see that he has been disabled", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.route("POST", apiRoute + "/user.authenticate").as("login");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`)
      .should("be.visible")
      .click();
    // Logout
    cy.wait("@disableUser")
      .wait("@userList")
      .get("#logoutbutton")
      .should("be.visible")
      .click();
    // Login with wrong password
    loginViaUi(testUserId, "wrongPassword");
    cy.wait("@login").then(xhr => {
      expect(xhr.response.body.error.code).to.eql(400);
    });
    cy.get("[data-test=client-snackbar]")
      .contains("Incorrect login ID or password")
      .should("be.visible");
    // Login with right password
    loginViaUi(testUserId, "test");
    cy.wait("@login").then(xhr => {
      expect(xhr.response.body.error.code).to.eql(403);
    });
    cy.get("[data-test=client-snackbar]")
      .contains("Login ID is disabled")
      .should("be.visible");
  });

  it("An enabled user is able to login", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.route("POST", apiRoute + "/global.enableUser").as("enableUser");
    cy.route("POST", apiRoute + "/user.authenticate").as("login");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`)
      .should("be.visible")
      .click();
    // Enable user
    cy.wait("@disableUser")
      .wait("@userList")
      .get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=enable-user-${testUserId}]`)
      .should("be.visible")
      .click({ force: true });
    // Logout
    cy.wait("@enableUser")
      .wait("@userList")
      .get("#logoutbutton")
      .should("be.visible")
      .click();
    //Login with wrong password
    loginViaUi(testUserId, "wrongPassword");
    cy.wait("@login").then(xhr => {
      expect(xhr.response.body.error.code).to.eql(400);
    });
    cy.get("[data-test=client-snackbar]")
      .contains("Incorrect login ID or password")
      .should("be.visible");
    //Login with right password
    loginViaUi(testUserId, "test");
    cy.get("#logoutbutton").should("be.visible");
  });

  it("Disabling user is rejected if the user is still assigned to a project", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project", [], undefined, {
      assignee: testUserId
    }).then(() => {
      // Disable user
      cy.get(`[data-test=disable-user-${testUserId}]`)
        .should("be.visible")
        .click();
      cy.wait("@disableUser").then(xhr => {
        expect(xhr.response.body.error.code).to.eql(412);
      });
    });
  });

  it("Disabling a user is rejected if the user is still assigned to a subproject", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject", undefined, { assignee: testUserId }).then(() => {
        // Disable user
        cy.get(`[data-test=disable-user-${testUserId}]`)
          .should("be.visible")
          .click();
        cy.wait("@disableUser").then(xhr => {
          expect(xhr.response.body.error.code).to.eql(412);
        });
      });
    });
  });

  it("Disabling a user is rejected if the user is still assigned to a workflowitem", function() {
    cy.route("POST", apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject").then(({ id }) => {
        const subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "user disable test workflowitem", { assignee: testUserId }).then(
          () => {
            // Disable user
            cy.get(`[data-test=disable-user-${testUserId}]`)
              .should("be.visible")
              .click();
            cy.wait("@disableUser").then(xhr => {
              expect(xhr.response.body.error.code).to.eql(412);
            });
          }
        );
      });
    });
  });
});
