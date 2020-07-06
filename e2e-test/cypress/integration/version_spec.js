describe("Component Versions", function() {
  let projectId;

  beforeEach(() => {
    cy.login();
  });

  it("Shows frontend version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=frontendVersion]")
      .should("be.visible")
      .should($elem => {
        const text = $elem.text();
        expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });

  it("Shows api version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=apiVersion]")
      .should("be.visible")
      .should($elem => {
        const text = $elem.text();
        expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });

  it("Shows blockchain version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=blockchainVersion]")
      .should("be.visible")
      .should($elem => {
        const text = $elem.text();
        expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+\.[0-9]+/);
      });
  });

  it("Shows multichain version", function() {
    cy.visit(`/projects`);
    cy.get("[data-test=openSideNavbar]")
      .should("be.visible")
      .click();
    cy.get("[data-test=multichainVersion]")
      .should("be.visible")
      .should($elem => {
        const text = $elem.text();
        expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+.*/);
      });
  });

  it("Shows versions after location change", function() {
    cy.createProject("p-version", "project for version test").then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      // Check service version
      cy.get("[data-test=openSideNavbar]")
        .should("be.visible")
        .click();
      cy.get("[data-test=multichainVersion]")
        .should("be.visible")
        .should($elem => {
          const text = $elem.text();
          expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+.*/);
        });
      // Click outside the sidenavbar to close it
      cy.get("[data-test=sidenav-drawer-backdrop]").click();
      cy.get("[data-test=side-navigation]").should("not.be.visible");
      // Open project
      cy.get(`[data-test=project-card-${projectId}]`).within(() => {
        cy.get(`[data-test*=project-view-button]`).click();
      });
      // Verify the service versions are still displayed
      cy.get("[data-test=openSideNavbar]")
        .should("be.visible")
        .click();
      cy.get("[data-test=multichainVersion]")
        .should("be.visible")
        .should($elem => {
          const text = $elem.text();
          expect(text.trim()).to.match(/[a-z]*:\s[0-9]+\.[0-9]+.*/);
        });
    });
  });
});
