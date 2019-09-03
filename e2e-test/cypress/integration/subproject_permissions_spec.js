let projects = undefined;

describe("Subproject Permissions", function() {
  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("Show project details page", function() {
    cy.location("pathname").should("eq", `/projects/${projects[0].data.id}`);
  });

  it("Show subproject permissions correctly", function() {
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test=permission-close]").click();
    cy.get("[data-test=permission-container]").should("not.be.visible");
  });

  it("Grant and revoke permissions", function() {
    cy.fixture("testdata.json").as("data");
    cy.get("[data-test=spp-button-0]").click();
    cy.get("[data-test=permission-container]").should("be.visible");
    cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
    cy.get("[data-test='permission-list']")
      .should("be.visible")
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(
          this.data.subprojects[0].permissions["subproject.intent.grantPermission"]
            ? this.data.subprojects[0].permissions["subproject.intent.grantPermission"].length
            : 1
        );
      })
      .then($list => {
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        const options = { timeout: 60000, force: true };
        cy.wrap(firstUnchecked, options)
          .click(options)
          .should("be.checked");
        cy.wrap(firstUnchecked, options)
          .click(options)
          .should("not.be.checked");
      })
      .then(() => cy.get("[data-test=permission-list]").type("{esc}"))
      .then(() => cy.get("[data-test=permission-submit]").click())
      .then(() => cy.get("[data-test=spp-button-0]").click())
      .then(() => {
        cy.get("[data-test='permission-select-subproject.intent.grantPermission']").click();
        cy.get("[data-test='permission-list']").should("be.visible");
      })
      // Restore status to make test re-runnable
      .then($list => {
        const checkedItems = $list.find("input:checked");
        expect(checkedItems).to.have.lengthOf(
          this.data.subprojects[0].permissions["subproject.intent.grantPermission"]
            ? this.data.subprojects[0].permissions["subproject.intent.grantPermission"].length + 1
            : 2
        );
        const lastChecked = $list.find("input:checked").last();
        // Use timeout to wait for animation to finish
        const options = { force: true, timeout: 60000 };
        cy.wrap(lastChecked, options)
          .click(options)
          .should("not.be.checked");
        cy.get("[data-test=permission-search] input").type("{esc}");
      })
      .then(() => cy.get("[data-test=permission-container]").should("be.visible"))
      .then(() => cy.get("[data-test=permission-submit]").click());
  });

  it("If a user has permissions to see the subproject details, the subproject details page can be viewed", function() {
    let projectId;
    let subprojectId;
    const subprojectDisplayname = "Permissionstest";

    // Create project, don't give permissions to jxavier
    cy.createProject("Permissions test", "Permissions test")
      // Create subproject, give permissions to jxavier
      .then(({ id }) => {
        projectId = id;
        cy.createSubproject(id, subprojectDisplayname);
      })
      .then(({ id }) => {
        subprojectId = id;
        cy.updateSubprojectPermissions(projectId, subprojectId, "subproject.viewDetails", "jxavier");
        cy.updateSubprojectPermissions(projectId, subprojectId, "subproject.viewSummary", "jxavier");
      })
      .then(() =>
        // Log in as jxavier
        cy.login("jxavier", "test")
      )
      .then(() => {
        // Go to subproject page and see that it is working
        cy.visit(`/projects/${projectId}/${subprojectId}`);
        cy.get("[data-test=subproject-details-displayname]").contains(subprojectDisplayname);
      });
  });
});
