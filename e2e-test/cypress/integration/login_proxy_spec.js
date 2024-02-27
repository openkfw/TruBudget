describe("Login with proxy", () => {
  beforeEach(() => {
    cy.visit(`/`);
  });

  it("should login with a valid cookie", () => {
    cy.setCookie(
      "authorizationToken",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJtc3RlaW4iLCJtZXRhZGF0YSI6eyJleHRlcm5hbElkIjoie1wib2lkXCI6XCIwZjUzNzg2ZS00ZTZkLTRlYWEtODA5Zi00OGRmNzU2NDg3NGJcIixcInRzXCI6MTcwOTAxODcxODkzN30ifSwiY3NyZiI6IldJS0FGR081QWl0X2puWmYiLCJqdGkiOiJhZWUxNzJhMC0wNzJjLTRjZjMtYjE0ZC05MzBhNDk4ZTljMTYiLCJpYXQiOjE3MDkwMTg3MTgsImV4cCI6MTcwOTAxOTMxOH0.BLRN92toZDVgmgKiQ7bp92VuQ8fl4okWR2lLQNWpQ0QaSI1Wjm8kyxj0A0OaLRSzLqQhQol29yeC_5oNKqaBFXVaGBMvecStFCPgcumxjrs3LpWsMYCoHdkY_aW6j9rxyje2Wkfp3TLfJZqR7dfswEOa-MQw99ZV6KTq0ssvovFlfWELdIHH40JkBbBQ30z3i7vYxQLJ_j7b5UWV3Tuu9FxMuSQiVOQeA24vRT-0pgIBHVPaHgsJRDl7XdCd44WKvHob-SSsdzseV54EPNaLoiSN4CGsOTFgYv_h3rUTUjCUeBDFjhmjocBUp4sgyE4-MlZ6epYv2ecqYQdUogVkGA",
    );
    cy.visit("/login?token=WIKAFGO5Ait_jnZf");

    cy.get("#logoutbutton").should("be.visible");
  });
});
