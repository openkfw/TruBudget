describe("`Cookie management`", function() {
  const apiRoute = "/api";
  const executingUser = "mstein";

  beforeEach(function() {
    cy.login(executingUser, "test");
    cy.visit(`/`);
  });

  it("If a user is logged in, JWT token should not exist in local storage", async () => {
    expect(JSON.parse(localStorage.getItem("state")).login.jwt).to.be.undefined;
  });

  it("If a user is logged out, JWT token should not exist in local storage", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        expect(JSON.parse(localStorage.getItem("state")).login.jwt).to.be.undefined;
      });
  });

  it("In case of failed login attempt, JWT should not exist in local storage", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        cy.intercept(apiRoute + "/user.authenticate").as("login");
        cy.get("#loginpage").should("be.visible");
        cy.get("#loginbutton").click();
        cy.wait("@login").then(xhr => {
          expect(xhr.response.body.error.code).to.eql(500);
          expect(JSON.parse(localStorage.getItem("state")).login.jwt).to.be.undefined;
        });
      });
  });

  it("If a user is logged in, the login state must be true", async () => {
    expect(JSON.parse(localStorage.getItem("state")).login.isUserLoggedIn).to.be.true;
  });

  it("If a user is logged out, the login state must be false", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        expect(JSON.parse(localStorage.getItem("state")).login.isUserLoggedIn).to.be.false;
      });
  });

  it("In case of failed login attempt, the login state must be false", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        cy.intercept(apiRoute + "/user.authenticate").as("login");
        cy.get("#loginpage").should("be.visible");
        cy.get("#loginbutton").click();
        cy.wait("@login").then(xhr => {
          expect(xhr.response.body.error.code).to.eql(500);
          expect(JSON.parse(localStorage.getItem("state")).login.isUserLoggedIn).to.be.false;
        });
      });
  });

  it("If a user is logged in, there must be a JWT token in the cookies", async () => {
    cy.getCookie("token").then(c => {
      expect(c.value).to.be.not.null;
    });
  });

  it("If a user is logged out, there cannot exist a JWT token in cookies", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        cy.clearCookie("token");
        cy.getCookie("token").should("not.exist");
      });
  });

  it("In case of failed login attempt, a JWT token cannot exist in the cookies", async () => {
    cy.get("#logoutbutton")
      .should("be.visible")
      .click()
      .then(() => {
        cy.clearCookie("token");
        cy.intercept(apiRoute + "/user.authenticate").as("login");
        cy.get("#loginpage").should("be.visible");
        cy.get("#loginbutton").click();
        cy.wait("@login").then(xhr => {
          expect(xhr.response.body.error.code).to.eql(500);
          cy.getCookie("token").should("not.exist");
        });
      });
  });
});
