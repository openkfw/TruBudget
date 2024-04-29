describe("Tableview Test", function () {
  before(() => {
    cy.login();
  });

  beforeEach(function () {
    cy.login();
    cy.visit(`/projects`);
  });

  function checkAllVisibleProjects() {
    cy.get("[data-test=project-name]")
      .its("length")
      .then((n) => {
        // all other projects visible
        expect(n).to.least(4);
      });
  }

  it("Search for a project works in TableView", function () {
    cy.get("[data-test=set-table-view]").click();
    checkAllVisibleProjects();
    cy.get("[data-test=search-input] input").type("Amazonas Fund");
    cy.get("[data-test=project-name]").should("be.visible");
    cy.get("[data-test=project-name]")
      .its("length")
      .then((n) => {
        // only amazon fund project is visible
        expect(n).to.equal(1);
      });
  });

  it("Pressing the Reset-Button resets the filter", function () {
    cy.get("[data-test=set-table-view]").click();
    checkAllVisibleProjects();
    cy.get("[data-test=search-input] input").type("Amazonas Fund");
    cy.get("[data-test=project-name]").should("be.visible");
    cy.get("[data-test=project-name]")
      .its("length")
      .then((n) => {
        // only amazon fund project is visible
        expect(n).to.equal(1);
      });
    // Reset filter
    cy.get("[data-test=open-filter]").should("be.visible").click();
    cy.get("[data-test=reset-table-view]").click();
    cy.wait(500);
    checkAllVisibleProjects();
  });

  it("Action buttons are visible", function () {
    cy.get("[data-test=set-table-view]").click();
    cy.get("[data-test^=project-view-]").first().scrollIntoView().should("be.visible");
    cy.get("[data-test^=project-permissions-]").first().scrollIntoView().should("be.visible");
    cy.get("[data-test^=project-edit-]").first().scrollIntoView().should("be.visible");
    cy.get("[data-test=create-project-button]").scrollIntoView().should("be.visible");
  });

  it("Pressing the filter icon opens the filter menu", function () {
    cy.get("[data-test=set-table-view]").click();
    cy.get("[data-test=filter-menu]").should("not.exist");
    cy.get("[data-test=open-filter]").scrollIntoView().should("be.visible").click();
    cy.get("[data-test=filter-menu]").should("be.visible");
  });

  it("Searching for projects created 100 years ago will find nothing", function () {
    cy.get("[data-test=set-table-view]").click();
    cy.get("[data-test=open-filter]").scrollIntoView().should("be.visible").click();
    cy.get("[data-test=filter-menu]").should("be.visible");
    cy.get("[data-test=datepicker-filter-start]").scrollIntoView().click().type("01/12/1900");
    cy.get("[data-test=datepicker-filter-end]").scrollIntoView().click().type("01/12/1901");
    cy.get("[data-test^=project-view-]").should("not.exist");
    // Reset filter
    cy.get("[data-test=reset-table-view]").click();
    checkAllVisibleProjects();
  });

  it("Searching for projects created today will find some", function () {
    const today = new Date();
    const tomorrow = new Date();
    const yesterday = new Date();
    tomorrow.setDate(today.getDate() + 1);
    yesterday.setDate(today.getDate() - 1);

    const tomorrowString = tomorrow.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const yesterdayString = yesterday.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    cy.get("[data-test=set-table-view]").click();
    cy.get("[data-test=open-filter]").scrollIntoView().should("be.visible").click();
    cy.get("[data-test=filter-menu]").should("be.visible");
    cy.get("[data-test=datepicker-filter-start]").scrollIntoView().click().type(yesterdayString);
    cy.get("[data-test=datepicker-filter-end]").scrollIntoView().click().type(tomorrowString);
    cy.get("[data-test^=project-view-]").first().should("exist");
    checkAllVisibleProjects();
  });
});
