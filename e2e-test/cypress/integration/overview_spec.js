describe("Overview Page", function() {
  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("Show overview page", function() {
    cy.location("pathname").should("eq", "/projects");
    cy.get("#overviewpage").should("be.visible");
  });

  it("Show example project", function() {
    cy.fixture("testdata.json").as("data");
    cy.get("[data-test*=project-card-]").should("have.length.above", 0);
    cy.get("[data-test*=project-card-]")
      .eq(0)
      .then($card => {
        expect($card.find("[data-test=project-header] span").eq(0)).to.contains.text(this.data.displayName);
        expect($card.find("[data-test=project-header] span").eq(2)).to.have.text("Status: Open");
        expect(
          $card
            .find("[data-test=project-budget]")
            .children()
            .first()
        ).to.contains.text("AR$ 32,000,000.00");
        expect(
          $card
            .find("[data-test=project-creation]")
            .children()
            .first()
        ).not.to.have.text("Jan 01, 1970");

        expect($card.find("button")).to.not.have.attr("disabled");
      });
  });
});
