describe("Project Assignee", function() {
  let projects = undefined;

  before(() => {
    cy.login();
    cy.fetchProjects().then(p => (projects = p));
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects/${projects[0].data.id}`);
  });

  it("After selecting a new assignee, the corresponding checkbox is checked", function() {
    cy.get("[data-test=assignee-selection]").click();
    cy.get("[data-test=assignee-list]")
      .should("be.visible")
      .then($list => {
        const firstUnchecked = $list.find("input:not(:checked)").first();
        // Use timeout to wait for animation to finish
        const options = { timeout: 10000, force: true };
        cy.wrap(firstUnchecked, options)
          .click(options)
          .should("be.checked");
      });
  });
});
