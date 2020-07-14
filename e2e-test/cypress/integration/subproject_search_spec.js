describe("Subproject Search", function() {
  let projectWithTag = {
    id: "",
    subprojectId: "",
    displayName: "p-search",
    description: "subproject search test",
    subprojectTitle: "SearchTestExample"
  };
  let projectNoTag = {
    id: "",
    displayName: "p-search-no-tag",
    description: "subproject search test"
  };
  const testTag = "testTagSub";

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
    cy.visit(`/projects/${projectWithTag.id}`);
  });

  it("Check regex highlighting", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    cy.get("[data-test=search-input]")
      .should("be.visible")
      .click()
      .type("SearchTest");
    cy.get("[data-test=highlighted-displayname]")
      .find("mark")
      .contains("SearchTest");
    cy.get("[data-test=highlighted-displayname]")
      .find("span")
      .contains("Example");
  });

  it("Filter subprojects by display name", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible")
      .should("not.be.disabled");
    cy.get("[data-test=search-input")
      .click()
      .type(projectWithTag.subprojectTitle);
    cy.get("[data-test=highlighted-displayname]").contains(projectWithTag.subprojectTitle);
    //Only one element should should be in the list
    cy.get("[data-test=subproject-title-0]").should("be.visible");
    cy.get("[data-test=subproject-title-1]").should("not.be.visible");
  });

  it("Filter subprojects by prefix 'name' and 'status'", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-input]")
      .click()
      .type("name:" + projectWithTag.subprojectTitle);
    cy.get("[data-test=highlighted-displayname]").contains(projectWithTag.subprojectTitle);
    //Only one element should should be in the list
    cy.get("[data-test=subproject-title-0]").should("be.visible");
    cy.get("[data-test=subproject-title-1]").should("not.be.visible");

    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=search-input]")
      .click()
      .type("{selectall}{backspace}")
      .type("status: open");
    cy.get("[data-test=ssp-table]").contains("Open");
    //Only one element should should be in the list
    cy.get("[data-test=subproject-title-0]").should("be.visible");
    cy.get("[data-test=subproject-title-1]").should("not.be.visible");
  });

  it("Search bar is empty when viewing subproject details", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    // Type into search bar
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .click()
      .type("SearchTestExample");
    // Go into detail view
    cy.get("[data-test=subproject-view-details-0]").click();
    // Go back to subproject view
    cy.get(`[data-test=breadcrumb-${projectWithTag.displayName}]`).click();
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("have.value", "");
  });

  it("Search bar is empty and exists when clicking on 'Main' breadcrumb", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    // Type into search bar
    cy.get("[data-test=search-input]")
      .click()
      .type("SearchTestExample");
    // Navigate via Main breadcrumb
    cy.get("[data-test=breadcrumb-Main]").click();
    // Go back to subproject view
    cy.visit(`/projects/${projectWithTag.id}`);
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("have.value", "");
  });

  it("Search bar is empty and exists when clicking on 'Projects' breadcrumb", function() {
    cy.get("[data-test=subproject-row]").should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible")
      .should("not.be.disabled");
    // Type into search bar
    cy.get("[data-test=search-input]")
      .click()
      .type("SearchTestExample");
    // Navigate via Projects breadcrumb
    cy.get("[data-test=breadcrumb-Projects]").click();
    // Go back to subproject view
    cy.visit(`/projects/${projectWithTag.id}`);
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("have.value", "");
  });

  it("Filter projects by navigate to URL with query parameters", function() {
    const queryParameter = {
      name: projectWithTag.subprojectTitle
    };
    cy.visit(`/projects/${projectWithTag.id}`, {
      qs: queryParameter
    });
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input]")
      .should("be.visible");
    cy.get("[data-test=sub-projects]")
      .find("[data-test=search-bar]")
      .find("[data-test=search-input] input")
      .should("have.value", "name:" + projectWithTag.subprojectTitle);
    //Only one element should should be in the list
    cy.get("[data-test=subproject-title-0]").should("be.visible");
    cy.get("[data-test=subproject-title-1]").should("not.be.visible");
  });
});
