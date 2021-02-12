describe("Nodes Page", function() {
  const organization = "KfW";
  const firstNode = {
    accessType: "admin",
    connectionStatus: "Connection"
  };

  beforeEach(function() {
    cy.login();
    cy.visit(`/nodes`);
  });

  it("Show nodes table", function() {
    cy.get("[data-test=nodes-table]").should("be.visible");
  });

  it("Show node connection status", function() {
    cy.get("#tableTitle").should("be.visible");
    cy.get("[data-test=nodes-table] table tbody tr").should("have.length.above", 0);
    cy.get("[data-test=nodes-table] table tbody tr")
      .eq(0)
      .then($node => {
        expect($node.find("th")).to.contains.text(organization);
        const nodeCount = parseInt($node.find("td").eq(0).text().trim(), 10);
        expect(nodeCount).to.be.greaterThan(0);
        expect($node.find("td").eq(1)).to.contains.text(`${firstNode.accessType} (${firstNode.connectionStatus})`);
      });
  });
});
