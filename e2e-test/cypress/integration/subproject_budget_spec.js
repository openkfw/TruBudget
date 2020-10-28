describe("Subproject budget test", function() {
  let projectId, subprojectId, baseUrl, apiRoute;
  const organization1 = "ACME Corp";
  const organization2 = "Organization 2";
  const projectProjectedBudget = {
    organization: organization1,
    currencyCode: "EUR",
    value: "10000"
  };
  const amount = "1234";
  const unformattedBudget = "1200";
  const formattedBudgetEnglish = "1,200.00";
  const wrongformattedBudgetEnglish = ["1.200,0", "1.", "1.1.1", "1,11.11"];
  const formattedBudgetGerman = "1.200,00";
  const wrongformattedBudgetGerman = ["1,200.0", "1,", "1.1.1", "1,11.11"];

  const subprojectProjectedBudget = { projectedBudgets: [projectProjectedBudget] };
  const multipleBudgets = {
    projectedBudgets: [
      {
        organization: organization1,
        currencyCode: "EUR",
        value: "10000"
      },
      {
        organization: organization1,
        currencyCode: "USD",
        value: "10000"
      },
      {
        organization: organization2,
        currencyCode: "BRL",
        value: "10000"
      }
    ]
  };

  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(() => {
    cy.login();
    cy.server();
    cy.route("GET", apiRoute + "/project.viewDetails*").as("viewDetailsProject");
    cy.route("GET", apiRoute + "/subproject.viewDetails*").as("viewDetailsSubproject");
    cy.route("GET", apiRoute + "/project.list*").as("listProjects");
    cy.route("POST", apiRoute + "/global.createProject").as("createProject");
    cy.route("POST", apiRoute + "/project.createSubproject").as("createSubproject");
    cy.route("POST", apiRoute + "/subproject.budget.deleteProjected").as("deleteBudget");
    cy.route("POST", apiRoute + "/subproject.budget.updateProjected").as("updateBudget");
  });

  it("When creating a subproject, only the organizations from the parent project can be selected", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.visit(`/projects/${projectId}`);
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=subproject-create-button]").should("be.visible");

        cy.get("[data-test=subproject-create-button]").click();
        cy.get("[data-test=nameinput]").type("Subproject budget test");
        cy.get("[data-test=commentinput]").type("Subproject budget test");
        cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click();
        cy.get("[data-value=EUR]").click();
        cy.get("[data-test=dropdown-organizations-click]").click();
        //Check for one organization
        cy.get("#menu-organizations ul").should("have.length", 1);
        cy.get("#menu-organizations ul li")
          .first()
          .should("contain", organization1);

        cy.get(`[data-value="${organization1}"]`).click();
        cy.get(`[data-test=cancel]`).click();
      }
    );
  });

  it("If the parent project has no projected budget, the organization input field is a textfield", function() {
    cy.createProject("subproject budget test project", "subproject budget test", []).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects/${projectId}`);
      cy.get("[data-test=subproject-create-button]")
        .should("be.visible")
        .click();
      // Check organization input field
      cy.get("[data-test=organization-input]").should("be.visible");
      cy.get(`[data-test=cancel]`).click();
    });
  });

  it("The projected budget of the subproject can be created", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.visit(`/projects/${projectId}`);
        cy.wait("@viewDetailsProject");
        cy.get("[data-test=subproject-create-button]").should("be.visible");
        cy.get("[data-test=subproject-create-button]").click();
        // Create subproject budget
        cy.get("[data-test=nameinput]").type("Subproject budget test");
        cy.get("[data-test=commentinput]").type("Subproject budget test");
        cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click();
        cy.get("[data-value=EUR]").click();
        cy.get("[data-test=dropdown-organizations-click]").click();
        cy.get("#menu-organizations ul").should("have.length", 1);
        cy.get("#menu-organizations ul li")
          .first()
          .should("contain", organization1);
        cy.get(`[data-value="${organization1}"]`).click();
        cy.get("[data-test=dropdown-currencies-click]").click();
        cy.get("[data-value=EUR]").click();
        cy.get("[data-test=projected-budget] input").type(amount);
        cy.get("[data-test=add-projected-budget]").click();
        cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
        cy.get("[data-test=edit-projected-budget]")
          .first()
          .click();
        // Send to API
        cy.get(`[data-test=submit]`).click();
        cy.wait("@createSubproject").then(xhr => {
          subprojectId = xhr.response.body.data.subproject.id;
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          // Check if budgets have been saved (+1 for header) on subproject page
          cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 2);
        });
        // Check edited budget in budget component
        cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
        cy.get(`[data-test^=subproject-edit-button-]`)
          .should("be.visible")
          .click();
        cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
      }
    );
  });

  it("The projected budget of the subproject can be removed", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          //Delete subproject budget
          cy.visit(`/projects/${projectId}`);
          cy.wait("@viewDetailsProject");
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
            .click();
          cy.get("[data-test=delete-projected-budget]").click();
          cy.get("[data-test=projected-budget-list] tr").should("have.length", 0);
          cy.get(`[data-test=submit]`).click();
          cy.wait("@deleteBudget");
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          // Check if budgets have been saved (+1 for header)
          cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 1);
        });
      }
    );
  });

  it("The projected budget of the subproject can be edited", function() {
    const editedAmount = "522";
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          //Edit subproject budget
          cy.visit(`/projects/${projectId}`);
          cy.wait("@viewDetailsProject");
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
            .click();
          cy.get("[data-test=edit-projected-budget]").click();
          cy.get("[data-test=edit-projected-budget-amount] input")
            .clear()
            .type(editedAmount);
          cy.get("[data-test=edit-projected-budget-amount-done]").click();
          cy.get(`[data-test=submit]`)
            .should("be.visible")
            .click();
          cy.wait("@updateBudget");
          // Send to API
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          // Check if budgets have been saved (+1 for header)
          cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 2);
        });
      }
    );
  });

  it("Multiple budgets can be set for one subproject", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", multipleBudgets).then(({ id }) => {
          subprojectId = id;
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          // Check if budgets have been saved (+1 for header)
          cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 4);
        });
      }
    );
  });

  it("Multiple projected budgets can be deleted for one subproject", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", multipleBudgets).then(({ id }) => {
          subprojectId = id;
          cy.visit(`/projects/${projectId}`);
          cy.wait("@viewDetailsProject");
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
            .click();
          cy.get("[data-test=projected-budget-list] tr").should("have.length", 3);
          // Delete two budgets
          cy.get("[data-test=delete-projected-budget]")
            .first()
            .click();
          cy.get("[data-test=delete-projected-budget]")
            .first()
            .click();
          cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
          cy.get(`[data-test=submit]`)
            .should("be.visible")
            .click();
          cy.wait("@deleteBudget");
          cy.wait("@deleteBudget");
          cy.wait("@updateBudget");
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          // Check if budgets have been saved (+1 for header)
          cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 2);
        });
      }
    );
  });

  it("Multiple budgets with the same organziation and currency can not exist for one subproject", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(() => {
          cy.visit(`/projects/${projectId}`);
          cy.wait("@viewDetailsProject");
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
            .click();
          // One budget exists
          cy.get("[data-test=projected-budget-list] tr").should("have.length", 1);
          // Try to select organziation and currency that are already used for one budget
          cy.get("[data-test=dropdown-organizations-click]").click();
          cy.get(`[data-value="${organization1}"]`).click();
          cy.get("[data-test=dropdown-currencies-click]").click();
          cy.get("[data-value=EUR]").click();
          cy.get("[data-test=projected-budget] input").type(amount);
          // Warning should appear and 'Add' Button should be disabled
          cy.get("[data-test=add-projected-budget]").should("be.disabled");
          cy.get("[data-test=dropdown-currencies]").should("contain", "Projected budget already exists");
        });
      }
    );
  });

  it("Check language specific number format in projected budget table", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          cy.login("mstein", "test", { language: "de" });
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          cy.get("[data-test=subproject-projected-budget] tr").then(projectedBudgets => {
            expect(projectedBudgets[1]).to.contain("10.000,00");
          });
          cy.login("mstein", "test", { language: "en" });
          cy.visit(`/projects/${projectId}/${subprojectId}`).wait("@viewDetailsSubproject");
          cy.get("[data-test=subproject-projected-budget] tr").then(projectedBudgets => {
            expect(projectedBudgets[1]).to.contain("10,000.00");
          });
        });
      }
    );
  });

  it("The budget cannot be added if the input format is invalid [english format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test").then(({ id }) => {
      projectId = id;
      // Test with english format
      cy.login("mstein", "test", { language: "en" });
      cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
      cy.get("[data-test=subproject-create-button]").should("be.visible");
      cy.get("[data-test=subproject-create-button]").click();
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
  });

  it("The budget cannot be added if the input format is invalid [german format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test").then(({ id }) => {
      projectId = id;
      // Test with german format
      cy.login("mstein", "test", { language: "de" });
      cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
      cy.get("[data-test=subproject-create-button]").should("be.visible");
      cy.get("[data-test=subproject-create-button]").click();
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
  });

  it("The inputfield to edit budgetamount shows an error if the input is invalid [english format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          cy.login("mstein", "test", { language: "en" });
          cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
          // Edit projected budgetamount
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
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
      }
    );
  });

  it("The inputfield to edit budgetamount shows an error if the input is invalid [german format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          cy.login("mstein", "test", { language: "de" });
          cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
          // Edit projected budgetamount
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
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
      }
    );
  });

  it("The budget cannot be edited if the input format is invalid [english format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          cy.login("mstein", "test", { language: "en" });
          cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
          // Edit projected budgetamount
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
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
      }
    );
  });

  it("The budget cannot be edited if the input format is invalid [german format]", function() {
    cy.createProject("subproject budget test project", "subproject budget test", [projectProjectedBudget]).then(
      ({ id }) => {
        projectId = id;
        cy.createSubproject(projectId, "subproject budget test", "EUR", subprojectProjectedBudget).then(({ id }) => {
          subprojectId = id;
          cy.login("mstein", "test", { language: "de" });
          cy.visit(`/projects/${projectId}`).wait("@viewDetailsProject");
          // Edit projected budgetamount
          cy.get(`[data-test^=subproject-edit-button-]`)
            .should("be.visible")
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
      }
    );
  });

  it("Check if adding, editing and deleting projected budgets works together", function() {
    const editedAmount = "522";
    cy.createProject("subproject budget test project", "subproject budget test", []).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects/${projectId}`);
      cy.wait("@viewDetailsProject");
      cy.get("[data-test=subproject-create-button]").should("be.visible");
      cy.get("[data-test=subproject-create-button]").click();
      cy.get("[data-test=nameinput]").type("Subproject budget test");
      cy.get("[data-test=commentinput]").type("Subproject budget test");
      cy.get("[data-test=dropdown-sp-dialog-currencies-click]").click();
      cy.get("[data-value=EUR]").click();
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
      cy.wait("@createSubproject").then(xhr => {
        subprojectId = xhr.response.body.data.subproject.id;
        // Check on detailview for 3 budgets (length +1 for header)
        cy.visit(`/projects/${projectId}/${subprojectId}`);
        cy.get("[data-test=subproject-projected-budget] tr").should("have.length", 4);
        cy.get("[data-test=subproject-projected-budget] tr").then(projectedBudgets => {
          expect(projectedBudgets[1]).to.contain("522.00");
          expect(projectedBudgets[1]).to.contain("EUR");
          expect(projectedBudgets[1]).to.contain(organization2);
          expect(projectedBudgets[2]).to.contain("1,234.00");
          expect(projectedBudgets[2]).to.contain("USD");
          expect(projectedBudgets[2]).to.contain(organization1);
          expect(projectedBudgets[3]).to.contain("1,234.00");
          expect(projectedBudgets[3]).to.contain("USD");
          expect(projectedBudgets[3]).to.contain(organization2);
        });
      });
    });
  });
});
