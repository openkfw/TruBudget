let projects = undefined;
let subprojects = undefined;
let openProject = undefined;
let openSubproject = undefined;
describe("Add workflowitem with document", function() {
  before(() => {
    cy.login();
    cy.fetchProjects()
      .then(p => (projects = p))
      .then(() => {
        cy.fetchSubprojects(projects[0].data.id).then(s => (subprojects = s));
      });
  });
  beforeEach(function() {
    cy.fixture("testdata.json").as("data");
    cy.login();
    openProject = projects.find(project => project.data.status === "open").data;
    openSubproject = subprojects.find(project => project.data.status === "open")
      .data;
    cy.visit(`/projects/${openProject.id}/${openSubproject.id}`);
  });
  it("Show subproject details page", function() {
    cy.location("pathname").should(
      "eq",
      `/projects/${openProject.id}/${openSubproject.id}`
    );
  });
  it("Create workflowItem", function() {
    cy.get("#createWorkflowItem")
      .should("be.visible")
      .click();
    cy.get("#nameinput")
      .should("be.visible")
      .type("E2E-WorkflowItem")
      .should("have.value", "E2E-WorkflowItem");
    cy.get("#commentinput")
      .should("be.visible")
      .type("E2E Comment")
      .should("have.value", "E2E Comment");
    cy.get("[data-test=next]")
      .should("be.visible")
      .click({ force: true });
    cy.get("#documentnameinput")
      .should("be.visible")
      .type("E2E Test File")
      .should("have.value", "E2E Test File");

    const testDocument = [{ id: "E2E Test File", base64: "c29tZXRoaW5ns" }];
    cy.createWorkflowItem(
      openProject.id,
      openSubproject.id,
      "E2E-WorkflowItem",
      "50",
      "EUR",
      "disbursed",
      "",
      "open",
      testDocument
    ).then(created => expect(created).to.be.true);
     cy.get("[data-test=cancel]").click();
  });

  it("Check WorkflowDetails of added Workflowitem", function() {
    cy.get("[data-test=workflowitemInfoButton]")
      .last()
      .should("be.visible")
      .click({ force: true });
    cy.get("[data-test=workflowInfoDialog]")
      .scrollIntoView()
      .should("be.visible");
    cy.get("[data-test= workflowitemInfoDisplayName]").contains(
      "E2E-WorkflowItem"
    );
    cy.get("[data-test= workflowitemDocumentId]")
      .last()
      .contains("E2E Test File");
   });
});
