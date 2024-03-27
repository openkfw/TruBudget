describe("Disable and enable users", function () {
  const apiRoute = "/api";
  let testUserId;

  // Generate random IDs since every ID can only exists once in the multichain
  const generateUserId = () => `test_user_${Math.floor(Math.random() * 1000000)}`;

  const baseUser = {
    id: "baseUser",
    displayName: "Base User",
    password: "test",
    organization: "KfW",
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

  beforeEach(function () {
    cy.login();
    cy.intercept(apiRoute + "/user.list").as("userList");
    cy.intercept(apiRoute + "/group.list").as("groupList");
    cy.intercept(apiRoute + "/global.listPermissions").as("globalPermissionsList");
    cy.intercept(apiRoute + "/project.viewDetails*").as("projectDetails");
    cy.intercept(apiRoute + "/subproject.viewDetails*").as("subprojectDetails");
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.intercept(apiRoute + "/global.enableUser").as("enableUser");
    cy.intercept(apiRoute + "/user.authenticate").as("login");

    // Create new user
    testUserId = generateUserId();
    cy.intercept(apiRoute + `/global.listAssignments?userId=${testUserId}`).as("fetchAssignments");
    cy.addUser(`Testuser-${testUserId}`, testUserId, baseUser.password);
    cy.visit("/users").wait("@userList").wait("@groupList").wait("@globalPermissionsList");
  });

  it("The logged-in user cannot disable himself", function () {
    cy.get(`[data-test=disable-user-mstein]`).should("be.disabled");
  });

  it("When the user has been disabled successfully, he/she is moved to the disabled-user list", function () {
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Check if disabled User is removed from user list
    cy.wait("@disableUser").wait("@userList").get(`[data-test=user-${testUserId}]`).should("not.exist");
    // Check disabled-user list
    cy.get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=user-${testUserId}]`)
      .should("be.visible");
  });

  it("When the user has been enabled successfully, he/she is moved to the user list", function () {
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
    cy.wait("@fetchAssignments");
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Enable user
    cy.wait("@disableUser").wait("@userList").get("[data-test=disabledUsersTab]").should("be.visible").click();
    cy.get(`[data-test=enable-user-${testUserId}]`).should("be.visible").click({ force: true });
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Check user list
    cy.wait("@enableUser").wait("@userList").get("[data-test=usersTab]").should("be.visible").click();
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Check disabled-user list
    cy.get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=user-${testUserId}]`)
      .should("not.exist");
  });

  it("Disabled user has to use correct password to see that he has been disabled", function () {
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Logout
    cy.wait("@disableUser").wait("@userList").get("#logoutbutton").should("be.visible").click();
    // Login with wrong password
    loginViaUi(testUserId, "wrongPassword");
    cy.wait("@login").should((interception) => {
      expect(interception.response.statusCode).to.eql(401);
    });
    cy.get("[data-test=client-snackbar]").contains("Incorrect login ID or password").should("be.visible");
    // Login with right password
    loginViaUi(testUserId, "test");
    cy.wait("@login").should((interception) => {
      expect(interception.response.statusCode).to.eql(403);
    });
    cy.get("[data-test=client-snackbar]").contains("Login ID is disabled").should("be.visible");
  });

  it("An enabled user is able to login", function () {
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.intercept(apiRoute + "/global.enableUser").as("enableUser");
    cy.intercept(apiRoute + "/user.authenticate").as("login");
    // Disable user
    cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Enable user
    cy.wait("@disableUser")
      .wait("@userList")
      .get("[data-test=disabledUsersTab]")
      .should("be.visible")
      .click()
      .get(`[data-test=enable-user-${testUserId}]`)
      .should("be.visible")
      .click({ force: true });
    cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.visible").click();
    // Logout
    cy.wait("@enableUser").wait("@userList").get("#logoutbutton").should("be.visible").click();
    //Login with wrong password
    loginViaUi(testUserId, "wrongPassword");
    cy.wait("@login").should((interception) => {
      expect(interception.response.statusCode).to.eql(401);
    });
    cy.get("[data-test=client-snackbar]").contains("Incorrect login ID or password").should("be.visible");
    //Login with right password
    loginViaUi(testUserId, "test");
    cy.get("#logoutbutton").should("be.visible");
  });

  it("Disabling user is rejected if the user is still assigned to a project", function () {
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project", [], undefined, {
      assignee: testUserId,
    }).then(() => {
      // Open disable dialog
      cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
      cy.wait("@fetchAssignments");
      cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
    });
  });

  it("Disabling a user is rejected if the user is still assigned to a subproject", function () {
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create subproject including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject", undefined, { assignee: testUserId }).then(() => {
        // Open disable dialog
        cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
        cy.wait("@fetchAssignments");
        cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
      });
    });
  });

  it("Disabling a user is rejected if the user is still assigned to a workflowitem", function () {
    cy.intercept(apiRoute + "/global.disableUser").as("disableUser");
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");

    // Create workflowitem including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject").then(({ id }) => {
        const subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "user disable test workflowitem", { assignee: testUserId }).then(
          () => {
            // Open disable dialog
            cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
            cy.wait("@fetchAssignments");
            cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
          },
        );
      });
    });
  });

  it("The refresh button fetches the current user assignments correctly", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create workflowitem including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject").then(({ id }) => {
        const subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "user disable test workflowitem", { assignee: testUserId }).then(
          () => {
            // Open disable dialog
            cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
            cy.wait("@fetchAssignments");
            cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
            // Refresh assignments
            cy.get("[data-test=refresh-assignments]").should("be.visible").click();
            cy.wait("@fetchAssignments");
            cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
          },
        );
      });
    });
  });

  it("When the user is still assigned to a project, the assignment table shows shows a reference link", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project", [], undefined, {
      assignee: testUserId,
    }).then(({ id }) => {
      const projectId = id;
      // Open disable dialog
      cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
      cy.wait("@fetchAssignments");
      cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
      // Check for one entry in column of project assignments
      cy.get(`[data-test=project-assignments] > div > a`)
        .should("have.attr", "href")
        .and("include", projectId)
        .then((href) => {
          cy.visit(href);
          cy.get(`[data-test=single-select]`).find("[tabindex*=0]").should("contain", testUserId);
          cy.wait("@userList");
          cy.wait("@projectDetails");
        });
    });
  });

  it("When the user is still assigned to a subproject, the assignment table shows shows a reference link", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create subproject including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject", undefined, { assignee: testUserId }).then(() => {
        const subprojectId = id;
        // Open disable dialog
        cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
        cy.wait("@fetchAssignments");
        cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
        // Check for one entry in column of subproject assignments
        cy.get(`[data-test=subproject-assignments] > div > a`)
          .should("have.attr", "href")
          .and("include", subprojectId)
          .then((href) => {
            cy.visit(href);
            cy.get(`[data-test=single-select]`).find("[tabindex*=0]").should("contain", testUserId);
            cy.wait("@userList");
            cy.wait("@subprojectDetails");
          });
      });
    });
  });

  it("When the user is still assigned to a workflowitem, the assignment table shows shows a reference link", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create worklfowitem including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject").then(({ id }) => {
        const subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "user disable test workflowitem", { assignee: testUserId }).then(
          ({ id }) => {
            const workflowitemId = id;
            // Open disable dialog
            cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
            cy.wait("@fetchAssignments");
            cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
            // Check for one entry in column of workflowitem assignments
            cy.get(`[data-test=workflowitem-assignments] > div > a`)
              .should("have.attr", "href")
              .and("include", subprojectId)
              .then((href) => {
                cy.visit(href);
                cy.get(`[data-test=workflowitem-assignee-${workflowitemId}]`)
                  .find("[tabindex*=0]")
                  .should("contain", testUserId);
                cy.wait("@userList");
                cy.wait("@subprojectDetails");
              });
          },
        );
      });
    });
  });

  it("When the user does not have permission to view a project where the user to disable is assigned to, it shows an info message", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create project including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project", [], undefined, {
      assignee: testUserId,
    }).then(({ id }) => {
      const projectId = id;
      // Remove view - permissions for current user (mstein)
      cy.revokeProjectPermission(projectId, "project.viewDetails", "mstein");
      cy.revokeProjectPermission(projectId, "project.list", "mstein");
      // Open disable dialog
      cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
      cy.wait("@fetchAssignments");
      cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
      // Check for hidden worklfowitem-assignment message
      cy.get(`[data-test=info-hidden-assignment]`).should("be.visible");
    });
  });

  it("When the user does not have permission to view a subproject where the user to disable is assigned to, it shows an info message", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create subproject including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject", undefined, { assignee: testUserId }).then(
        ({ id }) => {
          const subprojectId = id;
          // Remove view - permissions for current user (mstein)
          cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.viewDetails", "mstein");
          cy.revokeSubprojectPermission(projectId, subprojectId, "subproject.list", "mstein");
          // Open disable dialog
          cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
          cy.wait("@fetchAssignments");
          cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
          // Check for hidden worklfowitem assignment message
          cy.get(`[data-test=info-hidden-assignment]`).should("be.visible");
        },
      );
    });
  });

  it("When the user does not have permission to view a workflowitem where the user to disable is assigned to, it shows an info message", function () {
    cy.get(`[data-test=user-${testUserId}]`).should("be.visible");
    // Create worklfowitem including testUser as assignee
    cy.createProject("user-disable-test-project", "user disable test project").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "user disable test subproject").then(({ id }) => {
        const subprojectId = id;
        cy.createWorkflowitem(projectId, subprojectId, "user disable test workflowitem", { assignee: testUserId }).then(
          ({ id }) => {
            const workflowitemId = id;
            // Remove view - permissions for current user (mstein)
            cy.revokeWorkflowitemPermission(projectId, subprojectId, workflowitemId, "workflowitem.list", "mstein");
            // Open disable dialog
            cy.get(`[data-test=disable-user-${testUserId}]`).should("be.visible").click();
            cy.wait("@fetchAssignments");
            cy.get(`[data-test=confirmation-dialog-confirm]`).should("be.disabled");
            // Check for hidden worklfowitem assignment message
            cy.get(`[data-test=info-hidden-assignment]`).should("be.visible");
          },
        );
      });
    });
  });
});
