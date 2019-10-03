describe("Overview Page", function() {
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("Shows project creation", function() {
    cy.get("[data-test=project-creation]").should("be.visible");
    cy.get("[data-test=project-creation] button").should("be.visible");
  });

  it("Disable project creation for 'root' user", function() {
    cy.login("root", "root-secret");
    cy.visit(`/projects`);
    cy.get("[data-test=project-creation]").should("be.visible");
    cy.get("[data-test=project-creation] button").should("be.disabled");
  });
});
