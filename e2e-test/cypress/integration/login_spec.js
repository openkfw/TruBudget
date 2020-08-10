describe("Login", function() {
  let projectId, subprojectId, apiRoute, baseUrl;
  const routes = {
    overview: "projects",
    users: "users",
    notifications: "notifications",
    nodes: "nodes",
    projectDetails: `projects/${projectId}`,
    subprojectDetails: `projects/${projectId}/${subprojectId}`,
    notFound: "notfound"
  };

  before(function() {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";

    cy.login();
    cy.createProject("p-login", "login test").then(({ id }) => {
      projectId = id;
      cy.createSubproject(projectId, "sp-login").then(({ id }) => {
        subprojectId = id;
        // Logout
        localStorage.setItem("state", undefined);
      });
    });
  });

  beforeEach(function() {
    cy.visit(`/`);
  });

  it(`Log in and out on overview page`, function() {
    loginUi();
    logout(routes.overview);
  });

  it(`Log in and out on users page`, function() {
    loginUi();
    logout(routes.users);
  });
  it(`Log in and out on notifications page`, function() {
    loginUi();
    logout(routes.notifications);
  });
  it(`Log in and out on nodes page`, function() {
    loginUi();
    logout(routes.nodes);
  });
  it(`Log in and out on projectDetails page`, function() {
    loginUi();
    logout(routes.projectDetails);
  });
  it(`Log in and out on subprojectDetails page`, function() {
    loginUi();
    logout(routes.subprojectDetails);
  });
  it(`Log in and out on a page that's not found`, function() {
    loginUi();
    logout(routes.notFound);
  });

  it("Reject wrong inputs", function() {
    cy.server();
    cy.route("POST", apiRoute + "/user.authenticate").as("login");
    cy.get("#loginpage").should("be.visible");
    cy.get("#username")
      .should("be.visible")
      .type("foo")
      .should("have.value", "foo");
    cy.get("#password")
      .type("bar")
      .should("have.value", "bar");
    cy.get("#loginbutton").click();
    cy.wait("@login").then(xhr => {
      expect(xhr.response.body.error.code).to.eql(400);
    });
    cy.get("[data-test=client-snackbar]")
      .contains("Incorrect login ID or password")
      .should("be.visible");
  });

  it("Reject empty inputs", function() {
    cy.server();
    cy.route("POST", apiRoute + "/user.authenticate").as("login");
    cy.get("#loginpage").should("be.visible");
    cy.get("#loginbutton").click();
    cy.wait("@login").then(xhr => {
      expect(xhr.response.body.error.code).to.eql(500);
    });
    cy.get("[data-test=client-snackbar]")
      .contains("Login ID or password field cannot be empty")
      .should("be.visible");
  });
});

function logout(route) {
  cy.visit(`/${route}`);
  cy.get("#logoutbutton")
    .should("be.visible")
    .click();
  // Check if logged out correctly
  cy.get("#loginpage").should("be.visible");
}

function loginUi() {
  cy.get("#loginpage")
    .should("be.visible")
    .get("#username")
    .type("mstein")
    .should("have.value", "mstein")
    .get("#password")
    .type("test")
    .should("have.value", "test")
    .get("#loginbutton")
    .click();
  // Check if logged in correctly
  cy.get("#logoutbutton").should("be.visible");
}
