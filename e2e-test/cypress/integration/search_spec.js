describe("Navigation", function() {
  let projectWithTag = {
    id: "",
    displayName: "p-search",
    description: "project search test"
  };
  let projectNoTag = {
    id: "",
    displayName: "p-search-no-tag",
    description: "project search test"
  };
  const testTag = "testTag";

  before(() => {
    cy.login();
    cy.createProject(projectWithTag.displayName, projectWithTag.description).then(({ id }) => {
      projectWithTag.id = id;
      cy.updateProject(id, { tags: [testTag] });
      cy.createProject(projectNoTag.displayName, projectNoTag.description).then(({ id }) => {
        projectNoTag.id = id;
      });
    });
  });

  beforeEach(function() {
    cy.login();
    cy.visit(`/projects`);
  });

  it("The search bar is cleared after disabling it", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type("foo");
    // Close search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.not.visible");
    //  Open search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").should("have.value", "");
  });

  it("Filter projects by display name", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type(projectNoTag.displayName);
    // Only show project without tag
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
  });

  it("Filter projects by display name prefix 'name'", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type("name:" + projectNoTag.displayName);
    // Only show project without tag
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
  });

  it("Filter projects by prefix 'name', 'tag' and 'status", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type(
      "name:" + projectWithTag.displayName + " " + "tag:" + testTag + " " + "status:open"
    );
    // Only show project with tag
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("be.visible");
  });

  it("Filter projects by tag via tag button", function() {
    // Click tag
    cy.get("[data-test=project-search-field]").should("not.be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`)
      .find("[data-test=overview-tag]")
      .should("have.length", 1)
      .contains(testTag.toLowerCase())
      .click();
    // Check search bar for tag search term
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").should("have.value", "tag:" + testTag.toLowerCase());
  });

  it("Search bar is closed and reset when viewing project details", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type(projectWithTag.displayName);
    // Go to project
    cy.get("[data-test*=project-view-button]")
      .first()
      .click();
    cy.get("[data-test=project-search-field]").should("not.be.visible");
    cy.get("[data-test=toggle-project-search]").should("be.disabled");
    // Navigate to overview page
    cy.visit("/projects");
    // Search field should be empty
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field] input").should("have.value", "");
  });

  it("Search bar is closed and reset when clicking on 'Main' breadcrumb", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type(projectWithTag.displayName);
    // Navigate via Main breadcrumb
    cy.get("[data-test=breadcrumb-Main]").click();
    cy.get("[data-test=project-search-field]").should("not.be.visible");
    cy.get("[data-test=toggle-project-search]").should("be.enabled");
    // Search field should be empty
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field] input").should("have.value", "");
  });

  it("Search bar is closed and reset when clicking on 'Projects' breadcrumb", function() {
    // Type into search bar
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field]").should("be.visible");
    cy.get("[data-test=project-search-field] input").type(projectWithTag.displayName);
    // Go to project
    cy.get("[data-test*=project-view-button]")
      .first()
      .click();
    // Navigate via Projects breadcrumb
    cy.get("[data-test=breadcrumb-Projects]").click();
    cy.get("[data-test=project-search-field]").should("not.be.visible");
    cy.get("[data-test=toggle-project-search]").should("be.enabled");
    // Search field should be empty
    cy.get("[data-test=toggle-project-search]").click();
    cy.get("[data-test=project-search-field] input").should("have.value", "");
  });
});
