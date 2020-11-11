describe("Project Tags", function() {
  let projectId, baseUrl, apiRoute;
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
    cy.login();
    cy.visit("/projects/");
  });

  beforeEach(function() {
    cy.login();
    cy.visit("/projects/");
  });

  it("Tags added upon project creation are displayed in the overview and project details", function() {
    // Click the "Create Project" button and enter some data
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");

    // Add a tag
    cy.get("[data-test=taginput] input").type("test");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "test");

    // Submit the project
    cy.server();
    cy.route("POST", apiRoute + "/global.createProject").as("create");
    cy.get("[data-test=submit]").click();
    cy.wait("@create")
      .then(data => {
        projectId = data.response.body.data.project.id;
      })
      .then(() => cy.visit("/projects/"))
      .then(() =>
        cy
          .get(`[data-test=project-card-${projectId}]`)
          .find("[data-test=overview-tags]")
          .find("[data-test=overview-tag]")
          .should("have.length", 1)
          .contains("test")
      )
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=project-details-tag]").should("have.length", 1));
  });
  it("When editing the project, the existing tags are displayed, can be deleted and new ones can be added", function() {
    // Create a project with tags
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");
    cy.get("[data-test=taginput] input").type("test");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "test");
    cy.server();
    cy.route("POST", apiRoute + "/global.createProject").as("create");
    cy.get("[data-test=submit]").click();
    cy.wait("@create")
      .then(data => {
        projectId = data.response.body.data.project.id;
      })
      .then(() => cy.visit("/projects/"))
      .then(() => {
        // Edit the project we just created
        cy.get(`[data-test=project-card-${projectId}] [data-test=pe-button]`).click();
        // See if it has one tag containing the text "test"
        cy.get("[data-test=tageditor-tag]")
          .should("have.length", 1)
          .contains("test");
        // Delete the tag
        cy.get("[data-test=tageditor-tag] svg").click();
        // There should be no tags now
        cy.get("[data-test=tageditor-tag]").should("not.exist");
        // Add a new one
        cy.get("[data-test=taginput] input").type("test2");
        cy.get("[data-test=add-tag-button]").click();
        cy.get("[data-test=tageditor-tag]")
          .first()
          .should("contain", "test");
        // Submit
        cy.get("[data-test=submit]").click();
      })
      .then(() => cy.visit("/projects/"))
      .then(() =>
        cy
          .get(`[data-test=project-card-${projectId}]`)
          .find("[data-test=overview-tags]")
          .find("[data-test=overview-tag]")
          .should("have.length", 1)
          .contains("test2")
      );
  });
  it("When editing the project, the tags are not changed when pressing the 'cancel' button", function() {
    // Create a project with tags
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");
    cy.get("[data-test=taginput] input").type("test");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "test");
    cy.server();
    cy.route("POST", apiRoute + "/global.createProject").as("create");
    cy.get("[data-test=submit]").click();
    cy.wait("@create")
      .then(data => {
        projectId = data.response.body.data.project.id;
      })
      .then(() => cy.visit("/projects/"))
      .then(() => {
        // Edit the project we just created
        cy.get(`[data-test=project-card-${projectId}] [data-test=pe-button]`).click();
        cy.get("[data-test=tageditor-tag]")
          .should("have.length", 1)
          .contains("test");
        // Add a new one
        cy.get("[data-test=taginput] input").type("test2");
        cy.get("[data-test=add-tag-button]").click();
        cy.get("[data-test=tageditor-tag]")
          .first()
          .should("contain", "test");
        // Cancel
        cy.get("[data-test=cancel]").click();
      })
      .then(() => cy.visit("/projects/"))
      .then(() =>
        cy
          .get(`[data-test=project-card-${projectId}]`)
          .find("[data-test=overview-tags]")
          .find("[data-test=overview-tag]")
          // Only the original tag is displayed
          .should("have.length", 1)
          .contains("test")
      );
  });
  it("Tags have to be unique", function() {
    // Open the creation dialog and enter a tag
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");
    cy.get("[data-test=taginput] input").type("test");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "test");

    // Try to add the same tag again
    cy.get("[data-test=taginput] input").type("test");
    cy.get("[data-test=add-tag-button]").click();
    // Warning that tag already exists
    cy.get("[data-test=taginput] p").contains("Tag already exists!");
    // No tag has been added
    cy.get("[data-test=tageditor-tag]")
      .should("have.length", 1)
      .should("contain", "test");
    cy.get("[data-test=taginput] input").type("2");
    cy.get("[data-test=add-tag-button]").click();
    // Warning is replaced by standard text
    cy.get("[data-test=taginput] p").contains("Add tag to project");
    // No tag has been added
    cy.get("[data-test=tageditor-tag]")
      .should("have.length", 2)
      .should("contain", "test2");
    // Cancel to restore normal view
    cy.get("[data-test=cancel]").click();
  });

  it("Tags with accents and umlauts are allowed", function() {
    // Click the "Create Project" button and enter some data
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");

    // Add a tag with accents and umlauts
    cy.get("[data-test=taginput] input").type("çéâêôûàèìòùäöãõ");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "çéâêôûàèìòùäöãõ");

    // Submit the project
    cy.server();
    cy.route("POST", apiRoute + "/global.createProject").as("create");
    cy.get("[data-test=submit]").click();
    cy.wait("@create")
      .then(data => {
        projectId = data.response.body.data.project.id;
      })
      .then(() => cy.visit("/projects/"))
      .then(() =>
        cy
          .get(`[data-test=project-card-${projectId}]`)
          .find("[data-test=overview-tags]")
          .find("[data-test=overview-tag]")
          .should("have.length", 1)
          .contains("çéâêôûàèìòùäöãõ")
      )
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=project-details-tag]").should("have.length", 1));
  });

  it("Tags with upper and lowercase letters are allowed", function() {
    // Click the "Create Project" button and enter some data
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput] input").type("Tag Test");

    // Add a tag with upper and lowercase letters
    cy.get("[data-test=taginput] input").type("TestTAG");
    cy.get("[data-test=add-tag-button]").click();
    cy.get("[data-test=tageditor-tag]")
      .first()
      .should("contain", "TestTAG");

    // Submit the project
    cy.server();
    cy.route("POST", apiRoute + "/global.createProject").as("create");
    cy.get("[data-test=submit]").click();
    cy.wait("@create")
      .then(data => {
        projectId = data.response.body.data.project.id;
      })
      .then(() => cy.visit("/projects/"))
      .then(() =>
        cy
          .get(`[data-test=project-card-${projectId}]`)
          .find("[data-test=overview-tags]")
          .find("[data-test=overview-tag]")
          .should("have.length", 1)
          .contains("TestTAG")
      )
      .then(() => cy.visit(`/projects/${projectId}`))
      .then(() => cy.get("[data-test=project-details-tag]").should("have.length", 1));
  });
});
