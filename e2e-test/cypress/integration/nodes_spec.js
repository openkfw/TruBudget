describe("Nodes Page", function () {
  const firstNode = {
    organization: "KfW",
    accessType: "admin",
  };

  beforeEach(function () {
    cy.login();
    cy.visit(`/nodes`);
  });

  it("Show approved nodes table", function () {
    cy.get("[data-test=approved-nodes-table]").should("be.visible");
  });

  it("Show declined nodes table", function () {
    cy.get("[data-test=declined-nodes-tab]").should("be.visible").click();
    cy.get("[data-test=declined-nodes-table]").should("be.visible");

  });

  it("Show node connection status", function () {
    cy.get("[data-test=approved-nodes-table-body]").should("have.length.above", 0);
    cy.get(`[data-test=open-entry-${firstNode.organization}] `).should("be.visible").click()
    cy.get(`[data-test=status-${firstNode.organization}]`)
      .should("be.visible")
      .should('have.css', 'background-color', 'rgb(0, 128, 0)');
  });
});
