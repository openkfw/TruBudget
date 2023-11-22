describe("Project Edit", function () {
  let projectId;
  const executingUser = "mstein";
  const otherUser = "jxavier";

  before(() => {
    cy.login(executingUser, "test");
    cy.createProject("p-subp-edit", "subproject edit test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.list", otherUser);
      cy.grantProjectPermission(projectId, "project.viewDetails", otherUser);
      cy.grantProjectPermission(projectId, "project.intent.revokePermission", otherUser);
    });
  });

  beforeEach(function () {
    cy.login(executingUser, "test");
    cy.visit(`/projects`);
  });

  it("Editing the title is possible", function () {
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get(`[data-test=pe-button]`).click();
    });
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then((title) => {
        // Modify title
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        // Check if title has changed
        cy.get(`[data-test=project-card-${projectId}]`).within(() => {
          cy.get(`[data-test^='project-title-${title}']`).invoke("text").should("not.eq", title);
          // Change title back to original
          cy.get("[data-test=pe-button]").click();
        });
        cy.get("[data-test=nameinput] input").clear().type(title);
        cy.get("[data-test=submit]").click();
        cy.get(`[data-test=project-card-${projectId}]`).within(() => {
          cy.get(`[data-test^='project-title-${title}']`).invoke("text").should("eq", title);
        });
      });
  });

  it("Editing title without a change isn't possible", function () {
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get(`[data-test=pe-button]`).click();
    });
    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then((title) => {
        cy.get("[data-test=nameinput] input").type("-");
        cy.get("[data-test=submit]").should("be.enabled");
        cy.get("[data-test=nameinput] input").clear().type(title);
        cy.get("[data-test=submit]").should("be.disabled");
      });
  });

  it("The edit button isn't visible without edit permissions", function () {
    cy.login(otherUser, "test");
    cy.visit(`/projects`);
    cy.revokeProjectPermission(projectId, "project.update", executingUser);
    cy.login(executingUser, "test");
    cy.visit(`/projects`);
    cy.get(`[data-test=project-card-${projectId}]`).within(() => {
      cy.get("[data-test=pe-button]").should("have.css", "opacity", "0").should("be.disabled");
    });
    cy.grantProjectPermission(projectId, "project.update", executingUser);
  });

  it("If additional data exists, you can open additional data dialog", function () {
    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-test= project-overview-additionaldata-${projectId}]`).scrollIntoView().should("be.visible").click();
    });
  });

  it("Editing the additional data is possible", function () {
    let previousAddtionalData;

    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-test= project-overview-additionaldata-${projectId}]`).scrollIntoView().should("be.visible").click();

      // Edit addtional data
      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value")
          .invoke("text")
          .then((additionalData) => {
            previousAddtionalData = additionalData;
          });
        cy.get(".jse-value").click().type("-changed{enter}");
      });

      cy.get(`[data-test=project-additional-data]`).click();
      cy.get(`[data-test=project-additional-data-submit]`).click();

      // Check if additional data has changed
      cy.get(`[data-test= project-overview-additionaldata-${projectId}]`).scrollIntoView().should("be.visible").click();

      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value").invoke("text").should("not.eq", previousAddtionalData);
      });

      // Change additional data back to original
      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value").click().type(`${previousAddtionalData}{enter}`);
      });
      cy.get(`[data-test=project-additional-data]`).click();
      cy.get(`[data-test=project-additional-data-submit]`).click();

      cy.get(`[data-test= project-overview-additionaldata-${projectId}]`).scrollIntoView().should("be.visible").click();

      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value").invoke("text").should("eq", previousAddtionalData);
      });
    });
  });

  it("Editing additional data without a change isn't possible", function () {
    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-test= project-overview-additionaldata-${projectId}]`).scrollIntoView().should("be.visible").click();

      cy.get(`[data-test=project-additional-data-submit]`).should("be.disabled");
    });
  });

  // List View tests
  it("Editing the title is possible in list view", function () {
    cy.get(`[data-testid=ViewListIcon]`).click();
    cy.get(`[aria-label="Last Page"]`).then(($btn) => {
      if ($btn.attr("disabled") != true) {
        $btn.click();
      }
    });

    cy.get(`[aria-label="Edit"]:last`).within(() => {
      cy.get(`.MuiIconButton-root`).as("editBtn");
      cy.get("@editBtn").scrollIntoView().should("be.visible");
      cy.get("@editBtn").click();
    });

    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then((title) => {
        // Modify title
        cy.get("[data-test=nameinput] input").type("-changed");
        cy.get("[data-test=submit]").click();
        // Check if title has changed
        cy.get(`[data-test="project-name"]:last`).invoke("text").should("not.eq", title);

        // Change title back to original
        cy.get(`[aria-label="Edit"]:last`).within(() => {
          cy.get(`.MuiIconButton-root`).scrollIntoView().should("be.visible").click();
        });
        cy.get("[data-test=nameinput] input").clear().type(title);
        cy.get("[data-test=submit]").click();
        cy.get(`[data-test="project-name"]:last`).invoke("text").should("eq", title);
      });
  });

  it("Editing title without a change isn't possible in list view", function () {
    cy.get(`[data-testid=ViewListIcon]`).click();
    cy.get(`[aria-label="Last Page"]`).then(($btn) => {
      if ($btn.attr("disabled") != true) {
        $btn.click();
      }
    });

    cy.get(`[aria-label="Edit"]:last`).within(() => {
      cy.get(`.MuiIconButton-root`).as("editBtn");
      cy.get("@editBtn").scrollIntoView().should("be.visible");
      cy.get("@editBtn").click();
    });

    cy.get("[data-test=submit]").should("be.disabled");
    cy.get("[data-test=nameinput] input")
      .invoke("val")
      .then((title) => {
        cy.get("[data-test=nameinput] input").type("-");
        cy.get("[data-test=submit]").should("be.enabled");
        cy.get("[data-test=nameinput] input").clear().type(title);
        cy.get("[data-test=submit]").should("be.disabled");
      });
  });

  it("The edit button isn't visible without edit permissions in list view", function () {
    cy.login(executingUser, "test");
    cy.createProject("p-subp-edit", "subproject edit test").then(({ id }) => {
      projectId = id;
      cy.grantProjectPermission(projectId, "project.list", otherUser);
      cy.grantProjectPermission(projectId, "project.viewDetails", otherUser);
      cy.grantProjectPermission(projectId, "project.intent.revokePermission", otherUser);
    });
    cy.revokeProjectPermission(projectId, "project.update", executingUser);
    cy.login(executingUser, "test");
    cy.visit(`/projects`);

    cy.get(`[data-testid=ViewListIcon]`).click();
    cy.get(`[aria-label="Last Page"]`).then(($btn) => {
      if ($btn.attr("disabled") != true) {
        $btn.click();
      }
    });

    cy.get(`[aria-label=""]:last`).within(() => {
      cy.get(`.MuiIconButton-root`).should("be.disabled");
    });
    cy.grantProjectPermission(projectId, "project.update", executingUser);
  });

  it("If additional data exists, you can open additional data dialog in list view", function () {
    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-testid=ViewListIcon]`).click();
      cy.get(`[aria-label="Last Page"]`).then(($btn) => {
        if ($btn.attr("disabled") != true) {
          $btn.click();
        }
      });
      cy.get(`[aria-label="Additional Data"]:last`).within(() => {
        cy.get(`.MuiIconButton-root`).as("editBtn");
        cy.get("@editBtn").scrollIntoView().should("be.visible");
        cy.get("@editBtn").click();
      });
    });
  });

  it("Editing additional data without a change isn't possible in list view", function () {
    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-testid=ViewListIcon]`).click();
      cy.get(`[aria-label="Last Page"]`).then(($btn) => {
        if ($btn.attr("disabled") != true) {
          $btn.click();
        }
      });
      cy.get(`[aria-label="Additional Data"]:last`).within(() => {
        cy.get(`.MuiIconButton-root`).as("editBtn");
        cy.get("@editBtn").scrollIntoView().should("be.visible");
        cy.get("@editBtn").click();
      });
      cy.get(`[data-test=project-additional-data-submit]`).should("be.disabled");
    });
  });

  it("Editing the additional data in the list view is possible", function () {
    let previousAddtionalData;

    cy.login(executingUser, "test");
    cy.createProject("AdditionalDataTest", undefined, undefined, undefined, {
      additionalData: {
        test: "Lorem ipsum dolor sit amet.",
      },
    }).then(({ id }) => {
      projectId = id;
      cy.visit(`/projects`);
      cy.get(`[data-testid=ViewListIcon]`).click();
      cy.get(`[aria-label="Last Page"]`).then(($btn) => {
        if ($btn.attr("disabled") != true) {
          $btn.click();
        }
      });

      cy.get(`[aria-label="Additional Data"]:last`).within(() => {
        cy.get(`.MuiIconButton-root`).as("editBtn");
        cy.get("@editBtn").scrollIntoView().should("be.visible");
        cy.get("@editBtn").click();
      });

      // Edit additional data
      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value")
          .invoke("text")
          .then((additionalData) => {
            previousAddtionalData = additionalData;
          });
        cy.get(".jse-value").click().type("-changed{enter}");
      });

      cy.get(`[data-test=project-additional-data]`).click();
      cy.get(`[data-test=project-additional-data-submit]`).click();

      //Check if additional data was changed
      cy.get(`[aria-label="Additional Data"]:last`).scrollIntoView().click();

      cy.get(`[data-test=project-additional-data]`).within(() => {
        cy.get(".jse-value").invoke("text").should("not.eq", previousAddtionalData);
      });
    });

    //Changing additional data back to default
    cy.get(`[data-test=project-additional-data]`).within(() => {
      cy.get(".jse-value").click().type(`${previousAddtionalData}{enter}`);
    });
    cy.get(`[data-test=project-additional-data-submit]`).should("be.visible").click();

    cy.get(`[aria-label="Additional Data"]:last`).within(() => {
      cy.get(`.MuiIconButton-root`).scrollIntoView().click();
    });

    cy.get(`[data-test=project-additional-data]`).within(() => {
      cy.get(".jse-value").invoke("text").should("eq", previousAddtionalData);
    });
  });
});
