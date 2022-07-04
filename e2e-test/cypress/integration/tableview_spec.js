describe("Tableview Test", function() {
  before(() => {
    cy.login();
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("Search for a project works in TableView", function() {
    cy.get("[data-test=set-table-view]").click();
    cy.get("[data-test=search-input] input").type("Amazonas Fund");
    cy.get("[data-test=project-name]").should("be.visible");
    cy.get("[data-test=project-name]")
      .its("length")
      .then(n => {
        // only amazon fund project is visible
        expect(n).to.equal(1);
      });
  });
});
