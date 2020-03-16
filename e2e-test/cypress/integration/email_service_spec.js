describe("Email Service test", function() {
  before(() => {});

  beforeEach(function() {});

  it("If the email server is not available, user cannot change email address", function() {
    cy.login();
    cy.visit("/projects/");
    // Open side navigation
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation").should("be.visible");

    // Open user profile
    cy.get("[data-test=show-user-profile]").click();
    cy.get("[data-test=user-profile-dialog").should("be.visible");
    cy.get("[data-test=email-address-input").should("not.be.visible");

    // Close
    cy.get("[data-test=close-user-profile]").click();
    cy.get("[data-test=side-navigation").should("be.visible");
  });

  it("If the email server is available, user can change email address", function() {
    cy.server();
    cy.route("**/readiness", [200]);
    cy.route("**/email/readiness", [200]);
    cy.login();
    cy.visit("/projects");

    // Open side navigation
    cy.get("[data-test=openSideNavbar]").click();
    cy.get("[data-test=side-navigation").should("be.visible");

    // Open user profile
    cy.get("[data-test=show-user-profile]").click();
    cy.get("[data-test=user-profile-dialog").should("be.visible");
    cy.get("[data-test=email-address-input").should("be.visible");

    // Close
    cy.get("[data-test=close-user-profile]").click();
    cy.get("[data-test=side-navigation").should("be.visible");
  });
});
