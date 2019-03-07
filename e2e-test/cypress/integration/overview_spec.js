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
    cy.get("[data-test=projectcard-0]").should("have.length.above", 0);
    cy.get("[data-test=projectcard-0]")
      .eq(0)
      .then($card => {
        console.log($card.find("[data-test=projectheader] span"));
        expect($card.find("[data-test=projectheader] span").eq(0)).to.have.text(
          this.data.displayName
        );
        expect($card.find("[data-test=projectheader] span").eq(2)).to.have.text(
          "Status: Open"
        );
        expect(
          $card
            .find("[data-test=projectbudget]")
            .children()
            .first()
        ).to.have.text("R$ 32,000,000.00\n");
        expect(
          $card
            .find("[data-test=projectcreation]")
            .children()
            .first()
        ).not.to.have.text("Jan 01, 1970");

        expect($card.find("button")).to.not.have.attr("disabled");
      });
  });

  it("Shows project creation", function() {
    cy.get("[data-test=projectcreation]").should("be.visible");
    cy.get("[data-test=projectcreation] button").should("be.visible");
  });
});
