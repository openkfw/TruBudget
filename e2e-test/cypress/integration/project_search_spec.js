describe("Project Search", function() {
  let projectWithTag = {
    id: "",
    subprojectId: "",
    displayName: "p-search",
    description: "project search test",
    subprojectTitle: "SearchTestExample"
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
      cy.createSubproject(projectWithTag.id, projectWithTag.subprojectTitle).then(({ id }) => {
        projectWithTag.subprojectId = id;
      });
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
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type("foo");
    // Close search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.not.visible");
    //  Open search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "");
  });

  it("Filter projects by display name", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type(projectNoTag.displayName);
    // Only show project without tag
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
  });

  it("Filter projects by display name prefix 'name'", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type("name:" + projectNoTag.displayName);
    // Only show project without tag
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
  });

  it("Filter projects by prefix 'name', 'tag' and 'status'", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type("name:" + projectWithTag.displayName + " " + "tag:" + testTag + " " + "status:open");
    // Only show project with tag
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("be.visible");
  });

  it("Filter projects by tag via tag button", function() {
    // Click tag
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("not.be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`)
      .find("[data-test=overview-tag]")
      .should("have.length", 1)
      .contains(testTag.toLowerCase())
      .click();
    // Check search bar for tag search term
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "tag:" + testTag.toLowerCase());
  });

  it("Search bar is closed and reset when viewing project details", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type(projectWithTag.displayName);
    // Go into project [subproject level]
    cy.get("[data-test*=project-view-button]")
      .first()
      .click();
    cy.get("[data-test=navigation-bar]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("not.be.visible");
    cy.get("[data-test=navigation-bar]")
      .find("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .should("be.disabled");
    // Navigate to overview page
    cy.visit("/projects");
    // Search field should be empty
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "");
  });

  it("Search bar is closed and reset when clicking on 'Main' breadcrumb", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type(projectNoTag.displayName);
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    // Navigate via Main breadcrumb
    cy.get("[data-test=breadcrumb-Main]").click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("not.be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .should("be.enabled");
    // All projects are visible
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("be.visible");
    // Search field should be empty
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "");
  });

  it("Search bar is closed and reset when clicking on 'Projects' breadcrumb", function() {
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type(projectNoTag.displayName);
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("not.be.visible");
    // Go to project
    cy.get("[data-test*=project-view-button]")
      .first()
      .click();
    // Navigate via Projects breadcrumb
    cy.get("[data-test=breadcrumb-Projects]").click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("not.be.visible");
    cy.get("[data-test=toggle-searchbar]").should("be.enabled");
    // All projects are visible
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("be.visible");
    // Search field should be empty
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-input] input").should("have.value", "");
  });

  it("Search bar is empty after clicking the clear button", function() {
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    // Type into search bar
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .type("SearchTest");
    // Click clear button
    cy.get("[data-test=clear-searchbar]")
      .should("be.visible")
      .click();
    // Check input field
    cy.get("[data-test=search-bar]")
      .find("[data-test=toggle-searchbar]")
      .click();
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("have.value", "");
  });

  it("Filter projects by navigate to URL with query parameters", function() {
    const queryParameter = {
      name: projectWithTag.displayName,
      status: "open",
      tag: testTag
    };
    cy.visit("/projects", {
      qs: queryParameter
    });
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "name:" + projectWithTag.displayName + " " + "status:open tag:" + testTag);
    // Only show project with tag
    cy.get(`[data-test=project-card-${projectNoTag.id}]`).should("not.be.visible");
    cy.get(`[data-test=project-card-${projectWithTag.id}]`).should("be.visible");
  });
});
