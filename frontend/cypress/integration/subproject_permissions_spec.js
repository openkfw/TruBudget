let projects = undefined;
let subprojects = undefined;

describe("Subproject Permissions", function() {
  before(() => {
    cy.login();
    cy
      .fetchProjects()
      .then(p => (projects = p))
      .then(() => {
        cy.fetchSubprojects(projects[0].data.id).then(s => (subprojects = s));
      });
  });
  beforeEach(function() {
    cy.fixture("testdata.json").as("data");
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("Show project details page", function() {
    cy.location("pathname").should("eq", `/projects/${projects[0].data.id}`);
  });

  it("Show and subproject permissions correctly", function() {
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Grant and revoke permissions", function() {
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
    cy
      .get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(
          this.data.subprojects[0].permissions["subproject.intent.grantPermission"]
            ? this.data.subprojects[0].permissions["subproject.intent.grantPermission"].length + 1
            : 1
        );
      })
      .then($list => {
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        const options = { timeout: 60000 };
        cy
          .wrap(firstUnchecked, options)
          .click(options)
          .should("be.checked");
        cy
          .wrap(firstUnchecked, options)
          .click(options)
          .should("not.be.checked");
      });
  });
});
