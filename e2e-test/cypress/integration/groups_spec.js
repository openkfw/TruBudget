describe("User/Groups Dashboard", function() {
  let baseUrl, apiRoute;
  before(() => {
    baseUrl = Cypress.env("API_BASE_URL") || `${Cypress.config("baseUrl")}/test`;
    apiRoute = baseUrl.toLowerCase().includes("test") ? "/test/api" : "/api";
  });

  beforeEach(() => {
    cy.login();
    cy.visit("/users");
    cy.get("[aria-label=groupsTab]").click();
    cy.server();
    cy.route("POST", apiRoute + "/global.createGroup").as("createGroup");
  });

  function createGroup(testGroup) {
    cy.get("[data-test=create]").click();
    cy.get("[data-test=groupid] input")
      .type(testGroup.id)
      .should("have.value", testGroup.id);
    cy.get("[data-test=groupname] input")
      .type(testGroup.name)
      .should("have.value", testGroup.name);
    cy.get("[data-test=add-user-selection]").click();
    cy.get("[data-test=search-user-input]")
      .click()
      .type("Mauro Stein")
      .should("have.value", "Mauro Stein");
    cy.get("[data-test=user-name-mstein]").click();
    cy.get("[data-test=search-user-input]")
      .clear()
      .type("Tom House")
      .should("have.value", "Tom House");
    cy.get("[data-test=user-name-thouse]").click();
    cy.get("[data-test=close-select]").click();
    cy.get("[data-test=submit]").click();
    cy.wait("@createGroup");
  }

  it("Show group table", function() {
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Create new group and check if new group is visible", function() {
    const testGroup = {
      id: `test-group-id-${Math.round(Math.random() * 1000000)}`,
      name: `test-group-name-${Math.round(Math.random() * 1000000)}`
    };
    createGroup(testGroup);
    cy.get(`[data-test=group-${testGroup.id}]`).should("be.visible");
    cy.get(`[data-test=group-${testGroup.id}] > [data-test=group-id]`).contains(testGroup.id);
    cy.get(`[data-test=group-${testGroup.id}] > [data-test=group-name]`).contains(testGroup.name);
    cy.get(`[data-test=group-${testGroup.id}] > [data-test=group-user-length]`).contains(2);
  });

  it("User that created the group should be able to edit it", function() {
    const testGroup = {
      id: `test-group-id-${Math.round(Math.random() * 1000000)}`,
      name: `test-group-name-${Math.round(Math.random() * 1000000)}`
    };
    createGroup(testGroup);
    cy.get(`[data-test=edit-group-${testGroup.id}]`)
      .should("be.visible")
      .click();
    // Remove user Tom House
    cy.get("[data-test=user-chip-thouse] > .MuiSvgIcon-root").click();
    cy.get("[data-test=user-chip-thouse]").should("not.be.visible");
    cy.get("[data-test=add-user-selection]").click();
    // Add user Dana Violin
    cy.get("[data-test=search-user-input]")
      .click()
      .type("Dana Violin")
      .should("have.value", "Dana Violin");
    cy.get("[data-test=user-name-dviolin]").click();
    cy.get("[data-test=close-select]").click();
    cy.get("[data-test=submit]").click();
    cy.get(`[data-test=edit-group-${testGroup.id}]`).click();
    cy.get("[data-test=user-chip-dviolin]").should("be.visible");
    cy.get("[data-test=submit]").click();
    // Check if number of user is corret
    cy.get(`[data-test=group-${testGroup.id}] > [data-test=group-user-length]`).contains(2);
  });

  it("Users that didn't create the group should not be able to edit it", function() {
    const testGroup = {
      id: `test-group-id-${Math.round(Math.random() * 1000000)}`,
      name: `test-group-name-${Math.round(Math.random() * 1000000)}`
    };
    createGroup(testGroup);

    cy.get("#logoutbutton")
      .should("be.visible")
      .click();
    cy.login("thouse", "test");
    cy.visit("/users");
    cy.get("[aria-label=groupsTab]").click();
    cy.get(`[data-test=edit-group-${testGroup.id}]`).should("be.disabled");

    cy.get("#logoutbutton")
      .should("be.visible")
      .click();
    cy.login("jdoe", "test");
    cy.visit("/users");
    cy.get("[aria-label=groupsTab]").click();
    cy.get(`[data-test=edit-group-${testGroup.id}]`).should("be.disabled");
  });
});
