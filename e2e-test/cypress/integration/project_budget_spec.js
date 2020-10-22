describe("Project budget test", function() {
  let baseUrl, apiRoute, projectId;
  const organization1 = "Organization 1";
  const organization2 = "Organization 2";
  const amount = "1234";
  const unformattedBudget = "1200";
  const formattedBudgetEnglish = "1,200.00";
  const wrongformattedBudgetEnglish = ["1.200,0", "1.", "1.1.1", "1,11.11"];
  const formattedBudgetGerman = "1.200,00";
  const wrongformattedBudgetGerman = ["1,200.0", "1,", "1.1.1", "1,11.11"];

  const projectedBudgets = [
    {
      organization: organization1,
      currencyCode: "EUR",
      value: "1111"
    },
    {
      organization: organization1,
      currencyCode: "USD",
      value: "2222"
    },
    {
      organization: organization2,
      currencyCode: "BRL",
      value: "3333"
    }
  ];
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(() => {
    cy.login();
    cy.visit("/projects");
    cy.server();
    cy.route("GET", apiRoute + "/project.list*").as("listProjects");
    cy.route("GET", apiRoute + "/project.viewDetails*").as("viewDetailsProject");
    cy.route("POST", apiRoute + "/global.createProject").as("createProject");
    cy.route("POST", apiRoute + "/project.createSubproject").as("createSubproject");
    cy.route("POST", apiRoute + "/project.budget.deleteProjected").as("deleteBudget");
    cy.route("POST", apiRoute + "/project.budget.updateProjected").as("updateBudget");
  });

  it("When creating a project, different organizations can be set", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput]").type("Project budget test");
    cy.get("[data-test=commentinput]").type("Project budget test");
    // Project Budget list is empty
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
    // Add Budget in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
    // Add Budget in EUR for Organization 2
    cy.get("[data-test=organization-input]").type(organization2);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Send to API
    cy.get("[data-test=submit]")
      .should("be.enabled")
      .click();
    cy.wait("@createProject").then(xhr => {
      projectId = xhr.response.body.data.project.id;
      cy.visit("/projects").wait("@listProjects");
      // Check if budgets have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
      // Check on detailview for 2 budgets (length +1 for header)
      cy.visit(`/projects/${projectId}`);
      cy.get("[data-test=project-projected-budget] tr").should("have.length", 3);
    });
  });

  it("An Organization cannot add two or more projected budgets with the same currency", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput]").type("Project budget test");
    cy.get("[data-test=commentinput]").type("Project budget test");
    // Add Budget in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
    // Cannot add another Budget  in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").should("be.disabled");
    cy.get("[data-test=organization-input]").clear();
    cy.get("[data-test=projected-budget] input").clear();
  });

  it("An Organization can add mutliple projected budgets with the different currencies", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput]").type("Project budget test");
    cy.get("[data-test=commentinput]").type("Project budget test");
    // Add Budget in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
    // Can set another Budget with different currency (USD) for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=USD]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]")
      .should("be.enabled")
      .click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Send to API
    cy.get("[data-test=submit]")
      .should("be.enabled")
      .click();
    cy.wait("@createProject").then(xhr => {
      projectId = xhr.response.body.data.project.id;
      cy.visit("/projects").wait("@listProjects");
      // Check if budgets have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
      // Check on detailview for 2 budgets (length +1 for header)
      cy.visit(`/projects/${projectId}`);
      cy.get("[data-test=project-projected-budget] tr").should("have.length", 3);
    });
  });

  it("Multiple projected budgets can be added to one project", function() {
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput]").type("Project budget test");
    cy.get("[data-test=commentinput]").type("Project budget test");
    // Project Budget list is empty
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
    // Add Budget in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
    // Add Budget in USD for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=USD]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Add Budget in EUR for Organization 2
    cy.get("[data-test=organization-input]").type(organization2);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
    // Send to API
    cy.get("[data-test=submit]")
      .should("be.enabled")
      .click();
    cy.wait("@createProject").then(xhr => {
      projectId = xhr.response.body.data.project.id;
      cy.visit("/projects").wait("@listProjects");
      // Check if budgets have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      // Check on detailview for 2 budgets (length +1 for header)
      cy.visit(`/projects/${projectId}`);
      cy.get("[data-test=project-projected-budget] tr").should("have.length", 4);
    });
  });

  it("Multiple projected budgets can be deleted from one project", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(({ id }) => {
      projectId = id;
      cy.visit("/projects").wait("@listProjects");
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      // Delete all 3 budgets
      cy.get("[data-test=delete-projected-budget]")
        .first()
        .click();
      cy.get("[data-test=delete-projected-budget]")
        .first()
        .click();
      cy.get("[data-test=delete-projected-budget]")
        .first()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
      cy.get(`[data-test=submit]`).click();
      cy.wait("@deleteBudget");
      cy.wait("@deleteBudget");
      cy.wait("@deleteBudget");
      cy.wait("@listProjects");
      // Check if changes have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
    });
  });

  it("Projected budget amounts of multiple projects can be edited and deleted at the same time", function() {
    const editedAmount = "522";
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(({ id }) => {
      projectId = id;
      cy.visit("/projects").wait("@listProjects");
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
      // Delete first budget
      cy.get("[data-test=delete-projected-budget]")
        .first()
        .click();
      // Edit budget amount on third budget
      cy.get("[data-test=edit-projected-budget]")
        .last()
        .click();
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(editedAmount);
      cy.get("[data-test=edit-projected-budget-amount-done]")
        .should("be.visible")
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
      cy.get(`[data-test=submit]`).click();
      cy.wait("@deleteBudget");
      cy.wait("@updateBudget");
      cy.wait("@updateBudget");
      cy.wait("@listProjects");
      // Check if changes have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      // Check if editing worked properly
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    });
  });

  it("Check language specific number format in projected budget table", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(({ id }) => {
      projectId = id;
      cy.login("mstein", "test", { language: "de" });
      cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
      cy.get("[data-test=project-projected-budget] tr").then(projectedBudgets => {
        expect(projectedBudgets[1]).to.contain("1.111,00");
      });
      cy.login("mstein", "test", { language: "en" });
      cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
      cy.get("[data-test=project-projected-budget] tr").then(projectedBudgets => {
        expect(projectedBudgets[1]).to.contain("1,111.00");
      });
    });
  });

  it("The budget cannot be added if the input format is invalid [english format]", function() {
    // Test with english format
    cy.login("mstein", "test", { language: "en" });
    cy.visit(`/projects`).wait("@listProjects");
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    // Type in a budgetamount
    cy.get("[data-test=projected-budget] input")
      .clear()
      .type(unformattedBudget);
    cy.get("[data-test=projected-budget]").should("not.contain", "Invalid format");
    cy.get("[data-test=projected-budget] input")
      .clear()
      .type(formattedBudgetEnglish);
    cy.get("[data-test=projected-budget]").should("not.contain", "Invalid format");
    wrongformattedBudgetEnglish.forEach(b => {
      cy.get("[data-test=projected-budget] input")
        .clear()
        .type(b);
      cy.get("[data-test=projected-budget]").should("contain", "Invalid format");
    });
  });

  it("The budget cannot be added if the input format is invalid [german format]", function() {
    // Test with german format
    cy.login("mstein", "test", { language: "de" });
    cy.visit(`/projects`).wait("@listProjects");
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    // Type in a budgetamount
    cy.get("[data-test=projected-budget] input")
      .clear()
      .type(unformattedBudget);
    cy.get("[data-test=projected-budget]").should("not.contain", "Ungültiges Format");
    cy.get("[data-test=projected-budget] input")
      .clear()
      .type(formattedBudgetGerman);
    cy.get("[data-test=projected-budget]").should("not.contain", "Ungültiges Format");
    wrongformattedBudgetGerman.forEach(b => {
      cy.get("[data-test=projected-budget] input")
        .clear()
        .type(b);
      cy.get("[data-test=projected-budget]").should("contain", "Ungültiges Format");
    });
  });

  it("The inputfield to edit budgetamount shows an error if the input is invalid [english format]", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(() => {
      cy.login("mstein", "test", { language: "en" });
      cy.visit(`/projects`).wait("@listProjects");
      // Edit projected budgetamount
      cy.get(`[data-test=pe-button]`)
        .last()
        .click();
      cy.get("[data-test=edit-projected-budget]")
        .first()
        .click();
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(unformattedBudget);
      cy.get("[data-test=edit-projected-budget-amount]").should("not.contain", "Invalid format");
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(formattedBudgetEnglish);
      cy.get("[data-test=edit-projected-budget-amount]").should("not.contain", "Invalid format");
      wrongformattedBudgetEnglish.forEach(b => {
        cy.get("[data-test=edit-projected-budget-amount] input")
          .clear()
          .type(b);
        cy.get("[data-test=edit-projected-budget-amount]").should("contain", "Invalid format");
      });
    });
  });

  it("The inputfield to edit budgetamount  shows an error if the input is invalid [german format]", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(() => {
      cy.login("mstein", "test", { language: "de" });
      cy.visit(`/projects`).wait("@listProjects");
      // Edit projected budgetamount
      cy.get(`[data-test=pe-button]`)
        .last()
        .click();
      cy.get("[data-test=edit-projected-budget]")
        .first()
        .click();
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(unformattedBudget);
      cy.get("[data-test=edit-projected-budget-amount]").should("not.contain", "Ungültiges Format");
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(formattedBudgetGerman);
      cy.get("[data-test=edit-projected-budget-amount]").should("not.contain", "Ungültiges Format");
      wrongformattedBudgetGerman.forEach(b => {
        cy.get("[data-test=edit-projected-budget-amount] input")
          .clear()
          .type(b);
        cy.get("[data-test=edit-projected-budget-amount]").should("contain", "Ungültiges Format");
      });
    });
  });

  it("The budget cannot be edited if the input format is invalid [english format]", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(() => {
      cy.login("mstein", "test", { language: "en" });
      cy.visit(`/projects`).wait("@listProjects");
      // Edit projected budgetamount
      cy.get(`[data-test=pe-button]`)
        .last()
        .click();
      cy.get("[data-test=edit-projected-budget]")
        .first()
        .click();
      wrongformattedBudgetEnglish.forEach(b => {
        cy.get("[data-test=edit-projected-budget-amount] input")
          .clear()
          .type(b);
        cy.get("[data-test=edit-projected-budget-amount-done]").should("be.disabled");
      });
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(unformattedBudget);
      cy.get("[data-test=edit-projected-budget-amount-done]")
        .should("be.enabled")
        .click();
      cy.get("[data-test=saved-projected-budget-amount]")
        .first()
        .should("contain", formattedBudgetEnglish);
    });
  });

  it("The budget cannot be edited if the input format is invalid [german format]", function() {
    cy.createProject("project budget test project", "project budget test", projectedBudgets).then(() => {
      cy.login("mstein", "test", { language: "de" });
      cy.visit(`/projects`).wait("@listProjects");
      // Edit projected budgetamount
      cy.get(`[data-test=pe-button]`)
        .last()
        .click();
      cy.get("[data-test=edit-projected-budget]")
        .first()
        .click();
      wrongformattedBudgetGerman.forEach(b => {
        cy.get("[data-test=edit-projected-budget-amount] input")
          .clear()
          .type(b);
        cy.get("[data-test=edit-projected-budget-amount-done]").should("be.disabled");
      });
      cy.get("[data-test=edit-projected-budget-amount] input")
        .clear()
        .type(unformattedBudget);
      cy.get("[data-test=edit-projected-budget-amount-done]")
        .should("be.enabled")
        .click();
      cy.get("[data-test=saved-projected-budget-amount]")
        .first()
        .should("contain", formattedBudgetGerman);
    });
  });

  it("Check if adding, editing and deleting projected budgets works together", function() {
    const editedAmount = "522";
    cy.get("[data-test=create-project-button]").click();
    cy.get("[data-test=nameinput]").type("Project budget test");
    cy.get("[data-test=commentinput]").type("Project budget test");
    // No projected budgets
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
    // Add Budget in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
    // Add Budget in EUR for Organization 2
    cy.get("[data-test=organization-input]").type(organization2);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Cannot add another Budget  in EUR for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").should("be.disabled");
    cy.get("[data-test=organization-input]").clear();
    cy.get("[data-test=projected-budget] input").clear();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Cannot add another Budget  in EUR for Organization 2
    cy.get("[data-test=organization-input]").type(organization2);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=EUR]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").should("be.disabled");
    cy.get("[data-test=organization-input]").clear();
    cy.get("[data-test=projected-budget] input").clear();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 2);
    // Can set another Budget with different currency for Organization 1
    cy.get("[data-test=organization-input]").type(organization1);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=USD]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]")
      .should("be.enabled")
      .click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
    // Can set another Budget with different currency for Organization 2
    cy.get("[data-test=organization-input]").type(organization2);
    cy.get("[data-test=dropdown-currencies]").click();
    cy.get("[data-value=USD]").click();
    cy.get("[data-test=projected-budget] input").type(amount);
    cy.get("[data-test=add-projected-budget]").click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 4);
    // Delete first projected budget
    cy.get("[data-test=delete-projected-budget]")
      .first()
      .click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
    // Change second (now first) projected budget amount
    cy.get("[data-test=edit-projected-budget]")
      .first()
      .click();
    cy.get("[data-test=edit-projected-budget-amount] input")
      .clear()
      .type(editedAmount);
    cy.get("[data-test=edit-projected-budget-amount-done]")
      .should("be.visible")
      .click();
    cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
    // Send to API
    cy.get("[data-test=submit]")
      .should("be.enabled")
      .click();
    cy.wait("@createProject").then(xhr => {
      projectId = xhr.response.body.data.project.id;
      cy.visit("/projects").wait("@listProjects");
      // Check if budgets have been saved
      cy.get("[data-test=pe-button]")
        .last()
        .click();
      cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
      // Check on detailview for 3 budgets (length +1 for header)
      cy.visit(`/projects/${projectId}`);
      cy.get("[data-test=project-projected-budget] tr").should("have.length", 4);
      cy.get("[data-test=project-projected-budget] tr").then(projectedBudgets => {
        expect(projectedBudgets[1]).to.contain("522.00");
        expect(projectedBudgets[1]).to.contain("EUR");
        expect(projectedBudgets[1]).to.contain("Organization 2");
        expect(projectedBudgets[2]).to.contain("1,234.00");
        expect(projectedBudgets[2]).to.contain("USD");
        expect(projectedBudgets[2]).to.contain("Organization 1");
        expect(projectedBudgets[3]).to.contain("1,234.00");
        expect(projectedBudgets[3]).to.contain("USD");
        expect(projectedBudgets[3]).to.contain("Organization 2");
      });
    });
  });
});
