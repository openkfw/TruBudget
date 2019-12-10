describe("Login", function() {
  let routes;

  before(function() {
    cy.login();
    cy.createProject("p-subp-assign", "subproject assign test").then(({ id }) => {
      const projectId = id;
      cy.createSubproject(projectId, "subproject assign test").then(({ id }) => {
        const subprojectId = id;
        // Logout
        localStorage.setItem("state", undefined);

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
    cy.visit(`/`);
  });

  it(`Log in and out on every route`, function() {
    routes.forEach(route => {
      cy.get("#loginpage").should("be.visible");
      cy.get("#username")
        .type("mstein")
        .should("have.value", "mstein");
      cy.get("#password")
        .type("test")
        .should("have.value", "test");
      cy.get("#loginbutton").click();
      cy.get("#logoutbutton").should("be.visible");
      cy.visit(`/${route}`);
      cy.get("#logoutbutton")
        .should("be.visible")
        .click();
      cy.get("#loginpage").should("be.visible");
    });
  });

  it("Reject wrong inputs", function() {
    cy.get("#loginpage").should("be.visible");
    cy.get("#username")
      .type("foo")
      .should("have.value", "foo");
    cy.get("#password")
      .type("bar")
      .should("have.value", "bar");
    cy.get("#loginbutton").click();
    cy.get("#password-helper-text").should("be.visible");
  });
});
