describe("Login", function() {
  let routes;

  before(function() {
    cy.login();
    cy.createProject("p-login", "login test").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "sp-login").then(({ id }) => {
        const subprojectId = id;
        routes = [
          "projects",
          "users",
          "notifications",
          "nodes",
          `projects/${projectId}`,
          `projects/${projectId}/${subprojectId}`,
          "notfound"
        ];
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/`);
  });

  it(`Log in and out on every route`, function() {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click();
    routes.forEach(route => {
      // Login process
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
      // Logout on specific route
      cy.visit(`/${route}`);
      cy.get("#logoutbutton")
        .should("be.visible")
        .click();
      // Check if logged out correctly
      cy.get("#loginpage").should("be.visible");
    });
  });

  it("Reject wrong inputs", function() {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click();
    cy.get("#loginpage").should("be.visible");
    cy.get("#username")
      .should("be.visible")
      .type("foo")
      .should("have.value", "foo");
    cy.get("#password")
      .type("bar")
      .should("have.value", "bar");
    cy.get("#loginbutton").click();
    cy.get("#password-helper-text").should("be.visible");
  });
});
