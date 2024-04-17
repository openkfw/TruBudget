describe("Login with proxy", () => {
  beforeEach(() => {
    cy.visit(`/`);
  });

  // cookie is valid until 2030
  // if changes are required, generate a new cookie using Auth Proxy, and with extended expiration

  it("should login with a valid cookie", () => {
    cy.setCookie(
      "authorizationToken",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJtc3RlaW4iLCJtZXRhZGF0YSI6eyJleHRlcm5hbElkIjoie1wib2lkXCI6XCJhMGUxNGQ3OS01ZDFkLTQ2OTQtYTg3My0xMzQ2MDQ2YzE4YmVcIixcInRzXCI6MTcwOTAyMDE4MjQ3NH0ifSwiY3NyZiI6IjUtWnJpQTh0YUI5V3hWZTkiLCJqdGkiOiI4YjJkMTJlZS1hZmQzLTQ3MGItYWE1My1iMjAwY2NjMmE0MzgiLCJpYXQiOjE3MDkwMjAxODIsImV4cCI6MTkyMjMxMzYwMH0.AeG-Usjuci3i88IUahRYdrIgfxHbKtmrVZSEOTFySSfDN1idPepLmtRwb2LOQ50RKdKSnQgWLt84RaUBn8BY31sMQl1JzGUfNv_hPNUBCcLZXu1WXC7IzPiyq5VoPDJiy90mY3Njo25j4jIuXINxJPPgkeBNPVN5LVzYxJGH6KkAuPQXhsyKD_fLRbO1ef7B-0aebTdtGGuqUOFtPq56JclyBJuwiAT_4iFo4BhejBlzjqL6SaSXPOP_QZAPsNKL8wwGHcrBaY3b8vUdVUyBqMVJEioO6clJPhAO6qqlICwUnepQAGOg3H8-ckgQin82cjmbVHnbqju6Lu8gAuX34g",
    );
    cy.visit("/login?token=5-ZriA8taB9WxVe9");

    cy.get("#logoutbutton").should("be.visible");
  });
});
