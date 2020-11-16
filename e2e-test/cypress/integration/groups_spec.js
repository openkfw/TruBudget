describe("User/Groups Dashboard", function() {
  const testGroup = { id: "group1" };

  before(() => {
    cy.login();
    cy.visit("/users");
    cy.get("[aria-label=groupsTab]").click();
  });

  it("Show group table", function() {
    cy.location("pathname").should("eq", "/users");
    cy.get("[data-test=userdashboard]").should("be.visible");
  });

  it("Create new group", function() {
    cy.get("[data-test=create]").click();
    cy.get("[data-test=groupid] input")
      .type(testGroup.id)
      .should("have.value", testGroup.id);
    cy.get("[data-test=groupname] input")
      .type(testGroup.id)
      .should("have.value", testGroup.id);
    cy.get("[data-test=add-user-selection]").click();
    cy.get("[data-test=search-user-input]")
      .click()
      .type("Mauro Stein")
      .should("have.value", "Mauro Stein");
    cy.get("[data-test=user-name-mstein]").click();
    cy.get("[data-test=add-user-selection]").click();
    cy.get("[data-test=search-user-input]")
      .click()
      .type("Tom House")
      .should("have.value", "Tom House");
    cy.get("[data-test=user-name-thouse]").click();
    cy.get("[data-test=submit]").click();
  });

  it("Created group should be visible", function() {
    cy.get(`[data-test=group-${testGroup.id}]`)
      .find("th")
      .then($th => {
        expect($th).to.have.length(1);
        expect($th.first()).to.have.text(testGroup.id);
      });
  });

  it("User that created the group should be able to edit it", function() {
    cy.get(`[data-test=edit-group-${testGroup.id}]`)
      .should("be.visible")
      .click();
    cy.get("[data-test=user-chip-thouse] > .MuiSvgIcon-root").click();
    cy.get("[data-test=user-chip-thouse]").should("not.be.visible");
    cy.get("[data-test=add-user-selection]").click();
    cy.get("[data-test=search-user-input]")
      .click()
      .type("John Doe")
      .should("have.value", "John Doe");
    cy.get("[data-test=user-name-jdoe]").click();
    cy.get("[data-test=submit]").click();
    cy.get(`[data-test=edit-group-${testGroup.id}]`).click();
    cy.get("[data-test=user-chip-jdoe]").should("be.visible");
    cy.get("[data-test=submit]").click();
  });

  it("Users that didn't create the group should not be able to edit it", function() {
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
